import { Canvas } from '../../../utils/Canvas'
import { ClassicBoard } from './ClassicBoard'

export class ClassicCanvas extends Canvas<ClassicBoard> {
    protected renderActiveGame(): void {
        this.renderCellBackground()
        this.renderCellValueAndCandidates()
        this.renderSelection()
        this.renderLinks()
        this.renderFadeAnimations()
    }
}
