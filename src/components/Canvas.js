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
		if (props.game.selectionCoords != null){
			selectedCell = props.game.getSelectedCell();
			highlitedCells = props.game.calculateHighlightedCells(props.game.selectionCoords);
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
				if (props.game.selectionCoords != null){
					if (highlitedCells[x][y]){
						ctx.fillStyle = '#1e1e26'; //Cell in same row or column as any cell with the same value as the selected cell
					}

					if (selectedCell.value > 0 && selectedCell.value === cell.value){
						ctx.fillStyle = '#16151b'; //Cell has same value as selected cell
					}

					if (props.game.selectionCoords.x === x && props.game.selectionCoords.y === y){
						ctx.fillStyle = '#163c7b'; //Selected cell
					}
				}
				ctx.fillRect(cellPositions[x][y].x, cellPositions[x][y].y, squareSize, squareSize);

				if (cell.value > 0){
					ctx.fillStyle = cell.clue ? '#75747c' : '#6f90c3';
					ctx.textAlign = "center";
					ctx.textBaseline = "middle";
					ctx.font = '38px arial';
					ctx.fillText(cell.value, cellPositions[x][y].x + squareSize / 2, cellPositions[x][y].y + squareSize / 2 + 3);
				} else {
					for (const n of cell.notes){
						if (props.game.selectionCoords && selectedCell.value === n){
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
				}
			}
		}
	});

	function handleClick(e){
		e.stopPropagation();
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

export default Canvas;