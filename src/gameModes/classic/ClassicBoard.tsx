import Solver from "../../utils/Solver";
import SettingsHandler from "../../utils/SettingsHandler"
import GameHandler from "../../utils/GameHandler"
import { decodeMissionString } from "../../utils/Decoder"
import { DifficultyIdentifier, DifficultyName, GameModeIdentifier, GameModeName, decodeDifficulty, decodeMode } from "../../utils/Difficulties";
import { Board, BoardAnimation, CellCoordinates, GameData, History, RawGameData, isGameData } from "../../utils/DataTypes";
import { ColorName } from "../../utils/Colors";
import { indexOfCoordsInArray } from "../../utils/CoordsUtils";

export default class ClassicBoard {
	id: string;
	mode: GameModeName;
	difficulty: DifficultyName;
	mission: string;
	clues: string;
	solution: string;
	nSquares: number;
	fullNotation: boolean;
	timer: number;
	selectedCells: CellCoordinates[];
	history: History;
	board: Board;
	possibleValues: number[][][];
	completedNumbers: number[];
	version: number = 0;

	constructor(data: GameData | RawGameData, nSquares: number = 9) {
		this.id = data.id;
		this.nSquares = nSquares;
		this.fullNotation = false;
		this.selectedCells = [{x: 0, y: 0}];
		this.history = [];
		this.board = [];
		this.possibleValues = [];
		this.completedNumbers = [];

		if (isGameData(data)){
			this.mode = data.mode;
			this.difficulty = data.difficulty;
			this.mission = data.mission;
			this.clues = data.clues;
			this.solution = data.solution;
			this.timer = data.timer;
			this.board = data.board;
			this.selectedCells = data.selectedCells;
			this.history = data.history;
			this.checkFullNotation();
			this.recalculatePossibleValues();
		} else {
			this.mode = decodeMode(data.id[0] as GameModeIdentifier);
			this.difficulty = decodeDifficulty(data.id[1] as DifficultyIdentifier);
			this.clues = decodeMissionString(data.m);
			this.mission = data.m;
			this.solution = Solver.solve(this.clues);
			this.timer = 0;

			this.initBoard();
		}
	}

	initBoard() {
		//Create game from raw data
		this.selectedCells = [{x: 0, y: 0}];
		this.history = [];
		this.board = [];
		this.timer = 0;

		for (let x = 0; x < this.nSquares; x++) {
			this.board.push(Array(this.nSquares).fill(null));
			for (let y = 0; y < this.nSquares; y++) {
				let number = Number.parseInt(this.clues[y * this.nSquares + x]);
				let solution = Number.parseInt(this.solution[y * this.nSquares + x]);
				this.board[x][y] = {
					clue: number > 0,
					value: number,
					notes: [],
					solution: solution,
					color: 'default',
				};
			}
		}

		this.recalculatePossibleValues();
	}

	recalculatePossibleValues(c?: CellCoordinates){
		if (c){
			//Reset only that position
			for (let k = 0; k < this.nSquares; k++){
				this.possibleValues[c.x][c.y][k] = k;
			}
		} else {
			//Initialize array
			this.possibleValues = [];
			for (let x = 0; x < this.nSquares; x++){
				this.possibleValues[x] = [];
				for (let y = 0; y < this.nSquares; y++){
					this.possibleValues[x][y] = [];
					if (this.get({x, y}).value === 0){
						for (let k = 1; k <= this.nSquares; k++){
							this.possibleValues[x][y][k] = k;
						}
					}
				}
			}
		}

		for (let x = (c?.x || 0); x <= (c?.x || this.nSquares - 1); x++){
			for (let y = (c?.x || 0); y <= (c?.y || this.nSquares - 1); y++){
				const value = this.get({x, y}).value;
				if (value > 0){
					const boxX = Math.floor(x / 3)
					const boxY = Math.floor(y / 3)

					for (let i = 0; i < this.nSquares; i++){
						this.possibleValues[i][y] = this.possibleValues[i][y].filter(n => n !== value);
						this.possibleValues[x][i] = this.possibleValues[x][i].filter(n => n !== value);
					}
					for (let ix = 0; ix < 3; ix++) for (let iy = 0; iy < 3; iy++){
						this.possibleValues[boxX * 3 + ix][boxY * 3 + iy] = this.possibleValues[boxX * 3 + ix][boxY * 3 + iy].filter(n => n !== value);
					}
				}
			}
		}

		this.completedNumbers = [];
		let count = Array(this.nSquares).fill(0);
		for (let x = 0; x < this.nSquares; x++){
			for (let y = 0; y < this.nSquares; y++){
				let cell = this.get({x, y});
				if (cell.value === cell.solution){
					count[cell.value-1]++;
					if (count[cell.value-1] === this.nSquares){
						this.completedNumbers.push(cell.value);
					}
				}
			}
		}
	}

	pushBoard() {
		this.history.push({
			board: JSON.parse(JSON.stringify(this.board))
		});
	}

	popBoard(){
		if (this.history.length > 0){
			this.board = this.history[this.history.length - 1].board
			this.checkFullNotation(true)
			this.history.pop()
			this.recalculatePossibleValues()
		}
	}

	get(c: CellCoordinates){
		return this.board[c.x][c.y];
	}

	selectCell(c: CellCoordinates){
		const index = indexOfCoordsInArray(this.selectedCells, c);
		if (index === -1) this.selectedCells.push(c);
		return this.selectedCells = this.selectedCells.filter((_, i) => i !== index);
	}

	onlyAvailableInBox(c: CellCoordinates, n: number){
		const boxX = Math.floor(c.x / 3);
		const boxY = Math.floor(c.y / 3);
		let found = 0;
		for (let x = 0; x < 3; x++){
			for (let y = 0; y < 3; y++){
				const cell = this.get({x: boxX * 3 + x, y: boxY * 3 + y});
				if (cell.value === 0 && this.possibleValues[boxX * 3 + x][boxY * 3 + y].includes(n)){
					found++;
				}
			}
		}
		return found === 1;
	}

	setNote(coords: CellCoordinates[], n: number, state: boolean | null = null, push: boolean = true, checkAutoSolution: boolean = true): [boolean | null, BoardAnimation[]]{
		let hasPushed = false;

		let finalNoteState: boolean | null = null;
		let animations: BoardAnimation[] = [];

		for (const c of coords){
			const cell = this.get(c)

			if (cell.value === 0){
				//Check if only available place in box
				if (SettingsHandler.settings.autoSolveOnlyInBox && checkAutoSolution && this.onlyAvailableInBox(c, n)){
					finalNoteState = true;
					animations = animations.concat(this.setValue([c], n));
				} else if (cell.notes.includes(n)){
					if (state !== true){
						//Remove note
						if (push && !hasPushed){
							this.pushBoard()
							hasPushed = true;
						}
						this.board[c.x][c.y].notes = cell.notes.filter(note => note !== n)
						if (
							(
								(SettingsHandler.settings.autoSolveCellsWithColor && cell.color !== 'default') ||
								(SettingsHandler.settings.autoSolveCellsFullNotation && this.fullNotation)
							) &&
							this.board[c.x][c.y].notes.length === 1
						){
							finalNoteState = true;
							animations = animations.concat(this.setValue([c], this.board[c.x][c.y].notes[0], false));
						}
					}
				} else if (state !== false && (!SettingsHandler.settings.lockCellsWithColor || (cell.color === 'default'))){
					//Add note
					if (!SettingsHandler.settings.showPossibleValues || this.possibleValues[c.x][c.y].includes(n)){
						if (push && !hasPushed){
							this.pushBoard()
							hasPushed = true;
						}
						this.board[c.x][c.y].notes.push(n);
						this.checkFullNotation();
						finalNoteState = true;
					}
				}
			}
		}

		if (coords.length === 1){
			return [finalNoteState, animations];
		}
		return [null, []];
	}

	setValue(coords: CellCoordinates[], s: number, push = true): BoardAnimation[]{
		let animations: BoardAnimation[] = [];
		let hasPushed = false;

		for (const c of coords){
			if (!this.board[c.x][c.y].clue){
				const boxX = Math.floor(c.x / 3)
				const boxY = Math.floor(c.y / 3)

				if (push && !hasPushed){
					this.pushBoard();
					hasPushed = true;
				}
				this.board[c.x][c.y].value = s
				this.board[c.x][c.y].notes = []
				for (const cell of this.getVisibleCells(c)){
					if (SettingsHandler.settings.autoRemoveCandidates) this.setNote([cell], s, false, false, false);
					this.possibleValues[cell.x][cell.y] = this.possibleValues[cell.x][cell.y].filter(n => n !== s);
				}

				if (SettingsHandler.settings.clearColorOnInput) this.board[c.x][c.y].color = 'default'

				//Check animations
				if (this.checkComplete()) animations = [{type: 'board', center: c}]
				else {
					let flagRow = true
					let flagCol = true
					for (let i = 0; i < this.nSquares; i++){
						if (this.get({x: i, y: c.y}).value === 0) flagRow = false
						if (this.get({x: c.x, y: i}).value === 0) flagCol = false
					}
					if (flagRow) animations.push({type: 'row', center: c})
					if (flagCol) animations.push({type: 'col', center: c})

					let boxFlag = true
					for (let x = 0; x < 3; x++) for (let y = 0; y < 3; y++) if (this.board[boxX * 3 + x][boxY * 3 + y].value === 0) boxFlag = false
					if (boxFlag) animations.push({type: 'box', boxX, boxY})
				}

				//Eliminate possibleValues
				for (let i = 0; i < this.nSquares; i++){
					this.possibleValues[i][c.y] = this.possibleValues[i][c.y].filter(n => n !== s);
					this.possibleValues[c.x][i] = this.possibleValues[c.x][i].filter(n => n !== s);
				}
				for (let x = 0; x < 3; x++) for (let y = 0; y < 3; y++){
					this.possibleValues[boxX * 3 + x][boxY * 3 + y] = this.possibleValues[boxX * 3 + x][boxY * 3 + y].filter(n => n !== s);
				}
			}
		}

		return animations;
	}

	hint(coords: CellCoordinates[]){
		let animations: BoardAnimation[] = [];
		for (const c of coords){
			animations.push(...(this.setValue([c], this.board[c.x][c.y].solution, true)));
			this.board[c.x][c.y].clue = true;
		}
		return animations;
	}

	erase(coords: CellCoordinates[]){
		let hasPushed = false;

		for (const c of coords){
			const cell = this.board[c.x][c.y];
			if (!cell.clue && (cell.value > 0 || cell.notes.length > 0)){
				if (!hasPushed){
					this.pushBoard();
					hasPushed = true;
				}
				for (const visibleCell of this.getVisibleCells(c)){
					this.possibleValues[visibleCell.x][visibleCell.y] = this.possibleValues[visibleCell.x][visibleCell.y].filter(n => n !== cell.value);
				}

				cell.value = 0;
				cell.notes = [];
				cell.color = 'default';
			}
		}

		this.recalculatePossibleValues();
	}

	getBoxCells(c: CellCoordinates){
		let boxCells = []
		const boxX = Math.floor(c.x / 3)
		const boxY = Math.floor(c.y / 3)
		for (let x = 0; x < 3; x++) for (let y = 0; y < 3; y++) boxCells.push({x: boxX * 3 + x, y: boxY * 3 + y})
		return boxCells
	}

	getVisibleCells(c: CellCoordinates){
		let visibleCells: CellCoordinates[] = []
		const boxX = Math.floor(c.x / 3)
		const boxY = Math.floor(c.y / 3)
		visibleCells = visibleCells.concat(this.getBoxCells(c))
		for (let i = 0; i < this.nSquares; i++){
			if (i < boxX * 3 || i >= boxX * 3 + 3) visibleCells.push({x: i, y: c.y})
			if (i < boxY * 3 || i >= boxY * 3 + 3) visibleCells.push({x: c.x, y: i})
		}
		return visibleCells
	}

	calculateHighlightedCells(selectedCoords: CellCoordinates[], number: number){
		let highlightedCells: boolean[][] = Array<number>(this.nSquares).fill(0).map(x => Array(this.nSquares).fill(false));
		for (const coords of selectedCoords){
			let targetValue = number > 0 ? number : this.get(coords).value

			if (number === 0) for (const cell of this.getVisibleCells(coords)) highlightedCells[cell.x][cell.y] = true

			if (SettingsHandler.settings.advancedHighlight){
				let highlightCages = []
				if (this.mode === 'killer'){
					for (let x = 0; x < this.nSquares; x++){
						for (let y = 0; y < this.nSquares; y++) {
							const cell = this.get({x, y})
							if (cell.value > 0 && cell.value === targetValue) highlightCages.push(cell.cageIndex)
						}
					}
				}
				for (let x = 0; x < this.nSquares; x++){
					for (let y = 0; y < this.nSquares; y++) {
						const cell = this.get({x, y})
						if (
							(targetValue > 0 && cell.value > 0) ||
							(this.mode === 'killer' && highlightCages.includes(cell.cageIndex)) ||
							(SettingsHandler.settings.lockCellsWithColor && cell.color !== 'default' && !cell.notes.includes(targetValue))
						) highlightedCells[x][y] = true
						if (cell.value > 0 && cell.value === targetValue) for (const visibleCell of this.getVisibleCells({x, y})) highlightedCells[visibleCell.x][visibleCell.y] = true
					}
				}
				if (this.nSquares === 9){
					for (let boxX = 0; boxX < 3; boxX++){
						for (let boxY = 0; boxY < 3; boxY++){
							let found = false
							for (let x = 0; x < 3; x++){
								for (let y = 0; y < 3; y++){
									const cell = this.get({x: boxX * 3 + x, y: boxY * 3 + y})
									if (cell.color !== 'default' && cell.notes.includes(targetValue)){
										found = true
										break
									}
								}
							}
							if (found){
								for (let x = 0; x < 3; x++){
									for (let y = 0; y < 3; y++){
										if (!this.get({x: boxX * 3 + x, y: boxY * 3 + y}).notes.includes(targetValue))
											highlightedCells[boxX * 3 + x][boxY * 3 + y] = true
									}
								}
							}
						}
					}
				}
			} else {
				for (const visibleCell of this.getVisibleCells(coords)) highlightedCells[visibleCell.x][visibleCell.y] = true
			}
		}

		return highlightedCells
	}

	calculateLinks(n: number){
		let links = []
		//Find links in rows
		for (let r = 0; r < this.nSquares; r++){
			//Count candidates in row
			let newLink = []
			for (let i = 0; i < this.nSquares; i++){
				if (this.board[i][r].notes.includes(n)){
					newLink.push({x: i, y: r});
				}
			}
			if (newLink.length <= 2){
				links.push(newLink)
			}
		}
		//Find links in columns
		for (let c = 0; c < this.nSquares; c++){
			//Count candidates in column
			let newLink = []
			for (let i = 0; i < this.nSquares; i++){
				if (this.board[c][i].notes.includes(n)){
					newLink.push({x: c, y: i})
				}
			}
			if (newLink.length <= 2){
				links.push(newLink)
			}
		}
		//Count candidates in boxes
		for (let qx = 0; qx < 3; qx++){
			for (let qy = 0; qy < 3; qy++){
				//Count candidates in box
				let newLink = []
				for (let x = 0; x < 3; x++){
					for (let y = 0; y < 3; y++){
						if (this.board[qx*3+x][qy*3+y].notes.includes(n)){
							newLink.push({x: qx*3+x, y: qy*3+y})
						}
					}
				}
				if (newLink.length <= 2){
					links.push(newLink)
				}
			}
		}
		return links
	}

	setColor(coords: CellCoordinates, newColor: ColorName){
		if (GameHandler.complete) return;

		this.pushBoard();
		this.board[coords.x][coords.y].color = newColor;
		//this.saveToLocalStorage()
	}

	clearColors(){
		this.pushBoard()
		for (let x = 0; x < this.nSquares; x++){
			for (let y = 0; y < this.nSquares; y++){
				this.board[x][y].color = 'default'
			}
		}
	}

	saveToLocalStorage(){
		GameHandler.saveGame(JSON.stringify(this))
	}

	checkComplete(){
		for (let x = 0; x < this.nSquares; x++) for (let y = 0; y < this.nSquares; y++) if (this.board[x][y].value !== this.board[x][y].solution) return false;
		GameHandler.setComplete();
		return true;
	}

	checkFullNotation(force = false){
		if (this.fullNotation && !force) return

		for (let n = 1; n <= 9; n++){
			for (let boxX = 0; boxX < 3; boxX++){
				for (let boxY = 0; boxY < 3; boxY++){
					let found = false
					for (let x = 0; x < 3; x++){
						for (let y = 0; y < 3; y++){
							const cell = this.get({x: boxX * 3 + x, y: boxY * 3 + y})
							if (cell.value === n || cell.notes.includes(n)){
								found = true
								break
							}
						}
					}
					if (!found){
						this.fullNotation = false
						return
					}
				}
			}
		}

		this.fullNotation = true

		if (SettingsHandler.settings.clearColorFullNotation) this.clearColors()
	}

	getTextRepresentation(cluesOnly: boolean){
		let text = ''
		for (let y = 0; y < this.nSquares; y++){
			for (let x = 0; x < this.nSquares; x++) {
				text += cluesOnly && !this.board[x][y].clue ? 0 : this.board[x][y].value
			}
		}
		return text
	}

	restart(){
		this.initBoard()
		this.fullNotation = false
	}

	setTimer(timestamp: number){
		this.timer = timestamp
	}
}
