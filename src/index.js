import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import * as serviceWorkerRegistration from './serviceWorkerRegistration'
import { BrowserRouter } from 'react-router-dom'
import GameHandler from './utils/GameHandler'
import './utils/i18n'
import i18n from 'i18next'
import './index.css'

GameHandler.init()

const root = createRoot(document.getElementById('root'))

root.render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)


serviceWorkerRegistration.register({
  onUpdate: (registration) => {
    registration.waiting.postMessage({type: 'SKIP_WAITING'})
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      alert(i18n.t('common.newVersionAvailable'))
      window.location.reload()
    })
  },
  onSuccess: () => {}
})
