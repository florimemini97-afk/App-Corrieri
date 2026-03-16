import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
EOFBLOCCO 9 — src/App.jsx e src/api.js:
bashcat > /app/frontend/src/App.jsx << 'EOF'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Register from './pages/Register'
import ScanVeicolo from './pages/ScanVeicolo'
import Ritorno from './pages/Ritorno'
import Admin from './pages/Admin'
import Home from './pages/Home'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"            element={<Home />} />
        <Route path="/register"    element={<Register />} />
        <Route path="/scan/:targa" element={<ScanVeicolo />} />
        <Route path="/ritorno"     element={<Ritorno />} />
        <Route path="/admin"       element={<Admin />} />
        <Route path="*"            element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}
