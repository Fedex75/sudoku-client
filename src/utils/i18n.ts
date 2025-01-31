import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

export function initI18n() {
    i18n.use(LanguageDetector).use(initReactI18next).init({
        debug: false,
        fallbackLng: 'en',
        interpolation: { escapeValue: false },
        supportedLngs: ['en', 'es'],
        resources: {
            en: {
                translation: {
                    common: {
                        cancel: 'Cancel',
                        delete: 'Delete',
                        discard: 'Discard',
                        discardGame: 'Discard current game?',
                        save: 'Save',
                        share: 'Share',
                        newVersionAvailable: "There's a new version available",
                        lightTheme: 'Light',
                        darkTheme: 'Dark',
                        reset: 'Reset'
                    },
                    sectionNames: {
                        play: 'New game',
                        bookmarks: 'Bookmarks',
                        statistics: 'Statistics',
                        settings: 'Settings',
                    },
                    home: {
                        import: 'Import',
                        importPrompt: 'Enter the board:',
                        incompatibleData: 'Incompatible data',
                        continue: 'Continue',
                    },
                    bookmarks: {
                        deleteAll: 'Delete all',
                        promptDeleteAll: 'Delete all markers?',
                        promptDeleteOne: 'Delete marker?',
                        empty: 'No bookmarks'
                    },
                    statistics: {
                        promptReset: 'Reset statistics?'
                    },
                    settings: {
                        sectionAppearance: 'Appearance',
                        sectionAnnotations: 'Annotations',
                        sectionColor: 'Color',
                        sectionErrors: 'Errors',
                        sectionAdvanced: 'Advanced',
                        sectionGeneral: 'General',
                        sectionLanguage: 'Language',
                        sectionAbout: 'About Sudoku',
                        automatic: 'Automatic',
                        accentColor: 'ACCENT COLOR',
                        highContrast: 'HIGH CONTRAST',
                        candidates: 'CANDIDATES',
                        grid: 'Grid',
                        coloredCells: 'COLORED CELLS',
                        autoSolveTitle: 'AUTO SOLVE',
                        showErrors: 'Show errors',
                        showLogicErrors: 'Logic errors',
                        showSolutionErrors: 'Solution errors',
                        killerShowCageErrors: 'Killer cage errors',
                        sudokuXShowDiagonals: 'Show Sudoku X diagonals',
                        sudokuXShowDiagonalErrors: 'Diagonal errors',
                        sandwichShowSumErrors: 'Sandwich sum errors',
                        sandwichHideSolvedClues: 'Hide solved Sandwich sums',
                        thermoShowThermometerErrors: 'Thermometer errors',
                        advancedHighlight: 'Advanced highlight',
                        advancedHighlightExplanation: 'Sudoku will highlight all cells where a candidate cannot be placed.',
                        showOnlyPossibleValues: 'Show only possible values',
                        showOnlyPossibleValuesExplanation: 'Sudoku will only highlight the buttons of the candidates that can be placed on the selected cell.',
                        killer: 'KILLER',
                        killerAutoSolveLastInCage: 'Killer cages',
                        sandwichAutoSolveLastInSum: 'Sandwich',
                        autoRemove: 'Auto remove',
                        inputLock: 'Input lock',
                        autoChangeInputLockExplanation: 'Select a number from the numpad and tap any cell to insert it as a note or value.',
                        lockColoredCells: 'Lock',
                        lockColoredCellsExplanation: "Sudoku won't let you add more condidates to a colored cell.",
                        autoSolve: 'Solve automatically',
                        autoSolveColoredCellsExplanation: 'Sudoku will automatically solve colored cells with a single candidate left.',
                        clearColorFullNotation: 'Clear color on full notation',
                        clearColorSolved: 'Clear color when solved',
                        fullNotation: 'FULL NOTATION',
                        fullNotationExplanation: 'Sudoku will detect when the notation is full and automatically solve single candidate cells.',
                        statistics: 'STATISTICS',
                        resetStatistics: 'Reset statistics',
                        nakedSingle: 'Single possible value',
                        onlyInBox: 'Single in unit',
                        version: 'Version',
                        madeWith: 'Made with',
                        inArgentina: 'in Argentina',
                        language: 'LANGUAGE',
                        languageAuto: 'Automatic',
                        languageEnglish: 'English',
                        languageSpanish: 'Spanish',
                        update: 'Update',
                        build: 'Build',
                        missionsTitle: 'MISSIONS',
                        errorsOn: 'On',
                        errorsOff: 'Off',
                        numpad: 'NUMPAD',
                        highContrastCandidates: 'Candidates',
                    },
                    sudoku: {
                        saved: 'Bookmarked',
                        removed: 'Removed',
                        share: 'Share',
                        newGame: 'New game',
                        increaseDifficulty: 'Increase difficulty to',
                        excellent: 'Excellent!',
                        time: 'Time',
                        average: 'Average',
                        best: 'Best',
                        export: 'Export board',
                        exortError: 'Error copying to clipboard',
                        copyClues: 'Copy clues',
                        copyFullBoard: 'Copy full board',
                        copyMission: 'Copy mission',
                        howToPlay: 'Tutorial',
                        timerFullNotation: 'Full notation'
                    },
                    gameModes: {
                        classic: 'Classic',
                        killer: 'Killer',
                        sandwich: 'Sandwich',
                        sudokuX: 'Sudoku X',
                        thermo: 'Thermo'
                    },
                    gameDifficulties: {
                        easy: 'Easy',
                        medium: 'Medium',
                        hard: 'Hard',
                        expert: 'Expert',
                        evil: 'Evil',
                        restart: 'Restart',
                        unrated: 'Unrated'
                    },
                    tutorial: {
                        classic: {
                            rows: "Numbers can't be repeated in a row.",
                            columns: "Numbers can't be repeated in a column.",
                            boxes: "Numbers can't be repeated in a 3x3 box.",
                            solve: 'To win, you must fill the entire grid with the numbers 1 through 9.'
                        },
                        killer: {
                            cages: "The board has cages, indicated with dashed lines.\nNumbers can't be repeated inside a cage.",
                            cageSum: 'Numbers inside a cage must add up to the value of the cage.\n6 + 3 + 2 = 11.',
                        },
                        sudokux: {
                            diagonals: "Numbers can't be repeated in the two shown diagonals."
                        },
                        sandwich: {
                            sum: "In every row and column, the numbers between 1 and 9 must add up to the indicated number.\n2 + 6 + 8 = 16."
                        },
                        thermo: {
                            thermometers1: "The board has thermometers, drawn as connected sequences of cells, with a bulb (start) and a tip (end).",
                            thermometers2: "The numbers inside a thermometer must strictly increase from the bulb to the tip.\nThey do not need to be consecutive.",
                        },
                        tutorial: 'Tutorial',
                        exit: 'Quit tutorial'
                    }
                },
            },
            es: {
                translation: {
                    common: {
                        cancel: 'Cancelar',
                        delete: 'Eliminar',
                        discard: 'Descartar',
                        discardGame: '¿Descartar el juego en progreso?',
                        save: 'Guardar',
                        share: 'Compartir',
                        newVersionAvailable: 'Hay una nueva versión disponible',
                        lightTheme: 'Claro',
                        darkTheme: 'Oscuro',
                        reset: 'Reiniciar'
                    },
                    sectionNames: {
                        bookmarks: 'Marcadores',
                        settings: 'Opciones'
                    },
                    home: {
                        import: 'Importar',
                        importPrompt: 'Ingrese el tablero:',
                        incompatibleData: 'Datos incompatibles',
                        continue: 'Continuar',
                        play: 'Nuevo juego',
                        bookmarks: 'Marcadores',
                        statistics: 'Estadísticas'
                    },
                    bookmarks: {
                        deleteAll: 'Eliminar todos',
                        promptDeleteAll: '¿Eliminar todos los marcadores?',
                        promptDeleteOne: '¿Eliminar marcador?',
                        empty: 'No hay marcadores'
                    },
                    statistics: {
                        promptReset: '¿Reiniciar estadísticas?'
                    },
                    settings: {
                        sectionAppearance: 'Apariencia',
                        sectionAnnotations: 'Anotaciones',
                        sectionColor: 'Color',
                        sectionErrors: 'Errores',
                        sectionAdvanced: 'Avanzado',
                        sectionGeneral: 'General',
                        sectionLanguage: 'Idioma',
                        sectionAbout: 'Acerca de Sudoku',
                        automatic: 'Automático',
                        accentColor: 'COLOR DE ACENTO',
                        highContrast: 'ALTO CONTRASTE',
                        candidates: 'CANDIDATOS',
                        grid: 'Grilla',
                        coloredCells: 'CELDAS CON COLOR',
                        autoSolveTitle: 'SOLUCIÓN AUTOMÁTICA',
                        showErrors: 'Mostrar errores',
                        showLogicErrors: 'Errores lógicos',
                        showSolutionErrors: 'Errores de resolución',
                        killerShowCageErrors: 'Errores de jaula Killer',
                        sudokuXShowDiagonals: 'Mostrar diagonales en SudokuX',
                        sudokuXShowDiagonalErrors: 'Errores en diagonal',
                        sandwichShowSumErrors: 'Errores de suma Sandwich',
                        sandwichHideSolvedClues: 'Ocultar sumas Sandwich resueltas',
                        thermoShowThermometerErrors: 'Errores de termómetro',
                        advancedHighlight: 'Señalamiento avanzado',
                        advancedHighlightExplanation: 'Sudoku señalará todas las celdas donde un candidato no puede ser ubicado.',
                        showOnlyPossibleValues: 'Mostrar solo valores posibles',
                        showOnlyPossibleValuesExplanation: 'Sudoku solo señalará los botones de los candidatos que pueden ir en la celda seleccionada.',
                        killer: 'KILLER',
                        killerAutoSolveLastInCage: 'Jaulas Killer',
                        sandwichAutoSolveLastInSum: 'Suma Sandwich',
                        autoRemove: 'Remover automáticamente',
                        inputLock: 'Bloqueo de entrada',
                        autoChangeInputLockExplanation: 'Seleccione un número del teclado y toque una celda para insertarlo como nota o valor.',
                        lockColoredCells: 'Bloquear',
                        lockColoredCellsExplanation: 'Sudoku no le permitirá agregar más candidatos a una celda con color.',
                        autoSolve: 'Solución automática',
                        autoSolveColoredCellsExplanation: 'Sudoku automáticamente resolverá celdas con color que solo tengan un candidato.',
                        clearColorSolved: 'Eliminar color al resolver',
                        clearColorFullNotation: 'Eliminar color al completar notación',
                        fullNotation: 'NOTACIÓN COMPLETA',
                        fullNotationExplanation: 'Sudoku detectará cuando la notación esté completa y automáticamente resolverá celdas con un único candidato.',
                        statistics: 'ESTADÍSTICAS',
                        resetStatistics: 'Reiniciar estadísticas',
                        nakedSingle: 'Único valor posible',
                        onlyInBox: 'Único candidato en la unidad',
                        version: 'Versión',
                        madeWith: 'Hecho con',
                        inArgentina: 'en Argentina',
                        language: 'IDIOMA',
                        languageAuto: 'Automático',
                        languageEnglish: 'Inglés',
                        languageSpanish: 'Español',
                        update: 'Actualizar',
                        build: 'Compilación',
                        missionsTitle: 'MISIONES',
                        errorsOn: 'Activado',
                        errorsOff: 'Desactivado',
                        numpad: 'TECLADO',
                        highContrastCandidates: 'Candidatos',
                    },
                    sudoku: {
                        saved: 'Guardado',
                        removed: 'Eliminado',
                        share: 'Compartir',
                        newGame: 'Nuevo juego',
                        increaseDifficulty: 'Aumentar dificultad a ',
                        excellent: '¡Excelente!',
                        time: 'Tiempo',
                        average: 'Promedio',
                        best: 'Mejor',
                        export: 'Exportar tablero',
                        exortError: 'Error al copiar',
                        copyClues: 'Copiar pistas',
                        copyFullBoard: 'Copiar tablero completo',
                        copyMission: 'Copiar misión',
                        howToPlay: 'Tutorial',
                        timerFullNotation: 'Notación completa'
                    },
                    gameModes: {
                        classic: 'Clásico',
                        killer: 'Killer',
                        sandwich: 'Sandwich',
                        sudokuX: 'Sudoku X',
                        thermo: 'Termo'
                    },
                    gameDifficulties: {
                        easy: 'Fácil',
                        medium: 'Intermedio',
                        hard: 'Difícil',
                        expert: 'Experto',
                        evil: 'Malvado',
                        restart: 'Reiniciar',
                        unrated: 'Sin clasificar'
                    },
                    tutorial: {
                        classic: {
                            rows: "Los números no pueden repetirse en una fila.",
                            columns: "Los números no pueden repetirse en una columna.",
                            boxes: "Los números no pueden repetirse en una caja de 3x3.",
                            solve: 'Para ganar, deberá llenar todo el tablero con los números del 1 al 9.'
                        },
                        killer: {
                            cages: "El tablero tiene jaulas, señaladas con líneas discontinuas.\nLos números no pueden repetirse dentro de una jaula.",
                            cageSum: 'La suma de los números dentro de una jaula debe ser igual al valor de esa jaula.\n6 + 3 + 2 = 11.',
                        },
                        sudokux: {
                            diagonals: "Los números no pueden repetirse en las dos diagonales señaladas."
                        },
                        sandwich: {
                            sum: "En cada fila y columna, los números entre el 1 y el 9 deben sumar la cantidad indicada.\n2 + 6 + 8 = 16."
                        },
                        thermo: {
                            thermometers1: "El tablero tiene termómetros, dibujados como secuencias de celdas conectadas, con un bulbo (inicio) y una punta (final).",
                            thermometers2: "Los números dentro de un termómetro deben aumentar estrictamente desde el bulbo hacia la punta.\nNo hace falta que sean consecutivos.",
                        },
                        tutorial: 'Tutorial',
                        exit: 'Salir del tutorial'
                    }
                }
            }
        }
    })
}
