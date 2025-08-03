import { SandwichBoard } from './SandwichBoard';
import { SandwichCanvas } from './SandwichCanvas';

const sandwichBoard = new SandwichBoard('wu0', '3 1.3:4.8. 123654789 35,9,3 13,30,11');
sandwichBoard.get({ x: 1, y: 0 })!.value = 2;
sandwichBoard.get({ x: 0, y: 1 })!.value = 6;
sandwichBoard.get({ x: 0, y: 2 })!.value = 7;
sandwichBoard.get({ x: 2, y: 2 })!.value = 9;
const sandwichCanvas = new SandwichCanvas('darkBlue', true, 0);
sandwichCanvas.game = sandwichBoard;
sandwichCanvas.theme = 'light';

export default sandwichCanvas;
