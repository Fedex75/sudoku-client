import React, { useEffect, useRef, useState } from 'react';
import API from '../utils/API';
import Board from '../utils/Board';
import Canvas from './Canvas';
import EditButton from './EditButton';
import NewGameButton from './NewGameButton';
import Section from './Section';
import eventBus from "./EventBus";
import SettingsHandler from '../utils/SettingsHandler';
import NunmpadButton from './NumpadButton';
import ReactLoading from 'react-loading';
import Auth from '../utils/Auth';

let animationCallback = null;

const Sudoku = ({themeName, theme, toggleTheme, gameMode, setGameMode}) => {
	// eslint-disable-next-line
	const [render, setRender] = useState(0);
	const [hintState, setHintState] = useState(0);
	const [eraseInkState, setEraseInkState] = useState(0);
	const [showLinks, setShowLinks] = useState(false);
	const [win, setWin] = useState(false);
	const [loading, setLoading] = useState(false);

	const gameRef = useRef(null);
	const noteModeRef = useRef(null);
	const possibleValuesRef = useRef([]);
	const completedNumbersRef = useRef([]);
	const lockedInputRef = useRef(0);
	const brushRef = useRef(false);

	const BOARD_API_VERSION = 4; //MUST BE EQUAL TO SERVER'S VERSION

	const colors = {
		default: theme.canvasLightDefaultCellColor,
		red: '#fc5c65',
		orange: '#fd9644',
		yellow: '#fed330',
		green: '#26de81',
		blueGreen: '#2bcbba',
		lightBlue: '#45aaf2',
		darkBlue: '#4b7bec',
		purple: '#a55eea'
	}

	function onClick(x, y, button, hold = false){
		switch (button){
			case 0:
				if (noteModeRef && hold){
					handleRemoveNote({x: x, y: y});
				} else {
					if (gameRef.current.selectedCell.x !== x || gameRef.current.selectedCell.y !== y){
						//Click on unselected cell
						gameRef.current.setSelectedCell({x: x, y: y});
						let value = gameRef.current.getSelectedCell().value;
						setPossibleValues();
						if (value > 0){
							if (SettingsHandler.settings.autoChangeInputLock && gameRef.current.mode === 'classic') lockedInputRef.current = value;
							setRender(r => r === 100 ? 0 : r+1);
						} else {
							if (lockedInputRef.current > 0 && !brushRef.current && possibleValuesRef.current.includes(lockedInputRef.current)) handleNumberInput(lockedInputRef.current);
							else setRender(r => r === 100 ? 0 : r+1);
						}
					} else {
						//Click on selected cell
						let value = gameRef.current.getSelectedCell().value;
						if (value > 0 && SettingsHandler.settings.autoChangeInputLock && gameRef.current.mode === 'classic') lockedInputRef.current = lockedInputRef.current === 0 ? value : 0;
						if (lockedInputRef.current > 0 && !brushRef.current && possibleValuesRef.current.includes(lockedInputRef.current)) handleNumberInput(lockedInputRef.current);
						else setRender(r => r === 100 ? 0 : r+1);
					}
				}
				break;
			case 1:
				handleSetColor({x: x, y: y}, 'darkBlue');
				break;
			case 2:
				const value = gameRef.current.get({x: x, y: y}).value;
				if (value === 0){
					handleRemoveNote({x: x, y: y});
				} else if (!hold){
					gameRef.current.setSelectedCell({x: x, y: y});
					if (value > 0 && SettingsHandler.settings.autoChangeInputLock){
						lockedInputRef.current = lockedInputRef.current === value ? 0 : value;
						setRender(r => r === 100 ? 0 : r+1);
					}
				}
				break;
			default:
				break;
		}
		setRender(r => r === 100 ? 0 : r+1);
	}

	function handleRemoveNote(coords){
		if (
			lockedInputRef.current > 0 &&
			!brushRef.current &&
			gameRef.current.getPossibleValues(coords).includes(lockedInputRef.current)
		){
			gameRef.current.setNote(coords, lockedInputRef.current);
		}
		setRender(r => r === 100 ? 0 : r+1);
	}

	function checkAnimation(){
		let animation = [];
		if (gameRef.current.checkComplete()){
			if (animationCallback) animationCallback([
				{
					type: 'board',
					center: gameRef.current.selectedCell
				}
			]);
			setTimeout(() => {setWin(true);}, 1350);
		} else {
			for (let i = 0; i < 9; i++){
				let flagRow = true;
				let flagCol = true;
				for (let j = 0; j < 9; j++){
					if (gameRef.current.get({x: j, y: i}).value === 0){
						flagRow = false;
					}
					if (gameRef.current.get({x: i, y: j}).value === 0){
						flagCol = false;
					}
				}
				if (flagRow && !gameRef.current.animationCache.rows[i]){
					gameRef.current.animationCache.rows[i] = true;
					animation.push({
						type: 'row',
						center: {
							x: gameRef.current.selectedCell.x,
							y: i
						}
					});
				}
				if (flagCol && !gameRef.current.animationCache.cols[i]){
					gameRef.current.animationCache.cols[i] = true;
					animation.push({
						type: 'col',
						center: {
							x: i,
							y: gameRef.current.selectedCell.y
						}
					});
				}	
			}
			for (let qx = 0; qx < 3; qx++){
				for (let qy = 0; qy < 3; qy++){
					if (!gameRef.current.animationCache.quadrants[qy*3+qx]){
						let flagQuadrant = true;
						for (let x = 0; x < 3; x++){
							for (let y = 0; y < 3; y++){
								if (gameRef.current.get({x: qx * 3 + x, y: qy * 3 + y}).value === 0){
									flagQuadrant = false;
									break;
								}
							}
						}
						if (flagQuadrant){
							gameRef.current.animationCache.quadrants[qy*3+qx] = true;
							animation.push({
								type: 'quadrant',
								quadrantX: qx,
								quadrantY: qy
							});
						}
					}
				}
			}
			if (animation.length > 0 && animationCallback) animationCallback(animation, lockedInputRef.current);
		}
		gameRef.current.saveToLocalStorage();
	}

	function handleNumberInput(number){
		if (gameRef.current.selectedCell !== null){
			const selectedCell = gameRef.current.getSelectedCell();
			if (selectedCell.value === 0){
				if (noteModeRef.current) gameRef.current.setNote(gameRef.current.selectedCell, number);
				else {
					gameRef.current.setValue(gameRef.current.selectedCell, number);
					if (SettingsHandler.settings.autoChangeInputLock && gameRef.current.mode === 'classic') lockedInputRef.current = number;
				}
			} else if (!selectedCell.clue && selectedCell.value > 0 && !noteModeRef.current) {
				gameRef.current.setValue(gameRef.current.selectedCell, number);
			}
		}
		setPossibleValues();
		setRender(r => r === 100 ? 0 : r+1);
	}

	function handleNumpadButtonClick(number, type){
		if (type === 'primary'){
			if (possibleValuesRef.current == null || (possibleValuesRef.current !== null && possibleValuesRef.current.includes(number))) handleNumberInput(number);
		} else {
			lockedInputRef.current = lockedInputRef.current === number ? 0 : number;
			setRender(r => r === 100 ? 0 : r+1);
		}
	}

	function invertNoteMode(){
		noteModeRef.current = !noteModeRef.current;
		setPossibleValues();
		setRender(r => r === 100 ? 0 : r+1);
	}

	function invertShowLinks(){
		setShowLinks(v => !v);
	}

	function eraseSelectedCell(){
		if (gameRef.current.selectedCell !== null){
			gameRef.current.erase(gameRef.current.selectedCell);
			setPossibleValues();
			setRender(r => r === 100 ? 0 : r+1);
		}
	}

	function handleKeyPress(e){
		if (e.key === 'Enter') {
			invertNoteMode();
		} else {
			if (['1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(e.key) && possibleValuesRef.current.includes(Number.parseInt(e.key))){
				handleNumberInput(Number.parseInt(e.key));
			} else if (e.key === '0'){
				eraseSelectedCell();
			} else if (e.key === 'f'){
				gameRef.current.fullNotation = !gameRef.current.fullNotation;
			} else if (e.key === 'c'){
				navigator.clipboard.writeText(gameRef.current.getTextRepresentation());
			} else if (['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'].includes(e.key)){
				// eslint-disable-next-line
				switch (e.key){
					case 'ArrowDown':
						if (gameRef.current.selectedCell !== null && gameRef.current.selectedCell.y < 8) onClick(gameRef.current.selectedCell.x, gameRef.current.selectedCell.y + 1);
						break;
					case 'ArrowUp':
						if (gameRef.current.selectedCell !== null && gameRef.current.selectedCell.y > 0) onClick(gameRef.current.selectedCell.x, gameRef.current.selectedCell.y - 1);
						break;
					case 'ArrowLeft':
						if (gameRef.current.selectedCell !== null && gameRef.current.selectedCell.x > 0) onClick(gameRef.current.selectedCell.x - 1, gameRef.current.selectedCell.y);
						break;
					case 'ArrowRight':
						if (gameRef.current.selectedCell !== null && gameRef.current.selectedCell.x < 8) onClick(gameRef.current.selectedCell.x + 1, gameRef.current.selectedCell.y);
						break;
				}
				setPossibleValues();
				setRender(r => r === 100 ? 0 : r+1);
			}
		}
	}

	function handleHintClick(){
		if (gameRef.current.selectedCell !== null){
			if (hintState === 0){
				setHintState(1);
				setTimeout(() => {setHintState(0)}, 2000);
			} else if (hintState === 1){
				setHintState(0);
				gameRef.current.hint(gameRef.current.selectedCell);
				setPossibleValues();
				/*if (SettingsHandler.settings.autoChangeInputLock) lockedInputRef.current = 0;*/
				setRender(r => r === 100 ? 0 : r+1);
			}
		}
	}

	function handleEraseInkClick(){
		if (eraseInkState === 0){
			setEraseInkState(1);
			setTimeout(() => {setEraseInkState(0)}, 2000);
		} else if (eraseInkState === 1){
			setEraseInkState(0);
			gameRef.current.clearColors();
			setRender(r => r === 100 ? 0 : r+1);
		}
	}

	function handleUndo(){
		gameRef.current.popBoard();
		gameRef.current.saveToLocalStorage();
		setPossibleValues();
		setRender(r => r === 100 ? 0 : r+1);
	}

	function handleBrushClick(){
		brushRef.current = !brushRef.current;
		setRender(r => r === 100 ? 0 : r+1);
	}

	function handleSetColor(coords, color){
		const selectedCell = gameRef.current.get(coords);
		if (selectedCell.value === 0){
			gameRef.current.setColor(coords, selectedCell.color !== color ? color : 'default');
			setRender(r => r === 100 ? 0 : r+1);
		}
	}

	function setPossibleValues(){
		if (noteModeRef.current && gameRef.current.getSelectedCell().value > 0) possibleValuesRef.current = [];
		else possibleValuesRef.current = gameRef.current.getPossibleValues(gameRef.current.selectedCell);
		completedNumbersRef.current = gameRef.current.getCompletedNumbers();
	}

	async function handleNewGame(difficulty, mode){
		if (difficulty === 'restart'){
			newGame(null, gameRef.current.id, gameRef.current.difficulty, gameRef.current.mode);
		} else {
			newGame(null, null, difficulty, mode);
		}
	}

	async function newGame(data, id, difficulty, mode){
		setWin(false);
		setLoading(true);
		if (data){
			gameRef.current = new Board(data, false);
			afterNewGame();
		} else {
			API.getGame(id, difficulty, mode).then(board => {
				gameRef.current = new Board(board, true);
				afterNewGame();
			});
		}
	}

	function afterNewGame(){
		if (gameRef.current.getSelectedCell().value > 0 && SettingsHandler.settings.autoChangeInputLock) lockedInputRef.current = gameRef.current.getSelectedCell().value;
		else lockedInputRef.current = 0;
		noteModeRef.current = false;
		setLoading(false);
		setPossibleValues();
		setRender(r => r === 100 ? 0 : r+1);
	}

	useEffect(() => {
		if (gameRef.current && !win && !loading) checkAnimation();
	});

	useEffect(() => {
		let data;
		if (Auth.isAuthenticated() && Auth.user.savedGame){
			data = JSON.parse(Auth.user.savedGame);
		} else {
			const ls = localStorage.getItem('game');	
			data = ls ? JSON.parse(ls) : null;
		}
		
		if (data?.version && data.version === BOARD_API_VERSION){
			setGameMode(data.mode)
			newGame(data, null, null, null);
		} else newGame(null, null, null, 'classic');

		const keyPressEvent = window.addEventListener('keypress', handleKeyPress, false);
		eventBus.on("newGame", (data) => {
      		handleNewGame(data.difficulty, data.mode);
		});
		const windowUnloadEvent = window.addEventListener('unload', gameRef.current.saveToLocalStorage);

		return () => {
			eventBus.remove("newGame");
			window.removeEventListener('keypress', keyPressEvent);
			window.removeEventListener('unload', windowUnloadEvent);
			gameRef.current.saveToLocalStorage();
		}
	}, []);

	if (gameRef.current === null){
		return <div className="game"></div>
	}

	return (
		<Section name="sudoku" themeName={themeName} toggleTheme={toggleTheme} gameMode={gameMode} setGameMode={setGameMode}>
			{win ? 
				<div className='sudoku__win-screen-wrapper'>
					<div className='sudoku__win-screen'>
						<div className='sudoku__win-screen__title'>¡Excelente!</div>
						<NewGameButton gameMode={gameMode} setGameMode={setGameMode} />
					</div>
				</div> :
				loading ?
				<div className='sudoku__loading-screen'>
					<ReactLoading type='spin' color='#4b7bec' height={50} width={50} />
				</div> :
				<div className="game">
					<div className="sudoku">
						<Canvas onClick={onClick} showLinks={showLinks} game={gameRef.current} lockedInput={lockedInputRef.current} theme={theme} setAnimationCallback={cb => {animationCallback = cb;}} />
					</div>
					<NewGameButton id="large-new-game-button" gameMode={gameMode} setGameMode={setGameMode}/>
					<div className="edit__buttons">
						<EditButton icon="fas fa-undo" title="Undo" onClick={handleUndo}/>
						<EditButton icon="fas fa-eraser" title="Erase" onClick={eraseSelectedCell}/>
						<EditButton icon="fas fa-pencil-alt" highlight={noteModeRef.current} title="Notes" onClick={invertNoteMode}/>
						<EditButton icon="fas fa-lightbulb" yellow={hintState === 1} title="Hint" onClick={handleHintClick}/>
					</div>
					<div className="extra__buttons">
						<EditButton icon="fas fa-link"  title="Links" highlight={showLinks} onClick={invertShowLinks}/>
						<EditButton icon="fas fa-droplet"  title="Paint" highlight={brushRef.current} onClick={handleBrushClick}/>
						<EditButton icon="fas fa-droplet-slash"  title="Erase ink" yellow={eraseInkState === 1} onClick={handleEraseInkClick}/>
					</div>
					<div className="numpad" onContextMenu={e => {e.preventDefault()}}>
						{brushRef.current ?
							['red', 'orange', 'yellow', 'green', 'blueGreen', 'lightBlue', 'darkBlue', 'purple', 'default'].map((color, i) => (
								<div
									key={i}
									className={'numpad__button color'}
									onClick={(e) => {
										e.stopPropagation();
										handleSetColor(gameRef.current.selectedCell, color);
									}}
									style={{backgroundColor: colors[color]}}
								>
								</div>
							)) : Array(9).fill().map((_, i) => (
								<NunmpadButton
									key={i}
									number={i+1}
									className={`numpad__button number ${(possibleValuesRef.current !== null && !possibleValuesRef.current.includes(i + 1)) /*|| (lockedInputRef.current > 0 && lockedInputRef.current !== i + 1)*/ ? 'disabled' : ''} ${completedNumbersRef.current.includes(i + 1) ? 'hidden' : ''} ${!completedNumbersRef.current.includes(i + 1) &&  lockedInputRef.current === i + 1 ? 'locked' : ''}`}
									onClick={handleNumpadButtonClick}
								/>
							))}
					</div>
				</div>
			}
		</Section>
	)
}

export default Sudoku;