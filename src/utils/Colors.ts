export const colorNames = ['default', 'red', 'orange', 'yellow', 'green', 'blueGreen', 'lightBlue', 'darkBlue', 'purple'] as const
export const colorNamesShortened = ['d', 'r', 'o', 'y', 'g', 'b', 'l', 'd', 'p']
export type AccentColor = 'red' | 'orange' | 'yellow' | 'green' | 'blueGreen' | 'lightBlue' | 'darkBlue' | 'purple'

export type ColorName = typeof colorNames[number]

export const ColorDefinitions: Record<ColorName, string> = {
    default: 'var(--canvasLightDefaultCellColor)',
    red: '#fc5c65',
    orange: '#fd9644',
    yellow: '#fed330',
    green: '#26de81',
    blueGreen: '#2bcbba',
    lightBlue: '#45aaf2',
    darkBlue: '#2e69f2',
    purple: '#a55eea'
}
