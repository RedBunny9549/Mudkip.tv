import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.jsx'
import Player from './Player.jsx'
import MangaReader from './MangaReader.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* The Home/Search Page */}
        <Route path="/" element={<App />} />

        {/* The Video Player Page */}
        <Route path="/watch/:id" element={<Player />} />

        {/* The Manga Reader Page */}
        <Route path="/read/:id" element={<MangaReader />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)