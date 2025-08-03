import { GameModeDefinition, GameModeName, gameModeOrder } from './types';
import { ClassicBoard } from './gameModes/classic/ClassicBoard';
import { ClassicCanvas } from './gameModes/classic/ClassicCanvas';
import classicCanvas from './gameModes/classic/miniature';
import classicTutorial from './gameModes/classic/tutorial';
import { KillerBoard } from './gameModes/killer/KillerBoard';
import { KillerCanvas } from './gameModes/killer/KillerCanvas';
import killerCanvas from './gameModes/killer/miniature';
import killerTutorial from './gameModes/killer/tutorial';
import sandwichCanvas from './gameModes/sandwich/miniature';
import { SandwichBoard } from './gameModes/sandwich/SandwichBoard';
import { SandwichCanvas } from './gameModes/sandwich/SandwichCanvas';
import sandwichTutorial from './gameModes/sandwich/tutorial';
import sudokuXCanvas from './gameModes/sudokuX/miniature';
import { SudokuXBoard } from './gameModes/sudokuX/SudokuXBoard';
import { SudokuXCanvas } from './gameModes/sudokuX/SudokuXCanvas';
import sudokuXTutorial from './gameModes/sudokuX/tutorial';
import thermoCanvas from './gameModes/thermo/miniature';
import { ThermoBoard } from './gameModes/thermo/ThermoBoard';
import { ThermoCanvas } from './gameModes/thermo/ThermoCanvas';
import thermoTutorial from './gameModes/thermo/tutorial';

export const GameModeDefinitions: Record<GameModeName, GameModeDefinition> = {
    classic: {
        name: 'classic',
        homeScreenCanvas: classicCanvas,
        tutorial: classicTutorial,
        boardClass: ClassicBoard,
        canvasClass: ClassicCanvas,
        difficulties: ['easy', 'medium', 'hard', 'expert', 'evil'],
        identifier: 'c'
    },
    killer: {
        name: 'killer',
        homeScreenCanvas: killerCanvas,
        tutorial: killerTutorial,
        boardClass: KillerBoard,
        canvasClass: KillerCanvas,
        difficulties: ['easy', 'medium', 'hard', 'expert'],
        identifier: 'k'
    },
    sudokuX: {
        name: 'sudokuX',
        homeScreenCanvas: sudokuXCanvas,
        tutorial: sudokuXTutorial,
        boardClass: SudokuXBoard,
        canvasClass: SudokuXCanvas,
        difficulties: ['easy', 'medium', 'hard', 'expert'],
        identifier: 'x'
    },
    sandwich: {
        name: 'sandwich',
        homeScreenCanvas: sandwichCanvas,
        tutorial: sandwichTutorial,
        boardClass: SandwichBoard,
        canvasClass: SandwichCanvas,
        difficulties: ['easy', 'medium', 'hard', 'expert'],
        identifier: 'w'
    },
    thermo: {
        name: 'thermo',
        homeScreenCanvas: thermoCanvas,
        tutorial: thermoTutorial,
        boardClass: ThermoBoard,
        canvasClass: ThermoCanvas,
        difficulties: ['easy', 'medium', 'hard', 'expert'],
        identifier: 't'
    },
};

export function getMode(identifier: string): GameModeName {
    let result: GameModeName | undefined = undefined;

    gameModeOrder.forEach((gameModeName) => {
        if (GameModeDefinitions[gameModeName].identifier === identifier) {
            result = gameModeName;
        }
    });

    if (!result) throw new Error('Unknown identifier: ' + identifier);

    return result;
}
