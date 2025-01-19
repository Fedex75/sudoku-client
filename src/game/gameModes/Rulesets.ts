import { commonDetectErrorsFromSolution, commonGetOrthogonalCells, commonInitCacheBoard, commonInitColorGroupsCache, commonInitUnitsAndVisibilityCache, commonRenderCellValueAndCandidates } from "./Common"
import { classicGetVisibleCells, classicGetCellUnits, classicResize, classicScreenCoordsToBoardCoords, classicRenderBackground, classicRenderCellBackground, classicRenderSelection, classicRenderLinks, classicRenderFadeAnimations, classicRenderPaused, classicRenderBorders, classicInitGameData, classicGetBoxCellsCoordinates, classicCheckRowAnimation, classicCheckColumnAnimation, classicCheckBoxAnimation, classicGetBoxes, classicCalculatePossibleValues, classicIterateAllCells, classicGetAllUnits } from "./Classic"
import { killerCalculateCageVectors, killerResize, killerRenderCagesAndCageValues, killerInitGameData, killerInitCages, killerGetVisibleCells, killerSolveLastInCages, killerCheckErrors } from "./Killer"
import { sudokuXRenderDiagonals, sudokuXInitGameData, sudokuXGetVisibleCells, sudokuXDetectErrors, sudokuXGetCellUnits, sudokuXGetAllUnits, sudokuXCheckDiagonalAnimations } from "./SudokuX"
import { sandwichDetectErrors, sandwichInitClueVisibility, sandwichInitGameData, sandwichInitLateralClues, sandwichRenderBackground, sandwichRenderBorders, sandwichRenderLateralClues, sandwichResize } from "./Sandwich"
import { Ruleset } from "../../utils/DataTypes"
import { GameModeName } from "../../utils/Difficulties"
import { thermoCalculatePossibleValues, thermoDetectErrors, thermoGetVisibleCells, thermoInitGameData, thermoInitThermometerData, thermoRenderThermometers, thermoRenderThermometersToOffscreenCanvas } from "./Thermo"

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
            getOrthogonalCells: commonGetOrthogonalCells,
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
            getOrthogonalCells: commonGetOrthogonalCells,
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
            getOrthogonalCells: commonGetOrthogonalCells,
            getVisibleCells: sudokuXGetVisibleCells,
            getBoxCellsCoordinates: classicGetBoxCellsCoordinates,
            checkAnimations: [classicCheckRowAnimation, classicCheckColumnAnimation, classicCheckBoxAnimation, sudokuXCheckDiagonalAnimations],
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
            initBoardMatrix: [commonInitCacheBoard, sandwichInitLateralClues, commonInitUnitsAndVisibilityCache, commonInitColorGroupsCache, sandwichInitClueVisibility],
            getOrthogonalCells: commonGetOrthogonalCells,
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
            init: [thermoRenderThermometersToOffscreenCanvas],
            onResize: [classicResize, thermoRenderThermometersToOffscreenCanvas],
            screenCoordsToBoardCoords: classicScreenCoordsToBoardCoords,
            before: [classicRenderBackground],
            unpaused: [classicRenderCellBackground, thermoRenderThermometers, commonRenderCellValueAndCandidates, classicRenderSelection, classicRenderLinks, classicRenderFadeAnimations],
            paused: [classicRenderPaused],
            after: [classicRenderBorders],
        },
        game: {
            initGameData: thermoInitGameData,
            initBoardMatrix: [commonInitCacheBoard, thermoInitThermometerData, commonInitUnitsAndVisibilityCache, commonInitColorGroupsCache],
            getOrthogonalCells: commonGetOrthogonalCells,
            getVisibleCells: thermoGetVisibleCells,
            getBoxCellsCoordinates: classicGetBoxCellsCoordinates,
            checkAnimations: [classicCheckRowAnimation, classicCheckColumnAnimation, classicCheckBoxAnimation],
            getBoxes: classicGetBoxes,
            afterValuesChanged: [classicCalculatePossibleValues, thermoCalculatePossibleValues],
            checkErrors: thermoDetectErrors,
            iterateAllCells: classicIterateAllCells,
            getCellUnits: classicGetCellUnits,
            getAllUnits: classicGetAllUnits
        },
    },
}
