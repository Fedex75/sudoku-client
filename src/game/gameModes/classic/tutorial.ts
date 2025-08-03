import { TutorialStep } from '../../types';
import { ClassicBoard } from './ClassicBoard';

const step1 = new ClassicBoard('cu0', '9 (3:87%6:4.29:9:2.54(1.6!9!5%17:4:35$3;6');
step1.setValue({ of: step1.get({ x: 2, y: 3 })!, to: 4, causedByUser: true });
step1.selectedCells = step1.get({ x: 2, y: 3 })!.row;

const step2 = new ClassicBoard('cu0', '9 (3:87%6:4.29:9:2.54(1.6!9!5%17:4:35$3;6');
step2.setValue({ of: step2.get({ x: 1, y: 7 })!, to: 6, causedByUser: true });
step2.selectedCells = step2.get({ x: 1, y: 7 })!.column;

const step3 = new ClassicBoard('cu0', '9 (3:87%6:4.29:9:2.54(1.6!9!5%17:4:35$3;6');
step3.setValue({ of: step3.get({ x: 8, y: 5 })!, to: 5, causedByUser: true });
step3.selectedCells = step3.get({ x: 6, y: 3 })!.box;

const step4 = new ClassicBoard('cu0', '9 (3:87%6:4.29:9:2.54(1.6!9!5%17:4:35$3;6');
for (const cell of step4.allCells) {
    step4.setValue({ of: cell, to: cell.solution, causedByUser: true });
}

const classicTutorial: TutorialStep[] = [
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
        text: 'tutorial.classic.solve',
        board: step4
    },
];

export default classicTutorial;
