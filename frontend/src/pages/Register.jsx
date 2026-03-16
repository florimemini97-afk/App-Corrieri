import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { registraCorriere, getCorrieri } from '../api'

export default function Register() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const redirect = params.get('redirect') || '/'
  const [nome, setNome] = useState('')
  const [cognome, setCognome] = useState('')
  const [telefono, setTelefono] = useState('')
  const [loading, setLoading] = useState(false)
  const [errore, setErrore] = useState('')
  const [modalita, setModalita] = useState('nuovo')
  const [corrieri, setCorrieri] = useState([])
  const [loadingCorrieri, setLoadingCorrieri] = useState(false)

  const handleNuovoRegistro = async (e) => {
    e.preventDefault()
    if (!nome.trim() || !cognome.trim()) { setErrore('Inserisci nome e cognome'); return }
    setLoading(true); setErrore('')
    try {
      const corriere = await registraCorriere(nome.trim(), cognome.trim(), telefono.trim())
      localStorage.setItem('corriere', JSON.stringify(corriere))
      navigate(redirect)
    } catch (err) {
      setErrore(err.response?.data?.detail || 'Errore durante la registrazione')
    } finally { setLoading(false) }
  }

  const handleScegli = async () => {
    setModalita('scegli'); setLoadingCorrieri(true)
    try {
      setCorrieri(await getCorrieri())
    } catch { setErrore('Errore nel caricamento') }
    finally { setLoadingCorrieri(false) }
  }

  const seleziona = (corriere) => {
    localStorage.setItem('corriere', JSON.stringify(corriere))
    navigate(redirect)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-600 to-blue-800 flex flex-col items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">👤</div>
          <h1 className="text-2xl font-bold text-gray-800">Chi sei?</h1>
          <p className="text-gray-500 text-sm mt-1">Identificati per usare i veicoli</p>
        </div>
        <div className="flex rounded-lg overflow-hidden border border-gray-200 mb-6">
          <button onClick={() => setModalita('nuovo')} className={`flex-1 py-2 text-sm font-medium transition-colors ${modalita === 'nuovo' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`}>Registrati</button>
          <button onClick={handleScegli} className={`flex-1 py-2 text-sm font-medium transition-colors ${modalita === 'scegli' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`}>Sono già registrato</button>
        </div>
        {errore && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm mb-4">{errore}</div>}
        {modalita === 'nuovo' && (
          <form onSubmit={handleNuovoRegistro} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
              <input type="text" value={nome} onChange={e => setNome(e.target.value)} placeholder="Es. Marco" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cognome *</label>
              <input type="text" value={cognome} onChange={e => setCognome(e.target.value)} placeholder="Es. Rossi" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefono (opzionale)</label>
              <input type="tel" value={telefono} onChange={e => setTelefono(e.target.value)} placeholder="+41 79 123 45 67" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors">
              {loading ? 'Registrazione...' : 'Entra →'}
            </button>
          </form>
        )}
        {modalita === 'scegli' && (
          <div>
            {loadingCorrieri ? <p className="text-center text-gray-500 py-4">Caricamento...</p>
            : corrieri.length === 0 ? <p className="text-center text-gray-500 py-4">Nessun corriere. Registrati!</p>
            : <div className="space-y-2 max-h-64 overflow-y-auto">
                {corrieri.map(c => (
                  <button key={c.id} onClick={() => seleziona(c)} className="w-full text-left bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg px-4 py-3 transition-colors">
                    <p className="font-semibold text-gray-800">{c.nome} {c.cognome}</p>
                    {c.telefono && <p className="text-xs text-gray-500">{c.telefono}</p>}
                  </button>
                ))}
              </div>}
          </div>
        )}
      </div>
    </div>
  )
}
