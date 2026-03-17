import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Home() {
  const navigate = useNavigate()
  const corriere = JSON.parse(localStorage.getItem('corriere') || 'null')

  useEffect(() => {
    if (!corriere) navigate('/register')
  }, [])

  if (!corriere) return null

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-600 to-blue-800 flex flex-col items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm text-center">
        <div className="text-5xl mb-4">🚗</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-1">App Corrieri</h1>
        <p className="text-gray-500 mb-6">Ciao, <span className="font-semibold text-blue-600">{corriere.nome} {corriere.cognome}</span>!</p>
        <div className="space-y-3 text-sm text-gray-600 bg-blue-50 rounded-xl p-4 mb-6">
          <p>📱 <strong>Per prendere un veicolo:</strong><br />Scansiona il QR code sulla macchina</p>
          <hr className="border-blue-200" />
          <p>🏠 <strong>Per restituirlo:</strong><br />Scansiona il QR code in pizzeria</p>
        </div>
        <button
          onClick={() => { localStorage.removeItem('corriere'); navigate('/register') }}
          className="text-xs text-gray-400 underline"
        >
          Non sei tu? Cambia account
        </button>
      </div>
    </div>
  )
}
