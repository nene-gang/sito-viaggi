const BASE_URL = 'https://sito-viaggi-worker.elena-gallarate.workers.dev'

// Helper condiviso: aggiunge sempre 'credentials: include' (serve per inviare
// il cookie di sessione al Worker, che è su un dominio diverso dal sito) e
// centralizza la gestione degli errori HTTP.
async function richiesta(percorso, opzioni = {}) {
  const res = await fetch(`${BASE_URL}${percorso}`, {
    credentials: 'include',
    ...opzioni,
    headers: opzioni.body ? { 'Content-Type': 'application/json', ...opzioni.headers } : opzioni.headers,
  })
  if (!res.ok) throw new Error(`Errore ${res.status}`)
  return res.json()
}

// --- Autenticazione ---

export function urlLogin() {
  return `${BASE_URL}/api/auth/login`
}

export function fetchUtenteCorrente() {
  return richiesta('/api/auth/me')
}

export function logout() {
  return richiesta('/api/auth/logout', { method: 'POST' })
}

// --- Viaggi ---

export function fetchViagggi() {
  return richiesta('/api/viaggi')
}

export function fetchViaggio(id) {
  return richiesta(`/api/viaggi/${id}`)
}

export function creaViaggio(dati) {
  return richiesta('/api/viaggi', { method: 'POST', body: JSON.stringify(dati) })
}

export function modificaViaggio(id, dati) {
  return richiesta(`/api/viaggi/${id}`, { method: 'PUT', body: JSON.stringify(dati) })
}

export function eliminaViaggio(id) {
  return richiesta(`/api/viaggi/${id}`, { method: 'DELETE' })
}

// --- Checklist ---

export function aggiornaChecklist(voceId, completata) {
  return richiesta(`/api/checklist/${voceId}`, { method: 'PUT', body: JSON.stringify({ completata }) })
}

// --- Tappe ---

export function aggiornaTappa(id, dati) {
  return richiesta(`/api/tappe/${id}`, { method: 'PUT', body: JSON.stringify(dati) })
}

// --- Giorni ---

export function creaGiorno(tappaId, dati) {
  return richiesta(`/api/tappe/${tappaId}/giorni`, { method: 'POST', body: JSON.stringify(dati) })
}

export function eliminaGiorno(id) {
  return richiesta(`/api/giorni/${id}`, { method: 'DELETE' })
}

// --- Attività ---

export function creaAttivita(giornoId, dati) {
  return richiesta(`/api/giorni/${giornoId}/attivita`, { method: 'POST', body: JSON.stringify(dati) })
}

export function modificaAttivita(id, dati) {
  return richiesta(`/api/attivita/${id}`, { method: 'PUT', body: JSON.stringify(dati) })
}

export function eliminaAttivita(id) {
  return richiesta(`/api/attivita/${id}`, { method: 'DELETE' })
}