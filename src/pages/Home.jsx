import { useState, useEffect } from 'react'
import Mappa from '../components/Mappa'
import PannelloTappa from '../components/PannelloTappa'
import TimelineViaggio from './TimelineViaggio'
import Statistiche from './Statistiche'
import { fetchViagggi, fetchViaggio, aggiornaChecklist } from '../api/client'
import './Home.css'
import { useNavigate } from 'react-router-dom'
import FormViaggio from '../components/FormViaggio'
import { creaViaggio, modificaViaggio, eliminaViaggio } from '../api/client'
import { etichettaStato } from '../utils/stato'

function formattaData(stringa) {
  if (!stringa) return ''
  const [anno, mese, giorno] = stringa.split('-')
  const mesi = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic']
  return `${parseInt(giorno)} ${mesi[parseInt(mese) - 1]} ${anno}`
}

const SEZIONI = [
  { id: 'mappa', label: 'Mappa', icona: '◎' },
  { id: 'i-miei-viaggi', label: 'I miei viaggi', icona: '✈', espandibile: true },
  { id: 'statistiche', label: "Collect 'em all", icona: '◈' },
  { id: 'sfide', label: 'Sfide', icona: '◇' },
]

function Home() {
  const [modaleChecklist, setModaleChecklist] = useState(false)
  const [sezioneAttiva, setSezioneAttiva] = useState('mappa')
  const [menuAperto, setMenuAperto] = useState(null)
  const [viaggioAperto, setViaggioAperto] = useState(null)
  const [viaggioAttivo, setViaggioAttivo] = useState(null)
  const [vistaCorrente, setVistaCorrente] = useState('mappa')
  const [tappaSelezionata, setTappaSelezionata] = useState(null)
  const [giornoSelezionato, setGiornoSelezionato] = useState('info')
  const [tuttiGiorni, setTuttiGiorni] = useState(false)
  const [sidebarCollassata, setSidebarCollassata] = useState(false)
  const [drawerAperto, setDrawerAperto] = useState(false)

  // Stato per i dati dal Worker
  const [viaggi, setViagggi] = useState([])
  const [loadingLista, setLoadingLista] = useState(true)
  const [errore, setErrore] = useState(null)
  const [loadingDettaglio, setLoadingDettaglio] = useState(false)
  const [modaleForm, setModaleForm] = useState(false)
  const [viaggioInModifica, setViaggioInModifica] = useState(null)
  const navigate = useNavigate()

  // Carica la lista viaggi all'avvio
  useEffect(() => {
    fetchViagggi()
      .then(data => setViagggi(data))
      .catch(err => setErrore(err.message))
      .finally(() => setLoadingLista(false))
  }, [])

  function cliccaSezione(sezione) {
    setSezioneAttiva(sezione.id)
    setDrawerAperto(false)
    if (sezione.espandibile) {
      setMenuAperto(prev => prev === sezione.id ? null : sezione.id)
    } else {
      setMenuAperto(null)
      setTappaSelezionata(null)
      setGiornoSelezionato('info')
      setViaggioAperto(null)
      setViaggioAttivo(null)
      setVistaCorrente('mappa')
    }
  }

  function selezionaViaggio(viaggio) {
    if (viaggioAperto === viaggio.id) {
      setViaggioAperto(null)
      setViaggioAttivo(null)
      setTappaSelezionata(null)
      return
    }

    setViaggioAperto(viaggio.id)
    setVistaCorrente('mappa')
    setTappaSelezionata(null)
    setGiornoSelezionato('info')
    setTuttiGiorni(false)

    // ← QUI non ci deve essere nulla di estraneo

    // viaggio.tappe esiste sempre ormai (anche nella lista, in versione leggera).
    // Il segnale giusto per capire se abbiamo già il dettaglio completo è
    // checklist_partenza, che il worker aggiunge solo su GET /api/viaggi/:id.
    if (viaggio.checklist_partenza) {
      setViaggioAttivo(viaggio)
      return
    }

    setLoadingDettaglio(true)
    fetchViaggio(viaggio.id)
      .then(dettaglio => {
        setViagggi(prev => prev.map(v => v.id === dettaglio.id ? dettaglio : v))
        setViaggioAttivo(dettaglio)
      })
      .catch(err => setErrore(err.message))
      .finally(() => setLoadingDettaglio(false))
  }

  function tickChecklist(viaggio, voceId, completata) {
    // Funzione helper per aggiornare la checklist in un oggetto viaggio
    function aggiorna(v) {
      if (v.id !== viaggio.id) return v
      return {
        ...v,
        checklist_partenza: v.checklist_partenza.map(voce =>
          voce.id === voceId ? { ...voce, completata } : voce
        )
      }
    }

    setViagggi(prev => prev.map(aggiorna))
    setViaggioAttivo(prev => aggiorna(prev))

    aggiornaChecklist(voceId, completata)
      .catch(() => {
        function ripristina(v) {
          if (v.id !== viaggio.id) return v
          return {
            ...v,
            checklist_partenza: v.checklist_partenza.map(voce =>
              voce.id === voceId ? { ...voce, completata: !completata } : voce
            )
          }
        }
        setViagggi(prev => prev.map(ripristina))
        setViaggioAttivo(prev => ripristina(prev))
      })
  }

  function apriTappa(tappa) {
    setTappaSelezionata(tappa)
    setGiornoSelezionato('info')
    setTuttiGiorni(false)
    setVistaCorrente('mappa')
    setDrawerAperto(false)
    const v = viaggi.find(v => v.tappe?.some(t => t.id === tappa.id))
    if (v) setViaggioAttivo(v)
  }

  function chiudiTappa() {
    setTappaSelezionata(null)
    setGiornoSelezionato('info')
    setTuttiGiorni(false)
  }

  function isMobile() {
    return window.innerWidth < 768
  }

  function apriNuovoViaggio() {
    setDrawerAperto(false)
    if (isMobile()) {
      navigate('/modifica/nuovo')
    } else {
      setViaggioInModifica(null)
      setModaleForm(true)
    }
  }

  function apriModificaViaggio(e, viaggio) {
    e.stopPropagation()
    setDrawerAperto(false)
    if (isMobile()) {
      navigate(`/modifica/${viaggio.id}`)
    } else {
      setViaggioInModifica(viaggio)
      setModaleForm(true)
    }
  }

  async function salvatoViaggio() {
    setModaleForm(false)
    setViaggioInModifica(null)
    // Ricarica la lista viaggi
    const data = await fetchViagggi()
    setViagggi(data)
    // Se stavamo modificando il viaggio attivo, ricarica anche il dettaglio
    if (viaggioInModifica && viaggioAttivo?.id === viaggioInModifica.id) {
      const dettaglio = await fetchViaggio(viaggioInModifica.id)
      setViagggi(prev => prev.map(v => v.id === dettaglio.id ? dettaglio : v))
      setViaggioAttivo(dettaglio)
    }
  }

  async function eliminatoViaggio(idEliminato) {
    setModaleForm(false)
    setViaggioInModifica(null)
    const data = await fetchViagggi()
    setViagggi(data)
    // Se il viaggio eliminato era quello aperto/attivo, ripulisci la vista
    if (viaggioAttivo?.id === idEliminato) {
      setViaggioAttivo(null)
      setTappaSelezionata(null)
    }
    if (viaggioAperto === idEliminato) {
      setViaggioAperto(null)
    }
  }

  const navContent = (
    <nav className="sidebar__nav">
      {SEZIONI.map(sezione => (
        <div key={sezione.id}>
          <button
            className={`sidebar__voce${sezioneAttiva === sezione.id ? ' sidebar__voce--attiva' : ''}`}
            onClick={() => cliccaSezione(sezione)}
            title={sezione.label}
          >
            <span className="sidebar__voce-icona">{sezione.icona}</span>
            {!sidebarCollassata && (
              <>
                <span className="sidebar__voce-label">{sezione.label}</span>
                {sezione.espandibile && (
                  <span className="sidebar__voce-freccia">
                    {menuAperto === sezione.id ? '▲' : '▼'}
                  </span>
                )}
              </>
            )}
          </button>

          {!sidebarCollassata && sezione.espandibile && menuAperto === sezione.id && (
            <div className="sidebar__submenu">
              {loadingLista ? (
                <p className="sidebar__loading">Caricamento…</p>
              ) : errore ? (
                <p className="sidebar__errore">Errore: {errore}</p>
              ) : (
                <>
                  <button
                    className="sidebar__nuovo-viaggio"
                    onClick={apriNuovoViaggio}
                  >
                    + Nuovo viaggio
                  </button>

                  {viaggi.map(viaggio => (
                    <div key={viaggio.id}>
                      <div className="viaggio-card__testa-wrap">
                        <button
                          className={`viaggio-card__testa${viaggioAttivo?.id === viaggio.id ? ' viaggio-card__testa--attivo' : ''}`}
                          onClick={() => selezionaViaggio(viaggio)}
                        >
                          <div className="viaggio-card__info">
                            <span className={`viaggio-card__stato viaggio-card__stato--${viaggio.stato}`}>
                              {etichettaStato(viaggio.stato)}
                            </span>
                            <span className="viaggio-card__titolo">{viaggio.titolo}</span>
                            <span className="viaggio-card__date">
                              {formattaData(viaggio.data_inizio)} → {formattaData(viaggio.data_fine)}
                            </span>
                          </div>
                          <span className="viaggio-card__freccia">
                            {viaggioAperto === viaggio.id ? '▲' : '▼'}
                          </span>
                        </button>
                        <button
                          className="viaggio-card__modifica"
                          onClick={e => apriModificaViaggio(e, viaggio)}
                          title="Modifica viaggio"
                        >
                          ✎
                        </button>
                      </div>

                      {viaggioAperto === viaggio.id && (
                        <div className="viaggio-card__tappe">
                          {loadingDettaglio ? (
                            <p className="sidebar__loading">Caricamento…</p>
                          ) : viaggioAttivo?.tappe ? (
                            <>
                              {viaggioAttivo.tappe.map(tappa => (
                                <button
                                  key={tappa.id}
                                  className={`tappa-item${tappaSelezionata?.id === tappa.id ? ' tappa-item--attiva' : ''}`}
                                  onClick={() => apriTappa(tappa)}
                                >
                                  <span className="tappa-item__nome">{tappa.nome}</span>
                                  <span className="tappa-item__notti">{tappa.notti}n</span>
                                </button>
                              ))}
                            </>
                          ) : null}
                        </div>
                      )}
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      ))}

      <button
        className="sidebar__collassa"
        onClick={() => setSidebarCollassata(c => !c)}
        title={sidebarCollassata ? 'Espandi menu' : 'Collassa menu'}
      >
        {sidebarCollassata ? '›' : '‹'}
      </button>
    </nav>
  )

  return (
    <div className="home">

      <header className="home-header">
        <button
          className="home-header__hamburger"
          onClick={() => setDrawerAperto(d => !d)}
          aria-label="Menu"
        >
          ☰
        </button>

        <span className="home-header__nome">atlas</span>

        {viaggioAttivo ? (
          <div className="home-header__contesto">
            <span className="home-header__viaggio-nome">{viaggioAttivo.titolo}</span>
            <div className="home-header__viste">
              <button
                className={`vista-btn${vistaCorrente === 'mappa' ? ' vista-btn--attiva' : ''}`}
                onClick={() => setVistaCorrente('mappa')}
              >
                <span className="vista-btn__icona">◎</span>
                <span className="vista-btn__label">Mappa</span>
              </button>
              <button
                className={`vista-btn${vistaCorrente === 'timeline' ? ' vista-btn--attiva' : ''}`}
                onClick={() => setVistaCorrente('timeline')}
              >
                <span className="vista-btn__icona">☰</span>
                <span className="vista-btn__label">Timeline</span>
              </button>
              {viaggioAttivo?.checklist_partenza?.length > 0 && (
                <button
                  className="vista-btn"
                  onClick={() => setModaleChecklist(true)}
                >
                  <span className="vista-btn__icona">☑</span>
                  <span className="vista-btn__label">Checklist</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <span className="home-header__tag">Map your world</span>
        )}
      </header>

      <div className="home-corpo">

        <aside className={`home-sidebar${sidebarCollassata ? ' home-sidebar--collassata' : ''}`}>
          {navContent}
        </aside>

        {drawerAperto && (
          <div className="drawer-overlay" onClick={() => setDrawerAperto(false)}>
            <aside className="drawer" onClick={e => e.stopPropagation()}>
              {navContent}
            </aside>
          </div>
        )}

        {sezioneAttiva === 'statistiche' ? (
          <Statistiche />
        ) : vistaCorrente === 'timeline' && viaggioAttivo ? (
          <TimelineViaggio viaggio={viaggioAttivo} />
        ) : (
          <>
            <div className="home-mappa">
              <Mappa
                viaggi={viaggi}
                onTappaClick={apriTappa}
                tappaSelezionata={tappaSelezionata}
                vistaGlobale={sezioneAttiva === 'mappa' && !viaggioAttivo}
                giornoSelezionato={giornoSelezionato}
                tuttiGiorni={tuttiGiorni}
              />
            </div>

            {tappaSelezionata && (
              <PannelloTappa
                tappa={tappaSelezionata}
                giornoSelezionato={giornoSelezionato}
                onCambiaGiorno={(i) => { setGiornoSelezionato(i); if (i !== 'info') setTuttiGiorni(false) }}
                onChiudi={chiudiTappa}
                tuttiGiorni={tuttiGiorni}
                onTuttiGiorni={() => setTuttiGiorni(t => !t)}
              />
            )}
          </>
        )}

      </div>
      {/* ── MODALE CHECKLIST ── */}
      {modaleChecklist && viaggioAttivo && (
        <div className="modale-overlay" onClick={() => setModaleChecklist(false)}>
          <div className="modale" onClick={e => e.stopPropagation()}>
            <div className="modale__head">
              <h3 className="modale__titolo">Checklist partenza</h3>
              <span className="modale__contatore">
                {viaggioAttivo.checklist_partenza.filter(v => v.completata).length}
                /{viaggioAttivo.checklist_partenza.length}
              </span>
              <button className="modale__chiudi" onClick={() => setModaleChecklist(false)}>✕</button>
            </div>
            <div className="modale__corpo">
              {viaggioAttivo.checklist_partenza.map(voce => (
                <label key={voce.id} className="checklist__voce">
                  <input
                    type="checkbox"
                    checked={!!voce.completata}
                    onChange={e => tickChecklist(viaggioAttivo, voce.id, e.target.checked)}
                  />
                  <span className={voce.completata ? 'checklist__testo--fatto' : ''}>
                    {voce.testo}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    {/* MODALE FORM */}
    {modaleForm && (
      <div className="modale-overlay" onClick={() => setModaleForm(false)}>
        <div className="modale modale--form" onClick={e => e.stopPropagation()}>
          <button
            className="modale__chiudi modale__chiudi--form"
            onClick={() => setModaleForm(false)}
          >
            ✕
          </button>
          <FormViaggio
            viaggio={viaggioInModifica}
            onSalvato={salvatoViaggio}
            onAnnulla={() => setModaleForm(false)}
            onEliminato={eliminatoViaggio}
          />
        </div>
      </div>
    )}
    </div>
  )
}

export default Home