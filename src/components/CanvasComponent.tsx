import { useEffect, useRef } from "react"
import { Canvas } from '../utils/Canvas'
import Board from '../utils/Board'

type Props = {
	canvasHandler: Canvas<Board>
	paused: boolean
	wrapperClass?: string
	onWrapperClick?: () => void
}

export default function CanvasComponent({ canvasHandler, paused, wrapperClass = 'sudoku-canvas-wrapper', onWrapperClick = () => { } }: Props) {
	const canvasRef = useRef<HTMLCanvasElement>(null)

	useEffect(() => {
		if (canvasRef.current) {
			canvasHandler.createOffscreenCanvases()
			canvasHandler.resizeCanvas()

			const resizeObserver = new ResizeObserver((entries) => {
				for (let i = 0; i < entries.length; i++) {
					canvasHandler.resizeCanvas()
				}
			})

			resizeObserver.observe(canvasRef.current)

			return () => {
				canvasHandler.canvasRef = null
				canvasHandler.destroyOffscreenCanvases()
				resizeObserver.disconnect()
			}
		}
	}, [canvasHandler])

	useEffect(() => {
		if (canvasRef.current) canvasHandler.canvasRef = canvasRef.current
	}, [canvasHandler])

	return <div className={wrapperClass} onClick={onWrapperClick}>
		<canvas
			ref={canvasRef}
			className='sudoku-canvas'
			style={{ touchAction: (canvasHandler.notPlayable || paused) ? 'auto' : 'none', boxSizing: 'border-box' }}
			onTouchStart={canvasHandler.onTouchStart}
			onTouchMove={canvasHandler.onTouchMove}
			onContextMenu={canvasHandler.onContextMenu}
			onMouseDown={canvasHandler.onMouseDown}
			onMouseMove={canvasHandler.onMouseMove}
			onMouseUp={canvasHandler.onMouseUp}
		/>
	</div>
}
