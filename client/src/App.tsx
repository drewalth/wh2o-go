import React from 'react'
import logo from './logo.svg'
import './App.css'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'

const Dashboard = () => {
  return <div>Dashboard</div>
}

const Settings = () => {
  return <div>Settings</div>
}

function App () {
  return (
    <Router>
      <div>
        <div>
          <Link to='/'>Dash</Link>
          <Link to='/settings'>Settings</Link>
        </div>

        <Routes>
          <Route path='/settings' element={<Settings />} />
          <Route index element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
