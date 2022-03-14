import React, { useEffect, useRef, useState } from 'react';
import API from '../API';
import Board from '../utils/Board';
import Canvas from './Canvas';
import EditButton from './EditButton';
import MenuButton from './MenuButton';
import Section from './Section';

const Sudoku = () => {
	const [render, setRender] = useState(false);
	const [hintState, setHintState] = useState(0);
	const [newGameState, setNewGameState] = useState(0);
	const [showLinks, setShowLinks] = useState(false);

	const gameRef = useRef(null);
	const noteModeRef = useRef(null);
	const possibleValuesRef = useRef([]);
	const holdInput = useRef(null);

	const difficulties = ['easy', 'medium', 'hard', 'expert', 'evil', 'restart'];

	function onSelect(x, y){
		if (gameRef.current.selectedCell === null || gameRef.current.selectedCell.x !== x || gameRef.current.selectedCell.y !== y){
			gameRef.current.setselectedCell({x: x, y: y});
			setPossibleValues();
			if (holdInput.current !== null){
				if (holdInput === 0) eraseSelectedCell();
				else if (possibleValuesRef.current.includes) handleNumberInput(holdInput.current);
			} else {
				if (gameRef.current.getSelectedCell().value > 0) onHighlight(x, y);
				else setRender(render => !render);
			}
		} else {
			if (gameRef.current.getSelectedCell().value > 0) onHighlight(x, y);
		}
	}

	function onHighlight(x, y){
		if (gameRef.current.highlightedCell === null || gameRef.current.highlightedCell.x !== x || gameRef.current.highlightedCell.y !== y){
			gameRef.current.setHighlightedCell({x: x, y: y});
			setRender(render => !render);
		} else {
			if (gameRef.current.highlightedCell !== null){
				gameRef.current.setHighlightedCell(null);
				setRender(render => !render);
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
						console.log('here1');
						onHighlight(gameRef.current.selectedCell.x, gameRef.current.selectedCell.y);
					}
				}
				if (gameRef.current.checkComplete()){
					gameRef.current.clearLocalStorage();
					newGame(null);
				}
				setPossibleValues();
				setRender(render => !render);
			} else if (!selectedCell.clue && selectedCell.value > 0 && !noteModeRef.current) {
				gameRef.current.setValue(gameRef.current.selectedCell, number);
				if (!gameRef.current.highlightedCell || gameRef.current.getSelectedCell().value !== gameRef.current.getHighlightedCell().value){
					console.log('here2');
					onHighlight(gameRef.current.selectedCell.x, gameRef.current.selectedCell.y);
				}
				if (gameRef.current.checkComplete()){
					gameRef.current.clearLocalStorage();
					newGame(null);
				}
				setPossibleValues();
				setRender(render => !render);
			}
		}
	}

	function invertNoteMode(){
		noteModeRef.current = !noteModeRef.current;
		setPossibleValues();
		setRender(render => !render);
	}

	function invertShowLinks(){
		setShowLinks(v => !v);
	}

	function eraseSelectedCell(){
		if (gameRef.current.selectedCell !== null){
			gameRef.current.erase(gameRef.current.selectedCell);
			setPossibleValues();
			setRender(render => !render);
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
				switch (e.key){
					case 'ArrowDown':
						if (gameRef.current.selectedCell !== null && gameRef.current.selectedCell.y < 8) gameRef.current.selectedCell.y++;
						break;
					case 'ArrowUp':
						if (gameRef.current.selectedCell !== null && gameRef.current.selectedCell.y > 0) gameRef.current.selectedCell.y--;
						break;
					case 'ArrowLeft':
						if (gameRef.current.selectedCell !== null && gameRef.current.selectedCell.x > 0) gameRef.current.selectedCell.x--;
						break;
					case 'ArrowRight':
						if (gameRef.current.selectedCell !== null && gameRef.current.selectedCell.x < 8) gameRef.current.selectedCell.x++;
						break;
				}
				setPossibleValues();
				setRender(render => !render);
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
				setRender(render => !render);
			}
		}
	}

	function handleUndo(){
		gameRef.current.popBoard();
		gameRef.current.saveToLocalStorage();
		setPossibleValues();
		setRender(render => !render);
	}

	function handleNewGameClick(){
		if (newGameState === 0) setNewGameState(1);
		else setNewGameState(0);
	}

	async function handleMenuButtonClick(dif){
		if (dif === 'restart'){
			gameRef.current.restart();
		} else {
			newGame(await API.getGame(dif));
		}
		setNewGameState(0);
	}

	function setPossibleValues(){
		if (gameRef.current.selectedCell === null || (noteModeRef.current && gameRef.current.getSelectedCell().value > 0)) possibleValuesRef.current = [];
		else possibleValuesRef.current = gameRef.current.getPossibleValues(gameRef.current.selectedCell);
	}

	async function newGame(data = null){
		gameRef.current = new Board(data || await API.getGame());
		setPossibleValues();
		setRender(render => !render);
	}

	useEffect(() => {
		let ls = localStorage.getItem('game');
		newGame( ls ? JSON.parse(ls) : null);
		window.addEventListener('keydown', handleKeyDown, false);
		window.addEventListener('keyup', handleKeyUp, false);
	}, []);

	if (gameRef.current === null){
		return <div className="game"></div>
	}

	return (
		<Section name="sudoku">
			<div className="game">
				<div className="sudoku">
					<Canvas onSelect={onSelect} onHighlight={onHighlight} showLinks={showLinks} game={gameRef.current} />
				</div>
				<div className="new-game-wrapper" onClick={e => {e.stopPropagation()}}>
					<div className="new-game-button" onClick={handleNewGameClick}>New Game</div>
					<div className={`new-game-menu ${newGameState === 0 ? 'hidden' : 'visible'}`}>
						{difficulties.map((dif, i) => (
							<MenuButton key={i} icon={dif === 'restart' ? 'fas fa-redo' : 'fas fa-th'} title={dif.replace(/./, c => c.toUpperCase())} onClick={() => handleMenuButtonClick(dif)} />
						))}
					</div>
				</div>
				<div className="edit__buttons">
					<EditButton icon="fas fa-undo" title="Undo" onClick={handleUndo}/>
					<EditButton icon="fas fa-eraser" title="Erase" onClick={eraseSelectedCell}/>
					<EditButton icon="fas fa-pencil-alt" highlight={noteModeRef.current} title="Notes" onClick={invertNoteMode}/>
					<EditButton icon="fas fa-lightbulb" yellow={hintState === 1} title="Hint" onClick={handleHintClick}/>
					<EditButton icon="fas fa-link"  title="Links" highlight={showLinks} onClick={invertShowLinks}/>
				</div>
				<div className="numpad">
					{Array(9).fill().map((_, i) => (
						<div
							key={i}
							className={`numpad__button ${possibleValuesRef.current !== null && !possibleValuesRef.current.includes(i + 1) ? 'hidden' : ''}`}
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