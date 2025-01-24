import { ClassicBoard } from '../classic/ClassicBoard'

export class ThermoBoard extends ClassicBoard {
    setMode(): void {
        this._mode = 'thermo'
    }
}
