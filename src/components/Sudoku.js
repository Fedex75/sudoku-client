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

const Sudoku = () => {
	// eslint-disable-next-line
	const [render, setRender] = useState(0);
	const [hintState, setHintState] = useState(0);
	const [eraseInkState, setEraseInkState] = useState(0);
	const [showLinks, setShowLinks] = useState(false);
	const [brush, setBrush] = useState(false);
	const [lockedInput, setLockedInput] = useState(0);
	const [win, setWin] = useState(false);
	const [loading, setLoading] = useState(false);

	const gameRef = useRef(null);
	const noteModeRef = useRef(null);
	const possibleValuesRef = useRef([]);
	const completedNumbersRef = useRef([]);

	const BOARD_API_VERSION = 2; //MUST BE EQUAL TO SERVER'S VERSION

	function onClick(x, y){
		if (gameRef.current.selectedCell.x !== x || gameRef.current.selectedCell.y !== y){
			//Click on unselected cell
			gameRef.current.setSelectedCell({x: x, y: y});
			let value = gameRef.current.getSelectedCell().value;
			setPossibleValues();
			if (value > 0){
				onHighlight(x, y);
				if (lockedInput > 0 && SettingsHandler.settings.autoChangeInputLock) setLockedInput(value);
			} else if (lockedInput > 0 && !brush && possibleValuesRef.current.includes(lockedInput)) handleNumberInput(lockedInput);
			
		} else {
			//Click on selected cell
			if (gameRef.current.getSelectedCell().value > 0) onHighlight(x, y);
			if (lockedInput > 0 && possibleValuesRef.current.includes(lockedInput)) handleNumberInput(lockedInput);
		}
		setRender(r => r === 100 ? 0 : r+1);
	}

	function onHighlight(x, y){
		if (gameRef.current.highlightedCell === null || gameRef.current.highlightedCell.x !== x || gameRef.current.highlightedCell.y !== y){
			gameRef.current.setHighlightedCell({x: x, y: y});
			setRender(r => r === 100 ? 0 : r+1);
		} else {
			if (gameRef.current.highlightedCell !== null){
				gameRef.current.setHighlightedCell(null);
				setRender(r => r === 100 ? 0 : r+1);
			}
		}
	}

	function handleNumberInput(number){
		if (gameRef.current.selectedCell !== null){
			const selectedCell = gameRef.current.getSelectedCell();
			if (selectedCell.value === 0){
				if (noteModeRef.current) gameRef.current.setNote(gameRef.current.selectedCell, number);
				else {
					gameRef.current.setValue(gameRef.current.selectedCell, number);
					if (!gameRef.current.highlightedCell || gameRef.current.getSelectedCell().value !== gameRef.current.getHighlightedCell().value){
						onHighlight(gameRef.current.selectedCell.x, gameRef.current.selectedCell.y);
					}
					let animation = [];

					if (gameRef.current.checkComplete()){
						eventBus.dispatch('doAnimation', [
							{
								type: 'board',
								center: gameRef.current.selectedCell
							}
						]);
						setTimeout(() => {setWin(true);}, 1350);
					} else {
						let flagRow = true;
						let flagCol = true;
						for (let i = 0; i < 9; i++){
							if (gameRef.current.get({x: i, y: gameRef.current.selectedCell.y}).value === 0){
								flagRow = false;
							}
							if (gameRef.current.get({x: gameRef.current.selectedCell.x, y: i}).value === 0){
								flagCol = false;
							}
						}
						if (flagRow){
							animation.push({
								type: 'row',
								center: gameRef.current.selectedCell
							});
						}
						if (flagCol){
							animation.push({
								type: 'col',
								center: gameRef.current.selectedCell
							});
						}
	
						flagRow = true; //Recicle flagRow as flagQuadrant
						let quadrantX = Math.floor(gameRef.current.selectedCell.x / 3);
						let quadrantY = Math.floor(gameRef.current.selectedCell.y / 3);
						for (let x = 0; x < 3; x++){
							for (let y = 0; y < 3; y++){
								if (gameRef.current.get({x: quadrantX * 3 + x, y: quadrantY * 3 + y}).value === 0){
									flagRow = false;
									break;
								}
							}
						}
						if (flagRow){
							animation.push({
								type: 'quadrant',
								quadrantX: quadrantX,
								quadrantY: quadrantY
							});
						}
						eventBus.dispatch('doAnimation', animation);
					}
				}
				setPossibleValues();
			} else if (!selectedCell.clue && selectedCell.value > 0 && !noteModeRef.current) {
				gameRef.current.setValue(gameRef.current.selectedCell, number);
				if (!gameRef.current.highlightedCell || gameRef.current.getSelectedCell().value !== gameRef.current.getHighlightedCell().value){
					onHighlight(gameRef.current.selectedCell.x, gameRef.current.selectedCell.y);
				}
				setPossibleValues();
				if (gameRef.current.checkComplete()){
					setWin(true);
				}
			}
		}
		setRender(r => r === 100 ? 0 : r+1);
	}

	function handleNumpadButtonClick(number, type){
		if (type === 'primary'){
			if (possibleValuesRef.current == null || (possibleValuesRef.current !== null && possibleValuesRef.current.includes(number))) handleNumberInput(number);
		} else {
			setLockedInput(li => li === number ? 0 : number);
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
			}
			else if (e.key === '0'){
				eraseSelectedCell();
			}
			else if (['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'].includes(e.key)){
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
				onHighlight(gameRef.current.selectedCell.x, gameRef.current.selectedCell.y);
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

	async function handleNewGame(dif){
		if (dif === 'restart'){
			gameRef.current.restart();
			setRender(r => r === 100 ? 0 : r+1);
		} else {
			newGame(await API.getGame(dif));
		}
	}

	function handleBrushClick(){
		setBrush(b => !b);
	}

	function handleColorButtonClick(color){
		gameRef.current.setColor(gameRef.current.selectedCell, gameRef.current.getSelectedCell().color !== color ? color : 'default');
		setRender(r => r === 100 ? 0 : r+1);
	}

	function setPossibleValues(){
		if (gameRef.current.selectedCell === null || (noteModeRef.current && gameRef.current.getSelectedCell().value > 0)) possibleValuesRef.current = [];
		else possibleValuesRef.current = gameRef.current.getPossibleValues(gameRef.current.selectedCell);
		completedNumbersRef.current = gameRef.current.getCompletedNumbers();
	}

	async function newGame(data = null){
		setWin(false);
		setLoading(true);
		if (data){
			gameRef.current = new Board(data);
			setLoading(false);
			setPossibleValues();
			setRender(r => r === 100 ? 0 : r+1);
		} else {
			API.getGame().then(board => {
				gameRef.current = new Board(board);
				setLoading(false);
				setPossibleValues();
				setRender(r => r === 100 ? 0 : r+1);
			});
		}
	}

	useEffect(() => {
		let ls = localStorage.getItem('game');
		if (ls){
			ls = JSON.parse(ls);
			if (ls?.version && ls.version === BOARD_API_VERSION) newGame(ls);
			else newGame(null);
		} else newGame(null);
		window.addEventListener('keypress', handleKeyPress, false);
		eventBus.on("newGame", (data) => {
      handleNewGame(data.difficulty);
		});
		
		return () => {
			eventBus.remove("newGame");
		}
	// eslint-disable-next-line
	}, []);

	if (gameRef.current === null){
		return <div className="game"></div>
	}

	return (
		<Section name="sudoku">
			{win ? 
				<div className='sudoku__win-screen-wrapper'>
					<div className='sudoku__win-screen'>
						<div className='sudoku__win-screen__title'>¡Excelente!</div>
						<NewGameButton />
					</div>
				</div> :
				loading ?
				<div className='sudoku__loading-screen'>
					<ReactLoading />
				</div> :
				<div className="game">
					<div className="sudoku">
						<Canvas onClick={onClick} onHighlight={onHighlight} showLinks={showLinks} game={gameRef.current} />
					</div>
					<NewGameButton id="large-new-game-button"/>
					<div className="edit__buttons">
						<EditButton icon="fas fa-undo" title="Undo" onClick={handleUndo}/>
						<EditButton icon="fas fa-eraser" title="Erase" onClick={eraseSelectedCell}/>
						<EditButton icon="fas fa-pencil-alt" highlight={noteModeRef.current} title="Notes" onClick={invertNoteMode}/>
						<EditButton icon="fas fa-lightbulb" yellow={hintState === 1} title="Hint" onClick={handleHintClick}/>
					</div>
					<div className="extra__buttons">
						<EditButton icon="fas fa-link"  title="Links" highlight={showLinks} onClick={invertShowLinks}/>
						<EditButton icon="fas fa-droplet"  title="Paint" highlight={brush} onClick={handleBrushClick}/>
						<EditButton icon="fas fa-droplet-slash"  title="Erase ink" yellow={eraseInkState === 1} onClick={handleEraseInkClick}/>
					</div>
					<div className="numpad" onContextMenu={e => {e.preventDefault()}}>
						{brush ?
							['red', 'orange', 'yellow', 'green', 'blueGreen', 'lightBlue', 'darkBlue', 'purple', 'default'].map((color, i) => (
								<div
									key={i}
									className={'numpad__button color'}
									onClick={(e) => {
										e.stopPropagation();
										handleColorButtonClick(color);
									}}
									style={{backgroundColor: gameRef.current.colors[color]}}
								>
								</div>
							)) : Array(9).fill().map((_, i) => (
								<NunmpadButton
									key={i}
									number={i+1}
									className={`numpad__button number ${(possibleValuesRef.current !== null && !possibleValuesRef.current.includes(i + 1)) /*|| (lockedInput > 0 && lockedInput !== i + 1)*/ ? 'disabled' : ''} ${completedNumbersRef.current.includes(i + 1) ? 'hidden' : ''} ${!completedNumbersRef.current.includes(i + 1) &&  lockedInput === i + 1 ? 'locked' : ''}`}
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