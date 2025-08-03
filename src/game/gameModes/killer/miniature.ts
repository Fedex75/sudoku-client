import { KillerBoard } from './KillerBoard';
import { KillerCanvas } from './KillerCanvas';

const killerBoard = new KillerBoard('ku0', '3 1.3:4.8. 123654789 0010,2021,0102,11,1222');
killerBoard.get({ x: 1, y: 0 })!.value = 2;
killerBoard.get({ x: 0, y: 1 })!.value = 6;
killerBoard.get({ x: 0, y: 2 })!.value = 7;
killerBoard.get({ x: 2, y: 2 })!.value = 9;
const killerCanvas = new KillerCanvas('darkBlue', true, 0);
killerCanvas.game = killerBoard;
killerCanvas.theme = 'light';

export default killerCanvas;
