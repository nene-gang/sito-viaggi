import { useState } from 'react'
import Mappa from '../components/Mappa'
import PannelloTappa from '../components/PannelloTappa'
import TimelineViaggio from './TimelineViaggio'
import viaggi from '../data/viaggi'
import './Home.css'

function formattaData(stringa) {
  if (!stringa) return ''
  const [anno, mese, giorno] = stringa.split('-')
  const mesi = ['gen','feb','mar','apr','mag','giu','lug','ago','set','ott','nov','dic']
  return `${parseInt(giorno)} ${mesi[parseInt(mese) - 1]} ${anno}`
}

const SEZIONI = [
  { id: 'mappa',         label: 'Mappa',         icona: '◎' },
  { id: 'i-miei-viaggi', label: 'I miei viaggi', icona: '✈', espandibile: true },
  { id: 'statistiche',   label: 'Statistiche',   icona: '◈' },
  { id: 'sfide',         label: 'Sfide',          icona: '◇' },
]

function Home() {
  const [sezioneAttiva, setSezioneAttiva]       = useState('mappa')
  const [menuAperto, setMenuAperto]             = useState(null)
  const [viaggioAperto, setViaggioAperto]       = useState(null)
  const [viaggioAttivo, setViaggioAttivo]       = useState(null)  // viaggio selezionato
  const [vistaCorrente, setVistaCorrente]       = useState('mappa') // 'mappa' | 'timeline'
  const [tappaSelezionata, setTappaSelezionata] = useState(null)
  const [giornoSelezionato, setGiornoSelezionato] = useState('info')
  const [tuttiGiorni, setTuttiGiorni]           = useState(false)

  function cliccaSezione(sezione) {
    setSezioneAttiva(sezione.id)
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
    // click sul titolo viaggio → attiva il viaggio, mostra vista mappa di default
    setViaggioAttivo(viaggio)
    setVistaCorrente('mappa')
    setTappaSelezionata(null)
    setGiornoSelezionato('info')
    setTuttiGiorni(false)
    // espande anche la lista tappe
    setViaggioAperto(viaggio.id)
  }

  function apriTappa(tappa) {
    setTappaSelezionata(tappa)
    setGiornoSelezionato('info')
    setTuttiGiorni(false)
    setVistaCorrente('mappa')
    // assicura che il viaggio attivo sia quello della tappa
    const v = viaggi.find(v => v.tappe.some(t => t.id === tappa.id))
    if (v) setViaggioAttivo(v)
  }

  function chiudiTappa() {
    setTappaSelezionata(null)
    setGiornoSelezionato('info')
    setTuttiGiorni(false)
  }

  function toggleViaggio(id) {
    setViaggioAperto(prev => prev === id ? null : id)
  }

  return (
    <div className="home">

      {/* ── HEADER ── */}
      <header className="home-header">
        <span className="home-header__nome">atlas</span>

        {viaggioAttivo ? (
          /* header contestuale quando un viaggio è selezionato */
          <div className="home-header__contesto">
            <span className="home-header__viaggio-nome">{viaggioAttivo.titolo}</span>
            <div className="home-header__viste">
              <button
                className={`vista-btn${vistaCorrente === 'mappa' ? ' vista-btn--attiva' : ''}`}
                onClick={() => setVistaCorrente('mappa')}
                title="Vista mappa"
              >
                <span className="vista-btn__icona">◎</span>
                <span className="vista-btn__label">Mappa</span>
              </button>
              <button
                className={`vista-btn${vistaCorrente === 'timeline' ? ' vista-btn--attiva' : ''}`}
                onClick={() => setVistaCorrente('timeline')}
                title="Vista timeline"
              >
                <span className="vista-btn__icona">☰</span>
                <span className="vista-btn__label">Timeline</span>
              </button>
            </div>
          </div>
        ) : (
          <span className="home-header__tag">i tuoi luoghi nel mondo</span>
        )}
      </header>

      {/* ── CORPO ── */}
      <div className="home-corpo">

        {/* ── SIDEBAR ── */}
        <aside className="home-sidebar">
          <nav className="sidebar__nav">
            {SEZIONI.map(sezione => (
              <div key={sezione.id}>
                <button
                  className={`sidebar__voce${sezioneAttiva === sezione.id ? ' sidebar__voce--attiva' : ''}`}
                  onClick={() => cliccaSezione(sezione)}
                >
                  <span className="sidebar__voce-icona">{sezione.icona}</span>
                  <span className="sidebar__voce-label">{sezione.label}</span>
                  {sezione.espandibile && (
                    <span className="sidebar__voce-freccia">
                      {menuAperto === sezione.id ? '▲' : '▼'}
                    </span>
                  )}
                </button>

                {sezione.espandibile && menuAperto === sezione.id && (
                  <div className="sidebar__submenu">
                    {viaggi.map(viaggio => (
                      <div key={viaggio.id}>
                        <button
                          className={`viaggio-card__testa${viaggioAttivo?.id === viaggio.id ? ' viaggio-card__testa--attivo' : ''}`}
                          onClick={() => {
                            selezionaViaggio(viaggio)
                            toggleViaggio(viaggio.id)
                          }}
                        >
                          <div className="viaggio-card__info">
                            <span className={`viaggio-card__stato viaggio-card__stato--${viaggio.stato}`}>
                              {viaggio.stato === 'futuro' ? 'In programma' : 'Completato'}
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

                        {viaggioAperto === viaggio.id && (
                          <div className="viaggio-card__tappe">
                            {viaggio.tappe.map(tappa => (
                              <button
                                key={tappa.id}
                                className={`tappa-item${tappaSelezionata?.id === tappa.id ? ' tappa-item--attiva' : ''}`}
                                onClick={() => apriTappa(tappa)}
                              >
                                <span className="tappa-item__nome">{tappa.nome}</span>
                                <span className="tappa-item__notti">{tappa.notti}n</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </aside>

        {/* ── CONTENUTO CENTRALE ── */}
        {vistaCorrente === 'timeline' && viaggioAttivo ? (
          <TimelineViaggio viaggio={viaggioAttivo} />
        ) : (
          <>
            <div className="home-mappa">
              <Mappa
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
    </div>
  )
}

export default Home