import './actionSheet.css'
import { ActionSheetButton } from '..'
import {Sheet} from 'react-modal-sheet'
import { PropsWithChildren } from 'react'

type Props = {
	isOpen: boolean;
	title?: string | null;
	cancelTitle?: string | null;
	cancelColor?: string;
	onClose?: () => void;
	buttonsMode?: boolean;
}

export default function ActionSheet({isOpen, title = null, cancelTitle = null, cancelColor = 'var(--red)', onClose = () => {}, buttonsMode = false, children}: PropsWithChildren<Props>){
	return (
		<Sheet
			isOpen={isOpen}
			onClose={onClose}
			dragVelocityThreshold={100}
			dragCloseThreshold={0.1}
			detent='content-height'
			mountPoint={document.getElementById('app')!}
		>
			<Sheet.Container style={{backgroundColor: 'transparent'}}>
				{ !buttonsMode ? <Sheet.Header  /> : null }
				<Sheet.Content className={`action-sheet__wrapper ${cancelTitle ? 'cancel' : ''}`} style={{height: 'fit-content !important', paddingBottom: buttonsMode ? '20px' : 0}}>
					<div className='action-sheet__list'>
						{
							title !== null ?
							<div className='action-sheet__list__title'>
								{title}
							</div> : null
						}
						{children}
					</div>
					{cancelTitle !== null ? <ActionSheetButton cancel title={cancelTitle} onClick={() => {onClose()}} color={cancelColor} /> : null}
				</Sheet.Content>
			</Sheet.Container>
			<Sheet.Backdrop onTap={() => {onClose()}} />
		</Sheet>
	)

	/*return (
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
			touchEnable
			closeOnBgTap
		>
			<div className={`action-sheet__wrapper ${cancelTitle ? 'cancel' : ''}`}>
				<div className='action-sheet__list'>
					{showHandle ? <div className='action-sheet__list__handle'></div> : null}
					{
						title !== null ?
						<div className='action-sheet__list__title'>
							{title}
						</div> : null
					}
					{children}
				</div>
				{cancelTitle !== null ? <ActionSheetButton cancel title={cancelTitle} onClick={cancel} color={cancelColor} /> : null}
			</div>
		</ActionSheetReact>
	)*/
}
