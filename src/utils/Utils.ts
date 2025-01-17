import { CellCoordinates } from "./DataTypes"

export function indexOfCoordsInArray(array: CellCoordinates[], cellToFind: CellCoordinates) {
    for (let i = 0; i < array.length; i++) {
        if (array[i].x === cellToFind.x && array[i].y === cellToFind.y) return i
    }
    return -1
}

export function removeByReference<T>(array: T[], element: T) {
    const index = array.indexOf(element)
    if (index > -1) array.splice(array.indexOf(element), 1)
}
