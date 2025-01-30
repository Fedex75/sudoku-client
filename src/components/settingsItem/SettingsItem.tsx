import { useTranslation } from 'react-i18next'
import ReactSwitch from 'react-switch'
import Check from '../check/Check'
import './settingsItem.css'
import Canvas from '../CanvasComponent'
import { AccentColor } from '../../utils/Colors'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck } from '@fortawesome/free-solid-svg-icons'
import { CanvasFactory } from '../../game/gameModes/CanvasFactory'
import { useMemo } from 'react'
import { BoardFactory } from '../../game/gameModes/BoardFactory'

type Props = {
  title?: string
  type?: 'boolean' | 'theme' | 'info' | 'language'
  value?: any
  onChange?: (value: any) => void
  theme?: string
  accentColor?: AccentColor
  accentColorHex?: string
  info?: string
  icon?: React.ReactNode
  language?: string
  disabled?: boolean
}

export default function SettingsItem({ title = '', type = 'boolean', theme, accentColor = 'darkBlue', accentColorHex = '', info = '', icon, language, value = null, onChange = () => { }, disabled = false }: Props) {
  const { t } = useTranslation()

  const className = useMemo(() => {
    return `settings__item ${disabled ? 'disabled' : ''} ${type === 'theme' ? 'theme' : ''}`
  }, [disabled, type])

  const [canvasHandlerLight, canvasHandlerDark] = useMemo(() => {
    if (type !== 'theme') return [null, null]

    const classicMiniature = BoardFactory('classic', { id: 'ce0', mission: '3 1.3:4.8.' })
    classicMiniature.get({ x: 1, y: 0 })!.value = 2
    classicMiniature.get({ x: 0, y: 1 })!.value = 6
    classicMiniature.get({ x: 0, y: 2 })!.value = 7
    classicMiniature.get({ x: 2, y: 2 })!.value = 9

    const newCanvasHandlerLight = CanvasFactory('classic', accentColor, true, 0)
    newCanvasHandlerLight.game = classicMiniature
    newCanvasHandlerLight.theme = 'light'

    const newCanvasHandlerDark = CanvasFactory('classic', accentColor, true, 0)
    newCanvasHandlerDark.game = classicMiniature
    newCanvasHandlerDark.theme = 'dark'

    return [newCanvasHandlerLight, newCanvasHandlerDark]
  }, [type, accentColor])

  if (type === 'boolean') return (
    <div className={className}>
      <p className="settings__item__title">{title}</p>
      <ReactSwitch
        className="react-switch"
        width={50}
        onColor={accentColorHex}
        checkedIcon={false}
        uncheckedIcon={false}
        handleDiameter={24}
        activeBoxShadow={undefined}
        onChange={value => { if (!disabled) onChange(value) }}
        checked={value}
      />
    </div>
  )

  if (type === 'theme' && canvasHandlerLight) {
    return (
      <div className={className}>
        <div style={{ flexGrow: 1 }}></div>

        <div className='settings__item__theme-wrapper' onClick={() => { if (!disabled) onChange('light') }}>
          <Canvas canvasHandler={canvasHandlerLight} paused={false} />
          <p>{t('common.lightTheme')}</p>
          <Check checked={theme === 'light'} />
        </div>

        <div style={{ flexGrow: 1 }}></div>

        <div className='settings__item__theme-wrapper' onClick={() => { if (!disabled) onChange('dark') }}>
          <Canvas canvasHandler={canvasHandlerDark} paused={false} />
          <p>{t('common.darkTheme')}</p>
          <Check checked={theme === 'dark'} />
        </div>

        <div style={{ flexGrow: 1 }}></div>
      </div>
    )
  }

  if (type === 'info') {
    return (
      <div className={className}>
        <p className="settings__item__title">{title}</p>
        <p style={{ color: 'var(--secondaryTextColor)', whiteSpace: 'nowrap' }}>{info}</p>
      </div>
    )
  }

  if (type === 'language') {
    return (
      <div className={className} onClick={() => { if (!disabled) onChange(language) }}>
        {icon}
        <p className="settings__item__title">{title}</p>
        <p style={{ color: 'var(--secondaryTextColor)', whiteSpace: 'nowrap' }}>{info}</p>
        {value ? <FontAwesomeIcon icon={faCheck} fontSize={20} color='var(--themeColor)' /> : null}
      </div>
    )
  }

  return null
}
