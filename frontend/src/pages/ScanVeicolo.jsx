import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { checkout } from '../api.js'

export default function ScanVeicolo() {
  const { targa } = useParams()
  const navigate = useNavigate()
  const corriere = JSON.parse(localStorage.getItem('corriere') || 'null')
  const [stato, setStato] = useState('confirm')
  const [messaggio, setMessaggio] = useState('')

  useEffect(() => {
    if (!corriere) navigate('/register?redirect=/scan/' + targa)
  }, [])

  if (!corriere) return null

  const handleCheckout = async () => {
    setStato('loading')
    try {
      const res = await checkout(corriere.id, targa)
      setMessaggio(res.messaggio)
      setStato('success')
    } catch (err) {
      setMessaggio(err.response?.data?.detail || 'Errore')
      setStato('error')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-500 to-green-700 flex flex-col items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm text-center">
        {stato === 'confirm' && (
          <>
            <div className="text-5xl mb-4">🚗</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Prendi questo veicolo?</h2>
            <div className="bg-green-50 rounded-xl p-4 mb-6">
              <p className="text-3xl font-bold text-green-700 tracking-widest">{targa?.toUpperCase()}</p>
            </div>
            <p className="text-gray-500 text-sm mb-6">Stai prendendo il veicolo come<br /><strong className="text-gray-700">{corriere.nome} {corriere.cognome}</strong></p>
            <button onClick={handleCheckout} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl text-lg transition-colors mb-3">Confermo, lo prendo</button>
            <button onClick={() => navigate('/')} className="text-sm text-gray-400 underline">Annulla</button>
          </>
        )}
        {stato === 'loading' && (
          <>
            <div className="text-5xl mb-4">⏳</div>
            <p className="text-gray-600 font-medium">Registrazione in corso...</p>
          </>
        )}
        {stato === 'success' && (
          <>
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-xl font-bold text-green-700 mb-2">Ottimo!</h2>
            <p className="text-gray-600 mb-6">{messaggio}</p>
            <button onClick={() => navigate('/')} className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-colors">Chiudi</button>
          </>
        )}
        {stato === 'error' && (
          <>
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-red-600 mb-2">Attenzione</h2>
            <p className="text-gray-600 mb-6">{messaggio}</p>
            <button onClick={() => setStato('confirm')} className="w-full bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl mb-3">Riprova</button>
            <button onClick={() => navigate('/')} className="text-sm text-gray-400 underline">Torna alla home</button>
          </>
        )}
      </div>
    </div>
  )
}
