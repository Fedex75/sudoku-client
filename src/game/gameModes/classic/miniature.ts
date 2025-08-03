import { ClassicBoard } from './ClassicBoard';
import { ClassicCanvas } from './ClassicCanvas';

const classicBoard = new ClassicBoard('cu0', '3 1.3:4.8.');
//classicBoard.init();
console.log(classicBoard);
classicBoard.get({ x: 1, y: 0 })!.value = 2;
classicBoard.get({ x: 0, y: 1 })!.value = 6;
classicBoard.get({ x: 0, y: 2 })!.value = 7;
classicBoard.get({ x: 2, y: 2 })!.value = 9;
const classicCanvas = new ClassicCanvas('darkBlue', true, 0);
classicCanvas.game = classicBoard;
classicCanvas.theme = 'light';

export default classicCanvas;
