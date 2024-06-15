import './home.css'
import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from "react-router-dom"
import { Canvas, Section, SectionContent, Topbar, ActionSheet, ActionSheetButton, ExpandCard } from "../../components"
import Board from "../../utils/Board"
import GameHandler from "../../utils/GameHandler"
import API from '../../utils/API'
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronRight, faGear } from '@fortawesome/free-solid-svg-icons'

function Home({ theme, accentColor }) {
	const [newGameMode, setNewGameMode] = useState(null);
	const [snappedIndex, setSnappedIndex] = useState(0);

	const discardGameActionSheetRef = useRef();
	const carouselRef = useRef(null);
	const scrollTimeout = useRef(null);
	let navigate = useNavigate()

	const { t } = useTranslation()

	let classicMiniature = new Board({ id: 'ce0', m: '1.3:4.8.' }, true, 3)
	classicMiniature.setValue({ x: 1, y: 0 }, 2)
	classicMiniature.setValue({ x: 0, y: 1 }, 6)
	classicMiniature.setValue({ x: 0, y: 2 }, 7)
	classicMiniature.setValue({ x: 2, y: 2 }, 9)

	let killerMiniature = new Board({ id: 'ke0', m: '1.3:4.8.', s: '123654789', c: '0010,2021,0102,11,1222' }, true, 3)
	killerMiniature.setValue({ x: 1, y: 0 }, 2)
	killerMiniature.setValue({ x: 0, y: 1 }, 6)
	killerMiniature.setValue({ x: 0, y: 2 }, 7)
	killerMiniature.setValue({ x: 2, y: 2 }, 9)

	function openNewGameActionSheet(mode) {
		setNewGameMode(mode)
		if (GameHandler.game === null || GameHandler.complete) handleNewGame(mode)
		else discardGameActionSheetRef.current.open()
	}

	function handleNewGame(mode) {
		GameHandler.newGame(mode, mode === 'classic' ? GameHandler.classicDifficulty : GameHandler.killerDifficulty)
		navigate('/sudoku')
	}

	function handleImport() {
		const board = prompt(t('home.importPrompt'))
		if (board) {
			if (GameHandler.importGame(board)) {
				navigate('/sudoku')
			} else {
				alert(t('home.incompatibleData'))
			}
		}
	}

	const handleScroll = () => {
		if (scrollTimeout.current) {
			clearTimeout(scrollTimeout.current);
		}

		const carousel = carouselRef.current;
		if (!carousel) return;

		const items = carousel.querySelectorAll('.home__gameMode');
		const carouselRect = carousel.getBoundingClientRect();
		const carouselCenter = carouselRect.left + carouselRect.width / 2;

		let closestIndex = 0;
		let closestDistance = Infinity;

		items.forEach((item, index) => {
			const itemRect = item.getBoundingClientRect();
			const itemCenter = itemRect.left + itemRect.width / 2;
			const distance = Math.abs(carouselCenter - itemCenter);

			if (distance < closestDistance) {
				closestDistance = distance;
				closestIndex = index;
			}
		});

		setSnappedIndex(closestIndex);

		scrollTimeout.current = setTimeout(() => {
			alert(snappedIndex)
			const carousel = carouselRef.current;
			if (!carousel) return;
			const items = carousel.querySelectorAll('.home__gameMode');
			const selectedItem = items[snappedIndex];
			const itemRect = selectedItem.getBoundingClientRect();
			const carouselRect = carousel.getBoundingClientRect();
			carousel.scrollTo({ left: itemRect.left - carouselRect.left + carouselRef.current.scrollLeft - (carouselRect.width / 2 - itemRect.width / 2), behavior: 'smooth' });
		}, 50);
	};

	useEffect(() => {
		const carousel = carouselRef.current;
		if (!carousel) return;

		// Calculate the initial scroll position to center the first item
		const initialScrollPosition = (carousel.scrollWidth - carousel.clientWidth) / 2;
		carousel.scrollLeft = initialScrollPosition;

		carousel.addEventListener('scroll', handleScroll);

		return () => {
			carousel.removeEventListener('scroll', handleScroll);
		};
	}, []);

	return (
		<Section>
			<Topbar title="Sudoku" buttons={[
				<Link key={0} to="/settings">
					<ExpandCard>
						<FontAwesomeIcon className='topbar__button' icon={faGear} />
					</ExpandCard>
				</Link>
			]}>
				{
					API.clientVersionIsBeta ?
						[
							<ExpandCard key={0} style={{ fontSize: 20, color: 'var(--red)' }}>Beta</ExpandCard>
						] : null
				}
			</Topbar>

			<SectionContent id="home">
				<div className='home__carousel-wrapper'>
					<div ref={carouselRef} className='home__carousel'>
						<div className='home__carousel__item-wrapper'>
							<div className={`home__gameMode ${snappedIndex === 0 ? 'snapped' : ''}`} onClick={() => { openNewGameActionSheet('sandwich') }}>
								<Canvas noTouch boxBorderWidthFactor={0} game={classicMiniature} nSquares={3} showSelectedCell={false} theme="light" accentColor={accentColor} />
								<div className='home__gameMode__name'>{t('gameModes.sandwich')}</div>
							</div>
						</div>
						<div className='home__carousel__item-wrapper'>
							<div className={`home__gameMode ${snappedIndex === 1 ? 'snapped' : ''}`} onClick={() => { openNewGameActionSheet('sudokux') }}>
								<Canvas noTouch boxBorderWidthFactor={0} game={classicMiniature} nSquares={3} showSelectedCell={false} theme="light" accentColor={accentColor} />
								<div className='home__gameMode__name'>{t('gameModes.sudokuX')}</div>
							</div>
						</div>
						<div className='home__carousel__item-wrapper'>
							<div className={`home__gameMode ${snappedIndex === 2 ? 'snapped' : ''}`} onClick={() => { openNewGameActionSheet('classic') }}>
								<Canvas noTouch boxBorderWidthFactor={0} game={classicMiniature} nSquares={3} showSelectedCell={false} theme="light" accentColor={accentColor} />
								<div className='home__gameMode__name'>{t('gameModes.classic')}</div>
							</div>
						</div>
						<div className='home__carousel__item-wrapper'>
							<div className={`home__gameMode ${snappedIndex === 3 ? 'snapped' : ''}`} onClick={() => { openNewGameActionSheet('killer') }}>
								<Canvas noTouch boxBorderWidthFactor={0} game={killerMiniature} nSquares={3} showSelectedCell={false} theme="light" accentColor={accentColor} />
								<div className='home__gameMode__name'>{t('gameModes.killer')}</div>
							</div>
						</div>
						<div className='home__carousel__item-wrapper'>
							<div className={`home__gameMode ${snappedIndex === 4 ? 'snapped' : ''}`} onClick={() => { openNewGameActionSheet('thermo') }}>
								<Canvas noTouch boxBorderWidthFactor={0} game={classicMiniature} nSquares={3} showSelectedCell={false} theme="light" accentColor={accentColor} />
								<div className='home__gameMode__name'>{t('gameModes.thermo')}</div>
							</div>
						</div>
					</div>

					<div className='home__carousel-dots'>
						<div className={`home__carousel-dots__dot ${snappedIndex === 0 ? 'selected' : ''}`}></div>
						<div className={`home__carousel-dots__dot ${snappedIndex === 1 ? 'selected' : ''}`}></div>
						<div className={`home__carousel-dots__dot ${snappedIndex === 2 ? 'selected' : ''}`}></div>
						<div className={`home__carousel-dots__dot ${snappedIndex === 3 ? 'selected' : ''}`}></div>
						<div className={`home__carousel-dots__dot ${snappedIndex === 4 ? 'selected' : ''}`}></div>
					</div>
				</div>

				<div className="home__continue-wrapper">
					{
						GameHandler.game && !GameHandler.complete ?
							<>
								<Link to="/sudoku">
									<ExpandCard className='home__continue'>
										<p className='home__continue__info'>{`${t(`gameModes.${GameHandler.game.mode}`)} - ${t(`gameDifficulties.${GameHandler.game.difficulty}`)}`}</p>
										<p className='home__continue__button'>{t('home.continue')}</p>
										<FontAwesomeIcon className='home__continue__icon' icon={faChevronRight} />
									</ExpandCard>
								</Link>
							</> : null
					}
				</div>
			</SectionContent>

			<ActionSheet reference={discardGameActionSheetRef} title={t('common.discardGame')} cancelTitle={t('common.cancel')}>
				<ActionSheetButton title={t('common.discard')} color="var(--red)" onClick={() => { handleNewGame(newGameMode) }} />
			</ActionSheet>
		</Section>
	)
}

export default Home
