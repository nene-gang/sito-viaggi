import { useRef, useState } from 'react'
import { creaViaggio } from '../api/client'
import PannelloFonte from './PannelloFonte'
import { fondiProposta, periodoDaTappe } from '../utils/fusioneFonti'
import './ChatNuovoViaggio.css'

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
  const [avvisi, setAvvisi] = useState([])
  const [bozza, setBozza] = useState(null)
  const [fonti, setFonti] = useState(0)
  const [geo, setGeo] = useState({})       // id tappa -> { stato, candidati }
  const [errore, setErrore] = useState(null)
  const [salvando, setSalvando] = useState(false)

  // Id stabile per tappa: gli indici cambiano quando si riordina dopo una
  // fusione, e lo stato del geocoding resterebbe agganciato alla tappa sbagliata.
  const contatoreId = useRef(0)
  const nuovoId = () => `t${++contatoreId.current}`

  // La chat si chiude solo dalla ✕, e se c'è del lavoro in corso chiede conferma.
  function chiediChiusura() {
    if (bozza && !window.confirm('Chiudere senza salvare? Quello che hai inserito andrà perso.')) return
    onChiudi()
  }

  function scegli(opzione, etichetta) {
    setSceltaUtente(etichetta)
    if (opzione === 'prenotazioni') setFase('incolla')
    else if (opzione === 'idea') setFase('idea')
    else onFormClassico()
  }

  // --- Arrivo di una nuova fonte ------------------------------------------

  function applicaFonte(proposta, avvisiServer) {
    const esito = fondiProposta(bozza?.tappe || [], proposta, { nuovoId })
    const tratte = [...(bozza?.tratte || [])]

    for (const nt of proposta.tratte || []) {
      const gia = tratte.some(t =>
        (t.da || '') === (nt.da || '') && (t.a || '') === (nt.a || '') && (t.data || '') === (nt.data || '')
      )
      if (!gia) tratte.push(nt)
    }

    const periodo = periodoDaTappe(esito.tappe, tratte)

    setBozza({
      titolo: bozza?.titolo || proposta.titolo || titoloDaTappe(esito.tappe),
      data_inizio: periodo.inizio || bozza?.data_inizio || '',
      data_fine: periodo.fine || bozza?.data_fine || '',
      descrizione: bozza?.descrizione || proposta.descrizione || '',
      tappe: esito.tappe,
      tratte,
    })
    setAvvisi([...avvisiServer, ...esito.avvisi])
    setFonti(n => n + 1)
    setFase('anteprima')
    geocodificaMancanti(esito.tappe)
  }

  // --- Coordinate: mai dal modello, sempre dal geocoder -------------------

  async function geocodificaMancanti(tappe) {
    const daFare = tappe.filter(t => !t.lat)
    for (let i = 0; i < daFare.length; i++) {
      if (i > 0) await attendi(1100)
      const t = daFare[i]
      await cercaLuogo(t._id, `${t.nome}${t.paese ? ', ' + t.paese : ''}`)
    }
  }

  async function cercaLuogo(id, query) {
    setGeo(g => ({ ...g, [id]: { stato: 'cerca', candidati: [] } }))
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1`,
        { headers: { 'Accept-Language': 'it' } }
      )
      const risultati = await res.json()
      if (!risultati.length) {
        setGeo(g => ({ ...g, [id]: { stato: 'nessuno', candidati: [] } }))
        return
      }
      setGeo(g => ({ ...g, [id]: { stato: 'ok', candidati: risultati } }))
      applicaLuogo(id, risultati[0])
    } catch {
      setGeo(g => ({ ...g, [id]: { stato: 'nessuno', candidati: [] } }))
    }
  }

  function applicaLuogo(id, risultato) {
    setBozza(b => ({
      ...b,
      tappe: b.tappe.map(t => t._id === id ? {
        ...t,
        lat: parseFloat(risultato.lat),
        lng: parseFloat(risultato.lon),
        paese_iso: (risultato.address?.country_code || '').toUpperCase(),
      } : t),
    }))
  }

  function aggiornaTappa(id, campo, valore) {
    setBozza(b => ({
      ...b,
      tappe: b.tappe.map(t => t._id === id ? { ...t, [campo]: valore } : t),
    }))
  }

  function rimuoviTappa(id) {
    setBozza(b => ({ ...b, tappe: b.tappe.filter(t => t._id !== id) }))
  }

  // --- Salvataggio come bozza --------------------------------------------

  async function salva() {
    setSalvando(true)
    setErrore(null)
    try {
      const res = await creaViaggio({
        titolo: bozza.titolo || titoloDaTappe(bozza.tappe),
        stato: 'bozza',
        data_inizio: bozza.data_inizio || null,
        data_fine: bozza.data_fine || null,
        descrizione: bozza.descrizione || null,
        // Solo i campi che il database si aspetta: _id, novita, incerta e paese
        // sono di servizio e restano nella chat.
        tappe: bozza.tappe.map((t, i) => ({
          nome: t.nome,
          lat: t.lat || null,
          lng: t.lng || null,
          paese_iso: t.paese_iso || null,
          ordine: i + 1,
          notti: t.notti === '' ? null : t.notti,
          data_arrivo: t.data_arrivo || null,
          data_partenza: t.data_partenza || null,
          hotel: t.hotel || {},
          trasporto_arrivo: t.trasporto_arrivo || null,
          trasporto_partenza: t.trasporto_partenza || null,
        })),
      })
      onCreato(res.id)
    } catch (e) {
      setErrore(e.message || 'Salvataggio non riuscito')
      setSalvando(false)
    }
  }

  const senzaCoordinate = bozza ? bozza.tappe.filter(t => !t.lat).length : 0

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
        {fase === 'incolla' && (
          <>
            <div className="bolla bolla--sistema">
              {fonti === 0
                ? 'Incolla qui il testo: una mail di conferma, un itinerario, i tuoi appunti. Va bene anche disordinato.'
                : `Incolla la fonte numero ${fonti + 1}: un'altra mail, un hotel, un treno. La aggiungo a quello che c'è già.`}
            </div>
            <PannelloFonte
              onProposta={applicaFonte}
              onAnnulla={bozza ? () => setFase('anteprima') : onFormClassico}
              etichettaAnnulla={bozza ? "Torna all'anteprima" : 'Form classico'}
            />
          </>
        )}

        {/* Anteprima */}
        {fase === 'anteprima' && bozza && (
          <>
            <div className="bolla bolla--sistema">
              {fonti === 1
                ? 'Ecco cosa ho capito. Controlla e correggi quello che serve — non salvo niente finché non me lo dici tu.'
                : `Ho unito ${fonti} fonti. Le novità dell'ultima sono evidenziate.`}
            </div>

            {avvisi.length > 0 && (
              <div className="chatnv__avvisi">
                <strong>Da controllare:</strong>
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

              {bozza.tappe.map(tappa => (
                <div
                  key={tappa._id}
                  className={`chatnv__tappa${tappa.incerta ? ' chatnv__tappa--incerta' : ''}${tappa.novita ? ' chatnv__tappa--novita' : ''}`}
                >
                  <div className="chatnv__tappa-testa">
                    <input
                      className="chatnv__tappa-nome"
                      value={tappa.nome}
                      onChange={e => aggiornaTappa(tappa._id, 'nome', e.target.value)}
                    />
                    {tappa.novita && <span className="chatnv__badge">nuovo</span>}
                    <button className="chatnv__rimuovi" onClick={() => rimuoviTappa(tappa._id)}>✕</button>
                  </div>

                  <div className="chatnv__tappa-date">
                    <input
                      type="date"
                      value={tappa.data_arrivo || ''}
                      onChange={e => aggiornaTappa(tappa._id, 'data_arrivo', e.target.value)}
                    />
                    <span>→</span>
                    <input
                      type="date"
                      value={tappa.data_partenza || ''}
                      onChange={e => aggiornaTappa(tappa._id, 'data_partenza', e.target.value)}
                    />
                    <span className="chatnv__notti">{tappa.notti || 0} notti</span>
                  </div>

                  {tappa.hotel?.nome && (
                    <p className="chatnv__alloggio">🏨 {tappa.hotel.nome}</p>
                  )}

                  {/* Conferma del luogo: le coordinate arrivano da qui, non dal modello */}
                  <div className="chatnv__luogo">
                    {geo[tappa._id]?.stato === 'cerca' && <span className="chatnv__luogo-cerca">cerco il luogo…</span>}
                    {geo[tappa._id]?.stato === 'nessuno' && (
                      <>
                        <span className="chatnv__luogo-ko">luogo non trovato</span>
                        <button onClick={() => cercaLuogo(tappa._id, tappa.nome)}>riprova</button>
                      </>
                    )}
                    {geo[tappa._id]?.stato === 'ok' && (
                      <select
                        value={geo[tappa._id].candidati.findIndex(c => parseFloat(c.lat) === tappa.lat)}
                        onChange={e => applicaLuogo(tappa._id, geo[tappa._id].candidati[Number(e.target.value)])}
                      >
                        {geo[tappa._id].candidati.map((c, k) => (
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
                  onClick={() => { setErrore(null); setFase('incolla') }}
                  disabled={salvando}
                >
                  + Aggiungi un'altra fonte
                </button>
              </div>

              <p className="chatnv__nota">
                {fonti === 1 ? '1 fonte caricata' : `${fonti} fonti caricate`}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default ChatNuovoViaggio
