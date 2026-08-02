import { useState } from 'react'
import { creaViaggio } from '../api/client'
import './ChatNuovoViaggio.css'

// I mezzi ammessi da TrasportoTappa. Quello che dice il modello va tradotto
// in uno di questi, altrimenti la tendina del form resta vuota.
const MAPPA_MEZZI = {
  aereo: 'aereo',
  volo: 'aereo',
  treno: 'treno',
  auto: 'auto',
  nave: 'nave',
  traghetto: 'nave',
}

const MESSAGGI_ATTESA = [
  'Sto leggendo il testo…',
  'Cerco date e località…',
  'Ancora un momento…',
]

function titoloDaTappe(tappe) {
  if (!tappe || tappe.length === 0) return 'Nuovo viaggio'
  if (tappe.length === 1) return tappe[0].nome
  if (tappe.length === 2) return `${tappe[0].nome} e ${tappe[1].nome}`
  return `${tappe[0].nome} e altre ${tappe.length - 1} tappe`
}

// Nominatim chiede di non superare una richiesta al secondo.
const attendi = (ms) => new Promise(r => setTimeout(r, ms))

function ChatNuovoViaggio({ onFormClassico, onCreato, onChiudi }) {
  const [fase, setFase] = useState('domanda')
  const [sceltaUtente, setSceltaUtente] = useState(null)
  const [testo, setTesto] = useState('')
  const [avvisi, setAvvisi] = useState([])
  const [bozza, setBozza] = useState(null)
  const [geo, setGeo] = useState({})       // indice tappa -> { stato, candidati }
  const [errore, setErrore] = useState(null)
  const [salvando, setSalvando] = useState(false)
  const [messaggioAttesa, setMessaggioAttesa] = useState(MESSAGGI_ATTESA[0])

  // La chat si chiude solo dalla ✕, e se c'è del lavoro in corso chiede conferma.
  function chiediChiusura() {
    const inCorso = bozza !== null || testo.trim() !== ''
    if (inCorso && !window.confirm('Chiudere senza salvare? Quello che hai inserito andrà perso.')) return
    onChiudi()
  }

  // --- Ramo iniziale ------------------------------------------------------

  function scegli(opzione, etichetta) {
    setSceltaUtente(etichetta)
    if (opzione === 'prenotazioni') setFase('incolla')
    else if (opzione === 'idea') setFase('idea')
    else onFormClassico()
  }

  // --- Analisi del testo --------------------------------------------------

  async function analizza() {
    if (!testo.trim()) return
    setErrore(null)
    setFase('analisi')

    let i = 0
    const timer = setInterval(() => {
      i = (i + 1) % MESSAGGI_ATTESA.length
      setMessaggioAttesa(MESSAGGI_ATTESA[i])
    }, 2500)

    try {
      const res = await fetch('/api/viaggi/proponi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ testo }),
      })
      const dati = await res.json()
      if (!res.ok || !dati.proposta) {
        throw new Error(dati.errore || 'Non sono riuscito a leggere il testo')
      }

      const p = dati.proposta
      const tappe = (p.tappe || []).map(t => ({ ...t, lat: null, lng: null, paese_iso: '' }))

      setAvvisi(dati.avvisi || [])
      setBozza({
        titolo: p.titolo || titoloDaTappe(tappe),
        data_inizio: p.data_inizio || '',
        data_fine: p.data_fine || '',
        descrizione: p.descrizione || '',
        tappe,
        tratte: p.tratte || [],
      })
      setFase('anteprima')
      geocodificaTutte(tappe)
    } catch (e) {
      setErrore(e.message)
      setFase('incolla')
    } finally {
      clearInterval(timer)
    }
  }

  // --- Coordinate: mai dal modello, sempre dal geocoder -------------------

  async function geocodificaTutte(tappe) {
    for (let i = 0; i < tappe.length; i++) {
      if (i > 0) await attendi(1100)
      await cercaLuogo(i, `${tappe[i].nome}${tappe[i].paese ? ', ' + tappe[i].paese : ''}`)
    }
  }

  async function cercaLuogo(indice, query) {
    setGeo(g => ({ ...g, [indice]: { stato: 'cerca', candidati: [] } }))
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1`,
        { headers: { 'Accept-Language': 'it' } }
      )
      const risultati = await res.json()
      if (!risultati.length) {
        setGeo(g => ({ ...g, [indice]: { stato: 'nessuno', candidati: [] } }))
        return
      }
      setGeo(g => ({ ...g, [indice]: { stato: 'ok', candidati: risultati } }))
      applicaLuogo(indice, risultati[0])
    } catch {
      setGeo(g => ({ ...g, [indice]: { stato: 'nessuno', candidati: [] } }))
    }
  }

  function applicaLuogo(indice, risultato) {
    setBozza(b => ({
      ...b,
      tappe: b.tappe.map((t, i) => i === indice ? {
        ...t,
        lat: parseFloat(risultato.lat),
        lng: parseFloat(risultato.lon),
        paese_iso: (risultato.address?.country_code || '').toUpperCase(),
      } : t),
    }))
  }

  function aggiornaTappa(indice, campo, valore) {
    setBozza(b => ({
      ...b,
      tappe: b.tappe.map((t, i) => i === indice ? { ...t, [campo]: valore } : t),
    }))
  }

  function rimuoviTappa(indice) {
    setBozza(b => ({ ...b, tappe: b.tappe.filter((_, i) => i !== indice) }))
  }

  // --- Salvataggio come bozza --------------------------------------------

  // La tratta che arriva in una tappa diventa il suo trasporto_arrivo.
  function trasportoVerso(nomeTappa) {
    const tratta = (bozza.tratte || []).find(
      t => (t.a || '').toLowerCase() === (nomeTappa || '').toLowerCase()
    )
    if (!tratta) return null

    const mezzo = MAPPA_MEZZI[(tratta.mezzo || '').toLowerCase()] || 'altro'
    const dettagli = [
      tratta.da ? `da ${tratta.da}` : '',
      tratta.scali ? `scalo: ${tratta.scali}` : '',
      tratta.riferimento || '',
    ].filter(Boolean).join(' · ')

    return {
      mezzo,
      mezzo_altro: mezzo === 'altro' ? (tratta.mezzo || '') : '',
      dettagli,
      lat: '',
      lng: '',
      link: '',
    }
  }

  async function salva() {
    setSalvando(true)
    setErrore(null)
    try {
      const payload = {
        titolo: bozza.titolo || titoloDaTappe(bozza.tappe),
        stato: 'bozza',
        data_inizio: bozza.data_inizio || null,
        data_fine: bozza.data_fine || null,
        descrizione: bozza.descrizione || null,
        tappe: bozza.tappe.map((t, i) => ({
          nome: t.nome,
          lat: t.lat,
          lng: t.lng,
          paese_iso: t.paese_iso || null,
          ordine: i,
          notti: t.notti || null,
          data_arrivo: t.data_arrivo || null,
          data_partenza: t.data_partenza || null,
          hotel: t.alloggio_nome || t.alloggio_indirizzo ? {
            nome: t.alloggio_nome || '',
            indirizzo: t.alloggio_indirizzo || '',
            prenotazione: t.alloggio_riferimento || '',
          } : {},
          trasporto_arrivo: trasportoVerso(t.nome),
          trasporto_partenza: null,
        })),
      }
      const res = await creaViaggio(payload)
      onCreato(res.id)
    } catch (e) {
      setErrore(e.message || 'Salvataggio non riuscito')
      setSalvando(false)
    }
  }

  const senzaCoordinate = bozza ? bozza.tappe.filter(t => t.lat == null).length : 0

  // --- Render -------------------------------------------------------------

  return (
    <div className="chatnv">
      <button className="chatnv__chiudi" onClick={chiediChiusura}>✕</button>

      <div className="chatnv__flusso">

        <div className="bolla bolla--sistema">
          Ciao! Come vuoi creare questo viaggio?
        </div>

        {fase === 'domanda' && (
          <div className="chatnv__opzioni">
            <button onClick={() => scegli('prenotazioni', 'Ho delle prenotazioni da caricare')}>
              Ho delle prenotazioni da caricare
            </button>
            <button onClick={() => scegli('idea', 'Ho un\'idea ma non ho prenotato niente')}>
              Ho un'idea ma non ho prenotato niente
            </button>
            <button className="chatnv__opzione-secondaria" onClick={() => scegli('classico')}>
              Preferisco il form classico
            </button>
          </div>
        )}

        {sceltaUtente && <div className="bolla bolla--utente">{sceltaUtente}</div>}

        {/* Ramo "ho un'idea": non ancora costruito */}
        {fase === 'idea' && (
          <>
            <div className="bolla bolla--sistema">
              Questa parte non è ancora pronta: presto potrai raccontarmi dove vuoi
              andare e ti proporrò un itinerario. Per ora puoi partire dalle
              prenotazioni o dal form classico.
            </div>
            <div className="chatnv__opzioni">
              <button onClick={() => { setSceltaUtente(null); setFase('domanda') }}>
                Torna indietro
              </button>
              <button className="chatnv__opzione-secondaria" onClick={onFormClassico}>
                Vai al form classico
              </button>
            </div>
          </>
        )}

        {/* Ramo prenotazioni: incolla il testo */}
        {(fase === 'incolla' || fase === 'analisi') && (
          <div className="bolla bolla--sistema">
            Incolla qui il testo: una mail di conferma, un itinerario, i tuoi appunti.
            Va bene anche disordinato.
          </div>
        )}

        {fase === 'incolla' && (
          <div className="chatnv__composer">
            <textarea
              value={testo}
              onChange={e => setTesto(e.target.value)}
              placeholder="Incolla qui…"
              rows={8}
            />
            {errore && <p className="chatnv__errore">{errore}</p>}
            <div className="chatnv__azioni">
              <button className="chatnv__primario" onClick={analizza} disabled={!testo.trim()}>
                Analizza
              </button>
              <button className="chatnv__opzione-secondaria" onClick={onFormClassico}>
                Form classico
              </button>
            </div>
          </div>
        )}

        {fase === 'analisi' && (
          <div className="bolla bolla--sistema chatnv__attesa">
            <span className="chatnv__punti"><i /><i /><i /></span>
            {messaggioAttesa}
          </div>
        )}

        {/* Anteprima */}
        {fase === 'anteprima' && bozza && (
          <>
            <div className="bolla bolla--sistema">
              Ecco cosa ho capito. Controlla e correggi quello che serve —
              non salvo niente finché non me lo dici tu.
            </div>

            {avvisi.length > 0 && (
              <div className="chatnv__avvisi">
                <strong>Ho corretto o scartato alcuni dati:</strong>
                <ul>{avvisi.map((a, i) => <li key={i}>{a}</li>)}</ul>
              </div>
            )}

            <div className="chatnv__anteprima">
              <label className="chatnv__campo">
                <span>Titolo</span>
                <input
                  value={bozza.titolo}
                  onChange={e => setBozza({ ...bozza, titolo: e.target.value })}
                />
              </label>

              <div className="chatnv__date">
                <label className="chatnv__campo">
                  <span>Dal</span>
                  <input
                    type="date"
                    value={bozza.data_inizio}
                    onChange={e => setBozza({ ...bozza, data_inizio: e.target.value })}
                  />
                </label>
                <label className="chatnv__campo">
                  <span>Al</span>
                  <input
                    type="date"
                    value={bozza.data_fine}
                    onChange={e => setBozza({ ...bozza, data_fine: e.target.value })}
                  />
                </label>
              </div>

              <h4 className="chatnv__sezione">Tappe</h4>
              {bozza.tappe.length === 0 && (
                <p className="chatnv__vuoto">Nessuna tappa trovata nel testo.</p>
              )}

              {bozza.tappe.map((tappa, i) => (
                <div key={i} className={`chatnv__tappa${tappa.incerta ? ' chatnv__tappa--incerta' : ''}`}>
                  <div className="chatnv__tappa-testa">
                    <input
                      className="chatnv__tappa-nome"
                      value={tappa.nome}
                      onChange={e => aggiornaTappa(i, 'nome', e.target.value)}
                    />
                    <button className="chatnv__rimuovi" onClick={() => rimuoviTappa(i)}>✕</button>
                  </div>

                  <div className="chatnv__tappa-date">
                    <input
                      type="date"
                      value={tappa.data_arrivo || ''}
                      onChange={e => aggiornaTappa(i, 'data_arrivo', e.target.value)}
                    />
                    <span>→</span>
                    <input
                      type="date"
                      value={tappa.data_partenza || ''}
                      onChange={e => aggiornaTappa(i, 'data_partenza', e.target.value)}
                    />
                    <span className="chatnv__notti">{tappa.notti || 0} notti</span>
                  </div>

                  {tappa.alloggio_nome && (
                    <p className="chatnv__alloggio">🏨 {tappa.alloggio_nome}</p>
                  )}

                  {/* Conferma del luogo: le coordinate arrivano da qui, non dal modello */}
                  <div className="chatnv__luogo">
                    {geo[i]?.stato === 'cerca' && <span className="chatnv__luogo-cerca">cerco il luogo…</span>}
                    {geo[i]?.stato === 'nessuno' && (
                      <>
                        <span className="chatnv__luogo-ko">luogo non trovato</span>
                        <button onClick={() => cercaLuogo(i, tappa.nome)}>riprova</button>
                      </>
                    )}
                    {geo[i]?.stato === 'ok' && (
                      <select
                        value={geo[i].candidati.findIndex(c => parseFloat(c.lat) === tappa.lat)}
                        onChange={e => applicaLuogo(i, geo[i].candidati[Number(e.target.value)])}
                      >
                        {geo[i].candidati.map((c, k) => (
                          <option key={k} value={k}>{c.display_name}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              ))}

              {bozza.tratte.length > 0 && (
                <>
                  <h4 className="chatnv__sezione">Spostamenti</h4>
                  {bozza.tratte.map((t, i) => (
                    <p key={i} className="chatnv__tratta">
                      {t.da} → {t.a}
                      {t.scali ? ` (scalo: ${t.scali})` : ''}
                      {t.data ? ` · ${t.data}` : ''}
                      {t.riferimento ? ` · ${t.riferimento}` : ''}
                    </p>
                  ))}
                </>
              )}

              {senzaCoordinate > 0 && (
                <p className="chatnv__nota">
                  {senzaCoordinate} {senzaCoordinate === 1 ? 'tappa non ha' : 'tappe non hanno'} ancora
                  le coordinate: {senzaCoordinate === 1 ? 'non comparirà' : 'non compariranno'} sulla mappa
                  finché non le sistemi.
                </p>
              )}

              {errore && <p className="chatnv__errore">{errore}</p>}

              <div className="chatnv__azioni">
                <button className="chatnv__primario" onClick={salva} disabled={salvando}>
                  {salvando ? 'Salvo…' : 'Crea bozza'}
                </button>
                <button
                  className="chatnv__opzione-secondaria"
                  onClick={() => { setFase('incolla'); setBozza(null); setAvvisi([]) }}
                  disabled={salvando}
                >
                  Ricomincia
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default ChatNuovoViaggio
