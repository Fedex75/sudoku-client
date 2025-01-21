import { useTranslation } from 'react-i18next'
import ReactSwitch from 'react-switch'
import SettingsHandler from '../../utils/SettingsHandler'
import Check from '../check/Check'
import './settingsItem.css'
import Board from '../../game/Board'
import Canvas from '../../game/Canvas'
import { AccentColor } from '../../utils/Colors'
import { rulesets } from '../../game/gameModes/Rulesets'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck } from '@fortawesome/free-solid-svg-icons'

type Props = {
  title: string
  name?: string
  handleSettingChange?: (name: string, c: any) => void
  type?: 'boolean' | 'theme' | 'info' | 'language'
  theme?: string
  accentColor?: AccentColor
  accentColorHex?: string
  info?: string
  setTheme?: (t: string) => void
  icon?: React.ReactNode
  language?: string
}

export default function SettingsItem({ title, name = '', handleSettingChange = () => { }, type = 'boolean', theme, setTheme = () => { }, accentColor = 'darkBlue', accentColorHex = '', info = '', icon, language }: Props) {
  const { t } = useTranslation()

  if (type === 'boolean') return (
    <div className="settings__item">
      <p className="settings__item__title">{title}</p>
      <ReactSwitch
        className="react-switch"
        width={50}
        onColor={accentColorHex}
        checkedIcon={false}
        uncheckedIcon={false}
        handleDiameter={24}
        activeBoxShadow={undefined}
        onChange={c => { handleSettingChange(name, c) }}
        checked={SettingsHandler.settings[name]}
      />
    </div>
  )

  if (type === 'theme') {
    let classicMiniature = new Board({ id: 'ce0', m: '1.3:4.8.' }, 3)
    classicMiniature.setValue([{ x: 1, y: 0 }], 2)
    classicMiniature.setValue([{ x: 0, y: 1 }], 6)
    classicMiniature.setValue([{ x: 0, y: 2 }], 7)
    classicMiniature.setValue([{ x: 2, y: 2 }], 9)

    return (
      <div className='settings__item theme'>
        <div className='settings__item__theme-wrapper' onClick={() => { setTheme('light') }}>
          <Canvas notPlayable game={classicMiniature} theme='light' accentColor={accentColor} ruleset={rulesets.classic} />
          <p>{t('common.lightTheme')}</p>
          <Check checked={theme === 'light'} />
        </div>
        <div className='settings__item__theme-wrapper' onClick={() => { setTheme('dark') }}>
          <Canvas notPlayable game={classicMiniature} theme='dark' accentColor={accentColor} ruleset={rulesets.classic} />
          <p>{t('common.darkTheme')}</p>
          <Check checked={theme === 'dark'} />
        </div>
      </div>
    )
  }

  if (type === 'info') {
    return (
      <div className="settings__item">
        <p className="settings__item__title">{title}</p>
        <p style={{ color: 'var(--secondaryTextColor)', whiteSpace: 'nowrap' }}>{info}</p>
      </div>
    )
  }

  if (type === 'language') {
    return (
      <div className="settings__item" onClick={() => { handleSettingChange('language', language) }}>
        {icon}
        <p className="settings__item__title">{title}</p>
        <p style={{ color: 'var(--secondaryTextColor)', whiteSpace: 'nowrap' }}>{info}</p>
        {SettingsHandler.settings.language === language ? <FontAwesomeIcon icon={faCheck} fontSize={20} color='var(--themeColor)' /> : null}
      </div>
    )
  }

  return null
}
