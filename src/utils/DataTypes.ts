import { ColorName } from "./Colors"
import { DifficultyName, GameModeName } from "./Difficulties"

export type ThemeName = 'light' | 'dark'

export type DigitChar = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'

export type Coordinates = {
    x: number,
    y: number
}

export type CanvasRef = {
    renderFrame: () => void
    doAnimations: (data: BoardAnimation[]) => void
    stopAnimations: () => void
}

export type MouseButtonType = 'primary' | 'secondary' | 'tertiary'

export type Cell = {
    value: number
    notes: number[]
    color: ColorName
    solution: number
    clue: boolean
    cageIndex?: number
    cageValue?: number
    possibleValues: number[]
    isError: boolean
}

export type CellCoordinates = {
    x: number
    y: number
}

export type Board = Cell[][]

export type HistoryItem = {
    board: string
    fullNotation: boolean
    colorGroups: string
}

export type History = HistoryItem[]

export type GameData = {
    id: string
    mode: GameModeName
    difficulty: DifficultyName
    mission: string
    clues: string
    solution: string
    cages: number[][][]
    timer: number
    board: Board
    selectedCells: CellCoordinates[]
    history: History
    version: number
    colorGroups: CellCoordinates[][]
}

export type RawGameData = {
    id: string
    m: string
}

export function isGameData(data: GameData | RawGameData): data is GameData {
    return (data as GameData).mode !== undefined
}

export type AnimationType = 'box' | 'row' | 'col' | 'board' | 'fadein' | 'fadein_long' | 'fadeout'

export type BoxBoardAnimation = {
    type: 'box'
    boxX: number
    boxY: number
}

export type RowBoardAnimation = {
    type: 'row'
    center: CellCoordinates
}

export type ColBoardAnimation = {
    type: 'col'
    center: CellCoordinates
}

export type BoardBoardAnimation = {
    type: 'board'
    center: CellCoordinates
}

export type FadeBoardAnimation = {
    type: 'fadein' | 'fadein_long' | 'fadeout'
}

export type BoardAnimation = BoxBoardAnimation | RowBoardAnimation | ColBoardAnimation | BoardBoardAnimation | FadeBoardAnimation

export type IDBookmark = {
    id: string
    m?: never
}

export type MissionBookmark = {
    id?: never
    m: string
}

export type Bookmark = IDBookmark | MissionBookmark

export function isIDBookmark(bm: Bookmark): bm is IDBookmark {
    return (bm.id !== undefined)
}
