import { DifficultyName, GameModeName } from "./Difficulties"
import { ThemeName } from '../game/Themes'

export type DigitChar = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'

export type BoardAnimation = {
    func: (props: { animationColors: string[][], theme: ThemeName, progress: number }) => void,
    startTime: number | null,
    duration: number,
    type: string
}

export type MouseButtonType = 'primary' | 'secondary' | 'tertiary'

export type Bookmark = {
    id: string
    m?: string
}

export type BoardHistory = string[]

export type GameData = {
    id: string
    mission: string

    boardString?: string
    colorGroupsString?: string
    timer?: number
    history?: BoardHistory
    version?: number
}

export type RawGameData = {
    id: string
    m: string
}

export type MissionsData = Record<GameModeName, Record<DifficultyName, RawGameData[]>>
