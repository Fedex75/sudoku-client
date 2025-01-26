export type ThemeName = 'light' | 'dark'

export type Theme = {
    background: string
    canvasLightDefaultCellColor: string
    canvasDarkDefaultCellColor: string
    canvasCellBorderColor: string
    canvasCellBorderColorRGBA: string
    canvasBoxBorderColor: string
    canvasBoxBorderColorRGBA: string
    canvasClueColor: string
    canvasSelectedCellClueColor: string
    canvasSelectedCellCandidateColor: string
    canvasSameValueCellBackground: string
    canvasNoteHighlightColor: string
    canvasValueHighlightColor: string
    canvasAnimationBaseColor: string
    canvasAnimationDarkColor: string
    canvasAnimationFadeBaseColor: string
    canvasKillerCageColor: string
    canvasKillerHighlightedCageColor: string
}

export const themes: Record<ThemeName, Theme> = {
    light: {
        background: '#e9e9e9',
        canvasLightDefaultCellColor: 'white',
        canvasDarkDefaultCellColor: '#e2ebf3',
        canvasCellBorderColor: '#bec6d4',
        canvasCellBorderColorRGBA: '190, 198, 212',
        canvasBoxBorderColor: '#344861',
        canvasBoxBorderColorRGBA: '52, 72, 97',
        canvasClueColor: '#777',
        canvasSelectedCellClueColor: '#344861',
        canvasSelectedCellCandidateColor: '#75747c',
        canvasSameValueCellBackground: '#c3d7ea',
        canvasNoteHighlightColor: 'black',
        canvasValueHighlightColor: '#344861',
        canvasAnimationBaseColor: '0, 0, 0',
        canvasAnimationDarkColor: '255, 255, 255',
        canvasAnimationFadeBaseColor: '226, 235, 243',
        canvasKillerCageColor: '#344861',
        canvasKillerHighlightedCageColor: 'black',
    },
    dark: {
        background: 'black',
        canvasLightDefaultCellColor: '#25242c',
        //canvasDarkDefaultCellColor: '#161620',
        canvasDarkDefaultCellColor: '#0D1117',
        canvasCellBorderColor: 'black',
        canvasCellBorderColorRGBA: '0, 0, 0',
        canvasBoxBorderColor: 'black',
        canvasBoxBorderColorRGBA: '0, 0, 0',
        canvasClueColor: '#75747c',
        canvasSelectedCellClueColor: 'black',
        canvasSelectedCellCandidateColor: 'black',
        canvasSameValueCellBackground: '#0f0e12',
        canvasNoteHighlightColor: 'white',
        canvasValueHighlightColor: 'white',
        canvasAnimationBaseColor: '255, 255, 255',
        canvasAnimationDarkColor: '0, 0, 0',
        canvasAnimationFadeBaseColor: '22, 22, 32',
        canvasKillerCageColor: '#75747c',
        canvasKillerHighlightedCageColor: 'white',
    }
}
