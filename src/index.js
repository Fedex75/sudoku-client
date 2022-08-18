import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import * as serviceWorkerRegistration from './serviceWorkerRegistration'
import { BrowserRouter } from 'react-router-dom'
import API from './utils/API'
import GameHandler from './utils/GameHandler'

GameHandler.init()

const container = document.getElementById('root')
const root = createRoot(container)

root.render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)

window.addEventListener("error", event => {
  if (process.env.NODE_ENV && process.env.NODE_ENV === 'production') {
    API.logError({
      text: event.message
    }).catch(() => {})
  }
})

window.addEventListener("unhandledrejection", event => {
  if (process.env.NODE_ENV && process.env.NODE_ENV === 'production') {
    API.logError({
      text: event.reason.message
    }).catch(() => {})
  }
})


serviceWorkerRegistration.register({
  onUpdate: (registration) => {
    console.log('onUpdate');
    registration.waiting.postMessage({type: 'SKIP_WAITING'})
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      alert('Hay una nueva versión disponible')
      window.location.reload()
    })
  },
  onSuccess: () => {}
})
