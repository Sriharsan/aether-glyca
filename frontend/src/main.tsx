import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles/globals.css'

// Apply theme before first paint to avoid flash
;(() => {
  const saved = localStorage.getItem('aether-theme') ?? 'dark'
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const isDark = saved === 'dark' || (saved === 'system' && prefersDark)
  document.documentElement.classList.toggle('dark', isDark)
})()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
