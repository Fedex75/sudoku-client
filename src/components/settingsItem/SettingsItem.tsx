import { useTranslation } from 'react-i18next'
import ReactSwitch from 'react-switch'
import SettingsHandler from '../../utils/SettingsHandler'
import Check from '../check/Check'
import './settingsItem.css'
import Canvas from '../CanvasComponent'
import { AccentColor } from '../../utils/Colors'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck } from '@fortawesome/free-solid-svg-icons'
import { ClassicBoard } from '../../game/gameModes/classic/ClassicBoard'
import { createCanvas } from '../../game/gameModes/createCanvas'

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
    let classicMiniature = new ClassicBoard({ id: 'ce0', mission: '3 1.3:4.8.' })
    classicMiniature.get({ x: 1, y: 0 })!.value = 2
    classicMiniature.get({ x: 0, y: 1 })!.value = 6
    classicMiniature.get({ x: 0, y: 2 })!.value = 7
    classicMiniature.get({ x: 2, y: 2 })!.value = 9

    const canvasHandlerLight = createCanvas('classic', accentColor, true, 0)
    canvasHandlerLight.game = classicMiniature
    canvasHandlerLight.theme = 'light'

    const canvasHandlerDark = createCanvas('classic', accentColor, true, 0)
    canvasHandlerLight.game = classicMiniature
    canvasHandlerLight.theme = 'dark'

    return (
      <div className='settings__item theme'>
        <div className='settings__item__theme-wrapper' onClick={() => { setTheme('light') }}>
          <Canvas canvasHandler={canvasHandlerLight} paused={false} />
          <p>{t('common.lightTheme')}</p>
          <Check checked={theme === 'light'} />
        </div>
        <div className='settings__item__theme-wrapper' onClick={() => { setTheme('dark') }}>
          <Canvas canvasHandler={canvasHandlerDark} paused={false} />
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
