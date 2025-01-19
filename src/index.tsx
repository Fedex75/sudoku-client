import './utils/apocalypseHandler'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import './fonts/fonts.css'
import { ServiceWorkerProvider } from './components/serviceWorker/useServiceWorker'

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
