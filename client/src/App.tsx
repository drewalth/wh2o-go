import React from 'react'
import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Settings from './pages/Settings'
import Exporter from './pages/Exporter'
import Home from './pages/Home'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/settings" element={<Settings />} />
        <Route path="/exporter" element={<Exporter />} />
        <Route index element={<Home />} />
      </Routes>
    </Router>
  )
}

export default App
