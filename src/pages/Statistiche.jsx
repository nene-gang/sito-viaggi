import { useState, useEffect } from 'react'
import { PROVINCE, CAPITALI_EU, CAPITALI_MONDO, ISO_A_CAPITALE } from '../data/statistiche'
import viaggi from '../data/viaggi'
import './Statistiche.css'
import MappaWandex from '../components/MappaWandex'

const STORAGE_KEY = 'atlas_statistiche'

function caricaDati() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { province: [], capitali_eu: [], capitali_mondo: [] }
    return JSON.parse(raw)
  } catch { return { province: [], capitali_eu: [], capitali_mondo: [] } }
}

function salvaDati(dati) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dati))
}

// Ricava capitali visitate automaticamente dai viaggi
function capitaliDaiViaggi() {
  const visited = new Set()
  viaggi.forEach(v => {
    if (v.stato !== 'passato') return
    v.tappe.forEach(t => {
      if (t.paese_iso && ISO_A_CAPITALE[t.paese_iso]) {
        visited.add(ISO_A_CAPITALE[t.paese_iso])
      }
    })
  })
  return visited
}

function BarraProgresso({ valore, totale, colore }) {
  const pct = totale > 0 ? Math.round((valore / totale) * 100) : 0
  return (
    <div className="barra-wrap">
      <div className="barra-track">
        <div
          className="barra-fill"
          style={{ width: `${pct}%`, background: colore }}
        />
      </div>
      <span className="barra-pct">{pct}%</span>
    </div>
  )
}

const CONFIG_MAPPA = {
  province:      { centro: [42.5, 12.5], zoom: 5 },
  capitali_eu:   { centro: [54.0, 15.0], zoom: 3 },
  capitali_mondo: { centro: [20.0, 10.0], zoom: 2 },
}

function Tracker({ titolo, icona, colore, items, visitatiManuali, visitatiAuto, onToggle, raggruppaPer, configMappa }) {
  const [espanso, setEspanso] = useState(false)
  const [filtro, setFiltro] = useState('')
  const [vista, setVista] = useState('lista')
  const [filtroVisita, setFiltroVisita] = useState('tutti') // 'tutti' | 'visitati' | 'da-visitare'

  const tuttiVisitati = new Set([...visitatiManuali, ...visitatiAuto])
  const count = tuttiVisitati.size
  const totale = items.length

  // Raggruppa per regione/continente se richiesto
  const gruppi = raggruppaPer
    ? [...new Set(items.map(i => i[raggruppaPer]))].sort()
    : null

  const itemsFiltrati = items
    .filter(i => filtro ? i.nome.toLowerCase().includes(filtro.toLowerCase()) : true)
    .filter(i => {
      if (filtroVisita === 'tutti') return true
      const key = i.cod || i.nome
      const visitato = tuttiVisitati.has(key)
      return filtroVisita === 'visitati' ? visitato : !visitato
    })

  return (
    <div className="tracker">
      <div className="tracker__head" onClick={() => setEspanso(e => !e)}>
        <div className="tracker__titolo-wrap">
          <span className="tracker__icona">{icona}</span>
          <div>
            <div className="tracker__titolo">{titolo}</div>
            <div className="tracker__sub">{count} di {totale} visitati</div>
          </div>
        </div>
        <div className="tracker__destra">
          <BarraProgresso valore={count} totale={totale} colore={colore} />
          <span className="tracker__freccia">{espanso ? '▲' : '▼'}</span>
        </div>
      </div>

      {espanso && (
        <div className="tracker__corpo">

          {/* selettore vista */}
          <div className="tracker__viste">
            <button
              className={`tracker__vista-btn${vista === 'lista' ? ' tracker__vista-btn--attiva' : ''}`}
              onClick={() => setVista('lista')}
            >≡ Lista</button>
            <button
              className={`tracker__vista-btn${vista === 'mappa' ? ' tracker__vista-btn--attiva' : ''}`}
              onClick={() => setVista('mappa')}
            >◎ Mappa</button>
          </div>

          {/* filtro visitati */}
          <div className="tracker__filtri">
            {['tutti', 'visitati', 'da-visitare'].map(f => (
              <button
                key={f}
                className={`tracker__filtro-btn${filtroVisita === f ? ' tracker__filtro-btn--attivo' : ''}`}
                style={filtroVisita === f ? { borderColor: colore, background: `${colore}18`, color: colore } : {}}
                onClick={() => setFiltroVisita(f)}
              >
                {f === 'tutti' ? 'Tutti' : f === 'visitati' ? '✓ Visitati' : '○ Da visitare'}
              </button>
            ))}
          </div>

          {vista === 'mappa' ? (
            <MappaWandex
              items={items}
              visitati={tuttiVisitati}
              colore={colore}
              centro={configMappa.centro}
              zoom={configMappa.zoom}
              altezza={380}
            />
          ) : (
          <>
          <input
            className="tracker__search"
            placeholder="Cerca..."
            value={filtro}
            onChange={e => setFiltro(e.target.value)}
            onClick={e => e.stopPropagation()}
          />

          {gruppi ? (
            gruppi.map(gruppo => {
              const itemsGruppo = itemsFiltrati.filter(i => i[raggruppaPer] === gruppo)
              if (itemsGruppo.length === 0) return null
              const countGruppo = itemsGruppo.filter(i => tuttiVisitati.has(i.cod || i.nome)).length
              return (
                <div key={gruppo} className="tracker__gruppo">
                  <div className="tracker__gruppo-label">
                    {gruppo}
                    <span className="tracker__gruppo-count">{countGruppo}/{itemsGruppo.length}</span>
                  </div>
                  <div className="tracker__grid">
                    {itemsGruppo.map(item => {
                      const key = item.cod || item.nome
                      const isAuto = visitatiAuto.has(key)
                      const isManuale = visitatiManuali.includes(key)
                      const visitato = isAuto || isManuale
                      return (
                        <button
                          key={key}
                          className={`luogo-btn${visitato ? ' luogo-btn--visitato' : ''}${isAuto ? ' luogo-btn--auto' : ''}`}
                          style={visitato ? { borderColor: colore, background: `${colore}15`, color: colore } : {}}
                          onClick={() => !isAuto && onToggle(key)}
                          title={isAuto ? 'Importato dai tuoi viaggi' : ''}
                        >
                          {item.nome}
                          {item.cod && <span className="luogo-btn__cod">{item.cod}</span>}
                          {isAuto && <span className="luogo-btn__auto">✈</span>}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })
          ) : (
            <div className="tracker__grid">
              {itemsFiltrati.map(item => {
                const key = item.cod || item.nome
                const isAuto = visitatiAuto.has(key)
                const isManuale = visitatiManuali.includes(key)
                const visitato = isAuto || isManuale
                return (
                  <button
                    key={key}
                    className={`luogo-btn${visitato ? ' luogo-btn--visitato' : ''}${isAuto ? ' luogo-btn--auto' : ''}`}
                    style={visitato ? { borderColor: colore, background: `${colore}15`, color: colore } : {}}
                    onClick={() => !isAuto && onToggle(key)}
                    title={isAuto ? 'Importato dai tuoi viaggi' : ''}
                  >
                    {item.nome}
                    {isAuto && <span className="luogo-btn__auto">✈</span>}
                  </button>
                )
              })}
            </div>
          )}
          </>
          )}
        </div>
      )}
    </div>
  )
}

function Statistiche() {
  const [dati, setDati] = useState(caricaDati)
  const autoCapitali = capitaliDaiViaggi()

  function toggle(categoria, key) {
    setDati(prev => {
      const lista = prev[categoria] || []
      const nuova = lista.includes(key)
        ? lista.filter(k => k !== key)
        : [...lista, key]
      const aggiornato = { ...prev, [categoria]: nuova }
      salvaDati(aggiornato)
      return aggiornato
    })
  }

  // Totali globali
  const totProvince = new Set([...dati.province]).size
  const totCapEu    = new Set([...dati.capitali_eu, ...autoCapitali].filter(c =>
    CAPITALI_EU.some(x => x.nome === c))).size
  const totCapMondo = new Set([...dati.capitali_mondo, ...autoCapitali]).size

  return (
    <div className="stats-wrap">
      <div className="stats-contenuto">

        <div className="stats-header">
          <h1 className="stats-titolo">Wandex</h1>
          <p className="stats-sub">Il tuo Pokédex dei viaggi — colleziona città, province e capitali del mondo</p>
        </div>

        {/* riepilogo globale */}
        <div className="stats-riepilogo">
          <div className="riepilogo-card">
            <div className="riepilogo-card__num" style={{ color: '#b5451b' }}>{totProvince}</div>
            <div className="riepilogo-card__label">Province italiane</div>
            <div className="riepilogo-card__tot">su 107</div>
          </div>
          <div className="riepilogo-card">
            <div className="riepilogo-card__num" style={{ color: '#1b6eb5' }}>{totCapEu}</div>
            <div className="riepilogo-card__label">Capitali europee</div>
            <div className="riepilogo-card__tot">su {CAPITALI_EU.length}</div>
          </div>
          <div className="riepilogo-card">
            <div className="riepilogo-card__num" style={{ color: '#2d6a4f' }}>{totCapMondo}</div>
            <div className="riepilogo-card__label">Capitali del mondo</div>
            <div className="riepilogo-card__tot">su {CAPITALI_MONDO.length}</div>
          </div>
        </div>

        {/* tracker */}
        <div className="stats-trackers">
          <Tracker
            titolo="Province italiane"
            icona="🇮🇹"
            colore="#b5451b"
            items={PROVINCE}
            visitatiManuali={dati.province}
            visitatiAuto={new Set()}
            onToggle={key => toggle('province', key)}
            configMappa={CONFIG_MAPPA.province}
            raggruppaPer="regione"
          />
          <Tracker
            titolo="Capitali europee"
            icona="🇪🇺"
            colore="#1b6eb5"
            items={CAPITALI_EU}
            visitatiManuali={dati.capitali_eu}
            visitatiAuto={new Set([...autoCapitali].filter(c => CAPITALI_EU.some(x => x.nome === c)))}
            onToggle={key => toggle('capitali_eu', key)}
            configMappa={CONFIG_MAPPA.capitali_eu}
            raggruppaPer={null}
          />
          <Tracker
            titolo="Capitali del mondo"
            icona="🌍"
            colore="#2d6a4f"
            items={CAPITALI_MONDO}
            visitatiManuali={dati.capitali_mondo}
            visitatiAuto={autoCapitali}
            onToggle={key => toggle('capitali_mondo', key)}
            configMappa={CONFIG_MAPPA.capitali_mondo}
            raggruppaPer="continente"
          />
        </div>

        <p className="stats-nota">
          ✈ indica i luoghi importati automaticamente dai tuoi viaggi · gli altri sono aggiunti manualmente
        </p>

      </div>
    </div>
  )
}

export default Statistiche