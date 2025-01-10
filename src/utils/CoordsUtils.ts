import { CellCoordinates } from "./DataTypes";

export function indexOfCoordsInArray(array: CellCoordinates[], findCell: CellCoordinates){
    for (let i = 0; i < array.length; i++){
        if (array[i].x === findCell.x && array[i].y === findCell.y) return i;
    }
    return -1;
}
