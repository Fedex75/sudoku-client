import './home.css'
import { Route, Routes } from 'react-router'
import { Section, SectionContent, Topbar } from "../../components"
import Play from './play/Play'
import Bookmarks from './bookmarks/Bookmarks'
import MainStatistics from './statistics/MainStatistics'
import { AccentColor } from '../../utils/Colors'
import { ThemeName } from '../../game/Themes'
import MainSettings from './settings/MainSettings'

type Props = {
    theme: ThemeName
    accentColor: AccentColor
}

function Home({ theme, accentColor }: Props) {
    return (
        <Section className="home">
            <Topbar logo />

            <SectionContent id="home">
                <Routes>
                    <Route path="/" element={<Play theme={theme} accentColor={accentColor} />} />
                    <Route path="/bookmarks" element={<Bookmarks theme={theme} accentColor={accentColor} />} />
                    <Route path="/statistics" element={<MainStatistics />} />
                    <Route path="/settings" element={<MainSettings />} />
                </Routes>
            </SectionContent>
        </Section>
    )
}

export default Home
