import './actionSheet.css'
import { ActionSheetButton } from '..'
import { Sheet } from 'react-modal-sheet'
import { PropsWithChildren } from 'react'

type Props = {
	isOpen: boolean
	title?: string | null
	cancelTitle?: string | null
	cancelColor?: string
	onClose?: () => void
	buttonsMode?: boolean
}

export default function ActionSheet({ isOpen, title = null, cancelTitle = null, cancelColor = 'var(--red)', onClose = () => { }, buttonsMode = false, children }: PropsWithChildren<Props>) {
	return (
		<Sheet
			isOpen={isOpen}
			onClose={onClose}
			dragVelocityThreshold={100}
			dragCloseThreshold={0.1}
			detent='content-height'
			mountPoint={document.getElementById('app')!}
		>
			<Sheet.Container style={{ backgroundColor: 'transparent', boxShadow: 'none' }}>
				<Sheet.Content className={`action-sheet__wrapper ${cancelTitle ? 'cancel' : ''} ${buttonsMode ? 'buttonsMode' : ''}`}>
					{
						buttonsMode ?
							<div className='action-sheet__list'>
								{
									title !== null ?
										<div className='action-sheet__list__title'>
											{title}
										</div> : null
								}
								{children}
							</div> :
							<div className='action-sheet__content'>
								<div className='action-sheet__handle'></div>
								{children}
							</div>
					}
					{cancelTitle !== null ? <ActionSheetButton cancel title={cancelTitle} onClick={() => { onClose() }} color={cancelColor} /> : null}
				</Sheet.Content>
			</Sheet.Container>
			<Sheet.Backdrop onTap={() => { onClose() }} />
		</Sheet>
	)
}
