import axios from 'axios'

const BASE = import.meta.env.VITE_BACKEND_URL || ''
const api = axios.create({ baseURL: `${BASE}/api` })

export const registraCorriere = (nome, cognome, telefono) =>
  api.post('/corrieri', { nome, cognome, telefono }).then(r => r.data)
export const getCorrieri = () =>
  api.get('/corrieri').then(r => r.data)
export const eliminaCorriere = (id) =>
  api.delete(`/corrieri/${id}`).then(r => r.data)
export const getVeicoli = () =>
  api.get('/veicoli').then(r => r.data)
export const creaVeicolo = (targa, descrizione) =>
  api.post('/veicoli', { targa, descrizione }).then(r => r.data)
export const eliminaVeicolo = (id) =>
  api.delete(`/veicoli/${id}`).then(r => r.data)
export const checkout = (corriere_id, veicolo_targa) =>
  api.post('/checkout', { corriere_id, veicolo_targa }).then(r => r.data)
export const checkin = (corriere_id) =>
  api.post('/checkin', { corriere_id }).then(r => r.data)
export const getDashboard = () =>
  api.get('/dashboard').then(r => r.data)
export const adminLogin = (password) =>
  api.post('/admin/login', { password }).then(r => r.data)
