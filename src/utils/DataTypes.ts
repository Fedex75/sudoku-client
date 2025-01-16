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
    colorGroupIndex: number
}

export type CellCoordinates = {
    x: number
    y: number
}

export type BoardMatrix = Cell[][]

export type HistoryItem = {
    board: string
    fullNotation: boolean
    colorGroups: string
    killer__cageErrors: string
    sandwich__visibleHorizontalClues: string
    sandwich__visibleVerticalClues: string
    sandwich__lateralCluesErrors: string
}

export type History = HistoryItem[]

export type ColorGroup = {
    cells: CellCoordinates[]
    visibleCells: CellCoordinates[]
}

export type GameData = {
    id: string
    mode: GameModeName
    difficulty: DifficultyName
    mission: string
    clues: string
    solution: string
    timer: number
    board: BoardMatrix
    selectedCells: CellCoordinates[]
    history: History
    version: number
    colorGroups: ColorGroup[]

    killer__cages: CellCoordinates[][]
    killer__cageErrors: number[]

    sandwich__horizontalClues: number[]
    sandwich__verticalClues: number[]
    sandwich__visibleHorizontalClues: boolean[]
    sandwich__visibleVerticalClues: boolean[]
    sandwich__lateralCluesErrors: { horizontal: boolean[], vertical: boolean[] }
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
    currentAnimations: { data: BoardAnimation, startTime: number | null }[]
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
        getVisibleCells: (game: Board, c: CellCoordinates) => CellCoordinates[]
        getBoxCellsCoordinates: (c: CellCoordinates) => CellCoordinates[]
        checkAnimations: ((game: Board, c: CellCoordinates) => BoardAnimation[])[]
        getBoxes: (game: Board) => CellCoordinates[][]
        afterValuesChanged: ((game: Board) => BoardAnimation[])[]
        checkErrors: (game: Board) => void
        iterateAllCells: (game: Board, func: (cell: Cell, coords: CellCoordinates, exit: () => void) => void) => void
        getCellUnits: (game: Board, c: CellCoordinates) => CellCoordinates[][]
        getAllUnits: (game: Board) => CellCoordinates[][]
    }
}
