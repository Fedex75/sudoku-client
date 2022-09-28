import './actionSheet.css'
import ActionSheetReact from 'actionsheet-react'
import { ActionSheetButton } from '../'

export default function ActionSheet({reference, title = null, cancelTitle = null, onClose = () => {}, showTopbar = false, children}){
	function cancel(){
		reference.current.close()
		onClose()
	}

	return (
		<ActionSheetReact
			ref={reference}
			sheetStyle={{
				backgroundColor: "transparent",
				padding: 10,
				boxSizing: 'border-box',
				display: 'grid',
				gridTemplateColumns: 'auto',
				justifyContent: 'center'
			}}
			bgStyle={{
				backgroundColor: "rgba(1, 1, 1, 0.5)",
				inset: 0
			}}
			sheetTransition='transform 0.2s ease-in-out'
			bgTransition='opacity 0.2s ease-in-out, z-index 0.2s ease-in-out'
			onClose={onClose}
		>
			<div className='action-sheet__wrapper'>
				<div className='action-sheet__list'>
					{
						title !== null ?
						<div className='action-sheet__list__title'>
							{title}
						</div> : null
					}
					{children}
				</div>
				{cancelTitle !== null ? <ActionSheetButton cancel title={cancelTitle} onClick={cancel} /> : null}
			</div>
		</ActionSheetReact>
	)
}