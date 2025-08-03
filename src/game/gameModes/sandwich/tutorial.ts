import { TutorialStep } from '../../types';
import { SandwichBoard } from './SandwichBoard';

const step1 = new SandwichBoard('wu0', '9 93:82.7;5.1!82;9.13:35;6;2!8:49;1;7;58,9$5. 931682574465713928827459613183597462652341789749268135374125896518936247296874351 3,3,6,16,15,16,15,8,33 12,0,17,0,5,7,17,17,18');
step1.setValue({ of: step1.get({ x: 1, y: 3 })!, to: 6, causedByUser: true });
step1.selectedCells = step1.get({ x: 1, y: 3 })!.row;

const step2 = new SandwichBoard('wu0', '9 93:82.7;5.1!82;9.13:35;6;2!8:49;1;7;58,9$5. 931682574465713928827459613183597462652341789749268135374125896518936247296874351 3,3,6,16,15,16,15,8,33 12,0,17,0,5,7,17,17,18');
step2.setValue({ of: step2.get({ x: 2, y: 7 })!, to: 5, causedByUser: true });
step2.selectedCells = step2.get({ x: 2, y: 7 })!.column;

const step3 = new SandwichBoard('wu0', '9 93:82.7;5.1!82;9.13:35;6;2!8:49;1;7;58,9$5. 931682574465713928827459613183597462652341789749268135374125896518936247296874351 3,3,6,16,15,16,15,8,33 12,0,17,0,5,7,17,17,18');
step3.setValue({ of: step3.get({ x: 8, y: 5 })!, to: 6, causedByUser: true });
step3.selectedCells = step3.get({ x: 6, y: 3 })!.box;

const step4 = new SandwichBoard('wu0', '9 93:82.7;5.1!82;9.13:35;6;2!8:49;1;7;58,9$5. 931682574465713928827459613183597462652341789749268135374125896518936247296874351 3,3,6,16,15,16,15,8,33 12,0,17,0,5,7,17,17,18');
step4.setValue({ of: step4.get({ x: 3, y: 5 })!, to: 2, causedByUser: true });
step4.setValue({ of: step4.get({ x: 4, y: 5 })!, to: 6, causedByUser: true });
step4.setValue({ of: step4.get({ x: 5, y: 5 })!, to: 8, causedByUser: true });
for (let x = 2; x <= 6; x++) step4.selectedCells.add(step4.get({ x, y: 5 })!);

const step5 = new SandwichBoard('wu0', '9 93:82.7;5.1!82;9.13:35;6;2!8:49;1;7;58,9$5. 931682574465713928827459613183597462652341789749268135374125896518936247296874351 3,3,6,16,15,16,15,8,33 12,0,17,0,5,7,17,17,18');
for (const cell of step5.allCells) {
    step5.setValue({ of: cell, to: cell.solution, causedByUser: true });
}

const sandwichTutorial: TutorialStep[] = [
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
        text: 'tutorial.sandwich.sum',
        board: step4
    },
    {
        text: 'tutorial.classic.solve',
        board: step5
    },
];

export default sandwichTutorial;
