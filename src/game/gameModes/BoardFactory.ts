import Board from '../../utils/Board';
import { GameData } from '../../utils/DataTypes';
import { defaultSettings } from '../../utils/hooks/SettingsHandler';
import { GameModeDefinitions } from '../Definitions';
import { GameModeName } from '../types';

export function BoardFactory(gameMode: GameModeName, data: GameData, settings = defaultSettings): Board {
    const newGame = new GameModeDefinitions[gameMode].boardClass(data.id, data.mission, settings);
    newGame.init(data);
    return newGame;
}
