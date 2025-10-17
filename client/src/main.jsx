import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import Hero2Demo from './Hero2Demo.jsx'
import './index.css'

// Check if URL has ?demo=hero2 to show Hero2 demo
const urlParams = new URLSearchParams(window.location.search);
const showHero2Demo = urlParams.get('demo') === 'hero2';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {showHero2Demo ? <Hero2Demo /> : <App />}
  </React.StrictMode>,
)
