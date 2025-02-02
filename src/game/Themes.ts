export type ThemeName = 'light' | 'dark'

export type Theme = {
    background: string
    lightDefaultCellColor: string
    darkDefaultCellColor: string
    cellBorderColor: string
    cellBorderColorRGBA: string
    boxBorderColor: string
    boxBorderColorRGBA: string
    clueColor: string
    noteColor: string
    selectedCellClueColor: string
    selectedCellCandidateColor: string
    sameValueCellBackground: string
    noteHighlightColor: string
    valueHighlightColor: string
    animationBaseColor: string
    animationDarkColor: string
    animationFadeBaseColor: string
    killerCageColor: string
    killerHighlightedCageColor: string
    killerCageOnColoredCellColor: string
    sudokuXDiagonalColor: string
    thermometerColor: string
    highlightedThermometerColor: string
}

export const themes: Record<ThemeName, Theme> = {
    light: {
        background: '#e9e9e9',
        lightDefaultCellColor: 'white',
        darkDefaultCellColor: '#e2ebf3',
        cellBorderColor: '#bec6d4',
        cellBorderColorRGBA: '190, 198, 212',
        boxBorderColor: '#344861',
        boxBorderColorRGBA: '52, 72, 97',
        clueColor: '#777',
        noteColor: '#75747c',
        selectedCellClueColor: '#344861',
        selectedCellCandidateColor: '#75747c',
        sameValueCellBackground: '#c3d7ea',
        noteHighlightColor: 'black',
        valueHighlightColor: '#344861',
        animationBaseColor: '0, 0, 0',
        animationDarkColor: '255, 255, 255',
        animationFadeBaseColor: '226, 235, 243',
        killerCageColor: '#344861',
        killerHighlightedCageColor: 'black',
        killerCageOnColoredCellColor: 'white',
        sudokuXDiagonalColor: '#dddddd',
        thermometerColor: '#aaa',
        highlightedThermometerColor: '#888',
    },
    dark: {
        background: 'black',
        lightDefaultCellColor: '#25242c',
        darkDefaultCellColor: '#0D1117',
        cellBorderColor: 'black',
        cellBorderColorRGBA: '0, 0, 0',
        boxBorderColor: 'black',
        boxBorderColorRGBA: '0, 0, 0',
        clueColor: '#75747c',
        noteColor: '#75747c',
        selectedCellClueColor: 'black',
        selectedCellCandidateColor: 'black',
        sameValueCellBackground: '#0f0e12',
        noteHighlightColor: 'white',
        valueHighlightColor: 'white',
        animationBaseColor: '255, 255, 255',
        animationDarkColor: '0, 0, 0',
        animationFadeBaseColor: '13, 17, 23',
        killerCageColor: '#75747c',
        killerHighlightedCageColor: 'white',
        killerCageOnColoredCellColor: 'black',
        sudokuXDiagonalColor: '#333333',
        thermometerColor: '#555',
        highlightedThermometerColor: '#777',
    }
}
