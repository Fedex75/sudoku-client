import { Cell, CellCoordinates } from "./DataTypes"

export function indexOf(coords: CellCoordinates, within: CellCoordinates[]) {
    for (let i = 0; i < within.length; i++) {
        if (within[i].x === coords.x && within[i].y === coords.y) return i
    }
    return -1
}

export function remove<T>(reference: T, from: T[]) {
    const index = from.indexOf(reference)
    if (index > -1) from.splice(from.indexOf(reference), 1)
}

export function intersection(of: Cell[][]): Cell[] {
    if (of.length === 0) return []
    return [...of[0]].filter(cell => of.every(arr => arr.includes(cell)))
}

export function union(of: Cell[][]): Cell[] {
    const result: Cell[] = []

    for (const array of of) {
        for (const cell of array) {
            if (result.includes(cell)) result.push(cell)
        }
    }

    return result
}

export default function brightness(x: number, p: number, q: number, l: number) {
    let t = (-q - l) * p + l
    const k = 0.2
    return Math.max(0, k * (1 - Math.abs(2 / l * (x + t) - 1)))
}
