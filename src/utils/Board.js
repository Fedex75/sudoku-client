export default class Board {
	constructor(data){
		this.board = data.board || Array(9).fill(Array(9).fill().map(x => ({
			clue: false,
			value: 0,
			notes: [],
			solution: 0
		})));
		this.mission = data.mission || null;
		this.selectedCell = data.selectedCell || null;
		this.highlightedCell = null;
		this.history = data.history || [];
		this.difficulty = data.difficulty || null;
		this.mode = data.mode || null;
	}

	pushBoard(){
		this.history.push({
			board: JSON.parse(JSON.stringify(this.board)),
			selectedCell: this.selectedCell
		});
	}

	popBoard(){
		if (this.history.length > 0){
			this.board = this.history[this.history.length - 1].board;
			this.selectedCell = this.history[this.history.length - 1].selectedCell;
			this.history.pop();
		}
	}

	get(c){
		return this.board[c.x][c.y];
	}

	getSelectedCell(){
		return this.get(this.selectedCell);
	}

	setselectedCell(c){
		this.selectedCell = c;
		this.saveToLocalStorage();
	}

	getHighlightedCell(){
		return this.get(this.highlightedCell);
	}

	setHighlightedCell(c){
		this.highlightedCell = c;
		this.saveToLocalStorage();
	}

	setNote(c, n, state = null, push = true){
		if (this.get(c).value === 0){
			if (this.get(c).notes.includes(n)){
				if (state !== true){
					if (push) this.pushBoard();
					this.board[c.x][c.y].notes = this.board[c.x][c.y].notes.filter(note => note !== n);
					this.saveToLocalStorage();
				}
			} else {
				if (state !== false){
					if (push) this.pushBoard();
					this.board[c.x][c.y].notes.push(n);
					this.saveToLocalStorage();
				}
			}
		}
	}

	setValue(c, s){
		this.pushBoard();
		this.board[c.x][c.y].value = s;
		this.board[c.x][c.y].notes = [];
		for (const cell of this.getVisibleCells(c)) this.setNote(cell, s, false, false);
		this.saveToLocalStorage();
	}

	hint(c){
		this.board[c.x][c.y].clue = true;
		this.board[c.x][c.y].value = this.board[c.x][c.y].solution;
	}

	erase(c){
		this.pushBoard();
		if (!this.board[c.x][c.y].clue){
			this.board[c.x][c.y] = {
				clue: false,
				value: 0,
				notes: [],
				solution: this.board[c.x][c.y].solution
			};
		}
		this.saveToLocalStorage();
	}

	getPossibleValues(c){
		if (this.get(c).clue) return [];
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
				if (selectedCell.value > 0 && cell.value > 0) highlightedCells[x][y] = true;
				if (cell.value > 0 && cell.value === selectedCell.value) for (const visibleCell of this.getVisibleCells({x: x, y: y})) highlightedCells[visibleCell.x][visibleCell.y] = true;
			}
		}

		return highlightedCells;
	}

	calculateLinks(n){
		let links = [];
		//Find links in rows
		for (let r = 0; r < 9; r++){
			//Count candidates in row
			let newLink = [];
			for (let i = 0; i < 9; i++){
				if (this.board[i][r].notes.includes(n)){
					newLink.push({x: i, y: r});		
				}
			}
			if (newLink.length <= 2){
				links.push(newLink);
			}
		}
		//Find links in columns
		for (let c = 0; c < 9; c++){
			//Count candidates in column
			let newLink = [];
			for (let i = 0; i < 9; i++){
				if (this.board[c][i].notes.includes(n)){
					newLink.push({x: c, y: i});
				}
			}
			if (newLink.length <= 2){
				links.push(newLink);
			}
		}
		//Count candidates in quadrants
		for (let qx = 0; qx < 3; qx++){
			for (let qy = 0; qy < 3; qy++){
				//Count candidates in quadrant
				let newLink = [];
				for (let x = 0; x < 3; x++){
					for (let y = 0; y < 3; y++){
						if (this.board[qx*3+x][qy*3+y].notes.includes(n)){
							newLink.push({x: qx*3+x, y: qy*3+y});
						}		
					}
				}
				if (newLink.length <= 2){
					links.push(newLink);
				}
			}
		}
		return links;
	}

	saveToLocalStorage(){
		localStorage.setItem('game', JSON.stringify(this));
	}

	clearLocalStorage(){
		localStorage.setItem('game', null);
	}

	checkComplete(){
		for (let x = 0; x < 9; x++) for (let y = 0; y < 9; y++) if (this.board[x][y].value !== this.board[x][y].solution) return false;
		return true;
	}

	restart(){
		this.clearLocalStorage();
		for (let x = 0; x < 9; x++){
			for (let y = 0; y < 9; y++){
				let n = Number.parseInt(this.mission[y*9+x]);
				this.board[x][y] = {
					clue: n > 0,
					value: n,
					notes: [],
					solution: this.board[x][y].solution
				};
			}
		}
	}
}