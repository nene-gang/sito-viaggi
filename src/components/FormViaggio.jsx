import { useState, useEffect } from 'react'
import { creaViaggio, modificaViaggio } from '../api/client'

const STATI = [
  { valore: 'futuro',   label: 'In programma' },
  { valore: 'passato',  label: 'Completato' },
]

const TAPPA_VUOTA = { nome: '', lat: '', lng: '', paese_iso: '', ordine: 1 }

function RicercaLuogo({ onSeleziona }) {
  const [query, setQuery]       = useState('')
  const [risultati, setRisultati] = useState([])
  const [cercando, setCercando] = useState(false)

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

function FormViaggio({ viaggio, onSalvato, onAnnulla }) {
  const [titolo,      setTitolo]      = useState(viaggio?.titolo      || '')
  const [stato,       setStato]       = useState(viaggio?.stato       || 'futuro')
  const [dataInizio,  setDataInizio]  = useState(viaggio?.data_inizio || '')
  const [dataFine,    setDataFine]    = useState(viaggio?.data_fine   || '')
  const [descrizione, setDescrizione] = useState(viaggio?.descrizione || '')
  const [tappe,       setTappe]       = useState(
    viaggio?.tappe?.map(t => ({ ...t })) || []
  )
  const [salvando,    setSalvando]    = useState(false)
  const [errore,      setErrore]      = useState(null)

  function aggiungiTappa(datiLuogo) {
    setTappe(prev => [
      ...prev,
      {
        ...TAPPA_VUOTA,
        ...datiLuogo,
        ordine: prev.length + 1,
      }
    ])
  }

  function aggiornaTappa(indice, campo, valore) {
    setTappe(prev => prev.map((t, i) => i === indice ? { ...t, [campo]: valore } : t))
  }

  function rimuoviTappa(indice) {
    setTappe(prev =>
      prev
        .filter((_, i) => i !== indice)
        .map((t, i) => ({ ...t, ordine: i + 1 }))
    )
  }

  function spostaTappa(indice, direzione) {
    const nuove = [...tappe]
    const swap = indice + direzione
    if (swap < 0 || swap >= nuove.length) return
    ;[nuove[indice], nuove[swap]] = [nuove[swap], nuove[indice]]
    setTappe(nuove.map((t, i) => ({ ...t, ordine: i + 1 })))
  }

  async function salva() {
    if (!titolo.trim()) { setErrore('Il titolo è obbligatorio'); return }

    setSalvando(true)
    setErrore(null)

    const dati = { titolo, stato, data_inizio: dataInizio, data_fine: dataFine, descrizione, tappe }

    try {
      if (viaggio?.id) {
        await modificaViaggio(viaggio.id, dati)
      } else {
        await creaViaggio(dati)
      }
      onSalvato()
    } catch (err) {
      setErrore(err.message)
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="form-viaggio">
      <h2 className="form-viaggio__titolo">
        {viaggio?.id ? 'Modifica viaggio' : 'Nuovo viaggio'}
      </h2>

      {errore && <p className="form-viaggio__errore">{errore}</p>}

      <div className="form-viaggio__sezione">
        <label className="form-viaggio__label">Titolo *</label>
        <input
          className="form-viaggio__input"
          value={titolo}
          onChange={e => setTitolo(e.target.value)}
          placeholder="Es. Giappone 2027"
        />
      </div>

      <div className="form-viaggio__sezione">
        <label className="form-viaggio__label">Stato</label>
        <select
          className="form-viaggio__select"
          value={stato}
          onChange={e => setStato(e.target.value)}
        >
          {STATI.map(s => (
            <option key={s.valore} value={s.valore}>{s.label}</option>
          ))}
        </select>
      </div>

      <div className="form-viaggio__riga">
        <div className="form-viaggio__sezione">
          <label className="form-viaggio__label">Data inizio</label>
          <input
            className="form-viaggio__input"
            type="date"
            value={dataInizio}
            onChange={e => setDataInizio(e.target.value)}
          />
        </div>
        <div className="form-viaggio__sezione">
          <label className="form-viaggio__label">Data fine</label>
          <input
            className="form-viaggio__input"
            type="date"
            value={dataFine}
            onChange={e => setDataFine(e.target.value)}
          />
        </div>
      </div>

      <div className="form-viaggio__sezione">
        <label className="form-viaggio__label">Descrizione</label>
        <textarea
          className="form-viaggio__textarea"
          value={descrizione}
          onChange={e => setDescrizione(e.target.value)}
          rows={3}
          placeholder="Note sul viaggio..."
        />
      </div>

      {/* Tappe */}
      <div className="form-viaggio__sezione">
        <label className="form-viaggio__label">Tappe</label>

        {tappe.length > 0 && (
          <div className="form-viaggio__tappe">
            {tappe.map((tappa, i) => (
              <div key={i} className="form-viaggio__tappa">
                <div className="form-viaggio__tappa-header">
                  <span className="form-viaggio__tappa-num">{i + 1}</span>
                  <input
                    className="form-viaggio__input form-viaggio__input--nome"
                    value={tappa.nome}
                    onChange={e => aggiornaTappa(i, 'nome', e.target.value)}
                    placeholder="Nome tappa"
                  />
                  <div className="form-viaggio__tappa-azioni">
                    <button onClick={() => spostaTappa(i, -1)} disabled={i === 0} title="Sposta su">↑</button>
                    <button onClick={() => spostaTappa(i, 1)} disabled={i === tappe.length - 1} title="Sposta giù">↓</button>
                    <button onClick={() => rimuoviTappa(i)} title="Rimuovi" className="form-viaggio__tappa-rimuovi">✕</button>
                  </div>
                </div>
                <div className="form-viaggio__tappa-coords">
                  <input
                    className="form-viaggio__input form-viaggio__input--coord"
                    value={tappa.lat}
                    onChange={e => aggiornaTappa(i, 'lat', e.target.value)}
                    placeholder="Lat"
                  />
                  <input
                    className="form-viaggio__input form-viaggio__input--coord"
                    value={tappa.lng}
                    onChange={e => aggiornaTappa(i, 'lng', e.target.value)}
                    placeholder="Lng"
                  />
                  <input
                    className="form-viaggio__input form-viaggio__input--iso"
                    value={tappa.paese_iso}
                    onChange={e => aggiornaTappa(i, 'paese_iso', e.target.value)}
                    placeholder="ISO (es. JP)"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="form-viaggio__aggiungi-tappa">
          <p className="form-viaggio__label form-viaggio__label--small">
            Cerca un luogo per aggiungere una tappa:
          </p>
          <RicercaLuogo onSeleziona={aggiungiTappa} />
        </div>
      </div>

      {/* Bottoni */}
      <div className="form-viaggio__bottoni">
        <button
          className="form-viaggio__btn form-viaggio__btn--annulla"
          onClick={onAnnulla}
          disabled={salvando}
        >
          Annulla
        </button>
        <button
          className="form-viaggio__btn form-viaggio__btn--salva"
          onClick={salva}
          disabled={salvando}
        >
          {salvando ? 'Salvataggio...' : 'Salva'}
        </button>
      </div>
    </div>
  )
}

export default FormViaggio