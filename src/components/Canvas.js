import React, { useEffect, useRef } from 'react';

/*function line(ctx, x1, y1, x2, y2){
	ctx.beginPath();
	ctx.moveTo(x1, y1);
	ctx.lineTo(x2, y2);
	ctx.stroke();
}*/

let squareSize = null;
let cellPositions = null;

const Canvas = (props) => {
	const canvasRef = useRef(null);

	function resizeCanvas(){
		const val = `${Math.min(window.visualViewport.width, 500) - (window.innerWidth < 880 ? 24 : 0)}px`;
		canvasRef.current.style.width = val;
		canvasRef.current.style.height = val;
	}

	useEffect(() => {
		window.addEventListener('resize', resizeCanvas, false);
		resizeCanvas();

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
				//Cell background
				ctx.fillStyle = '#25242c'; //Default
				
				if (highlitedCells[x][y]){
					ctx.fillStyle = '#191925'; //Cell in same row or column as any cell with the same value as the selected cell
				}
				
				if (
					(props.game.highlightedCell && highlightedCell.value > 0 && highlightedCell.value === cell.value) ||
					(!props.game.highlightedCell && props.game.selectedCell && selectedCell.value > 0 && selectedCell.value === cell.value)
				){
					ctx.fillStyle = '#16151b'; //Cell has same value as selected cell
				}

				if (props.game.selectedCell && props.game.selectedCell.x === x && props.game.selectedCell.y === y){
					ctx.fillStyle = '#163c7b'; //Selected cell
				}
				
				if (props.game.highlightedCell && props.game.highlightedCell.x === x && props.game.highlightedCell.y === y){
					let auxStyle = ctx.fillStyle;
					ctx.fillStyle = 'white';
					ctx.fillRect(cellPositions[x][y].x, cellPositions[x][y].y, squareSize, squareSize);
					ctx.fillStyle = auxStyle;
					ctx.fillRect(cellPositions[x][y].x + 2, cellPositions[x][y].y + 2, squareSize - 4, squareSize - 4);
				} else {
					ctx.fillRect(cellPositions[x][y].x, cellPositions[x][y].y, squareSize, squareSize);
				}

				if (cell.value > 0){
					ctx.fillStyle = cell.clue ? '#75747c' : (cell.value !== cell.solution ? 'red' : '#6f90c3');
					ctx.textAlign = "center";
					ctx.textBaseline = "middle";
					ctx.font = '38px arial';
					ctx.fillText(cell.value, cellPositions[x][y].x + squareSize / 2, cellPositions[x][y].y + squareSize / 2 + 3);
				} else {
					for (const n of cell.notes){
						ctx.fillStyle = '#75747c';
						if ((props.game.highlightedCell && highlightedCell.value === n) || (!props.game.highlightedCell && props.game.selectedCell && selectedCell.value === n))	ctx.fillStyle = 'white';
						
						ctx.textAlign = "center";
						ctx.textBaseline = "middle";
						ctx.font = '14px arial';

						const noteX = squareSize * (((n - 1) % 3 + 1) * 0.3 - 0.1);
						const noteY = squareSize * ((Math.floor((n - 1) / 3) + 1) * 0.3 - 0.1);
						
						ctx.fillText(n, cellPositions[x][y].x + noteX, cellPositions[x][y].y + noteY);
					}
				}
			}
		}

		if (props.showLinks && props.game.selectedCell && selectedCell.value > 0){
			let links = props.game.calculateLinks(selectedCell.value);
			//Draw links
			ctx.fillStyle = 'red';
			ctx.strokeStyle = 'red';
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

		/*TODO: Optimize finding position*/
		for (let x = 0; x < 9; x++){
			for (let y = 0; y < 9; y++) {
				if (clickX >= cellPositions[x][y].x && clickY >= cellPositions[x][y].y && clickX <= cellPositions[x][y].x + squareSize && clickY <= cellPositions[x][y].y + squareSize){
					/*if (double){
						props.onHighlight(x, y);
					} else {
						props.onSelect(x, y);
					}*/
					props.onSelect(x, y);
				}
			}
		}
	}

	return (
		<canvas ref={canvasRef} width="500" height="500" style={{border: "solid 2px black"}} onClick={e => {handleClick(e, false)}} onDoubleClick={e => {handleClick(e, true)}} />
	)
}

export default Canvas;