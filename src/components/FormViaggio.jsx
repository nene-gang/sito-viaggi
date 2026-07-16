import { useState, useEffect } from 'react'
import { creaViaggio, modificaViaggio, eliminaViaggio } from '../api/client'
import { STATI_VIAGGIO } from '../utils/stato'

const HOTEL_VUOTO = { nome: '', lat: '', lng: '', indirizzo: '', link: '', link_prenotazione: '', costo: '', prenotazione: '', note: '' }

const TAPPA_VUOTA = { nome: '', lat: '', lng: '', paese_iso: '', ordine: 1, data_arrivo: '', data_partenza: '', notti: '', hotel: { ...HOTEL_VUOTO } }

// Calcola le notti tra due date (YYYY-MM-DD). Torna '' se mancano dati o l'intervallo non è valido.
function calcolaNotti(arrivo, partenza) {
  if (!arrivo || !partenza) return ''
  const diff = Math.round((new Date(partenza) - new Date(arrivo)) / 86400000)
  return diff >= 0 ? diff : ''
}

// Somma un numero di notti a una data (YYYY-MM-DD), tornando la nuova data nello stesso formato.
function sommaGiorni(data, notti) {
  if (!data || notti === '' || notti === null || isNaN(notti)) return ''
  const d = new Date(data)
  d.setDate(d.getDate() + Number(notti))
  return d.toISOString().slice(0, 10)
}

// Confronta la partenza di una tappa con l'arrivo della successiva.
// Torna un numero di giorni: positivo = buco, negativo = sovrapposizione, null = nessuna incongruenza (o dati mancanti).
function calcolaScarto(precedente, attuale) {
  if (!precedente?.data_partenza || !attuale?.data_arrivo) return null
  const diff = Math.round((new Date(attuale.data_arrivo) - new Date(precedente.data_partenza)) / 86400000)
  return diff === 0 ? null : diff
}

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

// Prova a estrarre lat/lng da un link Google Maps del tipo ".../@45.464,9.19,17z..."
// Se il link non contiene quel pattern, restituisce null e si salva comunque solo il link.
function estraiCoordDaLink(link) {
  const match = link.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
  return match ? { lat: parseFloat(match[1]), lng: parseFloat(match[2]) } : null
}

function AlloggioTappa({ hotel, onCambia }) {
  const [espanso, setEspanso]     = useState(false)
  const [linkInput, setLinkInput] = useState('')

  function aggiorna(campo, valore) {
    onCambia({ ...hotel, [campo]: valore })
  }

  function daRicerca(datiLuogo) {
    onCambia({
      ...hotel,
      nome: datiLuogo.nome,
      lat: datiLuogo.lat,
      lng: datiLuogo.lng,
      indirizzo: datiLuogo.indirizzo || hotel.indirizzo,
    })
  }

  function usaLink() {
    if (!linkInput.trim()) return
    const coord = estraiCoordDaLink(linkInput)
    onCambia({
      ...hotel,
      link: linkInput.trim(),
      ...(coord || {}),
    })
    setLinkInput('')
  }

  function rimuovi() {
    onCambia({ ...HOTEL_VUOTO })
    setEspanso(false)
  }

  const haHotel = !!(hotel?.nome || hotel?.link)

  return (
    <div className="form-viaggio__alloggio">
      <button
        type="button"
        className="form-viaggio__alloggio-toggle"
        onClick={() => setEspanso(e => !e)}
      >
        <span>🏨 {haHotel ? (hotel.nome || 'Alloggio (via link)') : 'Aggiungi alloggio'}</span>
        <span>{espanso ? '▲' : '▼'}</span>
      </button>

      {espanso && (
        <div className="form-viaggio__alloggio-corpo">
          <RicercaLuogo onSeleziona={daRicerca} />

          <div className="form-viaggio__riga-link">
            <input
              className="form-viaggio__input"
              placeholder="...oppure incolla un link Google Maps"
              value={linkInput}
              onChange={e => setLinkInput(e.target.value)}
            />
            <button type="button" onClick={usaLink} disabled={!linkInput.trim()}>Usa</button>
          </div>

          {haHotel && (
            <>
              <input
                className="form-viaggio__input"
                placeholder="Nome alloggio"
                value={hotel.nome || ''}
                onChange={e => aggiorna('nome', e.target.value)}
              />
              <input
                className="form-viaggio__input"
                placeholder="Indirizzo"
                value={hotel.indirizzo || ''}
                onChange={e => aggiorna('indirizzo', e.target.value)}
              />
              <div className="form-viaggio__riga">
                <input
                  className="form-viaggio__input"
                  placeholder="Costo (es. 80€/notte)"
                  value={hotel.costo || ''}
                  onChange={e => aggiorna('costo', e.target.value)}
                />
                <input
                  className="form-viaggio__input"
                  placeholder="Codice prenotazione"
                  value={hotel.prenotazione || ''}
                  onChange={e => aggiorna('prenotazione', e.target.value)}
                />
              </div>
              <input
                className="form-viaggio__input"
                placeholder="Link prenotazione (Booking, Trip.com...)"
                value={hotel.link_prenotazione || ''}
                onChange={e => aggiorna('link_prenotazione', e.target.value)}
              />
              <textarea
                className="form-viaggio__textarea"
                placeholder="Note (check-in, colazione...)"
                rows={2}
                value={hotel.note || ''}
                onChange={e => aggiorna('note', e.target.value)}
              />
              <button type="button" className="form-viaggio__alloggio-rimuovi" onClick={rimuovi}>
                Rimuovi alloggio
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

function FormViaggio({ viaggio, onSalvato, onAnnulla, onEliminato }) {
  const [titolo,      setTitolo]      = useState(viaggio?.titolo      || '')
  const [stato,       setStato]       = useState(viaggio?.stato       || 'bozza')
  const [dataInizio,  setDataInizio]  = useState(viaggio?.data_inizio || '')
  const [dataFine,    setDataFine]    = useState(viaggio?.data_fine   || '')
  const [descrizione, setDescrizione] = useState(viaggio?.descrizione || '')
  const [tappe,       setTappe]       = useState(
    viaggio?.tappe?.map(t => ({ ...t })) || []
  )
  const [salvando,    setSalvando]    = useState(false)
  const [eliminando,  setEliminando]  = useState(false)
  const [errore,      setErrore]      = useState(null)

  function aggiungiTappa(datiLuogo) {
    setTappe(prev => {
      const precedente = prev[prev.length - 1]
      // Precompila l'arrivo: dall'inizio del viaggio per la prima tappa,
      // dalla partenza della tappa precedente per le successive.
      const dataArrivo = precedente?.data_partenza || (prev.length === 0 ? dataInizio : '')
      return [
        ...prev,
        {
          ...TAPPA_VUOTA,
          ...datiLuogo,
          ordine: prev.length + 1,
          data_arrivo: dataArrivo,
        }
      ]
    })
  }

  function aggiornaTappa(indice, campo, valore) {
    setTappe(prev => prev.map((t, i) => i === indice ? { ...t, [campo]: valore } : t))
  }

  // Aggiorna arrivo/notti/partenza di una tappa, ricalcolando il campo
  // dipendente: arrivo+notti → partenza, arrivo+partenza → notti, notti (con arrivo già noto) → partenza.
  function aggiornaDate(indice, campo, valore) {
    setTappe(prev => prev.map((t, i) => {
      if (i !== indice) return t
      const nuova = { ...t, [campo]: valore }

      if (campo === 'data_arrivo') {
        if (nuova.notti !== '') {
          nuova.data_partenza = sommaGiorni(nuova.data_arrivo, nuova.notti)
        } else if (nuova.data_partenza) {
          nuova.notti = calcolaNotti(nuova.data_arrivo, nuova.data_partenza)
        }
      } else if (campo === 'data_partenza') {
        nuova.notti = calcolaNotti(nuova.data_arrivo, nuova.data_partenza)
      } else if (campo === 'notti') {
        if (nuova.data_arrivo) {
          nuova.data_partenza = sommaGiorni(nuova.data_arrivo, nuova.notti)
        }
      }

      return nuova
    }))
  }

  // Propaga la partenza della tappa `indice` come arrivo di tutte le successive,
  // a catena, preservando le notti già impostate su ciascuna (o ricalcolandole
  // se ha già una partenza fissata a mano).
  function propagaDate(indice) {
    setTappe(prev => {
      const nuove = [...prev]
      for (let i = indice; i < nuove.length - 1; i++) {
        const attuale = nuove[i]
        if (!attuale.data_partenza) break // senza una partenza nota non possiamo propagare oltre

        const successiva = nuove[i + 1]
        const nuovoArrivo = attuale.data_partenza
        const nuovaPartenza = successiva.notti !== ''
          ? sommaGiorni(nuovoArrivo, successiva.notti)
          : successiva.data_partenza

        nuove[i + 1] = {
          ...successiva,
          data_arrivo: nuovoArrivo,
          data_partenza: nuovaPartenza,
          notti: successiva.notti !== '' ? successiva.notti : calcolaNotti(nuovoArrivo, nuovaPartenza),
        }
      }
      return nuove
    })
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

  async function elimina() {
    if (!viaggio?.id) return
    if (!window.confirm(`Eliminare definitivamente "${titolo}"? Verranno cancellate anche tutte le tappe, i giorni e la checklist. L'operazione non è reversibile.`)) {
      return
    }

    setEliminando(true)
    setErrore(null)

    try {
      await eliminaViaggio(viaggio.id)
      onEliminato(viaggio.id)
    } catch (err) {
      setErrore(err.message)
    } finally {
      setEliminando(false)
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
          {STATI_VIAGGIO.map(s => (
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
            {tappe.map((tappa, i) => {
              const scarto = i > 0 ? calcolaScarto(tappe[i - 1], tappa) : null
              return (
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
                    className="form-viaggio__input form-viaggio__input--coord form-viaggio__input--bloccato"
                    value={tappa.lat}
                    readOnly
                    title="Coordinata presa dalla ricerca del luogo, non modificabile"
                    placeholder="Lat"
                  />
                  <input
                    className="form-viaggio__input form-viaggio__input--coord form-viaggio__input--bloccato"
                    value={tappa.lng}
                    readOnly
                    title="Coordinata presa dalla ricerca del luogo, non modificabile"
                    placeholder="Lng"
                  />
                  <input
                    className="form-viaggio__input form-viaggio__input--iso"
                    value={tappa.paese_iso}
                    onChange={e => aggiornaTappa(i, 'paese_iso', e.target.value)}
                    placeholder="ISO (es. JP)"
                  />
                </div>
                {i > 0 && scarto !== null && (
                  <p className={`form-viaggio__scarto ${scarto > 0 ? 'form-viaggio__scarto--buco' : 'form-viaggio__scarto--sovrapposizione'}`}>
                    {scarto > 0
                      ? `⚠ Buco di ${scarto} giorni rispetto alla tappa precedente`
                      : `⚠ Sovrapposizione di ${Math.abs(scarto)} giorni con la tappa precedente`}
                  </p>
                )}
                <div className="form-viaggio__tappa-date">
                  <div className="form-viaggio__tappa-campo">
                    <label className="form-viaggio__label form-viaggio__label--small">Arrivo</label>
                    <input
                      className="form-viaggio__input"
                      type="date"
                      value={tappa.data_arrivo}
                      onChange={e => aggiornaDate(i, 'data_arrivo', e.target.value)}
                    />
                  </div>
                  <div className="form-viaggio__tappa-campo">
                    <label className="form-viaggio__label form-viaggio__label--small">Notti</label>
                    <input
                      className="form-viaggio__input"
                      type="number"
                      min="0"
                      value={tappa.notti}
                      onChange={e => aggiornaDate(i, 'notti', e.target.value)}
                    />
                  </div>
                  <div className="form-viaggio__tappa-campo">
                    <label className="form-viaggio__label form-viaggio__label--small">Partenza</label>
                    <input
                      className="form-viaggio__input"
                      type="date"
                      value={tappa.data_partenza}
                      onChange={e => aggiornaDate(i, 'data_partenza', e.target.value)}
                    />
                  </div>
                  {i < tappe.length - 1 && (
                    <button
                      type="button"
                      className="form-viaggio__propaga-btn"
                      onClick={() => propagaDate(i)}
                      disabled={!tappa.data_partenza}
                      title="Applica questa partenza come arrivo delle tappe successive, a catena"
                    >
                      ⇥ Applica alle successive
                    </button>
                  )}
                </div>

                <AlloggioTappa
                  hotel={tappa.hotel || HOTEL_VUOTO}
                  onCambia={nuovoHotel => aggiornaTappa(i, 'hotel', nuovoHotel)}
                />
              </div>
              )
            })}
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
        {viaggio?.id && (
          <button
            className="form-viaggio__btn form-viaggio__btn--elimina"
            onClick={elimina}
            disabled={salvando || eliminando}
          >
            {eliminando ? 'Eliminazione...' : 'Elimina viaggio'}
          </button>
        )}
        <button
          className="form-viaggio__btn form-viaggio__btn--annulla"
          onClick={onAnnulla}
          disabled={salvando || eliminando}
        >
          Annulla
        </button>
        <button
          className="form-viaggio__btn form-viaggio__btn--salva"
          onClick={salva}
          disabled={salvando || eliminando}
        >
          {salvando ? 'Salvataggio...' : 'Salva'}
        </button>
      </div>
    </div>
  )
}

export default FormViaggio