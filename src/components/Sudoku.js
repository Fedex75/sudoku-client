import React, { useEffect, useRef, useState } from 'react';
import API from '../API';
import Board from '../utils/Board';
import Canvas from './Canvas';
import EditButton from './EditButton';

const Sudoku = () => {
	const [render, setRender] = useState(false);
	const [hintState, setHintState] = useState(0);

	const gameRef = useRef(null);
	const noteModeRef = useRef(null);
	const possibleValuesRef = useRef([]);

	function onSelect(x, y){
		if (gameRef.current.selectionCoords === null || gameRef.current.selectionCoords.x !== x || gameRef.current.selectionCoords.y !== y){
			gameRef.current.setSelectionCoords({x: x, y: y});
			setPossibleValues();
			setRender(render => !render);
		}
	}

	function handleNumberInput(number){
		if (gameRef.current.selectionCoords !== null){
			const selectedCell = gameRef.current.getSelectedCell();
			if (selectedCell.value === 0){
				if (noteModeRef.current) gameRef.current.setNote(gameRef.current.selectionCoords, number);
				else gameRef.current.setValue(gameRef.current.selectionCoords, number);
				setPossibleValues();
				setRender(render => !render);
			} else if (!selectedCell.clue && selectedCell.value > 0 && !noteModeRef.current) {
				gameRef.current.setValue(gameRef.current.selectionCoords, number);
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

	function eraseSelectedCell(){
		if (gameRef.current.selectionCoords !== null){
			gameRef.current.erase(gameRef.current.selectionCoords);
			setRender(render => !render);
		}
	}

	function handleKeyDown(e){
		if (e.key === 'Enter') {
			invertNoteMode();
		} else {
			if (['1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(e.key)) handleNumberInput(Number.parseInt(e.key));
			else if (e.key === '0') eraseSelectedCell();
			else if (['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'].includes(e.key)){
				switch (e.key){
					case 'ArrowDown':
						if (gameRef.current.selectionCoords !== null && gameRef.current.selectionCoords.y < 8) gameRef.current.selectionCoords.y++;
						break;
					case 'ArrowUp':
						if (gameRef.current.selectionCoords !== null && gameRef.current.selectionCoords.y > 0) gameRef.current.selectionCoords.y--;
						break;
					case 'ArrowLeft':
						if (gameRef.current.selectionCoords !== null && gameRef.current.selectionCoords.x > 0) gameRef.current.selectionCoords.x--;
						break;
					case 'ArrowRight':
						if (gameRef.current.selectionCoords !== null && gameRef.current.selectionCoords.x < 8) gameRef.current.selectionCoords.x++;
						break;
				}
				setRender(render => !render);
			}
		}
	}

	function handleHintClick(){
		if (gameRef.current.selectionCoords !== null){
			if (hintState === 0){
				setHintState(1);
				setTimeout(() => {setHintState(0)}, 2000);
			} else if (hintState === 1){
				setHintState(0);
				gameRef.current.hint(gameRef.current.selectionCoords);
				setRender(render => !render);
			}
		}
	}

	function handleUndo(){
		gameRef.current.popBoard();
		setRender(render => !render);
	}

	function setPossibleValues(){
		if (gameRef.current.selectionCoords === null || (noteModeRef.current && gameRef.current.getSelectedCell().value > 0)) possibleValuesRef.current = [];
		else possibleValuesRef.current = gameRef.current.getPossibleValues(gameRef.current.selectionCoords);
	}

	async function newGame(){
		gameRef.current = new Board(await API.getGame());
		setRender(render => !render);
	}

	useEffect(() => {
		/*let data = JSON.parse(`{
			"Id": "",
			"Mission": "080032000700000160000004500100000004000005680500420000000300000400000801020070000",
			"Solution": "685132479734598162219764538197683254342915687568427913851349726473256891926871345",
			"Difficulty": {
				"Type": "expert"
			},
			"Mode": "classic"
		}`);*/
		/*gameRef.current = new Board(data);
		setRender(render => !render);*/
		newGame();
		window.addEventListener('keydown', handleKeyDown, false);
	}, []);

	if (gameRef.current === null){
		return <div className="game"></div>
	}

	return (
		<div
			className="game"
			onClick={() => {
				gameRef.current.setSelectionCoords(null); setRender(remder => !render);
				setPossibleValues();
			}}
		>
			<div className="sudoku">
				<Canvas onSelect={onSelect} game={gameRef.current} />
			</div>
			<div className="controls" onClick={e => {e.stopPropagation()}}>
				<div className="new-game-button">New Game</div>
				<div className="edit__buttons">
					<EditButton icon="fas fa-undo" title="Undo" onClick={handleUndo}/>
					<EditButton icon="fas fa-eraser" title="Erase" onClick={eraseSelectedCell}/>
					<EditButton icon="fas fa-pencil-alt" highlight={noteModeRef.current} title="Notes" onClick={invertNoteMode}/>
					<EditButton icon="fas fa-lightbulb" yellow={hintState === 1} title="Hint" onClick={handleHintClick}/>
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
		</div>
	)
}

export default Sudoku;