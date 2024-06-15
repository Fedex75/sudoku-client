import Solver from "../utils/Solver";
import Decoder from "../utils/Decoder"
import { difficultyDecoder, modeDecoder } from "../utils/Difficulties";

class ClassicBoard {
    constructor(data, raw, nSquares){
		this.id = data.id
		this.mode = raw ? modeDecoder[data.id[0]] : data.mode
		this.difficulty = raw ? difficultyDecoder[data.id[1]] : data.difficulty
		this.mission = raw ? Decoder.decode(data.m) : data.mission
		this.solution = raw ? Solver.solve(this.mission) : data.solution
		this.fullNotation = false
		this.nSquares = nSquares
		this.timer = raw ? 0 : data.timer

		if (raw){
			this.initBoard()
		} else {
			this.board = data.board
			this.selectedCell = data.selectedCell;
			this.history = data.history;
			this.checkFullNotation();
		}
	}

    initBoard(){
		//Create game from raw data
		this.selectedCell = {x: 0, y: 0};
		this.history = [];
		this.board = [];
		this.timer = 0;

		for (let x = 0; x < this.nSquares; x++){
			this.board.push(Array(this.nSquares).fill(null));
			for (let y = 0; y < this.nSquares; y++){
				let number = Number.parseInt(this.mission[y * this.nSquares + x]);
				let solution = Number.parseInt(this.solution[y * this.nSquares + x]);
				this.board[x][y] = {
					clue:     number > 0,
					value:    number,
					notes:    [],
					solution: solution,
					color:    'default',
				};
			}
		}
	}

    pushBoard(){
		this.history.push({
			board: JSON.parse(JSON.stringify(this.board)),
			selectedCell: this.selectedCell
		});
	}
}

class ClassicGame {
    constructor(data, raw, nSquares = 9){
        this.board = new ClassicBoard(data, raw, nSquares);
    }
}

export default ClassicGame;
