import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

i18n.use(LanguageDetector).use(initReactI18next).init({
  debug: false,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  resources: {
    en: {
      translation: {
        common: {
          cancel: 'Cancel',
          delete: 'Delete',
          discard: 'Discard',
          discardGame: 'Discard current game?'
        },
        sectionNames: {
          bookmarks: 'Bookmarks',
          settings: 'Settings'
        },
        home: {
          import: 'Import',
          importPrompt: 'Enter the board:',
          incompatibleData: 'Incompatble data',
          continue: 'Continue',
        },
        bookmarks: {
          deleteAll: 'Delete all',
          promptDeleteAll: 'Delete all markers?',
          promptDeleteOne: 'Delete marker?',
          empty: 'No bookmarks'
        },
        settings: {
          sectionAppearance: 'Appearance',
          sectionGame: 'Game',
          sectionAdvanced: 'Advanced',
          sectionAbout: 'About',
          automatic: 'Automatic',
          accentColor: 'ACCENT COLOR',
          candidates: 'CANDIDATES',
          inputLock: 'INPUT LOCK',
          coloredCells: 'COLORED CELLS',
          autoSolveTitle: 'AUTO SOLVE',
          showErrors: 'Show errors',
          advancedHighlight: 'Advanced highlight',
          showOnlyPossibleValues: 'Show only possible values',
          autoRemove: 'Remove automatically',
          autoChange: 'Change automatically',
          lock: 'Lock',
          autoSolve: 'Solve automatically',
          clearColorSolved: 'Clear color when solved',
          fullNotation: 'Full notation',
          nakedSingle: 'Naked single',
          onlyInBox: 'Only in box',
          version: 'Version',
          madeWith: 'Made with',
          in: 'in'
        },
        sudoku: {
          saved: 'Bookmarked',
          removed: 'Removed',
          share: 'Share',
          newGame: 'New game',
          excellent: 'Excellent!',
          export: 'Export board',
          exortError: 'Error copying to clipboard',
          copyClues: 'Copy clues',
          copyFullBoard: 'Copy full board',
          copyMission: 'Copy mission'
        },
        gameModes: {
          classic: 'Classic',
          killer: 'Killer'
        },
        gameDifficulties: {
          easy: 'Easy',
          medium: 'Medium',
          hard: 'Hard',
          expert: 'Expert',
          evil: 'Evil',
          restart: 'Restart'
        }
      },
    },
    es: {
      translation: {
        common: {
          cancel: 'Cancelar',
          delete: 'Eliminar',
          discard: 'Descartar',
          discardGame: '¿Descartar el juego en progreso?'
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

        },
        bookmarks: {
          deleteAll: 'Eliminar todos',
          promptDeleteAll: '¿Eliminar todos los marcadores?',
          promptDeleteOne: '¿Eliminar marcador?',
          empty: 'No hay marcadores'
        },
        settings: {
          sectionAppearance: 'Apariencia',
          sectionGame: 'Juego',
          sectionAdvanced: 'Avanzado',
          sectionAbout: 'Acerca de',
          automatic: 'Automático',
          accentColor: 'COLOR DE ACENTO',
          candidates: 'CANDIDATOS',
          inputLock: 'BLOQUEO DE ENTRADA',
          coloredCells: 'CELDAS CON COLOR',
          autoSolveTitle: 'SOLUCIÓN AUTOMÁTICA',
          showErrors: 'Mostrar errores',
          advancedHighlight: 'Señalamiento avanzado',
          showOnlyPossibleValues: 'Mostrar solo valores posibles',
          autoRemove: 'Remover automáticamente',
          autoChange: 'Cambiar automatically',
          lock: 'Bloquear',
          autoSolve: 'Solución automática',
          clearColorSolved: 'Eliminar color al resolver',
          fullNotation: 'Notación completa',
          nakedSingle: 'Candidato único',
          onlyInBox: 'Único en la caja',
          version: 'Versión',
          madeWith: 'Hecho con',
          in: 'en'
        },
        sudoku: {
          saved: 'Guardado',
          removed: 'Eliminado',
          share: 'Compartir',
          newGame: 'Nuevo juego',
          excellent: '¡Excelente!',
          export: 'Exportar tablero',
          exortError: 'Error al copiar',
          copyClues: 'Copiar pistas',
          copyFullBoard: 'Copiar tablero completo',
          copyMission: 'Copiar misión'
        },
        gameModes: {
          classic: 'Clásico',
          killer: 'Killer'
        },
        gameDifficulties: {
          easy: 'Fácil',
          medium: 'Intermedio',
          hard: 'Difícil',
          expert: 'Experto',
          evil: 'Malvado',
          restart: 'Reiniciar'
        }
      }
    }
  }
})

export default i18n