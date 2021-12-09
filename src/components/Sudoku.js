import React, { useEffect, useRef, useState } from 'react'

/*function line(ctx, x1, y1, x2, y2){
	ctx.beginPath();
	ctx.moveTo(x1, y1);
	ctx.lineTo(x2, y2);
	ctx.stroke();
}*/

let squareSize = null;
let cellPositions = null;

function calculateHighlightedCells(game, selectedCell, selectedCoords){
	let highlightedCells = Array(9).fill().map(x => Array(9).fill(false));
	
	if (selectedCell.type === 'notes'){
		for (let i = 0; i < 9; i++){
			highlightedCells[selectedCoords.x][i] = true;
			highlightedCells[i][selectedCoords.y] = true;
		}

		const quadrantX = Math.floor(selectedCoords.x / 3);
		const quadrantY = Math.floor(selectedCoords.y / 3);

		for (let x = 0; x < 3; x++){
			for (let y = 0; y < 3; y++) {
				highlightedCells[quadrantX * 3 + x][quadrantY * 3 + y] = true;
			}
		}
	}

	for (let x = 0; x < 9; x++){
		for (let y = 0; y < 9; y++) {
			const cell = game[x][y];
			if ((cell.type === 'clue' || cell.type === 'solution') && (selectedCell.type === 'clue' || selectedCell.type === 'solution')){
				highlightedCells[x][y] = true;
				if (cell.value === selectedCell.value){
					for (let i = 0; i < 9; i++){
						highlightedCells[x][i] = true;
						highlightedCells[i][y] = true;
					}
					const quadrantX = Math.floor(x / 3);
					const quadrantY = Math.floor(y / 3);
	
					for (let x = 0; x < 3; x++){
						for (let y = 0; y < 3; y++) {
							highlightedCells[quadrantX * 3 + x][quadrantY * 3 + y] = true;
						}
					}
				}
			}
		}
	}

	return highlightedCells;
}

const Canvas = (props) => {
	const canvasRef = useRef(null);

	useEffect(() => {
		const canvas = canvasRef.current;

		cellPositions = [];
		for (let i = 0; i < 9; i++) cellPositions.push([]);

		squareSize = (canvas.width - 14) / 9;

		let posY = 0;
		for (let y = 0; y < 9; y++){
			let posX = 0;
			for (let x = 0; x < 9; x++){
				cellPositions[x][y] = {x: posX, y: posY};
				posX += squareSize + 1;
				if ((x + 1) % 3 === 0) posX += 3;
			}
			posY += squareSize + 1;
			if ((y + 1) % 3 === 0) posY += 3;
		}
	}, []);

	useEffect(() => {
		const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
		let selectedCell = null;
		let highlitedCells = [];
		if (props.selected != null){
			selectedCell = props.game[props.selected.x][props.selected.y];
			highlitedCells = calculateHighlightedCells(props.game, selectedCell, props.selected);
		}

		//Background
		ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

		//Draw cells
		for (let x = 0; x < 9; x++){
			for (let y = 0; y < 9; y++) {
				const cell = props.game[x][y];
				//Cell background
				ctx.fillStyle = '#25242c'; //Default
				if (props.selected != null){
					if (highlitedCells[x][y]){
						ctx.fillStyle = '#1e1e26'; //Cell in same row or column as any cell with the same value as the selected cell
					}

					if ((selectedCell.type === 'clue' || selectedCell.type === 'solution') && ((cell.type === 'clue' || cell.type === 'solution') && selectedCell.value === cell.value)){
						ctx.fillStyle = '#16151b'; //Cell has same value as selected cell
					}

					if (props.selected.x === x && props.selected.y === y){
						ctx.fillStyle = '#163c7b'; //Selected cell
					}
				}
				ctx.fillRect(cellPositions[x][y].x, cellPositions[x][y].y, squareSize, squareSize);

				switch (cell.type){
					case 'clue':
						ctx.fillStyle = '#75747c';
						ctx.textAlign = "center";
						ctx.textBaseline = "middle";
						ctx.font = '38px arial';
						ctx.fillText(cell.value, cellPositions[x][y].x + squareSize / 2, cellPositions[x][y].y + squareSize / 2 + 3);
						break;
					case 'notes':
						for (const n of cell.notes){
							if (props.selected && (selectedCell.type === 'clue' || selectedCell.type === 'solution') && selectedCell.value === n){
								ctx.fillStyle = 'white';
							} else {
								ctx.fillStyle = '#75747c';
							}
							ctx.textAlign = "center";
							ctx.textBaseline = "middle";
							ctx.font = '14px arial';

							const noteX = squareSize * (((n - 1) % 3 + 1) * 0.3 - 0.1);
							const noteY = squareSize * ((Math.floor((n - 1) / 3) + 1) * 0.3 - 0.1);
							
							ctx.fillText(n, cellPositions[x][y].x + noteX, cellPositions[x][y].y + noteY);
						}
						break;
					case 'solution':
						ctx.fillStyle = '#6f90c3';
						ctx.textAlign = "center";
						ctx.textBaseline = "middle";
						ctx.font = '38px arial';
						ctx.fillText(cell.value, cellPositions[x][y].x + squareSize / 2, cellPositions[x][y].y + squareSize / 2 + 3);
						break;
					default:
						break;
				}
			}
		}
	});

	function handleClick(e){
		const canvas = canvasRef.current;
		const rect = canvas.getBoundingClientRect();
		const clickX = e.clientX - rect.left;
		const clickY = e.clientY - rect.top;
		for (let x = 0; x < 9; x++){
			for (let y = 0; y < 9; y++) {
				if (clickX >= cellPositions[x][y].x && clickY >= cellPositions[x][y].y && clickX <= cellPositions[x][y].x + squareSize && clickY <= cellPositions[x][y].y + squareSize){
					props.onSelect(x, y);
				}
			}
		}
	}

	return (
		<canvas ref={canvasRef} width="500" height="500" {...props} style={{border: "solid 2px black"}} onClick={handleClick} />
	)
}

const Sudoku = () => {
	const [selected, setSelected] = useState(null);
	const [game, setGame] = useState(null);
	const [noteMode, setNoteMode] = useState(false);

	const selectedRef = useRef(selected);
	const gameRef = useRef(game);
	const noteModeRef = useRef(noteMode);

	function onSelect(x, y){
		if (selected === null || selected.x !== x || selected.y !== y){
			selectedRef.current = {x: x, y: y};
			setSelected({x: x, y: y});
		}
	}

	function handleKeyDown(e){
		if (e.key === 'Enter') {
			noteModeRef.current = !noteModeRef.current;
			setNoteMode(mode => !mode);
		} else {
			if (selectedRef.current !== null){
				const selectedCell = gameRef.current[selectedRef.current.x][selectedRef.current.y];
				if (['1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(e.key) && selectedRef.current !== null){
					if (selectedCell.type === 'notes'){
						let newGame = [...gameRef.current];
						if (noteModeRef.current){
							if (selectedCell.notes.includes(Number.parseInt(e.key))){
								newGame[selectedRef.current.x][selectedRef.current.y].notes = newGame[selectedRef.current.x][selectedRef.current.y].notes.filter(note => note !== Number.parseInt(e.key));	
							} else {
								newGame[selectedRef.current.x][selectedRef.current.y].notes.push(Number.parseInt(e.key));
							}
						} else {
							newGame[selectedRef.current.x][selectedRef.current.y] = {
								type: 'solution',
								value: Number.parseInt(e.key)
							};	
						}
						gameRef.current = newGame;
						setGame(newGame);
					} else if (selectedCell.type === 'solution' && !noteModeRef.current) {
						let newGame = [...gameRef.current];
						newGame[selectedRef.current.x][selectedRef.current.y] = {
							type: 'solution',
							value: Number.parseInt(e.key)
						};
						gameRef.current = newGame;
						setGame(newGame);
					}
				}
			}
		}
	}

	useEffect(() => {
		let data = JSON.parse(`{
			"Id": "",
			"Mission": "080032000700000160000004500100000004000005680500420000000300000400000801020070000",
			"Solution": "685132479734598162219764538197683254342915687568427913851349726473256891926871345",
			"Difficulty": {
				"Type": "expert"
			},
			"Mode": "classic"
		}`);
		let newGame = [];
		for (let i = 0; i < 9; i++) newGame.push([]);
		for (let x = 0; x < 9; x++){
			for (let y = 0; y < 9; y++) {
				const number = Number.parseInt(data.Mission[y*9 + x]);
				if (number === 0){
					newGame[x][y] = {
						type: 'notes',
						notes: []
					}
				} else {
					newGame[x][y] = {
						type: 'clue',
						value: number
					}
				}
			}
		}
		gameRef.current = newGame;
		setGame(newGame);

		window.addEventListener('keydown', handleKeyDown, false);
	}, []);

	if (game === null){
		return <div>Loading</div>
	}

	return (
		<div className="game">
			<div className="sudoku">
				<Canvas selected={selected} onSelect={onSelect} game={game} />
			</div>
			<div className="controls" style={{width: 300, height: 500, backgroundColor: "green"}}>
				<div>Note mode: {noteMode ? 'true' : 'false'}</div>
				<div>Note mode ref: {noteModeRef.current ? 'true' : 'false'}</div>
			</div>
		</div>
	)
}

export default Sudoku;