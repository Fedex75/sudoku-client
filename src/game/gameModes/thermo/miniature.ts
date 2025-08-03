import { ThermoBoard } from './ThermoBoard';
import { ThermoCanvas } from './ThermoCanvas';

const thermoBoard = new ThermoBoard('tu0', '3 1.3:4.8. 123654789 0,1,2,5;3,6,7,8');
thermoBoard.get({ x: 1, y: 0 })!.value = 2;
thermoBoard.get({ x: 0, y: 1 })!.value = 6;
thermoBoard.get({ x: 0, y: 2 })!.value = 7;
thermoBoard.get({ x: 2, y: 2 })!.value = 9;
const thermoCanvas = new ThermoCanvas('darkBlue', true, 0);
thermoCanvas.game = thermoBoard;
thermoCanvas.theme = 'light';

export default thermoCanvas;
