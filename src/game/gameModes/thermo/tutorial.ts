import { TutorialStep } from '../../types';
import { ThermoBoard } from './ThermoBoard';

const step1 = new ThermoBoard('tu0', '9 :2)9(6%4=3(7g 932781645576942183184635729649528317218379456357164298795216834823457961461893572 33,42,43,44,35,26;74,65,56,47,38,29;58,57,66,67,68,69;37,36,45,46,55;5,14,23,32,41;48,39,30,21,12;20,11,10,19;31,22,13,4;71,62,53,52;51,50,49,40;61,70,79;2,1,0;34,25,16');
step1.setValue({ of: step1.get({ x: 6, y: 3 })!, to: 4, causedByUser: true });
step1.selectedCells = step1.get({ x: 6, y: 3 })!.row;

const step2 = new ThermoBoard('tu0', '9 :2)9(6%4=3(7g 932781645576942183184635729649528317218379456357164298795216834823457961461893572 33,42,43,44,35,26;74,65,56,47,38,29;58,57,66,67,68,69;37,36,45,46,55;5,14,23,32,41;48,39,30,21,12;20,11,10,19;31,22,13,4;71,62,53,52;51,50,49,40;61,70,79;2,1,0;34,25,16');
step2.setValue({ of: step2.get({ x: 0, y: 1 })!, to: 3, causedByUser: true });
step2.selectedCells = step2.get({ x: 0, y: 1 })!.column;

const step3 = new ThermoBoard('tu0', '9 :2)9(6%4=3(7g 932781645576942183184635729649528317218379456357164298795216834823457961461893572 33,42,43,44,35,26;74,65,56,47,38,29;58,57,66,67,68,69;37,36,45,46,55;5,14,23,32,41;48,39,30,21,12;20,11,10,19;31,22,13,4;71,62,53,52;51,50,49,40;61,70,79;2,1,0;34,25,16');
step3.setValue({ of: step3.get({ x: 5, y: 1 })!, to: 6, causedByUser: true });
step3.selectedCells = step3.get({ x: 3, y: 0 })!.box;

const step4 = new ThermoBoard('tu0', '9 :2)9(6%4=3(7g 932781645576942183184635729649528317218379456357164298795216834823457961461893572 33,42,43,44,35,26;74,65,56,47,38,29;58,57,66,67,68,69;37,36,45,46,55;5,14,23,32,41;48,39,30,21,12;20,11,10,19;31,22,13,4;71,62,53,52;51,50,49,40;61,70,79;2,1,0;34,25,16');
step4.selectedCells = new Set([
    step4.get({ x: 4, y: 0 })!,
    step4.get({ x: 4, y: 3 })!,
]);

const step5 = new ThermoBoard('tu0', '9 :2)9(6%4=3(7g 932781645576942183184635729649528317218379456357164298795216834823457961461893572 33,42,43,44,35,26;74,65,56,47,38,29;58,57,66,67,68,69;37,36,45,46,55;5,14,23,32,41;48,39,30,21,12;20,11,10,19;31,22,13,4;71,62,53,52;51,50,49,40;61,70,79;2,1,0;34,25,16');
step5.setValue({ of: step5.get({ x: 6, y: 3 })!, to: 3, causedByUser: true });
step5.setValue({ of: step5.get({ x: 6, y: 4 })!, to: 4, causedByUser: true });
step5.setValue({ of: step5.get({ x: 7, y: 4 })!, to: 5, causedByUser: true });
step5.setValue({ of: step5.get({ x: 8, y: 4 })!, to: 6, causedByUser: true });
step5.setValue({ of: step5.get({ x: 8, y: 3 })!, to: 7, causedByUser: true });
step5.setValue({ of: step5.get({ x: 8, y: 2 })!, to: 9, causedByUser: true });
step5.setValue({ of: step5.get({ x: 1, y: 0 })!, to: 1, causedByUser: true });
step5.selectedCells = step5.get({ x: 0, y: 0 })!.thermometer!.members.union(step5.get({ x: 8, y: 2 })!.thermometer!.members);

const step6 = new ThermoBoard('tu0', '9 :2)9(6%4=3(7g 932781645576942183184635729649528317218379456357164298795216834823457961461893572 33,42,43,44,35,26;74,65,56,47,38,29;58,57,66,67,68,69;37,36,45,46,55;5,14,23,32,41;48,39,30,21,12;20,11,10,19;31,22,13,4;71,62,53,52;51,50,49,40;61,70,79;2,1,0;34,25,16');
const thermoSolution = '932781645576942183184635729649528317218379456357164298795216834;823457961461893572';
for (const cell of step6.allCells) cell.value = Number.parseInt(thermoSolution[cell.coords.y * 9 + cell.coords.x]);

const thermoTutorial: TutorialStep[] = [
    {
        text: 'tutorial.classic.rows',
        board: step1
    },
    {
        text: 'tutorial.classic.columns',
        board: step2
    },
    {
        text: 'tutorial.classic.boxes',
        board: step3
    },
    {
        text: 'tutorial.thermo.thermometers1',
        board: step4
    },
    {
        text: 'tutorial.thermo.thermometers2',
        board: step5
    },
    {
        text: 'tutorial.classic.solve',
        board: step6
    },
];

export default thermoTutorial;
