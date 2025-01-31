import './settings.css'
import { useCallback } from 'react'
import { Section, SectionContent, Topbar, ColorChooser } from '../../components'
import { Route, Routes } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHeart } from '@fortawesome/free-solid-svg-icons'
import SettingsItem from '../../components/settingsItem/SettingsItem'
import API from '../../utils/API'
import { useTranslation } from 'react-i18next'
import { colorNames } from '../../utils/Colors'
import { AccentColor } from '../../utils/Colors'
import FlagArg from '../../svg/flag_arg'
import FlagUKSVG from '../../svg/flag_uk'
import FlagSpainSVG from '../../svg/flag_spain'
import { ThemeName } from '../../game/Themes'
import { Language, useSettings } from '../../utils/SettingsHandler'
import GameHandler from '../../utils/GameHandler'
import SectionLink from '../../components/sectionLink/SectionLink'

type AppearanceSettingsProps = {
    theme: ThemeName
    setTheme: (t: ThemeName) => void
    accentColor: AccentColor
    setAccentColor: (c: AccentColor) => void
    accentColorHex: string
}

function AppearanceSettings({ theme, setTheme, accentColor, setAccentColor, accentColorHex }: AppearanceSettingsProps) {
    const { t } = useTranslation()
    const { settings, updateSettings } = useSettings()

    return (
        <Section>
            <Topbar title={t('sectionNames.settings')} subtitle={t('settings.sectionAppearance')} backURL="/home/settings" />
            <SectionContent id="settings">
                <div className="settings__list" >
                    <SettingsItem type='theme' theme={theme} onChange={t => { setTheme(t) }} value='' accentColor={accentColor} />
                    <SettingsItem title={t('settings.automatic')} onChange={v => { updateSettings({ autoTheme: v }) }} value={settings.autoTheme} accentColorHex={accentColorHex} />
                </div>

                <div className='settings__label'>{t('settings.accentColor')}</div>

                <div style={{ marginBottom: 30 }}>
                    <ColorChooser value={accentColor} colors={colorNames.filter(cn => cn !== 'default')} onChange={(c: string) => { setAccentColor(c as AccentColor) }} />
                </div>

                <div className='settings__label'>{t('settings.highContrast')}</div>

                <div className="settings__list">
                    <SettingsItem title={t('settings.highContrastCandidates')} onChange={v => { updateSettings({ highlightCandidatesWithColor: v }) }} value={settings.highlightCandidatesWithColor} accentColorHex={accentColorHex} />
                    <SettingsItem title={t('settings.grid')} onChange={v => { updateSettings({ highContrastGrid: v }) }} value={settings.highContrastGrid} accentColorHex={accentColorHex} />
                </div>

                <div className="settings__list">
                    <SettingsItem title={t('settings.sudokuXShowDiagonals')} onChange={v => { updateSettings({ sudokuXShowDiagonals: v }) }} value={settings.sudokuXShowDiagonals} accentColorHex={accentColorHex} />
                    <SettingsItem title={t('settings.sandwichHideSolvedClues')} onChange={v => { updateSettings({ sandwichHideSolvedClues: v }) }} value={settings.sandwichHideSolvedClues} accentColorHex={accentColorHex} />
                </div>
            </SectionContent>
        </Section>
    )
}

function AnnotationsSettings({ accentColorHex }: { accentColorHex: string }) {
    const { t } = useTranslation()
    const { settings, updateSettings } = useSettings()

    return (
        <Section>
            <Topbar title={t('sectionNames.settings')} subtitle={t('settings.sectionAnnotations')} backURL="/home/settings" />
            <SectionContent id="settings">
                <div className='settings__label'>{t('settings.candidates')}</div>

                <div className="settings__list">
                    <SettingsItem title={t('settings.autoRemove')} onChange={v => { updateSettings({ autoRemoveCandidates: v }) }} value={settings.autoRemoveCandidates} accentColorHex={accentColorHex} />
                </div>

                <div className='settings__label'>{t('settings.numpad')}</div>

                <div className="settings__list" style={{ marginBottom: 0 }}>
                    <SettingsItem title={t('settings.inputLock')} onChange={v => { updateSettings({ inputLock: v }) }} value={settings.inputLock} accentColorHex={accentColorHex} />
                </div>

                <p className='settings__explanation'>{t('settings.autoChangeInputLockExplanation')}</p>

                <div className="settings__list" style={{ marginBottom: 0 }}>
                    <SettingsItem title={t('settings.showOnlyPossibleValues')} onChange={v => { updateSettings({ showPossibleValues: v }) }} value={settings.showPossibleValues} accentColorHex={accentColorHex} />
                </div>

                <p className='settings__explanation'>{t('settings.showOnlyPossibleValuesExplanation')}</p>

                <div className='settings__label'>{t('settings.autoSolveTitle')}</div>

                <div className="settings__list" style={{ marginBottom: 0 }}>
                    <SettingsItem title={t('settings.nakedSingle')} onChange={v => { updateSettings({ autoSolveNakedSingles: v }) }} value={settings.showPossibleValues && settings.autoSolveNakedSingles} accentColorHex={accentColorHex} disabled={!settings.showPossibleValues} />
                    <SettingsItem title={t('settings.onlyInBox')} onChange={v => { updateSettings({ autoSolveOnlyInBox: v }) }} value={settings.showPossibleValues && settings.autoSolveOnlyInBox} accentColorHex={accentColorHex} disabled={!settings.showPossibleValues} />
                </div>
            </SectionContent>
        </Section>
    )
}

function ColorSettings({ accentColorHex }: { accentColorHex: string }) {
    const { t } = useTranslation()
    const { settings, updateSettings } = useSettings()

    return (
        <Section>
            <Topbar title={t('sectionNames.settings')} subtitle={t('settings.sectionColor')} backURL="/home/settings" />
            <SectionContent id="settings">
                <div className='settings__label'>{t('settings.coloredCells')}</div>

                <div className="settings__list" style={{ marginBottom: 0 }}>
                    <SettingsItem title={t('settings.clearColorSolved')} onChange={v => { updateSettings({ clearColorOnInput: v }) }} value={settings.clearColorOnInput} accentColorHex={accentColorHex} />
                    <SettingsItem title={t('settings.lockColoredCells')} onChange={v => { updateSettings({ lockCellsWithColor: v }) }} value={settings.lockCellsWithColor} accentColorHex={accentColorHex} />
                </div>

                <p className='settings__explanation' style={{ marginBottom: 10 }}>{t('settings.lockColoredCellsExplanation')}</p>

                <div className="settings__list" style={{ marginBottom: 0 }}>
                    <SettingsItem title={t('settings.autoSolve')} onChange={v => { updateSettings({ autoSolveCellsWithColor: v }) }} value={settings.autoSolveCellsWithColor} accentColorHex={accentColorHex} />
                </div>

                <p className='settings__explanation'>{t('settings.autoSolveColoredCellsExplanation')}</p>
            </SectionContent>
        </Section>
    )
}

function ErrorsSettings({ accentColorHex }: { accentColorHex: string }) {
    const { t } = useTranslation()
    const { settings, updateSettings } = useSettings()

    return (
        <Section>
            <Topbar title={t('sectionNames.settings')} subtitle={t('settings.sectionErrors')} backURL="/home/settings" />
            <SectionContent id="settings">
                <div className="settings__list">
                    <SettingsItem title={t('settings.showErrors')} onChange={v => { updateSettings({ showErrors: v }) }} value={settings.showErrors} accentColorHex={accentColorHex} />
                    <SettingsItem title={t('settings.showSolutionErrors')} onChange={v => { updateSettings({ showSolutionErrors: v }) }} value={settings.showErrors && settings.showSolutionErrors} accentColorHex={accentColorHex} disabled={!settings.showErrors} />
                    <SettingsItem title={t('settings.showLogicErrors')} onChange={v => { updateSettings({ showLogicErrors: v }) }} value={settings.showErrors && settings.showLogicErrors} accentColorHex={accentColorHex} disabled={!settings.showErrors} />
                </div>

                <div className="settings__list">
                    <SettingsItem title={t('settings.killerShowCageErrors')} onChange={v => { updateSettings({ killerShowCageErrors: v }) }} value={settings.showErrors && settings.showLogicErrors && settings.killerShowCageErrors} accentColorHex={accentColorHex} disabled={!settings.showErrors || !settings.showLogicErrors} />
                    <SettingsItem title={t('settings.sudokuXShowDiagonalErrors')} onChange={v => { updateSettings({ sudokuXShowDiagonalErrors: v }) }} value={settings.showErrors && settings.showLogicErrors && settings.sudokuXShowDiagonals && settings.sudokuXShowDiagonalErrors} accentColorHex={accentColorHex} disabled={!settings.showErrors || !settings.sudokuXShowDiagonals || !settings.showLogicErrors} />
                    <SettingsItem title={t('settings.sandwichShowSumErrors')} onChange={v => { updateSettings({ sandwichShowSumErrors: v }) }} value={settings.showErrors && settings.showLogicErrors && settings.sandwichShowSumErrors} accentColorHex={accentColorHex} disabled={!settings.showErrors || !settings.showLogicErrors} />
                    <SettingsItem title={t('settings.thermoShowThermometerErrors')} onChange={v => { updateSettings({ thermoShowThermometerErrors: v }) }} value={settings.showErrors && settings.showLogicErrors && settings.thermoShowThermometerErrors} accentColorHex={accentColorHex} disabled={!settings.showErrors || !settings.showLogicErrors} />
                </div>
            </SectionContent>
        </Section>
    )
}

function AdvancedSettings({ accentColorHex }: { accentColorHex: string }) {
    const { t } = useTranslation()
    const { settings, updateSettings } = useSettings()

    return (
        <Section>
            <Topbar title={t('sectionNames.settings')} subtitle={t('settings.sectionAdvanced')} backURL="/home/settings" />
            <SectionContent id="settings">
                <div className="settings__list" style={{ marginBottom: 0 }}>
                    <SettingsItem title={t('settings.advancedHighlight')} onChange={v => { updateSettings({ advancedHighlight: v }) }} value={settings.advancedHighlight} accentColorHex={accentColorHex} />
                </div>

                <p className='settings__explanation'>{t('settings.advancedHighlightExplanation')}</p>

                <div className='settings__label'>{t('settings.fullNotation')}</div>

                <div className="settings__list" style={{ marginBottom: 0 }}>
                    <SettingsItem title={t('settings.autoSolve')} onChange={v => { updateSettings({ autoSolveCellsFullNotation: v }) }} value={settings.autoSolveCellsFullNotation} accentColorHex={accentColorHex} />
                </div>

                <p className='settings__explanation'>{t('settings.fullNotationExplanation')}</p>

                <div className="settings__list">
                    <SettingsItem title={t('settings.clearColorFullNotation')} onChange={v => { updateSettings({ clearColorFullNotation: v }) }} value={settings.clearColorFullNotation} accentColorHex={accentColorHex} />
                </div>

                <div className='settings__label'>{t('settings.autoSolveTitle')}</div>

                <div className="settings__list" style={{ marginBottom: 0 }}>
                    <SettingsItem title={t('settings.killerAutoSolveLastInCage')} onChange={v => { updateSettings({ killerAutoSolveLastInCage: v }) }} value={settings.killerAutoSolveLastInCage} accentColorHex={accentColorHex} />
                    <SettingsItem title={t('settings.sandwichAutoSolveLastInSum')} onChange={v => { updateSettings({ sandwichAutoSolveLastInSum: v }) }} value={settings.sandwichAutoSolveLastInSum} accentColorHex={accentColorHex} />
                </div>
            </SectionContent>
        </Section>
    )
}

function GeneralSection() {
    const { t } = useTranslation()

    return (
        <Section>
            <Topbar title={t('sectionNames.settings')} subtitle={t('settings.sectionGeneral')} backURL="/home/settings" />
            <SectionContent id="settings">
                <div className="settings__section__list">
                    <SectionLink color='var(--darkBlue)' title={t('settings.sectionLanguage')} link='language' />
                    <SectionLink color='var(--darkBlue)' title={t('settings.sectionAbout')} link='about' />
                </div>
            </SectionContent>
        </Section>
    )
}

function LanguageSettings({ accentColorHex }: { accentColorHex: string }) {
    const { t, i18n } = useTranslation()
    const { settings, updateSettings } = useSettings()

    const handleChangeLanguage = useCallback((newLang: Language) => {
        updateSettings({ language: newLang })
        if (newLang === 'auto') {
            i18n.changeLanguage(navigator.language.split('-')[0])
        } else {
            i18n.changeLanguage(newLang)
        }
    }, [i18n, updateSettings])

    return (
        <Section>
            <Topbar title={t('sectionNames.settings')} subtitle={t('settings.sectionLanguage')} backURL="/settings/general" />
            <SectionContent id="settings">
                <div className='settings__label'>{t('settings.language')}</div>

                <div className="settings__list" style={{ marginBottom: 0 }}>
                    <SettingsItem type='language' language='auto' title={t('settings.languageAuto')} onChange={handleChangeLanguage} value={settings.language === 'auto'} accentColorHex={accentColorHex} />
                    <SettingsItem type='language' language='en' icon={<FlagUKSVG className='settings__item__icon' />} title={t('settings.languageEnglish')} onChange={handleChangeLanguage} value={settings.language === 'en'} accentColorHex={accentColorHex} />
                    <SettingsItem type='language' language='es' icon={<FlagSpainSVG className='settings__item__icon' />} title={t('settings.languageSpanish')} onChange={handleChangeLanguage} value={settings.language === 'es'} accentColorHex={accentColorHex} />
                </div>
            </SectionContent>
        </Section>
    )
}

function AboutSection() {
    const { t } = useTranslation()

    return (
        <Section>
            <Topbar title={t('sectionNames.settings')} subtitle={t('settings.sectionAbout')} backURL="/settings/general" />
            <SectionContent id="settings">
                <div className="settings__list">
                    <SettingsItem type='info' title={t('settings.version')} info={API.clientVersion} />
                    <SettingsItem type='info' title={t('settings.build')} info={API.buildHash} />
                </div>

                <div className='settings__label'>{t('settings.missionsTitle')}</div>

                <div className="settings__list">
                    {
                        Object.entries(GameHandler.missions).map(([gameMode, difficulties]) => (
                            <SettingsItem key={gameMode} type='info' title={t(`gameModes.${gameMode}`)} info={Object.entries(difficulties).map(([, missions]) => missions.length).reduce((a, b) => a + b, 0).toString()} />
                        ))
                    }
                </div>

                <p style={{ display: 'flex', flexFlow: 'row', justifyContent: 'center', gap: 7, alignItems: 'center', color: 'var(--primaryTextColor)', textAlign: 'center' }}>{t('settings.madeWith')} <FontAwesomeIcon icon={faHeart} color='var(--darkRed)' /> {t('settings.inArgentina')} <FlagArg className='about__flag-argentina' /> </p>
            </SectionContent>
        </Section>
    )
}

type SettingsProps = {
    theme: ThemeName
    setTheme: (t: ThemeName) => void
    accentColor: AccentColor
    setAccentColor: (c: AccentColor) => void
}

export default function Settings({ theme, setTheme, accentColor, setAccentColor }: SettingsProps) {
    const accentColorHex = getComputedStyle(document.documentElement).getPropertyValue(`--${accentColor}`)

    return (
        <Routes>
            <Route path='/appearance' element={<AppearanceSettings theme={theme} setTheme={setTheme} accentColor={accentColor} setAccentColor={setAccentColor} accentColorHex={accentColorHex} />} />
            <Route path='/annotations' element={<AnnotationsSettings accentColorHex={accentColorHex} />} />
            <Route path='/color' element={<ColorSettings accentColorHex={accentColorHex} />} />
            <Route path='/errors' element={<ErrorsSettings accentColorHex={accentColorHex} />} />
            <Route path='/advanced' element={<AdvancedSettings accentColorHex={accentColorHex} />} />
            <Route path='/general' element={<GeneralSection />} />
            <Route path='/general/about' element={<AboutSection />} />
            <Route path='/general/language' element={<LanguageSettings accentColorHex={accentColorHex} />} />
        </Routes>
    )
}
