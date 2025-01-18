import { commonDetectErrorsFromSolution, commonInitCacheBoard, commonInitColorGroupsCache, commonInitUnitsAndVisibilityCache, commonRenderCellValueAndCandidates } from "./Common"
import { classicGetVisibleCells, classicGetCellUnits, classicResize, classicScreenCoordsToBoardCoords, classicRenderBackground, classicRenderCellBackground, classicRenderSelection, classicRenderLinks, classicRenderFadeAnimations, classicRenderPaused, classicRenderBorders, classicInitGameData, classicGetBoxCellsCoordinates, classicCheckRowAnimation, classicCheckColumnAnimation, classicCheckBoxAnimation, classicGetBoxes, classicCalculatePossibleValues, classicIterateAllCells, classicGetAllUnits } from "./Classic"
import { killerCalculateCageVectors, killerResize, killerRenderCagesAndCageValues, killerInitGameData, killerInitCages, killerGetVisibleCells, killerSolveLastInCages, killerCheckErrors } from "./Killer"
import { sudokuXRenderDiagonals, sudokuXInitGameData, sudokuXGetVisibleCells, sudokuXDetectErrors, sudokuXGetCellUnits, sudokuXGetAllUnits } from "./SudokuX"
import { sandwichDetectErrors, sandwichInitClueVisibility, sandwichInitGameData, sandwichRenderBackground, sandwichRenderBorders, sandwichRenderLateralClues, sandwichResize } from "./Sandwich"
import { Ruleset } from "../../utils/DataTypes"
import { GameModeName } from "../../utils/Difficulties"

export const rulesets: { [key in GameModeName]: Ruleset } = {
    classic: {
        render: {
            init: [],
            onResize: [classicResize],
            screenCoordsToBoardCoords: classicScreenCoordsToBoardCoords,
            before: [classicRenderBackground],
            unpaused: [classicRenderCellBackground, commonRenderCellValueAndCandidates, classicRenderSelection, classicRenderLinks, classicRenderFadeAnimations],
            paused: [classicRenderPaused],
            after: [classicRenderBorders],
        },
        game: {
            initGameData: classicInitGameData,
            initBoardMatrix: [commonInitCacheBoard, commonInitUnitsAndVisibilityCache, commonInitColorGroupsCache],
            getVisibleCells: classicGetVisibleCells,
            getBoxCellsCoordinates: classicGetBoxCellsCoordinates,
            checkAnimations: [classicCheckRowAnimation, classicCheckColumnAnimation, classicCheckBoxAnimation],
            getBoxes: classicGetBoxes,
            afterValuesChanged: [classicCalculatePossibleValues],
            checkErrors: commonDetectErrorsFromSolution,
            iterateAllCells: classicIterateAllCells,
            getCellUnits: classicGetCellUnits,
            getAllUnits: classicGetAllUnits,
        },
    },
    killer: {
        render: {
            init: [killerCalculateCageVectors],
            onResize: [killerResize, killerCalculateCageVectors],
            screenCoordsToBoardCoords: classicScreenCoordsToBoardCoords,
            before: [classicRenderBackground],
            unpaused: [classicRenderCellBackground, commonRenderCellValueAndCandidates, killerRenderCagesAndCageValues, classicRenderSelection, classicRenderLinks, classicRenderFadeAnimations],
            paused: [classicRenderPaused],
            after: [classicRenderBorders],
        },
        game: {
            initGameData: killerInitGameData,
            initBoardMatrix: [commonInitCacheBoard, killerInitCages, commonInitUnitsAndVisibilityCache, commonInitColorGroupsCache],
            getVisibleCells: killerGetVisibleCells,
            getBoxCellsCoordinates: classicGetBoxCellsCoordinates,
            checkAnimations: [classicCheckRowAnimation, classicCheckColumnAnimation, classicCheckBoxAnimation],
            getBoxes: classicGetBoxes,
            afterValuesChanged: [killerSolveLastInCages, classicCalculatePossibleValues],
            checkErrors: killerCheckErrors,
            iterateAllCells: classicIterateAllCells,
            getCellUnits: classicGetCellUnits,
            getAllUnits: classicGetAllUnits
        },
    },
    sudokuX: {
        render: {
            init: [],
            onResize: [classicResize],
            screenCoordsToBoardCoords: classicScreenCoordsToBoardCoords,
            before: [classicRenderBackground],
            unpaused: [classicRenderCellBackground, sudokuXRenderDiagonals, commonRenderCellValueAndCandidates, classicRenderSelection, classicRenderLinks, classicRenderFadeAnimations],
            paused: [classicRenderPaused],
            after: [classicRenderBorders],
        },
        game: {
            initGameData: sudokuXInitGameData,
            initBoardMatrix: [commonInitCacheBoard, commonInitUnitsAndVisibilityCache, commonInitColorGroupsCache],
            getVisibleCells: sudokuXGetVisibleCells,
            getBoxCellsCoordinates: classicGetBoxCellsCoordinates,
            checkAnimations: [classicCheckRowAnimation, classicCheckColumnAnimation, classicCheckBoxAnimation],
            getBoxes: classicGetBoxes,
            afterValuesChanged: [classicCalculatePossibleValues],
            checkErrors: sudokuXDetectErrors,
            iterateAllCells: classicIterateAllCells,
            getCellUnits: sudokuXGetCellUnits,
            getAllUnits: sudokuXGetAllUnits
        },
    },
    sandwich: {
        render: {
            init: [],
            onResize: [sandwichResize],
            screenCoordsToBoardCoords: classicScreenCoordsToBoardCoords,
            before: [sandwichRenderBackground],
            unpaused: [classicRenderCellBackground, commonRenderCellValueAndCandidates, classicRenderSelection, classicRenderLinks, classicRenderFadeAnimations, sandwichRenderLateralClues],
            paused: [classicRenderPaused],
            after: [sandwichRenderBorders],
        },
        game: {
            initGameData: sandwichInitGameData,
            initBoardMatrix: [commonInitCacheBoard, commonInitUnitsAndVisibilityCache, commonInitColorGroupsCache, sandwichInitClueVisibility],
            getVisibleCells: classicGetVisibleCells,
            getBoxCellsCoordinates: classicGetBoxCellsCoordinates,
            checkAnimations: [classicCheckRowAnimation, classicCheckColumnAnimation, classicCheckBoxAnimation],
            getBoxes: classicGetBoxes,
            afterValuesChanged: [classicCalculatePossibleValues],
            checkErrors: sandwichDetectErrors,
            iterateAllCells: classicIterateAllCells,
            getCellUnits: classicGetCellUnits,
            getAllUnits: classicGetAllUnits
        },
    },
    thermo: {
        render: {
            init: [],
            onResize: [],
            screenCoordsToBoardCoords: classicScreenCoordsToBoardCoords,
            before: [() => { }],
            unpaused: [],
            paused: [],
            after: [() => { }],
        },
        game: {
            initGameData: () => { },
            initBoardMatrix: [commonInitCacheBoard, commonInitUnitsAndVisibilityCache, commonInitColorGroupsCache],
            getVisibleCells: classicGetVisibleCells,
            getBoxCellsCoordinates: classicGetBoxCellsCoordinates,
            checkAnimations: [classicCheckRowAnimation, classicCheckColumnAnimation, classicCheckBoxAnimation],
            getBoxes: classicGetBoxes,
            afterValuesChanged: [classicCalculatePossibleValues, commonDetectErrorsFromSolution],
            checkErrors: () => { },
            iterateAllCells: classicIterateAllCells,
            getCellUnits: classicGetCellUnits,
            getAllUnits: () => []
        },
    },
}
