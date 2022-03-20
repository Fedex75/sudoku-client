import React, { useEffect, useRef } from 'react';
import SettingsHandler from '../utils/SettingsHandler';

/*function line(ctx, x1, y1, x2, y2){
	ctx.beginPath();
	ctx.moveTo(x1, y1);
	ctx.lineTo(x2, y2);
	ctx.stroke();
}*/

let squareSize = null;
let cellPositions = null;
let valuePositions = [];
let noteDeltas = [];

const Canvas = (props) => {
	const canvasRef = useRef(null);

	function resizeCanvas(){
		if (canvasRef.current){
			//const val = `${Math.min(window.visualViewport.width, 500) - (window.innerWidth < 880 ? 24 : 0)}px`;
			const val = `${window.visualViewport.width > 880 ? Math.min(window.visualViewport.width, 500) : Math.min(Math.min(window.visualViewport.height - 350, window.visualViewport.width - 6), 500)}px`;
			canvasRef.current.style.width = val;
			canvasRef.current.style.height = val;
		}
	}

	useEffect(() => {
		window.addEventListener('resize', resizeCanvas, false);
		resizeCanvas();

		const canvas = canvasRef.current;

		cellPositions = [];
		for (let i = 0; i < 9; i++){
			cellPositions.push([]);
			valuePositions.push([]);
		}

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

		for (let x = 0; x < 9; x++){
			for (let y = 0; y < 9; y++){
				valuePositions[x][y] = {
					x: cellPositions[x][y].x + squareSize / 2,
					y: cellPositions[x][y].y + squareSize / 2 + 3
				}
			}
		}

		for (let n = 1; n <= 9; n++){
			noteDeltas.push({
				x: squareSize * (((n - 1) % 3 + 1) * 0.3 - 0.1),
				y: squareSize * ((Math.floor((n - 1) / 3) + 1) * 0.3 - 0.1)
			});
		}
	}, []);

	useEffect(() => {
		const canvas = canvasRef.current;
		const ctx = canvas.getContext('2d');
		let selectedCell = props.game.getSelectedCell();;
		let highlitedCells = [];
		highlitedCells = props.game.calculateHighlightedCells(props.game.highlightedCell || props.game.selectedCell);
		let highlightedCell = null;
		if (props.game.highlightedCell){
			highlightedCell = props.game.getHighlightedCell();
		}

		//Background
		ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

		//Draw cells
		for (let x = 0; x < 9; x++){
			for (let y = 0; y < 9; y++) {
				const cell = props.game.get({x: x, y: y});
				const isSelectedCell = props.game.selectedCell && props.game.selectedCell.x === x && props.game.selectedCell.y === y;
				const isHighlightedCell = props.game.highlightedCell && props.game.highlightedCell.x === x && props.game.highlightedCell.y === y;
				const hasSameValueAsSelected = (props.game.highlightedCell && highlightedCell.value > 0 && highlightedCell.value === cell.value) || (!props.game.highlightedCell && props.game.selectedCell && selectedCell.value > 0 && selectedCell.value === cell.value);
				const hasColor = cell.color !== 'default';
				//Cell background
				ctx.setLineDash([]);
				ctx.fillStyle = 
					/*isSelectedCell ? (hasColor ? props.game.colors[cell.color] : '#163c7b') :*/
					hasSameValueAsSelected ? (hasColor ? props.game.darkColors[cell.color] : '#16151b') : //Cell has same value as selected cell
					highlitedCells[x][y] ? (isSelectedCell && hasColor ? props.game.colors[cell.color] : props.game.darkColors[cell.color]) : //Cell in same row or column as any cell with the same value as the selected cell
					props.game.colors[cell.color]; //Default

				ctx.fillRect(cellPositions[x][y].x, cellPositions[x][y].y, squareSize, squareSize);

				ctx.strokeStyle = 'white';
				ctx.lineWidth = 2;
				if (isSelectedCell){
					ctx.strokeRect(cellPositions[x][y].x + 2, cellPositions[x][y].y + 2, squareSize - 4, squareSize - 4);
					if (isHighlightedCell){
						ctx.setLineDash([5,5]);
						ctx.strokeRect(cellPositions[x][y].x + 4, cellPositions[x][y].y + 4, squareSize - 8, squareSize - 8);	
					}
				} else if (isHighlightedCell){
					ctx.setLineDash([5,5]);
					ctx.strokeRect(cellPositions[x][y].x + 2, cellPositions[x][y].y + 2, squareSize - 4, squareSize - 4);
				}

				if (cell.value > 0){
					//Number
					ctx.textAlign = "center";
					ctx.textBaseline = "middle";
					ctx.font = '40px arial';
					const isError = SettingsHandler.settings.checkMistakes && cell.value !== cell.solution;
					ctx.fillStyle = 
						isError ? 'red'                              :
						isSelectedCell ? 'white'                     :
						cell.clue ? (hasColor ? 'white' : '#75747c') :
						(hasColor ? 'black' : '#6f90c3')             ;
					if (isError && hasColor) ctx.strokeStyle = 'white';
					else ctx.strokeStyle = ctx.fillStyle;
					ctx.fillText(cell.value, valuePositions[x][y].x, valuePositions[x][y].y);
				} else {
					//Candidates
					for (const n of cell.notes){
						ctx.fillStyle = 
						(props.game.highlightedCell && highlightedCell.value === n) || (!props.game.highlightedCell && props.game.selectedCell && selectedCell.value === n) ? 'white' :
						(hasColor ? 'black' : '#75747c');
						
						ctx.textAlign = "center";
						ctx.textBaseline = "middle";
						ctx.font = '14px arial';
						
						ctx.fillText(n, cellPositions[x][y].x + noteDeltas[n-1].x, cellPositions[x][y].y + noteDeltas[n-1].y);
					}
				}
			}
		}

		if (props.showLinks && ((highlightedCell && highlightedCell.value > 0) || (selectedCell && selectedCell.value > 0))){
			let links = props.game.calculateLinks(highlightedCell && highlightedCell.value > 0 ? highlightedCell.value : selectedCell.value);
			//Draw links
			ctx.fillStyle = 'red';
			ctx.strokeStyle = 'red';
			ctx.setLineDash([]);
			links.forEach(link => {
				link.forEach(cell => {
					ctx.beginPath();
					ctx.arc(cellPositions[cell.x][cell.y].x + squareSize / 2, cellPositions[cell.x][cell.y].y + squareSize / 2, squareSize / 8, 0, 2 * Math.PI, false);
					ctx.fill();
				});
				if (link.length === 2){
					ctx.beginPath();
					ctx.moveTo(cellPositions[link[0].x][link[0].y].x + squareSize / 2, cellPositions[link[0].x][link[0].y].y + squareSize / 2);
					ctx.lineWidth = 4;
					ctx.lineTo(cellPositions[link[1].x][link[1].y].x + squareSize / 2, cellPositions[link[1].x][link[1].y].y + squareSize / 2);
					ctx.stroke();
				}
			});
		}
	});

	function handleClick(e, double){
		e.stopPropagation();
		const canvas = canvasRef.current;
		const rect = canvas.getBoundingClientRect();
		const clickX = (e.clientX - rect.left) / parseInt(canvasRef.current.style.width, 10) * 500;
		const clickY = (e.clientY - rect.top) / parseInt(canvasRef.current.style.height, 10) * 500;

		for (let x = 0; x < 9; x++){
			if (clickX <= cellPositions[x][0].x + squareSize){
				for (let y = 0; y < 9; y++) {
					if (clickY <= cellPositions[0][y].y + squareSize){
						props.onClick(x, y);
						break;
					}
				}		
				break;
			}
		}
	}

	return (
		<canvas ref={canvasRef} width="500" height="500" style={{border: "solid 2px black"}} onClick={e => {handleClick(e, false)}} onDoubleClick={e => {handleClick(e, true)}} />
	)
}

export default Canvas;