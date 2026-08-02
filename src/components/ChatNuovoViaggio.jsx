import { useRef, useState } from 'react'
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

// Campi di una tappa che una fonte successiva può riempire se sono vuoti.
const CAMPI_UNIBILI = [
  'paese', 'data_arrivo', 'data_partenza',
  'alloggio_nome', 'alloggio_indirizzo', 'alloggio_riferimento',
]

const ETICHETTE = {
  paese: 'paese',
  data_arrivo: 'data di arrivo',
  data_partenza: 'data di partenza',
  alloggio_nome: 'alloggio',
  alloggio_indirizzo: 'indirizzo alloggio',
  alloggio_riferimento: 'riferimento alloggio',
}

function titoloDaTappe(tappe) {
  if (!tappe || tappe.length === 0) return 'Nuovo viaggio'
  if (tappe.length === 1) return tappe[0].nome
  if (tappe.length === 2) return `${tappe[0].nome} e ${tappe[1].nome}`
  return `${tappe[0].nome} e altre ${tappe.length - 1} tappe`
}

// Confronto tra nomi di località: senza accenti, maiuscole e spazi doppi.
function chiaveNome(s) {
  return String(s || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().trim().replace(/\s+/g, ' ')
}

function giorniTra(a, b) {
  return Math.round((Date.parse(b) - Date.parse(a)) / 86400000)
}

// Nominatim chiede di non superare una richiesta al secondo.
const attendi = (ms) => new Promise(r => setTimeout(r, ms))

function ChatNuovoViaggio({ onFormClassico, onCreato, onChiudi }) {
  const [fase, setFase] = useState('domanda')
  const [sceltaUtente, setSceltaUtente] = useState(null)
  const [testo, setTesto] = useState('')
  const [avvisi, setAvvisi] = useState([])
  const [bozza, setBozza] = useState(null)
  const [fonti, setFonti] = useState(0)
  const [geo, setGeo] = useState({})       // id tappa -> { stato, candidati }
  const [errore, setErrore] = useState(null)
  const [salvando, setSalvando] = useState(false)
  const [messaggioAttesa, setMessaggioAttesa] = useState(MESSAGGI_ATTESA[0])

  // Id stabile per tappa: gli indici cambiano quando si riordina dopo una
  // fusione, e lo stato del geocoding resterebbe agganciato alla tappa sbagliata.
  const contatoreId = useRef(0)
  const nuovoId = () => `t${++contatoreId.current}`

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

      const risultato = bozza
        ? fondi(bozza, dati.proposta)
        : primaBozza(dati.proposta)

      setBozza(risultato.bozza)
      setAvvisi([...(dati.avvisi || []), ...risultato.avvisi])
      setFonti(n => n + 1)
      setTesto('')
      setFase('anteprima')
      geocodificaMancanti(risultato.bozza.tappe)
    } catch (e) {
      setErrore(e.message)
      setFase('incolla')
    } finally {
      clearInterval(timer)
    }
  }

  function primaBozza(p) {
    const tappe = (p.tappe || []).map(t => ({
      ...t, _id: nuovoId(), lat: null, lng: null, paese_iso: '', novita: false,
    }))
    return {
      bozza: {
        titolo: p.titolo || titoloDaTappe(tappe),
        data_inizio: p.data_inizio || '',
        data_fine: p.data_fine || '',
        descrizione: p.descrizione || '',
        tappe,
        tratte: p.tratte || [],
      },
      avvisi: [],
    }
  }

  // --- Fusione di una nuova fonte sulla bozza esistente --------------------
  // Regola: vince sempre il dato già presente. La fonte nuova riempie solo i
  // campi vuoti; le discordanze finiscono negli avvisi, non sovrascrivono.

  function fondi(corrente, p) {
    const avvisiFusione = []
    const tappe = corrente.tappe.map(t => ({ ...t, novita: false }))

    for (const nuova of p.tappe || []) {
      const indice = tappe.findIndex(t => chiaveNome(t.nome) === chiaveNome(nuova.nome))

      if (indice === -1) {
        tappe.push({
          ...nuova, _id: nuovoId(), lat: null, lng: null, paese_iso: '', novita: true,
        })
        avvisiFusione.push(`Aggiunta la tappa ${nuova.nome}`)
        continue
      }

      const esistente = tappe[indice]
      let modificata = false

      for (const campo of CAMPI_UNIBILI) {
        const valoreNuovo = nuova[campo]
        if (!valoreNuovo) continue

        if (!esistente[campo]) {
          esistente[campo] = valoreNuovo
          modificata = true
          avvisiFusione.push(`${esistente.nome}: aggiunto ${ETICHETTE[campo]}`)
        } else if (String(esistente[campo]) !== String(valoreNuovo)) {
          avvisiFusione.push(
            `${esistente.nome}: questa fonte dice "${valoreNuovo}" come ${ETICHETTE[campo]}, ho tenuto "${esistente[campo]}"`
          )
        }
      }

      if (modificata) esistente.novita = true
    }

    // Notti ricalcolate dalle date, mai ereditate dalla fonte.
    for (const t of tappe) {
      if (t.data_arrivo && t.data_partenza) {
        const n = giorniTra(t.data_arrivo, t.data_partenza)
        if (n >= 0) t.notti = n
      }
    }

    // Ordine cronologico: le tappe senza data restano in fondo.
    tappe.sort((a, b) => {
      if (!a.data_arrivo) return 1
      if (!b.data_arrivo) return -1
      return a.data_arrivo.localeCompare(b.data_arrivo)
    })

    // Tratte: si accodano se non ci sono già.
    const tratte = [...(corrente.tratte || [])]
    for (const nt of p.tratte || []) {
      const gia = tratte.some(t =>
        chiaveNome(t.da) === chiaveNome(nt.da) &&
        chiaveNome(t.a) === chiaveNome(nt.a) &&
        (t.data || '') === (nt.data || '')
      )
      if (!gia) {
        tratte.push(nt)
        avvisiFusione.push(`Aggiunto lo spostamento ${nt.da} → ${nt.a}`)
      }
    }

    // Date del viaggio ricalcolate su tutto quello che abbiamo.
    const date = []
    for (const t of tappe) {
      if (t.data_arrivo) date.push(t.data_arrivo)
      if (t.data_partenza) date.push(t.data_partenza)
    }
    for (const t of tratte) if (t.data) date.push(t.data)
    date.sort()

    return {
      bozza: {
        ...corrente,
        tappe,
        tratte,
        data_inizio: date[0] || corrente.data_inizio,
        data_fine: date[date.length - 1] || corrente.data_fine,
      },
      avvisi: avvisiFusione,
    }
  }

  // --- Coordinate: mai dal modello, sempre dal geocoder -------------------

  async function geocodificaMancanti(tappe) {
    const daFare = tappe.filter(t => t.lat == null)
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

  function aggiungiFonte() {
    setErrore(null)
    setTesto('')
    setFase('incolla')
  }

  // --- Salvataggio come bozza --------------------------------------------

  // La tratta che arriva in una tappa diventa il suo trasporto_arrivo.
  function trasportoVerso(nomeTappa) {
    const tratta = (bozza.tratte || []).find(t => chiaveNome(t.a) === chiaveNome(nomeTappa))
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
            {fonti === 0
              ? 'Incolla qui il testo: una mail di conferma, un itinerario, i tuoi appunti. Va bene anche disordinato.'
              : `Incolla la fonte numero ${fonti + 1}: un'altra mail, un hotel, un treno. La aggiungo a quello che c'è già.`}
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
              {bozza ? (
                <button className="chatnv__opzione-secondaria" onClick={() => setFase('anteprima')}>
                  Torna all'anteprima
                </button>
              ) : (
                <button className="chatnv__opzione-secondaria" onClick={onFormClassico}>
                  Form classico
                </button>
              )}
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

                  {tappa.alloggio_nome && (
                    <p className="chatnv__alloggio">🏨 {tappa.alloggio_nome}</p>
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
                  onClick={aggiungiFonte}
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
