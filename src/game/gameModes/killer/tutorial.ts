import { TutorialStep } from '../../types';
import { KillerBoard } from './KillerBoard';

const step1 = new KillerBoard('ku0', '9 .1)7!4=38%84(9;4.8.7.6$4.5:2$89. 514962738367185249829374651751496382693218475482753916945827163138649527276531894 00010212,0304,0506,0818,1011,212232132333,1424,1626,07172728,2030,31,344445,152535,40,414252,4656,3637473848,5060,51,57,586878,70617172,43535464,5565,6667,7585,768677,80,8182,62637383,7484,8788');
step1.setValue({ of: step1.get({ x: 6, y: 1 })!, to: 7, causedByUser: true });
for (let x = 0; x < 9; x++) step1.selectedCells.add(step1.get({ x, y: 1 })!);

const step2 = new KillerBoard('ku0', '9 .1)7!4=38%84(9;4.8.7.6$4.5:2$89. 514962738367185249829374651751496382693218475482753916945827163138649527276531894 00010212,0304,0506,0818,1011,212232132333,1424,1626,07172728,2030,31,344445,152535,40,414252,4656,3637473848,5060,51,57,586878,70617172,43535464,5565,6667,7585,768677,80,8182,62637383,7484,8788');
step2.setValue({ of: step2.get({ x: 6, y: 2 })!, to: 5, causedByUser: true });
for (let y = 0; y < 9; y++) step2.selectedCells.add(step2.get({ x: 6, y })!);

const step3 = new KillerBoard('ku0', '9 .1)7!4=38%84(9;4.8.7.6$4.5:2$89. 514962738367185249829374651751496382693218475482753916945827163138649527276531894 00010212,0304,0506,0818,1011,212232132333,1424,1626,07172728,2030,31,344445,152535,40,414252,4656,3637473848,5060,51,57,586878,70617172,43535464,5565,6667,7585,768677,80,8182,62637383,7484,8788');
step3.setValue({ of: step3.get({ x: 8, y: 8 })!, to: 6, causedByUser: true });
step3.selectedCells = step3.get({ x: 6, y: 6 })!.box;

const step4 = new KillerBoard('ku0', '9 .1)7!4=38%84(9;4.8.7.6$4.5:2$89. 514962738367185249829374651751496382693218475482753916945827163138649527276531894 00010212,0304,0506,0818,1011,212232132333,1424,1626,07172728,2030,31,344445,152535,40,414252,4656,3637473848,5060,51,57,586878,70617172,43535464,5565,6667,7585,768677,80,8182,62637383,7484,8788');
step4.setValue({ of: step4.get({ x: 3, y: 3 })!, to: 7, causedByUser: true });
step4.selectedCells = step4.get({ x: 2, y: 1 })!.cage!.members;
step4.get({ x: 2, y: 1 })!.hasVisibleError = true;
step4.get({ x: 3, y: 3 })!.hasVisibleError = true;

const step5 = new KillerBoard('ku0', '9 .1)7!4=38%84(9;4.8.7.6$4.5:2$89. 514962738367185249829374651751496382693218475482753916945827163138649527276531894 00010212,0304,0506,0818,1011,212232132333,1424,1626,07172728,2030,31,344445,152535,40,414252,4656,3637473848,5060,51,57,586878,70617172,43535464,5565,6667,7585,768677,80,8182,62637383,7484,8788');
step5.setValue({ of: step5.get({ x: 7, y: 7 })!, to: 2, causedByUser: true });
step5.setValue({ of: step5.get({ x: 8, y: 6 })!, to: 3, causedByUser: true });
step5.selectedCells = step5.get({ x: 7, y: 7 })!.cage!.members;

const step6 = new KillerBoard('ku0', '9 .1)7!4=38%84(9;4.8.7.6$4.5:2$89. 514962738367185249829374651751496382693218475482753916945827163138649527276531894 00010212,0304,0506,0818,1011,212232132333,1424,1626,07172728,2030,31,344445,152535,40,414252,4656,3637473848,5060,51,57,586878,70617172,43535464,5565,6667,7585,768677,80,8182,62637383,7484,8788');
for (const cell of step6.allCells) {
    step6.setValue({ of: cell, to: cell.solution, causedByUser: true });
}

const killerTutorial: TutorialStep[] = [
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
        text: 'tutorial.killer.cages',
        board: step4
    },
    {
        text: 'tutorial.killer.cageSum',
        board: step5
    },
    {
        text: 'tutorial.classic.solve',
        board: step6
    },
];

export default killerTutorial;
