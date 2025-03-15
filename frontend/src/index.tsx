import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './assets/css/main.css' // Ensure this path matches the file location

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)