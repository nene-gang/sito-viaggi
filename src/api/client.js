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