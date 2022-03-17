import React, { useEffect, useRef, useState } from 'react';
import API from '../utils/API';
import Board from '../utils/Board';
import Canvas from './Canvas';
import EditButton from './EditButton';
import NewGameButton from './NewGameButton';
import Section from './Section';
import eventBus from "./EventBus";

const Sudoku = () => {
	// eslint-disable-next-line
	const [render, setRender] = useState(0);
	const [hintState, setHintState] = useState(0);
	const [eraseInkState, setEraseInkState] = useState(0);
	const [showLinks, setShowLinks] = useState(false);
	const [brush, setBrush] = useState(false);

	const gameRef = useRef(null);
	const noteModeRef = useRef(null);
	const possibleValuesRef = useRef([]);
	const holdInput = useRef(null);

	const BOARD_API_VERSION = 2; //MUST BE EQUAL TO SERVER'S VERSION

	function onClick(x, y){
		if (gameRef.current.selectedCell === null || gameRef.current.selectedCell.x !== x || gameRef.current.selectedCell.y !== y){
			gameRef.current.setSelectedCell({x: x, y: y});
			setPossibleValues();
			if (holdInput.current !== null){
				if (holdInput === 0) eraseSelectedCell();
				else if (possibleValuesRef.current.includes(holdInput.current)) handleNumberInput(holdInput.current);
			} else {
				if (gameRef.current.getSelectedCell().value > 0) onHighlight(x, y);
				else setRender(r => r === 100 ? 0 : r+1);
			}
		} else {
			if (gameRef.current.getSelectedCell().value > 0) onHighlight(x, y);
		}
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
				}
				if (gameRef.current.checkComplete()){
					gameRef.current.clearLocalStorage();
					newGame(null);
				}
				setPossibleValues();
			} else if (!selectedCell.clue && selectedCell.value > 0 && !noteModeRef.current) {
				gameRef.current.setValue(gameRef.current.selectedCell, number);
				if (!gameRef.current.highlightedCell || gameRef.current.getSelectedCell().value !== gameRef.current.getHighlightedCell().value){
					onHighlight(gameRef.current.selectedCell.x, gameRef.current.selectedCell.y);
				}
				if (gameRef.current.checkComplete()){
					gameRef.current.clearLocalStorage();
					newGame(null);
				}
				setPossibleValues();
			}
		}
		setRender(r => r === 100 ? 0 : r+1);
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

	function handleKeyDown(e){
		if (e.key === 'Enter') {
			invertNoteMode();
		} else {
			if (['1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(e.key) && possibleValuesRef.current.includes(Number.parseInt(e.key))){
				if (holdInput.current === null){
					handleNumberInput(Number.parseInt(e.key));
					holdInput.current = Number.parseInt(e.key);
				}
			}
			else if (e.key === '0'){
				if (holdInput.current === null){
					eraseSelectedCell();
					holdInput.current = 0;
				}
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

	function handleKeyUp(e){
		holdInput.current = null;
	}

	function handleHintClick(){
		if (gameRef.current.selectedCell !== null){
			if (hintState === 0){
				setHintState(1);
				setTimeout(() => {setHintState(0)}, 2000);
			} else if (hintState === 1){
				setHintState(0);
				gameRef.current.hint(gameRef.current.selectedCell);
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
			for (let i = 0; i < 9; i++) for (let j = 0; j < 9; j++) gameRef.current.setColor({x: i, y: j}, 'default');
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
	}

	async function newGame(data = null){
		gameRef.current = new Board(data || await API.getGame());
		setPossibleValues();
		setRender(r => r === 100 ? 0 : r+1);
	}

	useEffect(() => {
		let ls = localStorage.getItem('game');
		if (ls){
			ls = JSON.parse(ls);
			if (ls?.version && ls.version === BOARD_API_VERSION) newGame(ls);
			else newGame(null);
		} else newGame(null);
		window.addEventListener('keydown', handleKeyDown, false);
		window.addEventListener('keyup', handleKeyUp, false);
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
				<div className="numpad">
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
							<div
								key={i}
								className={`numpad__button number ${possibleValuesRef.current !== null && !possibleValuesRef.current.includes(i + 1) ? 'hidden' : ''}`}
								onClick={(e) => {
									e.stopPropagation();
									if (possibleValuesRef.current == null || (possibleValuesRef.current !== null && possibleValuesRef.current.includes(i + 1))) handleNumberInput(i + 1)
								}}
							>
								{i + 1}
							</div>
						))}
				</div>
			</div>
		</Section>
	)
}

export default Sudoku;