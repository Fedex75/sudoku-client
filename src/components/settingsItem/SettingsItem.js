import { t } from 'i18next'
import ReactSwitch from 'react-switch'
import Board from '../../utils/Board'
import SettingsHandler from '../../utils/SettingsHandler'
import Canvas from '../canvas/Canvas'
import Check from '../check/Check'
import './settingsItem.css'

export default function SettingsItem({title, name, handleSettingChange, type = 'boolean', theme, setTheme, accentColor, info}){  
  if (type === 'boolean') return (
    <div className="settings__item">
      <p className="settings__item__title">{title}</p>
      <ReactSwitch
        className="react-switch"
        width={50}
        onColor='#00d039'
        checkedIcon={false}
        uncheckedIcon={false}
        handleDiameter={24}
        activeBoxShadow={null}
        onChange={c => {handleSettingChange(name, c)}}
        checked={SettingsHandler.settings[name]}
      />
    </div>
  )

  if (type === 'theme'){
    let classicMiniature = new Board({id: 'ce0', m: '1.3:4.8.'}, true, 3)
    classicMiniature.setValue({x: 1, y: 0}, 2)
    classicMiniature.setValue({x: 0, y: 1}, 6)
    classicMiniature.setValue({x: 0, y: 2}, 7)
    classicMiniature.setValue({x: 2, y: 2}, 9)

    return (
      <div className='settings__item theme'>
        <div className='settings__item__theme-wrapper' onClick={() => {setTheme('light')}}>
          <Canvas noTouch game={classicMiniature} nSquares={3} showSelectedCell={false} theme='light' accentColor={accentColor} />
          <p>{t('common.lightTheme')}</p>
          <Check checked={theme === 'light'} />
        </div>
        <div className='settings__item__theme-wrapper' onClick={() => {setTheme('dark')}}>
          <Canvas noTouch game={classicMiniature} nSquares={3} showSelectedCell={false} theme='dark' accentColor={accentColor} />
          <p>{t('common.darkTheme')}</p>
          <Check checked={theme === 'dark'} />
        </div>
      </div>
    )
  }

  if (type === 'info'){
    return (
      <div className="settings__item">
        <p className="settings__item__title">{title}</p>
        <p style={{color: 'var(--secondaryTextColor)'}}>{info}</p>
      </div>
    )
  }

  return null
}