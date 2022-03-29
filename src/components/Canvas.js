import React, { useEffect, useRef } from 'react';
import ThemeHandler from '../utils/ThemeHandler';
import SettingsHandler from '../utils/SettingsHandler';
import eventBus from "./EventBus";


let squareSize = null;
let cellPositions = [];
let valuePositions = [];
let noteDeltas = [];
let animationColors = null;
let currentAnimations = [];
const borderWidth = 2;

const animationLengths = {
	row: 500,
	col: 500,
	quadrant: 500,
	board: 1350, //Must be equal to the timeout delay on Sudoku.js
};

const k = 0.2;

function brightness(x, p, q, l){
	let t = (-q-l)*p+l;
	return Math.max(0, k*(1-Math.abs(2/l*(x+t)-1)));
}

const Canvas = (props) => {
	const canvasRef = useRef(null);

	function resizeCanvas(){
		if (canvasRef.current){
			const val = `${window.visualViewport.width > 880 ? Math.min(window.visualViewport.width, 500) : Math.min(Math.min(window.visualViewport.height - 350, window.visualViewport.width - 6), 500)}px`;
			canvasRef.current.style.width = val;
			canvasRef.current.style.height = val;
		}
	}

	useEffect(() => {
		resizeCanvas();

		const canvas = canvasRef.current;
		squareSize = (canvas.width - 14) / 9;

		for (let i = 0; i < 9; i++){
			cellPositions.push([]);
			valuePositions.push([]);
		}

		let posY = 2;
		for (let y = 0; y < 9; y++){
			let posX = 2;
			for (let x = 0; x < 9; x++){
				//Cell positions
				cellPositions[x][y] = {x: posX, y: posY};
				posX += squareSize + 1;
				if ((x + 1) % 3 === 0) posX += borderWidth - 1;
				//Value positions
				valuePositions[x][y] = {
					x: cellPositions[x][y].x + squareSize / 2,
					y: cellPositions[x][y].y + squareSize / 2
				}
			}
			posY += squareSize + 1;
			if ((y + 1) % 3 === 0) posY += borderWidth - 1;
			//Candidate positions
			noteDeltas.push({
				x: squareSize * ((y % 3 + 1) * 0.25),
				y: squareSize * ((Math.floor(y / 3) + 1) * 0.3 - 0.08)
			});
		}
		
		let resizeEvent = window.addEventListener('resize', resizeCanvas, false);
		
		return () => {
			eventBus.remove("doAnimation");
			window.removeEventListener('resize', resizeEvent);
		}
		// eslint-disable-next-line
	}, []);

	function renderFrame(){
		if (canvasRef.current === null) return;
		const colors = {
			default: ThemeHandler.theme.canvasLightDefaultCellColor,
			red: '#fc5c65',
			orange: '#fd9644',
			yellow: '#fed330',
			green: '#26de81',
			blueGreen: '#2bcbba',
			lightBlue: '#45aaf2',
			darkBlue: '#4b7bec',
			purple: '#a55eea'
		};
	
		const darkColors = {
			default: ThemeHandler.theme.canvasDarkDefaultCellColor,
			red: '#99393d',
			orange: '#995c29',
			yellow: '#997e1d',
			green: '#1a995a',
			blueGreen: '#2bcbba',
			lightBlue: '#2c6c99',
			darkBlue: '#315099',
			purple: '#6b3d99'
		}
		const canvas = canvasRef.current;
		const ctx = canvas.getContext('2d');
		let selectedCell = props.game.getSelectedCell();
		let highlitedCells = [];
		highlitedCells = props.game.calculateHighlightedCells(props.game.selectedCell, props.lockedInput);

		//Background
		ctx.fillStyle = ThemeHandler.theme.canvasCellBorderColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

		//Borders
		ctx.fillStyle = ThemeHandler.theme.canvasQuadrantBorderColor;
		ctx.fillRect(0, 0, borderWidth, 500);
		ctx.fillRect(0, 0, 500, borderWidth);
		for (let i = 2; i < 9; i += 3){
			ctx.fillRect(cellPositions[i][0].x + squareSize, 0, borderWidth, 500);
			ctx.fillRect(0, cellPositions[0][i].y + squareSize, 500, borderWidth);
		}

		//Draw cells
		for (let x = 0; x < 9; x++){
			for (let y = 0; y < 9; y++) {
				const cell = props.game.get({x: x, y: y});
				const isSelectedCell = props.game.selectedCell.x === x && props.game.selectedCell.y === y;
				const hasSameValueAsSelected = ((props.lockedInput > 0 && props.lockedInput === cell.value) || (props.lockedInput === 0 && selectedCell.value > 0 && selectedCell.value === cell.value));
				const hasColor = cell.color !== 'default';
				//Cell background
				ctx.setLineDash([]);

				if (hasColor){
					ctx.fillStyle = colors[cell.color];
					ctx.fillRect(cellPositions[x][y].x + 1, cellPositions[x][y].y + 1, squareSize - 2, squareSize - 2);
				}

				ctx.fillStyle =
					isSelectedCell ? ThemeHandler.theme.canvasSelectedCellBackground :
					hasSameValueAsSelected ? ThemeHandler.theme.canvasSameValueCellBackground : //Cell has same value as selected cell
					highlitedCells[x][y] ? darkColors.default : //Cell in same row or column as any cell with the same value as the selected cell
					colors.default; //Default
				
				if (hasColor){
					ctx.fillRect(cellPositions[x][y].x + 3, cellPositions[x][y].y + 3, squareSize - 6, squareSize - 6);
				} else {
					ctx.fillRect(cellPositions[x][y].x, cellPositions[x][y].y, squareSize, squareSize);
				}

				if (animationColors && animationColors[x][y]){
					ctx.fillStyle = animationColors[x][y];
					ctx.fillRect(cellPositions[x][y].x, cellPositions[x][y].y, squareSize, squareSize);
				}

				if (cell.value > 0){
					//Number
					ctx.textAlign = "center";
					ctx.textBaseline = "middle";
					ctx.font = '40px Arial';
					const isError = SettingsHandler.settings.checkMistakes && cell.value !== cell.solution;
					ctx.fillStyle = 
						isError ? 'red' :
						cell.clue ? ThemeHandler.theme.canvasClueColor :
						ThemeHandler.theme.canvasSolutionColor;
					if (isError && hasColor) ctx.strokeStyle = 'white';
					else ctx.strokeStyle = ctx.fillStyle;
					ctx.fillText(cell.value, valuePositions[x][y].x, valuePositions[x][y].y);
				} else {
					//Candidates
					for (const n of cell.notes){
						ctx.fillStyle = 
						selectedCell.value === n || props.lockedInput === n ? ThemeHandler.theme.canvasNoteHighlightColor :
						'#75747c';
						
						ctx.textAlign = "center";
						ctx.textBaseline = "middle";
						ctx.font = '16px Arial';
						
						ctx.fillText(n, cellPositions[x][y].x + noteDeltas[n-1].x, cellPositions[x][y].y + noteDeltas[n-1].y);
					}
				}
			}
		}

		if (props.showLinks && (props.lockedInput > 0 || selectedCell.value > 0)){
			let links = props.game.calculateLinks(props.lockedInput > 0 ? props.lockedInput : selectedCell.value);
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
	}

	function doAnimation(timestamp){
		//Init colors
		animationColors = [];
		for (let x = 0; x < 9; x++){
			animationColors.push(Array(9).fill(null));
		}

		let i = 0;

		while (i < currentAnimations.length){
			let animation = currentAnimations[i];
			if (animation.startTime < 0) animation.startTime = timestamp;
			let progress = (timestamp - animation.startTime) / animationLengths[animation.data.type];

			if (progress < 1){
				switch(animation.data.type){
					case 'row':
						for (let x = 0; x < 9; x++){
							animationColors[x][animation.data.center.y] = `rgba(${ThemeHandler.theme.canvasAnimationBaseColor}, ${brightness(Math.abs(animation.data.center.x - x), progress, 8, 4)})`;
						}
						break;
					case 'col':
						for (let y = 0; y < 9; y++){
							animationColors[animation.data.center.x][y] = `rgba(${ThemeHandler.theme.canvasAnimationBaseColor}, ${brightness(Math.abs(animation.data.center.y - y), progress, 8, 4)})`;
						}
						break;
					case 'quadrant':
						for (let x = 0; x < 3; x++){
							for (let y = 0; y < 3; y++){
								animationColors[animation.data.quadrantX*3+x][animation.data.quadrantY*3+y] = `rgba(${ThemeHandler.theme.canvasAnimationBaseColor}, ${brightness(y*3+x, progress, 8, 8)})`;
							}
						}
						break;
					case 'board':
						for (let x = 0; x < 9; x++){
							for (let y = 0; y < 9; y++){
								animationColors[x][y] = `rgba(${ThemeHandler.theme.canvasAnimationBaseColor}, ${brightness(Math.max(Math.abs(animation.data.center.x - x), Math.abs(animation.data.center.y - y)), progress, 8, 8)})`;
							}
						}
						break;
					default:
						break;
				}
				i++;
			} else {
				currentAnimations.splice(i, 1);
			}
		}

		renderFrame();

		if (currentAnimations.length > 0){
			requestAnimationFrame(doAnimation);				
		} else {
			animationColors = null;
			renderFrame();
		}
	}

	useEffect(() => {
		props.setAnimationCallback((data) => {
			return new Promise((resolve, reject) => {
				data.forEach(animation => {
					currentAnimations.push({
						data: animation,
						startTime: -1
					});
				});
				requestAnimationFrame(doAnimation);
				resolve();
			});
		});
		renderFrame();
	});

	function handleClick(e){
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
		<canvas ref={canvasRef} width="500" height="500" onClick={e => {handleClick(e)}} />
	)
}

export default Canvas;