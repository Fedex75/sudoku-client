import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import * as serviceWorkerRegistration from './serviceWorkerRegistration'
import { BrowserRouter } from 'react-router-dom'
import GameHandler from './utils/GameHandler'

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
      alert('Hay una nueva versión disponible')
      window.location.reload()
    })
  },
  onSuccess: () => {}
})
