import { useState } from 'react'

function RicercaLuogo({ onSeleziona }) {
  const [query, setQuery]         = useState('')
  const [risultati, setRisultati] = useState([])
  const [cercando, setCercando]   = useState(false)

  async function cerca() {
    if (!query.trim()) return
    setCercando(true)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1`,
        { headers: { 'Accept-Language': 'it' } }
      )
      const dati = await res.json()
      setRisultati(dati)
    } finally {
      setCercando(false)
    }
  }

  function seleziona(r) {
    // Estrae il codice ISO del paese dai dettagli di Nominatim
    const paeseIso = r.address?.country_code?.toUpperCase() || ''
    onSeleziona({
      nome: r.display_name.split(',')[0].trim(),
      lat:  parseFloat(r.lat),
      lng:  parseFloat(r.lon),
      paese_iso: paeseIso,
      indirizzo: r.display_name,
    })
    setQuery('')
    setRisultati([])
  }

  return (
    <div className="ricerca-luogo">
      <div className="ricerca-luogo__riga">
        <input
          className="ricerca-luogo__input"
          placeholder="Cerca città o luogo..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && cerca()}
        />
        <button
          className="ricerca-luogo__btn"
          onClick={cerca}
          disabled={cercando}
        >
          {cercando ? '...' : '🔍'}
        </button>
      </div>
      {risultati.length > 0 && (
        <ul className="ricerca-luogo__risultati">
          {risultati.map(r => (
            <li key={r.place_id}>
              <button
                className="ricerca-luogo__risultato"
                onClick={() => seleziona(r)}
              >
                {r.display_name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default RicercaLuogo