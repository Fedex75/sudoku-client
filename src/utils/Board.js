import SettingsHandler from "./SettingsHandler";

export default class Board {
	constructor(data){
		this.board = data.board;
		this.mission = data.mission;
		this.selectedCell = data.selectedCell;
		this.highlightedCell = this.getSelectedCell().value > 0 ? this.selectedCell : null;
		this.history = data.history;
		this.difficulty = data.difficulty;
		this.mode = data.mode;
		this.version = data.version;

		this.saveToLocalStorage();

		this.colors = {
			default: '#25242c',
			red: '#fc5c65',
			orange: '#fd9644',
			yellow: '#fed330',
			green: '#26de81',
			blueGreen: '#2bcbba',
			lightBlue: '#45aaf2',
			darkBlue: '#4b7bec',
			purple: '#a55eea'
		};

		this.darkColors = {
			default: '#191925',
			red: '#99393d',
			orange: '#995c29',
			yellow: '#997e1d',
			green: '#1a995a',
			blueGreen: '#2bcbba',
			lightBlue: '#2c6c99',
			darkBlue: '#315099',
			purple: '#6b3d99'
		}
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

	setSelectedCell(c){
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

	clearCandidatesFromVisibleCells(c, s){
		if (SettingsHandler.settings.autoRemoveCandidates) for (const cell of this.getVisibleCells(c)) this.setNote(cell, s, false, false);
	}

	setValue(c, s){
		this.pushBoard();
		this.board[c.x][c.y].value = s;
		this.board[c.x][c.y].notes = [];
		this.clearCandidatesFromVisibleCells(c, s);
		if (SettingsHandler.settings.clearColorOnInput) this.board[c.x][c.y].color = 'default';
		this.saveToLocalStorage();
	}

	hint(c){
		this.board[c.x][c.y].clue = true;
		this.board[c.x][c.y].value = this.board[c.x][c.y].solution;
		this.clearCandidatesFromVisibleCells(c, this.board[c.x][c.y].solution);
		if (SettingsHandler.settings.clearColorOnInput) this.board[c.x][c.y].color = 'default';
		this.saveToLocalStorage();
	}

	erase(c){
		this.pushBoard();
		if (!this.board[c.x][c.y].clue){
			this.board[c.x][c.y] = {
				clue: false,
				value: 0,
				notes: [],
				solution: this.board[c.x][c.y].solution,
				color: 'default'
			};
			if (this.highlightedCell === c){
				this.highlightedCell = null;
			}
		}
		this.saveToLocalStorage();
	}

	getPossibleValues(c){
		if (this.get(c).clue) return [];
		if (SettingsHandler.settings.showPossibleValues){
			let values = [];
			for (const coords of this.getVisibleCells(c)){
				const cell = this.get(coords);
				if (cell.value > 0 && !values.includes(cell.value)){
					values.push(cell.value);
				}
			}
			return Array(9).fill().map((_, i) => i + 1).filter(v => !values.includes(v));
		} else {
			return Array(9).fill().map((_, i) => i + 1);
		}
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
	
		for (const cell of this.getVisibleCells(selectedCoords)) highlightedCells[cell.x][cell.y] = true;

		if (SettingsHandler.settings.advancedHighlight){
			for (let x = 0; x < 9; x++){
				for (let y = 0; y < 9; y++) {
					const cell = this.get({x: x, y: y});
					if (selectedCell.value > 0 && cell.value > 0) highlightedCells[x][y] = true;
					if (cell.value > 0 && cell.value === selectedCell.value) for (const visibleCell of this.getVisibleCells({x: x, y: y})) highlightedCells[visibleCell.x][visibleCell.y] = true;
				}
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

	setColor(coords, newColor){
		this.board[coords.x][coords.y].color = newColor;
		this.saveToLocalStorage();
	}

	saveToLocalStorage(){
		localStorage.setItem('game', JSON.stringify(this));
	}

	clearLocalStorage(){
		localStorage.setItem('game', null);
	}

	checkComplete(){
		for (let x = 0; x < 9; x++) for (let y = 0; y < 9; y++) if (this.board[x][y].value !== this.board[x][y].solution) return false;
		this.clearLocalStorage();
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
					solution: this.board[x][y].solution,
					color: 'default'
				};
			}
		}
	}
}