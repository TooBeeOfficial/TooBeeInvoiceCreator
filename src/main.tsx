/* The entry point.

   Global stylesheets first and in order — tokens before the reset that uses
   them — then the app. Nothing else belongs here. */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/tokens.css'
import './styles/global.css'
import { App } from './App'

const container = document.getElementById('root')
if (!container) throw new Error('The window has no root element to draw into.')

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
