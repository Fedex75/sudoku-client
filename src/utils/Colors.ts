export const colorNames = ['red', 'orange', 'yellow', 'green', 'blueGreen', 'lightBlue', 'darkBlue', 'purple'] as const
export const colorNamesShortened = ['r', 'o', 'y', 'g', 'b', 'l', 'd', 'p']
export type AccentColor = 'red' | 'orange' | 'yellow' | 'green' | 'blueGreen' | 'lightBlue' | 'darkBlue' | 'purple'

export type ColorName = typeof colorNames[number]

export const Colors: Record<ColorName, string> = {
    red: '#fc5c65',
    orange: '#fd9644',
    yellow: '#fed330',
    green: '#26de81',
    blueGreen: '#2bcbba',
    lightBlue: '#45aaf2',
    darkBlue: '#2e69f2',
    purple: '#a55eea'
}

export const DarkColors = {
    red: '#99393d',
    orange: '#995c29',
    yellow: '#997e1d',
    green: '#1a995a',
    blueGreen: '#1d877d',
    lightBlue: '#2c6c99',
    darkBlue: '#315099',
    purple: '#6b3d99'
}

export const SolutionColors: Record<AccentColor, string> = {
    red: '#fc7e84',
    orange: '#fcb77e',
    yellow: '#ffe173',
    green: '#6fdea7',
    blueGreen: '#66ccc2',
    lightBlue: '#79c0f2',
    darkBlue: '#6f90c3',
    purple: '#c298eb'
}

type AdditionalColorsItem = {
    errorColor: ColorName
    spareErrorColor: ColorName // Used when a cell has the same color as the main error color
    linksColor: ColorName
    spareLinksColor: ColorName // Used when a cell has the same color as the main link color
}

export const AdditionalColors: Record<AccentColor, AdditionalColorsItem> = {
    red: {
        errorColor: 'yellow',
        spareErrorColor: 'purple',
        linksColor: 'purple',
        spareLinksColor: 'yellow'
    },
    orange: {
        errorColor: 'red',
        spareErrorColor: 'yellow',
        linksColor: 'red',
        spareLinksColor: 'yellow'
    },
    yellow: {
        errorColor: 'red',
        spareErrorColor: 'purple',
        linksColor: 'red',
        spareLinksColor: 'purple'
    },
    green: {
        errorColor: 'red',
        spareErrorColor: 'yellow',
        linksColor: 'red',
        spareLinksColor: 'purple'
    },
    blueGreen: {
        errorColor: 'red',
        spareErrorColor: 'yellow',
        linksColor: 'red',
        spareLinksColor: 'purple'
    },
    lightBlue: {
        errorColor: 'red',
        spareErrorColor: 'yellow',
        linksColor: 'red',
        spareLinksColor: 'purple'
    },
    darkBlue: {
        errorColor: 'red',
        spareErrorColor: 'yellow',
        linksColor: 'red',
        spareLinksColor: 'purple'
    },
    purple: {
        errorColor: 'red',
        spareErrorColor: 'yellow',
        linksColor: 'green',
        spareLinksColor: 'lightBlue'
    }
}
