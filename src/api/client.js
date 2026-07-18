const BASE_URL = 'https://sito-viaggi-worker.elena-gallarate.workers.dev'

export async function fetchViagggi() {
  const res = await fetch(`${BASE_URL}/api/viaggi`)
  if (!res.ok) throw new Error(`Errore ${res.status}`)
  return res.json()
}

export async function fetchViaggio(id) {
  const res = await fetch(`${BASE_URL}/api/viaggi/${id}`)
  if (!res.ok) throw new Error(`Errore ${res.status}`)
  return res.json()
}

export async function aggiornaChecklist(voceId, completata) {
  const res = await fetch(`${BASE_URL}/api/checklist/${voceId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ completata }),
  })
  if (!res.ok) throw new Error(`Errore ${res.status}`)
  return res.json()
}
export async function creaViaggio(dati) {
  const res = await fetch(`${BASE_URL}/api/viaggi`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dati),
  })
  if (!res.ok) throw new Error(`Errore ${res.status}`)
  return res.json()
}

export async function modificaViaggio(id, dati) {
  const res = await fetch(`${BASE_URL}/api/viaggi/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dati),
  })
  if (!res.ok) throw new Error(`Errore ${res.status}`)
  return res.json()
}

export async function eliminaViaggio(id) {
  const res = await fetch(`${BASE_URL}/api/viaggi/${id}`, {
    method: 'DELETE',
  })
  if (!res.ok) throw new Error(`Errore ${res.status}`)
  return res.json()
}

export async function aggiornaTappa(id, dati) {
  const res = await fetch(`${BASE_URL}/api/tappe/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dati),
  })
  if (!res.ok) throw new Error(`Errore ${res.status}`)
  return res.json()
}

export async function creaGiorno(tappaId, dati) {
  const res = await fetch(`${BASE_URL}/api/tappe/${tappaId}/giorni`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dati),
  })
  if (!res.ok) throw new Error(`Errore ${res.status}`)
  return res.json()
}

export async function eliminaGiorno(id) {
  const res = await fetch(`${BASE_URL}/api/giorni/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error(`Errore ${res.status}`)
  return res.json()
}

export async function creaAttivita(giornoId, dati) {
  const res = await fetch(`${BASE_URL}/api/giorni/${giornoId}/attivita`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dati),
  })
  if (!res.ok) throw new Error(`Errore ${res.status}`)
  return res.json()
}

export async function modificaAttivita(id, dati) {
  const res = await fetch(`${BASE_URL}/api/attivita/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dati),
  })
  if (!res.ok) throw new Error(`Errore ${res.status}`)
  return res.json()
}

export async function eliminaAttivita(id) {
  const res = await fetch(`${BASE_URL}/api/attivita/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error(`Errore ${res.status}`)
  return res.json()
}