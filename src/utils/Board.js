export default class Board {
	constructor(data = null){
		this.board = [];
		this.selectionCoords = null;
		this.history = [];
		for (let i = 0; i < 9; i++) this.board.push([]);
		for (let x = 0; x < 9; x++){
			for (let y = 0; y < 9; y++) {
				if (data !== null){
					const number = Number.parseInt(data.Mission[y * 9 + x]);
					this.board[x][y] = {
						clue: number > 0,
						value: number,
						notes: [],
						solution: Number.parseInt(data.Solution[y * 9 + x])
					};
				} else {
					this.board[x][y] = {
						clue: false,
						value: 0,
						notes: [],
						solution: 0
					};
				}
			}
		}
	}

	pushBoard(){
		this.history.push({
			board: JSON.parse(JSON.stringify(this.board)),
			selectionCoords: this.selectionCoords
		});
	}

	popBoard(){
		if (this.history.length > 0){
			this.board = this.history[this.history.length - 1].board;
			this.selectionCoords = this.history[this.history.length - 1].selectionCoords;
			this.history.pop();
		}
	}

	get(c){
		return this.board[c.x][c.y];
	}

	getSelectedCell(){
		return this.get(this.selectionCoords);
	}

	setSelectionCoords(c){
		this.selectionCoords = c;
	}

	setNote(c, n, state = null){
		if (this.get(c).value === 0){
			if (this.get(c).notes.includes(n)){
				if (state !== true){
					this.pushBoard();
					this.board[c.x][c.y].notes = this.board[c.x][c.y].notes.filter(note => note !== n);
				}
			} else {
				if (state !== false){
					this.pushBoard();
					this.board[c.x][c.y].notes.push(n);
				}
			}
		}
	}

	setValue(c, s){
		this.pushBoard();
		this.board[c.x][c.y].value = s;
		this.board[c.x][c.y].notes = [];
		for (const cell of this.getVisibleCells(c)) this.setNote(cell, s, false);
	}

	hint(c){
		this.board[c.x][c.y].clue = true;
		this.board[c.x][c.y].value = this.board[c.x][c.y].solution;
	}

	erase(c){
		this.pushBoard();
		if (this.board[c.x][c.y].clue){
			this.board[c.x][c.y] = {
				clue: false,
				value: 0,
				notes: []
			};
		}
	}

	getPossibleValues(c){
		let values = [];
		for (const coords of this.getVisibleCells(c)){
			const cell = this.get(coords);
			if (cell.value > 0 && !values.includes(cell.value)){
				values.push(cell.value);
			}
		}
		return Array(9).fill().map((_, i) => i + 1).filter(v => !values.includes(v));
	}

	getVisibleCells(c){
		let visibleCells = [];
		for (let i = 0; i < 9; i++) visibleCells.push	({x: c.x, y: i}, {x: i, y: c.y});
		const quadrantX = Math.floor(c.x / 3);
		const quadrantY = Math.floor(c.y / 3);
		for (let x = 0; x < 3; x++) for (let y = 0; y < 3; y++) visibleCells.push({x: quadrantX * 3 + x, y: quadrantY * 3 + y});
		return visibleCells;
	}

	calculateHighlightedCells(selectedCoords){
		let selectedCell = this.get(selectedCoords);
		let highlightedCells = Array(9).fill().map(x => Array(9).fill(false));
	
		if (selectedCell.value === 0) for (const cell of this.getVisibleCells(selectedCoords)) highlightedCells[cell.x][cell.y] = true;

		for (let x = 0; x < 9; x++){
			for (let y = 0; y < 9; y++) {
				const cell = this.get({x: x, y: y});
				if (cell.value > 0) highlightedCells[x][y] = true;
				if (cell.value > 0 && cell.value === selectedCell.value) for (const visibleCell of this.getVisibleCells({x: x, y: y})) highlightedCells[visibleCell.x][visibleCell.y] = true;
			}
		}

		return highlightedCells;
	}
}