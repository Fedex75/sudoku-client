import React, { useEffect, useRef, useState } from 'react'
import Canvas from '../../components/Canvas'
import EditButton from '../../components/EditButton'
import { Section, SectionContent, Topbar } from '../../components/section'
import SettingsHandler from '../../utils/SettingsHandler'
import NumpadButton from '../../components/NumpadButton'
import ActionSheet from '../../components/ActionSheet'
import { ActionSheetButton } from '../../components/ActionSheet'
import GameHandler from '../../utils/GameHandler'
import { modeTranslations, difficultyTranslations, classicDifficulties, killerDifficulties } from '../../utils/Difficulties'
import copy from 'copy-to-clipboard'
import { useNavigate } from 'react-router'
import Button from '../../components/Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowUpFromBracket, faBookmark, faDroplet, faDropletSlash, faEraser, faLightbulb, faLink, faPencilAlt, faPlus, faUndo } from '@fortawesome/free-solid-svg-icons'
import ColorButton from '../../components/ColorButton'

let animationCallback = null

const colorNames = ['red', 'orange', 'yellow', 'green', 'blueGreen', 'lightBlue', 'darkBlue', 'purple', 'default']

const Sudoku = ({theme}) => {
	const [, setRender] = useState(0)
	const [hintState, setHintState] = useState(0)
	const [eraseInkState, setEraseInkState] = useState(0)
	const [showLinks, setShowLinks] = useState(false)
	const [win, setWin] = useState(false)
	const [bookmark, setBookmark] = useState(GameHandler.currentGameIsBookmarked())

	const brushRef = useRef(false)
	const lockedColorRef = useRef('purple')
	const noteModeRef = useRef(null)
	const possibleValuesRef = useRef([])
	const completedNumbersRef = useRef([])
	const lockedInputRef = useRef(0)
	const noteDragMode = useRef(null)

	const newGameActionSheetRef = useRef()
	const exportActionSheetRef = useRef()
	const navigate = useNavigate()

	const canvasRef = useRef()

	function onClick(x, y, button, hold = false){
		switch (button){
			case 0:
				if (brushRef.current){
					if (lockedColorRef.current !== null) handleSetColor({x, y}, lockedColorRef.current)
				} else {
					if (GameHandler.game.selectedCell.x !== x || GameHandler.game.selectedCell.y !== y){
						//Click on unselected cell
						GameHandler.game.setSelectedCell({x, y})
						let value = GameHandler.game.getSelectedCell().value
						setPossibleValues()
						if (value > 0){
							if (SettingsHandler.settings.autoChangeInputLock && GameHandler.game.mode === 'classic') lockedInputRef.current = value
						} else {
							if (lockedInputRef.current > 0 && possibleValuesRef.current.includes(lockedInputRef.current)) handleNumberInput(lockedInputRef.current, hold)
						}
					} else {
						//Click on selected cell
						let value = GameHandler.game.getSelectedCell().value
						if (value > 0 && SettingsHandler.settings.autoChangeInputLock && GameHandler.game.mode === 'classic') lockedInputRef.current = lockedInputRef.current === 0 ? value : 0
						if (lockedInputRef.current > 0 && possibleValuesRef.current.includes(lockedInputRef.current)) handleNumberInput(lockedInputRef.current, hold)
					}
				}
				break
			case 1:
				handleSetColor({x, y}, 'purple')
				break
			case 2:
				const value = GameHandler.game.get({x, y}).value
				if (value === 0) handleSetNote({x, y}, hold)
				else if (!hold){
					GameHandler.game.setSelectedCell({x, y})
					if (value > 0 && SettingsHandler.settings.autoChangeInputLock){
						lockedInputRef.current = lockedInputRef.current === value ? 0 : value
					}
				}
				break
			default:
				break
		}
		setRender(r => r === 100 ? 0 : r+1)
	}

	function handleSetNote(coords, hold){
		if (!hold) noteDragMode.current = null
		if (
			lockedInputRef.current > 0  &&
			!brushRef.current &&
			GameHandler.game.getPossibleValues(coords).includes(lockedInputRef.current)
		){
			if (noteDragMode.current === null){
				noteDragMode.current = GameHandler.game.setNote(coords, lockedInputRef.current)
			} else {
				if (GameHandler.game.get(coords).notes.includes(lockedInputRef.current) !== noteDragMode.current){
					GameHandler.game.setNote(coords, lockedInputRef.current)
				}
			}
		}
		setRender(r => r === 100 ? 0 : r+1)
	}

	function checkAnimation(){
		if (GameHandler.game.checkComplete()){
			if (!GameHandler.game.animationCache.board){
				GameHandler.game.animationCache.board = true
				if (animationCallback) animationCallback([
					{
						type: 'board',
						center: GameHandler.game.selectedCell
					}
				])
				setTimeout(() => {
					setWin(true)
					setShowLinks(false)
					lockedInputRef.current = 0
				}, 1350)
			}
		}

		/*let animation = []
		if (GameHandler.game.checkComplete()){
			if (!GameHandler.game.animationCache.board){
				GameHandler.game.animationCache.board = true
				if (animationCallback) animationCallback([
					{
						type: 'board',
						center: GameHandler.game.selectedCell
					}
				])
				setTimeout(() => {
					setWin(true)
					setShowLinks(false)
					lockedInputRef.current = 0
				}, 1350)
			}
		} else {
			for (let i = 0; i < 9; i++){
				let flagRow = true
				let flagCol = true
				for (let j = 0; j < 9; j++){
					if (GameHandler.game.get({x: j, y: i}).value === 0){
						flagRow = false
					}
					if (GameHandler.game.get({x: i, y: j}).value === 0){
						flagCol = false
					}
				}
				if (flagRow && !GameHandler.game.animationCache.rows[i]){
					GameHandler.game.animationCache.rows[i] = true
					animation.push({
						type: 'row',
						center: {
							x: GameHandler.game.selectedCell.x,
							y: i
						}
					})
				}
				if (flagCol && !GameHandler.game.animationCache.cols[i]){
					GameHandler.game.animationCache.cols[i] = true
					animation.push({
						type: 'col',
						center: {
							x: i,
							y: GameHandler.game.selectedCell.y
						}
					})
				}	
			}
			for (let qx = 0; qx < 3; qx++){
				for (let qy = 0; qy < 3; qy++){
					if (!GameHandler.game.animationCache.quadrants[qy*3+qx]){
						let flagQuadrant = true
						for (let x = 0; x < 3; x++){
							for (let y = 0; y < 3; y++){
								if (GameHandler.game.get({x: qx * 3 + x, y: qy * 3 + y}).value === 0){
									flagQuadrant = false
									break
								}
							}
						}
						if (flagQuadrant){
							GameHandler.game.animationCache.quadrants[qy*3+qx] = true
							animation.push({
								type: 'quadrant',
								quadrantX: qx,
								quadrantY: qy
							})
						}
					}
				}
			}
			if (animation.length > 0 && animationCallback) animationCallback(animation)
			GameHandler.game.saveToLocalStorage()
		}*/
	}

	function handleNumberInput(number, hold){
		if (!GameHandler.complete){
			if (GameHandler.game.selectedCell !== null){
				const selectedCell = GameHandler.game.getSelectedCell()
				if (selectedCell.value === 0){
					if (noteModeRef.current) GameHandler.game.setNote(GameHandler.game.selectedCell, number, )
					else {
						GameHandler.game.setValue(GameHandler.game.selectedCell, number)
						if (SettingsHandler.settings.autoChangeInputLock && GameHandler.game.mode === 'classic') lockedInputRef.current = number
					}
				} else if (!selectedCell.clue && selectedCell.value > 0 && !noteModeRef.current) {
					GameHandler.game.setValue(GameHandler.game.selectedCell, number)
				}
			}
			setPossibleValues()
			setRender(r => r === 100 ? 0 : r+1)
		}
	}

	function handleNumpadButtonClick(number, type){
		if (type === 'primary'){
			if (possibleValuesRef.current == null || (possibleValuesRef.current !== null && possibleValuesRef.current.includes(number))) handleNumberInput(number)
		} else {
			lockedInputRef.current = lockedInputRef.current === number ? 0 : number
			setRender(r => r === 100 ? 0 : r+1)
		}
	}

	function invertNoteMode(){
		noteModeRef.current = !noteModeRef.current
		setPossibleValues()
		setRender(r => r === 100 ? 0 : r+1)
	}

	function invertShowLinks(){
		setShowLinks(v => !v)
	}

	function eraseSelectedCell(){
		if (!GameHandler.complete && GameHandler.game.selectedCell !== null){
			GameHandler.game.erase(GameHandler.game.selectedCell)
			setPossibleValues()
			setRender(r => r === 100 ? 0 : r+1)
		}
	}

	function handleKeyPress(e){
		if (e.key === 'Enter') {
			invertNoteMode()
		} else {
			if (['1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(e.key) && possibleValuesRef.current.includes(Number.parseInt(e.key))){
				handleNumberInput(Number.parseInt(e.key))
			} else if (e.key === '0'){
				eraseSelectedCell()
			} else if (['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'].includes(e.key)){
				switch (e.key){
					case 'ArrowDown':
						if (GameHandler.game.selectedCell !== null && GameHandler.game.selectedCell.y < 8) onClick(GameHandler.game.selectedCell.x, GameHandler.game.selectedCell.y + 1)
						break
					case 'ArrowUp':
						if (GameHandler.game.selectedCell !== null && GameHandler.game.selectedCell.y > 0) onClick(GameHandler.game.selectedCell.x, GameHandler.game.selectedCell.y - 1)
						break
					case 'ArrowLeft':
						if (GameHandler.game.selectedCell !== null && GameHandler.game.selectedCell.x > 0) onClick(GameHandler.game.selectedCell.x - 1, GameHandler.game.selectedCell.y)
						break
					case 'ArrowRight':
						if (GameHandler.game.selectedCell !== null && GameHandler.game.selectedCell.x < 8) onClick(GameHandler.game.selectedCell.x + 1, GameHandler.game.selectedCell.y)
						break
					default:
						break
				}
				setPossibleValues()
				setRender(r => r === 100 ? 0 : r+1)
			}
		}
	}

	function handleHintClick(){
		if (!GameHandler.complete && GameHandler.game.selectedCell !== null){
			if (hintState === 0){
				setHintState(1)
				setTimeout(() => {setHintState(0)}, 2000)
			} else if (hintState === 1){
				setHintState(0)
				GameHandler.game.hint(GameHandler.game.selectedCell)
				setPossibleValues()
				/*if (SettingsHandler.settings.autoChangeInputLock) lockedInputRef.current = 0;*/
				setRender(r => r === 100 ? 0 : r+1)
			}
		}
	}

	function handleEraseInkClick(){
		if (eraseInkState === 0){
			setEraseInkState(1)
			setTimeout(() => {setEraseInkState(0)}, 2000)
		} else if (eraseInkState === 1){
			setEraseInkState(0)
			GameHandler.game.clearColors()
			setRender(r => r === 100 ? 0 : r+1)
		}
	}

	function handleUndo(){
		if (!GameHandler.complete){
			GameHandler.game.popBoard()
			GameHandler.game.saveToLocalStorage()
			setPossibleValues()
			canvasRef.current.renderFrame()
			setRender(r => r === 100 ? 0 : r+1)
		}
	}

	function handleBrushClick(){
		brushRef.current = !brushRef.current
		setRender(r => r === 100 ? 0 : r+1)
	}

	function handleColorButtonClick(color, type){
		if (type === 'primary') handleSetColor(GameHandler.game.selectedCell, color)
		else {
			lockedColorRef.current = lockedColorRef.current === color ? null : color
			setRender(r => r === 100 ? 0 : r+1)
		}
	}

	function handleSetColor(coords, color){
		const cell = GameHandler.game.get(coords)
		if (
			cell.value === 0 &&
			(GameHandler.game.mode === 'killer' || cell.notes.length > 1)
		){
			GameHandler.game.setColor(coords, cell.color !== color ? color : 'default')
			setRender(r => r === 100 ? 0 : r+1)
		}
	}

	function setPossibleValues(){
		if (noteModeRef.current && GameHandler.game.getSelectedCell().value > 0) possibleValuesRef.current = []
		else possibleValuesRef.current = GameHandler.game.getPossibleValues(GameHandler.game.selectedCell)
		completedNumbersRef.current = GameHandler.game.getCompletedNumbers()
	}

	function handleNewGame(difficulty){
		GameHandler.newGame(GameHandler.game.mode, difficulty)
		
		if (GameHandler.game.getSelectedCell().value > 0 && SettingsHandler.settings.autoChangeInputLock) lockedInputRef.current = GameHandler.game.getSelectedCell().value
		else lockedInputRef.current = 0
		noteModeRef.current = false
		brushRef.current = false
		setWin(false)
		setShowLinks(false)
		setPossibleValues()
		setBookmark(GameHandler.currentGameIsBookmarked())

		newGameActionSheetRef.current.close()
		setRender(r => r === 100 ? 0 : r+1)
	}

	function handleBookmarkClick(){
		if (bookmark){
			setBookmark(false)
			GameHandler.removeBookmark({
				id: GameHandler.game._id,
				mission: GameHandler.game.mission
			})
		} else {
			setBookmark(true)
			GameHandler.bookmarkCurrentGame()
		}
	}

	useEffect(() => {
		if (GameHandler.game && !win) checkAnimation()
	})

	useEffect(() => {
		if (GameHandler.game === null){
			navigate('/')
			return
		}

		const keyPressEvent = window.addEventListener('keypress', handleKeyPress, false)

		setPossibleValues()
		setRender(r => r === 100 ? 0 : r+1)

		const windowVisibilityChangeEvent = window.addEventListener('visibilitychange', () => {
			if (GameHandler.game && !GameHandler.game.checkComplete()) GameHandler.game.saveToLocalStorage()
		})

		return () => {
			window.removeEventListener('keypress', keyPressEvent)
			window.removeEventListener('visibilitychange', windowVisibilityChangeEvent)
			GameHandler.game.saveToLocalStorage()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	if (GameHandler.game === null) return null

	return (
		<Section>
			{/* title={modeTranslations[GameHandler.game.mode]} subtitle={difficultyTranslations[GameHandler.game.difficulty]} */}
			<Topbar title={`${modeTranslations[GameHandler.game.mode]} - ${difficultyTranslations[GameHandler.game.difficulty]}`} titleSize={20} backURL="/">
				<FontAwesomeIcon className={`topbar__buttons__button bookmark-${bookmark ? 'on' : 'off'}`} icon={faBookmark} onClick={handleBookmarkClick} />
				<FontAwesomeIcon className='topbar__buttons__button' icon={faArrowUpFromBracket} onClick={() => {exportActionSheetRef.current.open()}} />
				<FontAwesomeIcon className='topbar__buttons__button' icon={faPlus} onClick={() => {newGameActionSheetRef.current.open()}} />
			</Topbar>
			<SectionContent paddingTop={0}>
				{
					win ? 
					<div className='sudoku__win-screen-wrapper'>
						<div className='sudoku__win-screen'>
							<div className='sudoku__win-screen__title'>¡Excelente!</div>
							<Button title="Nuevo juego" onClick={() => {newGameActionSheetRef.current.open()}} />
						</div>
					</div> :
					<div className="game">
						<div className="sudoku">
							<Canvas ref={canvasRef} onClick={onClick} showLinks={showLinks} game={GameHandler.game} lockedInput={lockedInputRef.current} theme={theme} setAnimationCallback={cb => {animationCallback = cb;}} />
						</div>
						<div className="numpad" onContextMenu={e => {e.preventDefault()}}>
							{(() => {
								let buttons = []
								const specialButtons = [
									<EditButton key={0} icon={faUndo} title="Undo" onClick={handleUndo}/>,
									<EditButton key={1} icon={faEraser} title="Erase" onClick={eraseSelectedCell}/>,
									<EditButton key={2} icon={faPencilAlt} highlight={noteModeRef.current} title="Notes" onClick={invertNoteMode}/>,
									<EditButton key={3} icon={faLightbulb} yellow={hintState === 1} title="Hint" onClick={handleHintClick}/>,
									<EditButton key={4} icon={faLink}  title="Links" highlight={showLinks} onClick={invertShowLinks}/>,
									<EditButton key={8} icon={faDroplet}  title="Paint" highlight={brushRef.current} onClick={handleBrushClick}/>,
									<EditButton key={12} icon={faDropletSlash}  title="Erase ink" yellow={eraseInkState === 1} onClick={handleEraseInkClick}/>
								]
								let specialButtonIndex = 0
								for (let y = 0; y < 4; y++){
									for (let x = 0; x < 4; x++){
										if (x === 0 || y === 0) buttons.push(specialButtons[specialButtonIndex++])
										else {
											const key = 4 * y + x
											const buttonIndex = 3 * (y - 1) + x
											buttons.push(brushRef.current ?
												<ColorButton
													key={key}
													theme={theme}
													color={colorNames[buttonIndex - 1]}
													locked={lockedColorRef.current === colorNames[buttonIndex - 1]}
													onClick={handleColorButtonClick}
												/> :
												<NumpadButton
													key={key}
													number={buttonIndex}
													disabled={possibleValuesRef.current !== null && !possibleValuesRef.current.includes(buttonIndex)}
													hidden={completedNumbersRef.current.includes(buttonIndex)}
													locked={!completedNumbersRef.current.includes(buttonIndex) && lockedInputRef.current === buttonIndex}
													onClick={handleNumpadButtonClick}
												/>
											)
										}
									}
								}
								return buttons
							})()}
						</div>
					</div>
				}
			</SectionContent>

			<ActionSheet reference={newGameActionSheetRef} title={`Nuevo juego`} cancelTitle="Cancelar">
				{
					(GameHandler.game.mode === 'classic' ? classicDifficulties : killerDifficulties).map(diff => (
						<ActionSheetButton key={diff} title={difficultyTranslations[diff]} color={diff === 'restart' ? 'var(--red)' : 'var(--theme-color)'} onClick={() => {handleNewGame(diff)}} />
					))
				}
			</ActionSheet>

			<ActionSheet reference={exportActionSheetRef} title={`Exportar tablero`} cancelTitle="Cancelar">
				<ActionSheetButton title="Copiar pistas" onClick={() => {
					try {
						copy(GameHandler.game.getTextRepresentation(true))
						exportActionSheetRef.current.close()
					} catch(e){
						alert(e)
					}
				}} />
				<ActionSheetButton title="Copiar tablero completo" onClick={() => {
					try {
						copy(GameHandler.game.getTextRepresentation(false))
						exportActionSheetRef.current.close()
					} catch(e){
						alert(e)
					}
				}} />
				{
					GameHandler.game.difficulty !== 'custom' ?
					<ActionSheetButton title="Copiar misión" onClick={() => {
						try {
							copy(GameHandler.exportMission())
							exportActionSheetRef.current.close()
						} catch(e){
							alert(e)
						}
					}} /> : null
				}				
			</ActionSheet>
		</Section>
	)
}

export default Sudoku