import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { checkin } from '../api'

export default function Ritorno() {
  const navigate = useNavigate()
  const corriere = JSON.parse(localStorage.getItem('corriere') || 'null')
  const [stato, setStato] = useState('confirm')
  const [messaggio, setMessaggio] = useState('')

  useEffect(() => {
    if (!corriere) navigate('/register?redirect=/ritorno')
  }, [])

  if (!corriere) return null

  const handleCheckin = async () => {
    setStato('loading')
    try {
      const res = await checkin(corriere.id)
      setMessaggio(res.messaggio); setStato('success')
    } catch (err) {
      setMessaggio(err.response?.data?.detail || 'Errore'); setStato('error')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-500 to-orange-700 flex flex-col items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm text-center">
        {stato === 'confirm' && <>
          <div className="text-5xl mb-4">🏠</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Ritorno in sede</h2>
          <p className="text-gray-500 text-sm mb-6">Stai restituendo il veicolo come<br /><strong className="text-gray-700">{corriere.nome} {corriere.cognome}</strong></p>
          <div className="bg-orange-50 rounded-xl p-4 mb-6">
            <p className="text-orange-700 text-sm font-medium">Il veicolo verrà segnato come disponibile e il tuo capo riceverà una notifica.</p>
          </div>
          <button onClick={handleCheckin} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl text-lg transition-colors mb-3">✅ Confermo il ritorno</button>
          <button onClick={() => navigate('/')} className="text-sm text-gray-400 underline">Annulla</button>
        </>}
        {stato === 'loading' && <>
          <div className="text-5xl mb-4">⏳</div>
          <p className="text-gray-600 font-medium">Registrazione in corso...</p>
        </>}
        {stato === 'success' && <>
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-orange-600 mb-2">Benvenuto!</h2>
          <p className="text-gray-600 mb-2">{messaggio}</p>
          <p className="text-sm text-gray-400 mb-6">Una notifica è stata inviata al tuo capo 📱</p>
          <button onClick={() => navigate('/')} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl transition-colors">Chiudi</button>
        </>}
        {stato === 'error' && <>
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-red-600 mb-2">Attenzione</h2>
          <p className="text-gray-600 mb-6">{messaggio}</p>
          <button onClick={() => setStato('confirm')} className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 rounded-xl transition-colors mb-3">Riprova</button>
          <button onClick={() => navigate('/')} className="text-sm text-gray-400 underline">Torna alla home</button>
        </>}
      </div>
    </div>
  )
}
