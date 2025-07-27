import { ThemeName } from '../game/Themes';
import Board from './Board';

export type DigitChar = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';

export type BoardAnimation = {
    func: (props: { theme: ThemeName, progress: number; }) => void,
    startTime: number | null,
    duration: number,
    type: string;
};

export type MouseButtonType = 'primary' | 'secondary' | 'tertiary';

export type Bookmark = {
    id: string;
    m?: string;
};

export type BoardHistory = string[];

export type GameData = {
    id: string;
    mission: string;

    boardString?: string;
    timer?: number;
    history?: BoardHistory;
    version?: number;
};

export type RawGameData = {
    id: string;
    m: string;
};

export type GameModeMissions<Difficulties extends string> = Partial<Record<Difficulties, RawGameData[]>>;

export type MissionsData<GameModes extends string, Difficulties extends string> = {
    [GameMode in GameModes]: GameModeMissions<Difficulties>
};

interface MethodParams {
    causedByUser: boolean; // This property is mandatory
    [key: string]: any;   // Allow additional properties if needed
}

export function UseHistory(
    target: Object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
): void {
    const originalMethod = descriptor.value!;

    descriptor.value = function (this: Board, args: MethodParams): unknown {
        if (args.causedByUser) {
            this.stashBoard();
        }

        const result = originalMethod.apply(this, [args]);

        if (args.causedByUser) {
            this.triggerValuesChanged(true);
        }

        return result;
    };
}
