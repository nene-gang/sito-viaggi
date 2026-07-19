// Frontend e backend sono ora sullo stesso dominio (Pages Functions),
// quindi le chiamate usano percorsi relativi: niente più URL assoluto
// verso workers.dev, e il cookie di sessione viaggia come "prima parte".
async function richiesta(percorso, opzioni = {}) {
  const res = await fetch(percorso, {
    credentials: 'same-origin',
    ...opzioni,
    headers: opzioni.body ? { 'Content-Type': 'application/json', ...opzioni.headers } : opzioni.headers,
  })
  if (!res.ok) throw new Error(`Errore ${res.status}`)
  return res.json()
}

// --- Autenticazione ---

export function urlLogin() {
  return '/api/auth/login'
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

// --- Utenti e amicizie ---

export function fetchUtenti() {
  return richiesta('/api/utenti')
}

export function fetchAmicizie() {
  return richiesta('/api/amicizie')
}

export function inviaRichiestaAmicizia(destinatario_id) {
  return richiesta('/api/amicizie', { method: 'POST', body: JSON.stringify({ destinatario_id }) })
}

export function rispondiRichiestaAmicizia(id, azione) {
  return richiesta(`/api/amicizie/${id}`, { method: 'PUT', body: JSON.stringify({ azione }) })
}

export function rimuoviAmicizia(id) {
  return richiesta(`/api/amicizie/${id}`, { method: 'DELETE' })
}

// --- Wandex ---

export function fetchWandexCatalogo() {
  return richiesta('/api/wandex/catalogo')
}

export function fetchWandex() {
  return richiesta('/api/wandex')
}

export function fetchWandexAmico(utenteId) {
  return richiesta(`/api/wandex/amico/${utenteId}`)
}

export function toggleWandex(categoria, chiave) {
  return richiesta('/api/wandex', { method: 'POST', body: JSON.stringify({ categoria, chiave }) })
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