import './bookmarks.css'
import { faBookmark, faCheck, faTrash } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useCallback, useState } from "react"
import { getMode, GameModeIdentifier } from "../../../utils/Difficulties"
import GameHandler from "../../../utils/GameHandler"
import { useTranslation } from 'react-i18next'
import { Bookmark } from '../../../utils/DataTypes'
import Canvas from '../../../components/CanvasComponent'
import { BoardFactory } from '../../../game/gameModes/BoardFactory'
import { CanvasFactory } from '../../../game/gameModes/CanvasFactory'
import Board from '../../../utils/Board'
import useAccentColor from '../../../utils/hooks/useAccentColor'
import useTheme from '../../../utils/hooks/useTheme'

type Props = {
    requestContinue: () => void
    requestNewGame: (newGame: Board) => void
    requestPrompt: (prompt: string, onConfirm: () => void, onCancel: () => void) => void
}

function Bookmarks({ requestContinue, requestNewGame, requestPrompt }: Props) {
    const [theme] = useTheme()
    const [accentColor] = useAccentColor()
    const [bookmarks, setBookmarks] = useState(GameHandler.bookmarks)

    const { t } = useTranslation()

    const handleRemoveBookmark = useCallback((bm: Bookmark) => {
        requestPrompt(
            t('bookmarks.promptDeleteOne'),
            () => {
                GameHandler.removeBookmark(bm)
                setBookmarks(GameHandler.bookmarks)
            },
            () => { }
        )
    }, [t, requestPrompt])

    const handleClearBookmarksClick = useCallback(() => {
        requestPrompt(
            t('bookmarks.promptDeleteAll'),
            () => {
                GameHandler.clearBookmarks()
                setBookmarks([])
            },
            () => { }
        )
    }, [t, requestPrompt])

    const handlePlayBookmark = useCallback((bm: Bookmark) => {
        if (GameHandler.game && !GameHandler.game.complete && GameHandler.game.id === bm.id) {
            requestContinue()
        } else {
            const newGame = GameHandler.createNewGameFromBookmark(bm)
            if (newGame) requestNewGame(newGame)
        }
    }, [requestContinue, requestNewGame])

    return (
        <div className='home__bookmarks'>
            <div className='home__section__title-wrapper'>
                <p className='home__section-title'>{t('sectionNames.bookmarks')}</p>
                {bookmarks.length > 0 ? <FontAwesomeIcon icon={faTrash} color='var(--red)' onClick={handleClearBookmarksClick} fontSize={20} /> : null}
            </div>
            {
                bookmarks.length > 0 ?
                    <div className="bookmarks__wrapper">
                        {
                            bookmarks.map((bm, i) => {
                                let board
                                let solved

                                const mode = getMode(bm.id[0] as GameModeIdentifier)
                                const mission = GameHandler.findMissionFromID(bm.id)
                                if (!mission) return null
                                board = BoardFactory(mode, {
                                    id: bm.id,
                                    mission: mission.m
                                })
                                solved = GameHandler.solved.includes(bm.id)


                                const canvasHandlerRef = CanvasFactory(mode, accentColor, true, 0.01)
                                canvasHandlerRef.game = board
                                canvasHandlerRef.theme = theme

                                return (
                                    <div key={i} className="bookmarks__item">
                                        <div className="bookmarks_item__top">
                                            <p className="bookmarks__item__top__title">{`${t(`gameModes.${board.mode}`)} - ${t(`gameDifficulties.${board.difficulty}`)}`}</p>
                                            {solved ? <FontAwesomeIcon style={{ color: 'var(--green)' }} icon={faCheck} /> : null}
                                            <FontAwesomeIcon className="bookmark-on" icon={faBookmark} onClick={() => { handleRemoveBookmark(bm) }} />
                                        </div>
                                        <div className="bookmarks__item__canvas-wrapper" onClick={() => { handlePlayBookmark(bm) }}>
                                            <Canvas canvasHandler={canvasHandlerRef} paused={false} />
                                        </div>
                                    </div>
                                )
                            })
                        }
                    </div> :
                    <div className="bookmarks__empty">
                        <FontAwesomeIcon icon={faBookmark} style={{ fontSize: 70, marginBottom: 10 }} />
                        <p style={{ fontSize: 20 }}>{t('bookmarks.empty')}</p>
                    </div>
            }
        </div>
    )
}

export default Bookmarks
