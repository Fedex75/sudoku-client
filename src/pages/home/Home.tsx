import './home.css'
import { Route, Routes } from 'react-router'
import { Link } from "react-router-dom"
import { Section, SectionContent, Topbar } from "../../components"
import { useTranslation } from 'react-i18next'
import SVGSettings from '../../svg/settings'
import Play from './play/Play'
import SVGImport from '../../svg/import'
import Bookmarks from './bookmarks/Bookmarks'
import Statistics from './statistics/Statistics'
import { AccentColor } from '../../utils/Colors'
import { useCallback } from 'react'
import { ThemeName } from '../../game/Themes'

type Props = {
	theme: ThemeName
	accentColor: AccentColor
}

function Home({ theme, accentColor }: Props) {
	const { t } = useTranslation()

	const handleImport = useCallback(() => {
		const board = prompt(t('home.importPrompt'))
		if (board) {
			/*if (GameHandler.importGame(board)) {
				navigate('/sudoku')
			} else {
				alert(t('home.incompatibleData'))
			}*/
		}
	}, [t])

	return (
		<Section className="home">
			<Topbar logo buttons={[
				<div key={1} onClick={handleImport} style={{ marginRight: 15 }}><SVGImport /></div>,
				<Link key={2} to="/settings">
					<SVGSettings />
				</Link>
			]} />

			<SectionContent id="home">
				<Routes>
					<Route path="/" element={<Play theme={theme} accentColor={accentColor} />} />
					<Route path="/bookmarks" element={<Bookmarks theme={theme} accentColor={accentColor} />} />
					<Route path="/statistics" element={<Statistics theme={theme} accentColor={accentColor} />} />
				</Routes>
			</SectionContent>
		</Section>
	)
}

export default Home
