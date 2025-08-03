import { SudokuXBoard } from './SudokuXBoard';
import { SudokuXCanvas } from './SudokuXCanvas';

const sudokuXBoard = new SudokuXBoard('xu0', '3 1.3:4.8. 123654789');
sudokuXBoard.get({ x: 1, y: 0 })!.value = 2;
sudokuXBoard.get({ x: 0, y: 1 })!.value = 6;
sudokuXBoard.get({ x: 0, y: 2 })!.value = 7;
sudokuXBoard.get({ x: 2, y: 2 })!.value = 9;
const sudokuXCanvas = new SudokuXCanvas('darkBlue', true, 0);
sudokuXCanvas.game = sudokuXBoard;
sudokuXCanvas.theme = 'light';

export default sudokuXCanvas;
