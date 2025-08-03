import Board from '../../utils/Board';
import { Canvas } from '../../utils/Canvas';
import { AccentColor } from '../../utils/Colors';
import { GameModeDefinitions } from '../Definitions';
import { GameModeName } from '../types';

export function CanvasFactory(gameMode: GameModeName, accentColor: AccentColor, notPlayable: boolean, boxBorderWidthFactor: number): Canvas<Board> {
    return new GameModeDefinitions[gameMode].canvasClass(accentColor, notPlayable, boxBorderWidthFactor);
}
