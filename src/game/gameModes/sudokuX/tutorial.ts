import { TutorialStep } from '../../types';
import { SudokuXBoard } from './SudokuXBoard';

const step1 = new SudokuXBoard('xu0', '9 *12$4.4671;5;2$8:1;7$8.3!1;5.2;43(6! 958324617712856934346719825173295468865143279429687351631978542597432186284561793');
step1.setValue({ of: step1.get({ x: 5, y: 2 })!, to: 4, causedByUser: true });
for (let x = 0; x < 9; x++) step1.selectedCells.add(step1.get({ x, y: 2 })!);

const step2 = new SudokuXBoard('xu0', '9 *12$4.4671;5;2$8:1;7$8.3!1;5.2;43(6! 958324617712856934346719825173295468865143279429687351631978542597432186284561793');
step2.setValue({ of: step2.get({ x: 4, y: 1 })!, to: 8, causedByUser: true });
for (let y = 0; y < 9; y++) step2.selectedCells.add(step2.get({ x: 4, y })!);

const step3 = new SudokuXBoard('xu0', '9 *12$4.4671;5;2$8:1;7$8.3!1;5.2;43(6! 958324617712856934346719825173295468865143279429687351631978542597432186284561793');
step3.setValue({ of: step3.get({ x: 5, y: 6 })!, to: 4, causedByUser: true });
step3.selectedCells = step3.get({ x: 3, y: 6 })!.box;

const step4 = new SudokuXBoard('xu0', '9 *12$4.4671;5;2$8:1;7$8.3!1;5.2;43(6! 958324617712856934346719825173295468865143279429687351631978542597432186284561793');
step4.setValue({ of: step4.get({ x: 8, y: 0 })!, to: 1, causedByUser: true });
step4.setValue({ of: step4.get({ x: 7, y: 7 })!, to: 6, causedByUser: true });

const step5 = new SudokuXBoard('xu0', '9 *12$4.4671;5;2$8:1;7$8.3!1;5.2;43(6! 958324617712856934346719825173295468865143279429687351631978542597432186284561793');
for (const cell of step5.allCells) {
    step5.setValue({ of: cell, to: cell.solution, causedByUser: true });
}

const sudokuXTutorial: TutorialStep[] = [
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
        text: 'tutorial.sudokux.diagonals',
        board: step4
    },
    {
        text: 'tutorial.classic.solve',
        board: step5
    },
];

export default sudokuXTutorial;
