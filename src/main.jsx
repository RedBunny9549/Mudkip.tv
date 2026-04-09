import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

// We will create this component next!
const Player = () => <div className="p-10 text-white">Player Page Coming Soon...</div>

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/watch/:id" element={<Player />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)