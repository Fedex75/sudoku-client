import Board from '../utils/Board';
import { Canvas } from '../utils/Canvas';
import { AccentColor } from '../utils/Colors';
import { DifficultyName } from '../utils/Difficulties';
import { Settings } from '../utils/hooks/SettingsHandler';

export type GameModeName = 'classic' | 'killer' | 'sandwich' | 'sudokuX' | 'thermo';
export const gameModeOrder: GameModeName[] = ['sandwich', 'sudokuX', 'classic', 'killer', 'thermo'];

export interface TutorialStep {
    text: string;
    board: Board;
}

export interface GameModeDefinition {
    name: GameModeName;
    homeScreenCanvas: Canvas<Board>;
    tutorial: TutorialStep[];
    boardClass: new (id: string, mission: string, settings: Settings) => Board;
    canvasClass: new (accentColor: AccentColor, notPlayable: boolean, boxBorderWidthFactor: number) => Canvas<Board>;
    difficulties: (DifficultyName)[];
    identifier: string;
}
