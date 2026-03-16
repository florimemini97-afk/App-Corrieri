import { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { getDashboard, adminLogin, getCorrieri, eliminaCorriere, getVeicoli, creaVeicolo, eliminaVeicolo } from '../api'

const VERCEL_URL = window.location.origin

export default function Admin() {
  const [autenticato, setAutenticato] = useState(() => sessionStorage.getItem('admin') === 'si')
  const [password, setPassword] = useState('')
  const [erroreLogin, setErroreLogin] = useState('')
  const [loadingLogin, setLoadingLogin] = useState(false)
  const [tab, setTab] = useState('dashboard')
  const [dati, setDati] = useState(null)
  const [loading, setLoading] = useState(false)
  const [nuovaTarga, setNuovaTarga] = useState('')
  const [nuovaDesc, setNuovaDesc] = useState('')
  const [errore, setErrore] = useState('')
  const [successo, setSuccesso] = useState('')

  const caricaDati = async () => {
    setLoading(true)
    try { setDati(await getDashboard()) }
    catch { setErrore('Errore caricamento dati') }
    finally { setLoading(false) }
  }

  useEffect(() => { if (autenticato) caricaDati() }, [autenticato])
  useEffect(() => {
    if (!autenticato) return
    const t = setInterval(caricaDati, 30000)
    return () => clearInterval(t)
  }, [autenticato])

  const handleLogin = async (e) => {
    e.preventDefault(); setLoadingLogin(true); setErroreLogin('')
    try {
      await adminLogin(password)
      sessionStorage.setItem('admin', 'si'); setAutenticato(true)
    } catch { setErroreLogin('Password errata') }
    finally { setLoadingLogin(false) }
  }

  const handleAggiungiVeicolo = async (e) => {
    e.preventDefault(); if (!nuovaTarga.trim()) return; setErrore('')
    try {
      await creaVeicolo(nuovaTarga.trim(), nuovaDesc.trim())
      setNuovaTarga(''); setNuovaDesc(''); setSuccesso('Veicolo aggiunto!')
      caricaDati(); setTimeout(() => setSuccesso(''), 3000)
    } catch (err) { setErrore(err.response?.data?.detail || 'Errore') }
  }

  const handleEliminaVeicolo = async (id, targa) => {
    if (!confirm(`Eliminare il veicolo ${targa}?`)) return
    try { await eliminaVeicolo(id); caricaDati() }
    catch { setErrore('Errore eliminazione') }
  }

  const handleEliminaCorriere = async (id, nome) => {
    if (!confirm(`Eliminare ${nome}?`)) return
    try { await eliminaCorriere(id); caricaDati() }
    catch { setErrore('Errore eliminazione') }
  }

  const formatData = (s) => s ? new Date(s).toLocaleString('it-CH', { dateStyle: 'short', timeStyle: 'short' }) : ''

  const stampaQR = (id) => {
    const el = document.getElementById(id); if (!el) return
    const w = window.open('', '_blank')
    w.document.write(`<html><head><title>QR</title><style>body{display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:sans-serif}.box{text-align:center;padding:40px;border:2px solid #ddd;border-radius:16px}</style></head><body><div class="box">${el.innerHTML}</div></body></html>`)
    w.document.close(); w.focus(); w.print()
  }

  if (!autenticato) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🔐</div>
          <h1 className="text-2xl font-bold text-gray-800">Area Admin</h1>
          <p className="text-gray-500 text-sm">Accesso riservato</p>
        </div>
        {erroreLogin && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm mb-4">{erroreLogin}</div>}
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password admin" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-500" />
          <button type="submit" disabled={loadingLogin} className="w-full bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors">{loadingLogin ? 'Accesso...' : 'Entra →'}</button>
        </form>
      </div>
    </div>
  )

  const tabs = [{ id: 'dashboard', label: '📊 Dashboard' }, { id: 'veicoli', label: '🚗 Veicoli' }, { id: 'corrieri', label: '👥 Corrieri' }, { id: 'qr', label: '📱 QR Codes' }]

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-gray-900 text-white px-4 py-4 flex items-center justify-between">
        <div><h1 className="text-lg font-bold">🍕 App Corrieri — Admin</h1><p className="text-gray-400 text-xs">Pannello di gestione</p></div>
        <div className="flex gap-2">
          <button onClick={caricaDati} className="text-xs bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded-lg">🔄</button>
          <button onClick={() => { sessionStorage.removeItem('admin'); setAutenticato(false) }} className="text-xs bg-red-700 hover:bg-red-600 px-3 py-1 rounded-lg">Esci</button>
        </div>
      </div>
      <div className="bg-white border-b border-gray-200 flex overflow-x-auto">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${tab === t.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}>{t.label}</button>
        ))}
      </div>
      <div className="p-4 max-w-2xl mx-auto">
        {errore && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm mb-4">{errore} <button onClick={() => setErrore('')} className="float-right font-bold">×</button></div>}
        {successo && <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-3 text-sm mb-4">{successo}</div>}
        {loading && <p className="text-center text-gray-400 py-8">Caricamento...</p>}

        {tab === 'dashboard' && dati && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white rounded-xl p-4 text-center shadow-sm"><p className="text-3xl font-bold text-blue-600">{dati.usi_attivi.length}</p><p className="text-xs text-gray-500 mt-1">In uso</p></div>
              <div className="bg-white rounded-xl p-4 text-center shadow-sm"><p className="text-3xl font-bold text-green-600">{dati.veicoli.length - dati.usi_attivi.length}</p><p className="text-xs text-gray-500 mt-1">Disponibili</p></div>
              <div className="bg-white rounded-xl p-4 text-center shadow-sm"><p className="text-3xl font-bold text-gray-700">{dati.corrieri.length}</p><p className="text-xs text-gray-500 mt-1">Corrieri</p></div>
            </div>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-4 py-3 bg-blue-50 border-b border-blue-100"><h3 className="font-semibold text-blue-800">🚗 Veicoli in uso ora</h3></div>
              {dati.usi_attivi.length === 0 ? <p className="text-gray-400 text-sm text-center py-6">Nessun veicolo in uso</p> :
                <div className="divide-y">{dati.usi_attivi.map(u => (
                  <div key={u.id} className="px-4 py-3 flex justify-between items-center">
                    <div><p className="font-semibold text-gray-800">{u.veicolo_targa}</p><p className="text-sm text-gray-500">{u.corriere_nome}</p></div>
                    <div className="text-right"><p className="text-xs text-gray-400">da {formatData(u.checkout_at)}</p><span className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full mt-1">In uso</span></div>
                  </div>
                ))}</div>}
            </div>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b"><h3 className="font-semibold text-gray-700">🕐 Ultime attività</h3></div>
              {dati.movimenti_recenti.length === 0 ? <p className="text-gray-400 text-sm text-center py-6">Nessuna attività</p> :
                <div className="divide-y max-h-80 overflow-y-auto">{dati.movimenti_recenti.map(m => (
                  <div key={m.id} className="px-4 py-3 flex items-center gap-3">
                    <span className="text-xl">{m.tipo === 'checkout' ? '🚗' : '🏠'}</span>
                    <div className="flex-1"><p className="text-sm font-medium text-gray-800">{m.corriere_nome}</p><p className="text-xs text-gray-500">{m.tipo === 'checkout' ? 'Ha preso' : 'Ha restituito'} <strong>{m.veicolo_targa}</strong></p></div>
                    <p className="text-xs text-gray-400">{formatData(m.timestamp)}</p>
                  </div>
                ))}</div>}
            </div>
          </div>
        )}

        {tab === 'veicoli' && dati && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="font-semibold text-gray-700 mb-3">➕ Aggiungi veicolo</h3>
              <form onSubmit={handleAggiungiVeicolo} className="space-y-3">
                <input type="text" value={nuovaTarga} onChange={e => setNuovaTarga(e.target.value.toUpperCase())} placeholder="Targa (es. TG 123456)" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input type="text" value={nuovaDesc} onChange={e => setNuovaDesc(e.target.value)} placeholder="Descrizione (es. Fiat Punto Bianca)" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors">Aggiungi</button>
              </form>
            </div>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b"><h3 className="font-semibold text-gray-700">🚗 Tutti i veicoli ({dati.veicoli.length})</h3></div>
              {dati.veicoli.length === 0 ? <p className="text-gray-400 text-sm text-center py-6">Nessun veicolo</p> :
                <div className="divide-y">{dati.veicoli.map(v => {
                  const inUso = dati.usi_attivi.find(u => u.veicolo_targa === v.targa)
                  return (
                    <div key={v.id} className="px-4 py-3 flex items-center gap-3">
                      <div className="flex-1">
                        <p className="font-mono font-bold text-gray-800">{v.targa}</p>
                        {v.descrizione && <p className="text-xs text-gray-500">{v.descrizione}</p>}
                        {inUso ? <span className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full mt-1">In uso: {inUso.corriere_nome}</span>
                          : <span className="inline-block bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full mt-1">Disponibile</span>}
                      </div>
                      <button onClick={() => handleEliminaVeicolo(v.id, v.targa)} className="text-red-400 hover:text-red-600 px-2 py-1">🗑</button>
                    </div>
                  )
                })}</div>}
            </div>
          </div>
        )}

        {tab === 'corrieri' && dati && (
          <div className="space-y-4">
            <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-800">
              <p>📱 I corrieri si registrano aprendo l'app al link:</p>
              <p className="font-mono text-xs mt-2 bg-white rounded px-2 py-1 break-all">{VERCEL_URL}/register</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b"><h3 className="font-semibold text-gray-700">👥 Tutti i corrieri ({dati.corrieri.length})</h3></div>
              {dati.corrieri.length === 0 ? <p className="text-gray-400 text-sm text-center py-6">Nessun corriere</p> :
                <div className="divide-y">{dati.corrieri.map(c => {
                  const inUso = dati.usi_attivi.find(u => u.corriere_id === c.id)
                  return (
                    <div key={c.id} className="px-4 py-3 flex items-center gap-3">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">{c.nome} {c.cognome}</p>
                        {c.telefono && <p className="text-xs text-gray-500">{c.telefono}</p>}
                        {inUso ? <span className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full mt-1">Guida: {inUso.veicolo_targa}</span>
                          : <span className="inline-block bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full mt-1">Non in turno</span>}
                      </div>
                      <button onClick={() => handleEliminaCorriere(c.id, `${c.nome} ${c.cognome}`)} className="text-red-400 hover:text-red-600 px-2 py-1">🗑</button>
                    </div>
                  )
                })}</div>}
            </div>
          </div>
        )}

        {tab === 'qr' && dati && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500 bg-yellow-50 border border-yellow-200 rounded-lg p-3">💡 Clicca <strong>Stampa</strong> per stampare il QR e attaccarlo al veicolo o in pizzeria.</p>
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="font-semibold text-gray-700 mb-3">🏠 QR Ritorno in sede</h3>
              <div className="flex items-center gap-4">
                <div id="qr-ritorno" className="bg-white p-2 border rounded-lg text-center">
                  <QRCodeSVG value={`${VERCEL_URL}/ritorno`} size={120} />
                  <p className="text-xs font-bold mt-2">🏠 RITORNO IN SEDE</p>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 font-mono break-all mb-2">{VERCEL_URL}/ritorno</p>
                  <button onClick={() => stampaQR('qr-ritorno')} className="bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium px-4 py-2 rounded-lg">🖨️ Stampa</button>
                </div>
              </div>
            </div>
            {dati.veicoli.length === 0 ? <p className="text-gray-400 text-sm text-center py-4">Aggiungi prima i veicoli dalla tab 🚗</p> :
              dati.veicoli.map(v => (
                <div key={v.id} className="bg-white rounded-xl shadow-sm p-4">
                  <h3 className="font-semibold text-gray-700 mb-1">🚗 {v.targa}</h3>
                  {v.descrizione && <p className="text-xs text-gray-400 mb-3">{v.descrizione}</p>}
                  <div className="flex items-center gap-4">
                    <div id={`qr-${v.targa}`} className="bg-white p-2 border rounded-lg text-center">
                      <QRCodeSVG value={`${VERCEL_URL}/scan/${v.targa}`} size={120} />
                      <p className="text-xs font-bold mt-2">{v.targa}</p>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 font-mono break-all mb-2">{VERCEL_URL}/scan/{v.targa}</p>
                      <button onClick={() => stampaQR(`qr-${v.targa}`)} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg">🖨️ Stampa</button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}
