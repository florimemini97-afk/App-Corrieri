import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Register from './pages/Register.jsx'
import ScanVeicolo from './pages/ScanVeicolo.jsx'
import Ritorno from './pages/Ritorno.jsx'
import Admin from './pages/Admin.jsx'
import Home from './pages/Home.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/scan/:targa" element={<ScanVeicolo />} />
        <Route path="/ritorno" element={<Ritorno />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}
