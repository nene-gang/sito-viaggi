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
  const [sezioneAttiva, setSezioneAttiva]         = useState('mappa')
  const [menuAperto, setMenuAperto]               = useState(null)
  const [viaggioAperto, setViaggioAperto]         = useState(null)
  const [viaggioAttivo, setViaggioAttivo]         = useState(null)
  const [vistaCorrente, setVistaCorrente]         = useState('mappa')
  const [tappaSelezionata, setTappaSelezionata]   = useState(null)
  const [giornoSelezionato, setGiornoSelezionato] = useState('info')
  const [tuttiGiorni, setTuttiGiorni]             = useState(false)
  const [sidebarCollassata, setSidebarCollassata] = useState(false)
  const [drawerAperto, setDrawerAperto]           = useState(false) // mobile

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
    setViaggioAttivo(viaggio)
    setVistaCorrente('mappa')
    setTappaSelezionata(null)
    setGiornoSelezionato('info')
    setTuttiGiorni(false)
    setViaggioAperto(prev => prev === viaggio.id ? null : viaggio.id)
  }

  function apriTappa(tappa) {
    setTappaSelezionata(tappa)
    setGiornoSelezionato('info')
    setTuttiGiorni(false)
    setVistaCorrente('mappa')
    setDrawerAperto(false)
    const v = viaggi.find(v => v.tappe.some(t => t.id === tappa.id))
    if (v) setViaggioAttivo(v)
  }

  function chiudiTappa() {
    setTappaSelezionata(null)
    setGiornoSelezionato('info')
    setTuttiGiorni(false)
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
              {viaggi.map(viaggio => (
                <div key={viaggio.id}>
                  <button
                    className={`viaggio-card__testa${viaggioAttivo?.id === viaggio.id ? ' viaggio-card__testa--attivo' : ''}`}
                    onClick={() => selezionaViaggio(viaggio)}
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

      {/* bottone collassa — solo desktop */}
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

      {/* ── HEADER ── */}
      <header className="home-header">
        {/* hamburger mobile */}
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
            </div>
          </div>
        ) : (
          <span className="home-header__tag">i tuoi luoghi nel mondo</span>
        )}
      </header>

      {/* ── CORPO ── */}
      <div className="home-corpo">

        {/* ── SIDEBAR DESKTOP ── */}
        <aside className={`home-sidebar${sidebarCollassata ? ' home-sidebar--collassata' : ''}`}>
          {navContent}
        </aside>

        {/* ── DRAWER MOBILE ── */}
        {drawerAperto && (
          <div className="drawer-overlay" onClick={() => setDrawerAperto(false)}>
            <aside className="drawer" onClick={e => e.stopPropagation()}>
              {navContent}
            </aside>
          </div>
        )}

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