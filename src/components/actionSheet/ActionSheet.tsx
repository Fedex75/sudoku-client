import './actionSheet.css'
import { ActionSheetButton } from '..'
import { Sheet } from 'react-modal-sheet'
import { PropsWithChildren } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons'
import { Link } from 'react-router-dom'

type Props = {
    isOpen: boolean
    title?: string | null
    cancelTitle?: string | null
    cancelColor?: string
    onClose?: () => void
    buttonsMode?: boolean
    disableDrag?: boolean
    showBackButton?: boolean
    backTitle?: string
    backURL?: string
    onBack?: () => void
}

export default function ActionSheet({ isOpen, title = null, cancelTitle = null, cancelColor = 'var(--red)', onClose = () => { }, buttonsMode = false, disableDrag = false, showBackButton = false, backTitle = '', backURL = '', onBack = () => { }, children }: PropsWithChildren<Props>) {
    return (
        <Sheet
            isOpen={isOpen}
            onClose={onClose}
            disableDrag={disableDrag}
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
                                {
                                    <div className='action-sheet__top'>
                                        {showBackButton ? <Link to={backURL}>
                                            <div className='action-sheet__top__back' onClick={onBack}>
                                                <FontAwesomeIcon icon={faChevronLeft} />
                                                {backTitle}
                                            </div>
                                        </Link> : <div></div>}

                                        {!disableDrag ? <div className='action-sheet__handle'></div> : <div></div>}

                                        <div></div>
                                    </div>
                                }
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
