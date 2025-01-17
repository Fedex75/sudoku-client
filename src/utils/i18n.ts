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
            bookmarks: 'Bookmarks',
            settings: 'Settings'
          },
          home: {
            import: 'Import',
            importPrompt: 'Enter the board:',
            incompatibleData: 'Incompatible data',
            continue: 'Continue',
            play: 'Play',
            bookmarks: 'Bookmarks',
            statistics: 'Statistics'
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
            sectionGame: 'Game',
            sectionAdvanced: 'Advanced',
            sectionLanguage: 'Language',
            sectionAbout: 'About Sudoku',
            automatic: 'Automatic',
            accentColor: 'ACCENT COLOR',
            highContrast: 'HIGH CONTRAST',
            candidates: 'Candidates',
            grid: 'Grid',
            inputLock: 'INPUT LOCK',
            coloredCells: 'COLORED CELLS',
            autoSolveTitle: 'AUTO SOLVE',
            showErrors: 'Show errors',
            advancedHighlight: 'Advanced highlight',
            advancedHighlightExplanation: 'Sudoku will highlight all cells where a candidate cannot be placed',
            showOnlyPossibleValues: 'Show only possible values',
            showOnlyPossibleValuesExplanation: 'Sudoku will only highlight the buttons of the candidates that can be placed on the selected cell',
            killer: 'KILLER',
            killerAutoSolveLastInCage: 'Auto solve cages',
            killerAutoSolveLastInCageExplanation: 'Sudoku will automatically solve the last empty cell in a cage',
            autoRemove: 'Auto remove',
            autoChangeInputLock: 'Change automatically',
            autoChangeInputLockExplanation: 'The locked number will change to the value of the selected cell',
            lockColoredCells: 'Lock',
            lockColoredCellsExplanation: "Sudoku won't let you add more condidates to a colored cell",
            autoSolve: 'Solve automatically',
            autoSolveColoredCellsExplanation: 'Sudoku will automatically solve colored cells with a single candidate left',
            clearColorFullNotation: 'Clear color on full notation',
            clearColorSolved: 'Clear color when solved',
            fullNotation: 'Full notation',
            fullNotationExplanation: 'Sudoku will detect when the notation is full and automatically solve single candidate cells',
            statistics: 'STATISTICS',
            resetStatistics: 'Reset statistics',
            nakedSingle: 'Naked single',
            onlyInBox: 'Single in unit',
            version: 'Version',
            madeWith: 'Made with',
            inArgentina: 'in Argentina',
            language: 'LANGUAGE',
            languageAuto: 'Automatic',
            languageEnglish: 'English',
            languageSpanish: 'Spanish'
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
            rules: 'Rules'
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
            play: 'Jugar',
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
            sectionGame: 'Juego',
            sectionAdvanced: 'Avanzado',
            sectionLanguage: 'Idioma',
            sectionAbout: 'Acerca de Sudoku',
            automatic: 'Automático',
            accentColor: 'COLOR DE ACENTO',
            highContrast: 'ALTO CONTRASTE',
            candidates: 'Candidatos',
            grid: 'Grilla',
            inputLock: 'BLOQUEO DE ENTRADA',
            coloredCells: 'CELDAS CON COLOR',
            autoSolveTitle: 'SOLUCIÓN AUTOMÁTICA',
            showErrors: 'Mostrar errores',
            advancedHighlight: 'Señalamiento avanzado',
            advancedHighlightExplanation: 'Sudoku señalará todas las celdas donde un candidato no puede ser ubicado',
            showOnlyPossibleValues: 'Mostrar solo valores posibles',
            showOnlyPossibleValuesExplanation: 'Sudoku solo señalará los botones de los candidatos que pueden ir en la celda seleccionada',
            killer: 'KILLER',
            killerAutoSolveLastInCage: 'Resolver jaulas automáticamente',
            killerAutoSolveLastInCageExplanation: 'Sudoku resolverá automáticamente la última celda vacía de cada jaula',
            autoRemove: 'Remover automáticamente',
            autoChangeInputLock: 'Cambiar automáticamente',
            autoChangeInputLockExplanation: 'El número bloqueado cambiará al valor de la celda seleccionada',
            lockColoredCells: 'Bloquear',
            lockColoredCellsExplanation: 'Sudoku no le permitirá agregar más candidatos a una celda con color',
            autoSolve: 'Solución automática',
            autoSolveColoredCellsExplanation: 'Sudoku automáticamente resolverá celdas con color que solo tengan un candidato',
            clearColorSolved: 'Eliminar color al resolver',
            clearColorFullNotation: 'Eliminar color al completar notación',
            fullNotation: 'Notación completa',
            fullNotationExplanation: 'Sudoku detectará cuando la notación esté completa y automáticamente resolverá celdas con un único candidato',
            statistics: 'ESTADÍSTICAS',
            resetStatistics: 'Reiniciar estadísticas',
            nakedSingle: 'Candidato único',
            onlyInBox: 'Único candidato en la unidad',
            version: 'Versión',
            madeWith: 'Hecho con',
            inArgentina: 'en Argentina',
            language: 'IDIOMA',
            languageAuto: 'Automático',
            languageEnglish: 'Inglés',
            languageSpanish: 'Español'
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
            rules: 'Reglas'
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
          }
        }
      }
    }
  })
}
