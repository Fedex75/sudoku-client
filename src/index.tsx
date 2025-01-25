import 'core-js/actual/set/union'
import 'core-js/actual/set/intersection'
import 'core-js/actual/set/difference'
import './utils/apocalypseHandler'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import './fonts/fonts.css'
import { ServiceWorkerProvider } from './components/serviceWorker/useServiceWorker'
import { initI18n } from './utils/i18n'

initI18n()

const root = createRoot(document.getElementById('root') as HTMLElement)

root.render(
  <StrictMode>
    <BrowserRouter>
      <ServiceWorkerProvider>
        <App />
      </ServiceWorkerProvider>
    </BrowserRouter>
  </StrictMode>,
)
