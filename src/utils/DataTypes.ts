import { MutableRefObject } from "react"
import Board from "../game/Board"
import { AccentColor, ColorName } from "./Colors"
import { DifficultyName, GameModeName } from "./Difficulties"

export type ThemeName = 'light' | 'dark'

export type DigitChar = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'

export type Coordinates = {
    x: number,
    y: number
}

// These two types look the same but they are technically different concepts

export type CellCoordinates = {
    x: number
    y: number
}

export type BoardAnimation = {
    func: (props: { animationColors: string[][], themes: any, theme: ThemeName, progress: number }) => void,
    startTime: number | null,
    duration: number,
    type: string
}

export type CanvasRef = {
    renderFrame: () => void
    doAnimations: (callbacks: BoardAnimation[]) => void
    stopAnimations: () => void
}

export type MouseButtonType = 'primary' | 'secondary' | 'tertiary'

export type KillerCage = {
    members: CellCoordinates[]
    sum: number
}

export type CageVector = {
    firstCell: CellCoordinates
    secondCell: CellCoordinates
    cage: KillerCage
    ratio: number
}

export type CacheItem = {
    solution: number
    clue: boolean
    cage?: KillerCage
    possibleValues: number[]
    visibleCells: CellCoordinates[]
    units: CellCoordinates[][]
    isError: boolean
    colorGroups: ColorGroup[]
}

export type Cell = {
    value: number
    notes: number[]
    color: ColorName
    cache: CacheItem
}

export type BoardMatrix = Cell[][]

export type HistoryItem = {
    board: string
    fullNotation: boolean
    colorGroups: ColorGroup[]
}

export type History = string[]

export type ColorGroup = {
    members: CellCoordinates[]
    visibleCells: CellCoordinates[]
}

export type GameData = {
    id: string
    mode: GameModeName
    difficulty: DifficultyName
    mission: string
    clues: string
    solution: string
    board: string
    colorGroups: string
    timer: number
    selectedCells: CellCoordinates[]
    history: History
    version: number
}

export type RawGameData = {
    id: string
    m: string
}

export function isGameData(data: GameData | RawGameData): data is GameData {
    return (data as GameData).mode !== undefined
}

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

export type MissionsData = Record<GameModeName, Record<DifficultyName, RawGameData[]>>

export interface RendererProps {
    ctx: CanvasRenderingContext2D
    themes: any
    theme: ThemeName
    logicalSize: number
    game: Board
    lockedInput: number
    notPlayable: boolean
    colors: Record<string, string>
    darkColors: Record<string, string>
    highlightedCells: boolean[][]
    selectedCellsValues: number[]
    squareSize: number
    animationColors: string[][] | null
    currentAnimations: BoardAnimation[]
    accentColor: AccentColor
    solutionColors: any
    colorBorderLineWidth: number
    boxBorderWidth: number
    showLinks: boolean
    linksLineWidth: number
    animationGammas: number[] | null
    cellBorderWidth: number
    rendererState: any
    cageLineWidth: number
}

export interface StateProps {
    themes: any
    theme: ThemeName
    game: Board
    rendererState: MutableRefObject<any>
    squareSize: MutableRefObject<number>
    logicalSize: MutableRefObject<number>
    boxBorderWidthFactor: number
    cellBorderWidth: number
    cageLineWidth: number
}

export interface InitGameProps {
    game: Board
    data: RawGameData
}

export interface Ruleset {
    render: {
        init: ((props: StateProps) => void)[]
        onResize: ((props: StateProps) => void)[]
        screenCoordsToBoardCoords: (clickX: number, clickY: number, state: StateProps) => CellCoordinates | undefined
        before: ((props: RendererProps) => void)[]
        unpaused: ((props: RendererProps) => void)[]
        paused: ((props: RendererProps) => void)[]
        after: ((props: RendererProps) => void)[]
    }
    game: {
        initGameData: (props: InitGameProps) => void
        initBoardMatrix: ((game: Board) => void)[]
        getOrthogonalCells: (game: Board, coords: CellCoordinates) => CellCoordinates[]
        getVisibleCells: (game: Board, c: CellCoordinates) => CellCoordinates[]
        getBoxCellsCoordinates: (c: CellCoordinates) => CellCoordinates[]
        checkAnimations: ((game: Board, c: CellCoordinates) => void)[]
        getBoxes: (game: Board) => CellCoordinates[][]
        afterValuesChanged: ((game: Board) => void)[]
        checkErrors: (game: Board) => void
        iterateAllCells: (game: Board, func: (cell: Cell, coords: CellCoordinates, exit: () => void) => void) => void
        getCellUnits: (game: Board, c: CellCoordinates) => CellCoordinates[][]
        getAllUnits: (game: Board) => CellCoordinates[][]
    }
}
