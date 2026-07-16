import { useState, useEffect, useRef } from 'react'
import './TimelineViaggio.css'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { etichettaStato } from '../utils/stato'

// Fix icone Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// Palette colori per le tappe — assegnata in ordine ciclico
const PALETTE = [
  { colore: '#1d3557', sfondo: '#d4e4f7' },
  { colore: '#2d6a4f', sfondo: '#d8f3dc' },
  { colore: '#ae2012', sfondo: '#f4d3cf' },
  { colore: '#9a6b00', sfondo: '#faeacc' },
  { colore: '#3d5a80', sfondo: '#e0ecff' },
  { colore: '#6b3fa0', sfondo: '#ede0f7' },
]

function formattaData(stringa) {
  if (!stringa) return ''
  const [anno, mese, giorno] = stringa.split('-')
  const mesi = ['gen','feb','mar','apr','mag','giu','lug','ago','set','ott','nov','dic']
  return `${parseInt(giorno)} ${mesi[parseInt(mese) - 1]} ${anno}`
}

function MappaTappa({ tappa, giornoIdx, palette }) {
  const mapRef = useRef(null)
  const instanceRef = useRef(null)

  useEffect(() => {
    if (!mapRef.current) return

    // Distruggi istanza precedente
    if (instanceRef.current) {
      instanceRef.current.remove()
      instanceRef.current = null
    }

    // Raccoglie attrazioni con coordinate del giorno corrente
    const giorni = tappa.giorni || []
    const giorno = giorni[giornoIdx]
    if (!giorno) return

    const attrazioni = giorno.attivita.filter(
      a => a.tipo === 'attrazione' && a.lat && a.lng
    )
    if (attrazioni.length === 0) return

    // Centro mappa
    const centro = [attrazioni[0].lat, attrazioni[0].lng]
    const map = L.map(mapRef.current, {
      center: centro,
      zoom: 13,
      zoomControl: false,
      attributionControl: false,
    })
    instanceRef.current = map

    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
    ).addTo(map)

    // Pin numerati con colore della tappa
    attrazioni.forEach((a, i) => {
      const icon = L.divIcon({
        html: `<div style="
          width:24px;height:24px;border-radius:50%;
          background:${palette.colore};color:#fff;
          display:flex;align-items:center;justify-content:center;
          font-size:11px;font-weight:700;font-family:sans-serif;
          border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3);
        ">${i + 1}</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        className: '',
      })
      L.marker([a.lat, a.lng], { icon })
        .addTo(map)
        .bindPopup(`<strong style="font-size:12px">${a.nome}</strong>`)
    })

    // Polilinea percorso
    if (attrazioni.length > 1) {
      L.polyline(
        attrazioni.map(a => [a.lat, a.lng]),
        { color: palette.colore, weight: 2, opacity: 0.5, dashArray: '4 3' }
      ).addTo(map)
    }

    // Fit bounds su tutti i pin
    const bounds = L.latLngBounds(attrazioni.map(a => [a.lat, a.lng]))
    map.fitBounds(bounds, { padding: [20, 20] })

    // Necessario per i tile nel modal
    setTimeout(() => map.invalidateSize(), 100)

    return () => {
      if (instanceRef.current) {
        instanceRef.current.remove()
        instanceRef.current = null
      }
    }
  }, [tappa, giornoIdx, palette])

  // Non mostrare se non ci sono attrazioni
  const giorno = (tappa.giorni || [])[giornoIdx]
  const haAttrazioni = giorno?.attivita?.some(
    a => a.tipo === 'attrazione' && a.lat && a.lng
  )
  if (!haAttrazioni) return null

  return <div ref={mapRef} className="tl-modal__mappa" />
}

function TappaModal({ tappa, palette, onChiudi }) {
  const [giornoIdx, setGiornoIdx] = useState(0)
  const haGiorni = tappa.giorni && tappa.giorni.length > 0
  const giorno = haGiorni ? tappa.giorni[giornoIdx] : null

  return (
    <div className="tl-overlay" onClick={e => e.target === e.currentTarget && onChiudi()}>
      <div className="tl-modal">

        {/* intestazione modal */}
        <div className="tl-modal__head" style={{ borderLeft: `4px solid ${palette.colore}` }}>
          <div>
            <div className="tl-modal__citta" style={{ color: palette.colore }}>{tappa.nome}</div>
            <div className="tl-modal__meta">
              <span>{tappa.paese}</span>
              <span className="tl-modal__dot" />
              <span>{formattaData(tappa.data_arrivo)} → {formattaData(tappa.data_partenza)}</span>
              <span className="tl-modal__badge" style={{ background: palette.sfondo, color: palette.colore }}>
                {tappa.notti} notti
              </span>
            </div>
          </div>
          <button className="tl-modal__chiudi" onClick={onChiudi}>✕</button>
        </div>

        {/* tab giorni */}
        {haGiorni && tappa.giorni.length > 1 && (
          <div className="tl-modal__tabs">
            {tappa.giorni.map((g, i) => (
              <button
                key={i}
                className={`tl-modal__tab${giornoIdx === i ? ' tl-modal__tab--attivo' : ''}`}
                style={giornoIdx === i ? { background: palette.colore, borderColor: palette.colore } : {}}
                onClick={() => setGiornoIdx(i)}
              >
                Giorno {g.numero}
              </button>
            ))}
          </div>
        )}

        {/* mappa anteprima */}
        <MappaTappa tappa={tappa} giornoIdx={giornoIdx} palette={palette} />

        {/* corpo */}
        <div className="tl-modal__corpo">
          {!haGiorni ? (
            <div className="tl-modal__vuoto">
              <span>📋</span>
              <p>Nessun itinerario inserito per questa tappa.</p>
            </div>
          ) : (
            <>
              <div className="tl-modal__giorno-titolo">
                <span>{giorno.titolo}</span>
                <span className="tl-modal__giorno-data">{giorno.data}</span>
              </div>

              {/* avvisi */}
              {giorno.attivita.filter(a => a.avviso).map((a, i) => (
                <div key={i} className="tl-modal__avviso">
                  <span className="tl-modal__avviso-nome">⚑ {a.nome}</span>
                  <span>{a.avviso}</span>
                </div>
              ))}

              {/* programma */}
              <div className="tl-modal__programma">
                {giorno.attivita.map((att, i) => (
                  <div key={i} className="tl-modal__slot">
                    <span className="tl-modal__ora">{att.ora}</span>
                    <div
                      className="tl-modal__dot-slot"
                      style={{ background: att.tipo === 'attrazione' ? palette.colore : 'var(--border)' }}
                    />
                    <div className="tl-modal__slot-corpo">
                      <div className={`tl-modal__att-nome${att.tipo === 'logistica' ? ' tl-modal__att-nome--logistica' : ''}`}>
                        {att.nome}
                      </div>
                      {att.note && <div className="tl-modal__att-note">{att.note}</div>}
                    </div>
                  </div>
                ))}
              </div>

              {/* trasporti */}
              {(tappa.trasporto_arrivo || tappa.trasporto_partenza) && (
                <div className="tl-modal__trasporti">
                  <div className="tl-modal__tr-label">Trasporti</div>
                  {tappa.trasporto_arrivo && (
                    <div className="tl-modal__tr-riga">
                      <span className="tl-modal__tr-icona">→</span>
                      <div>
                        <div className="tl-modal__tr-tipo">Arrivo</div>
                        <div>{tappa.trasporto_arrivo}</div>
                      </div>
                    </div>
                  )}
                  {tappa.trasporto_partenza && (
                    <div className="tl-modal__tr-riga">
                      <span className="tl-modal__tr-icona">←</span>
                      <div>
                        <div className="tl-modal__tr-tipo">Partenza</div>
                        <div>{tappa.trasporto_partenza}</div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function TimelineViaggio({ viaggio }) {
  const [tappaAperta, setTappaAperta] = useState(null)

  return (
    <div className="tl-wrap">
      <div className="tl-contenuto">

        {/* intestazione viaggio */}
        <div className="tl-header">
          <div className="tl-header__eyebrow">
            {etichettaStato(viaggio.stato)}
          </div>
          <h1 className="tl-header__titolo">{viaggio.titolo}</h1>
          <div className="tl-header__meta">
            <span><strong>{formattaData(viaggio.data_inizio)}</strong></span>
            <span>→</span>
            <span><strong>{formattaData(viaggio.data_fine)}</strong></span>
            <span className="tl-header__sep" />
            <span>{viaggio.tappe.length} tappe</span>
            <span className="tl-header__sep" />
            <span>{viaggio.tappe.reduce((s, t) => s + t.notti, 0)} notti</span>
          </div>
          {viaggio.descrizione && (
            <p className="tl-header__desc">{viaggio.descrizione}</p>
          )}
        </div>

        {/* timeline tappe */}
        <div className="tl-timeline">
          {viaggio.tappe.map((tappa, idx) => {
            const pal = PALETTE[idx % PALETTE.length]
            return (
              <div key={tappa.id}>
                {/* card tappa */}
                <div
                  className="tl-stop"
                  onClick={() => setTappaAperta(tappa)}
                >
                  <div className="tl-stop__dot" style={{ borderColor: pal.colore, background: pal.sfondo }} />
                  <div className="tl-stop__card" style={{ borderLeft: `3px solid ${pal.colore}` }}>
                    <div className="tl-stop__head">
                      <span className="tl-stop__nome" style={{ color: pal.colore }}>{tappa.nome}</span>
                      <span className="tl-stop__date">{formattaData(tappa.data_arrivo)}</span>
                      <span className="tl-stop__notti" style={{ background: pal.sfondo, color: pal.colore }}>
                        {tappa.notti} {tappa.notti === 1 ? 'notte' : 'notti'}
                      </span>
                    </div>

                    {/* preview giorni */}
                    {tappa.giorni && tappa.giorni.length > 0 ? (
                      <div className="tl-stop__preview">
                        {tappa.giorni.map((g, gi) => (
                          <div key={gi} className="tl-stop__preview-riga">
                            <span className="tl-stop__preview-label">{g.data?.split('-')[2] ?? gi + 1}</span>
                            <span>{g.titolo}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="tl-stop__vuoto">Nessun itinerario inserito</div>
                    )}

                    <div className="tl-stop__hint">↗ Clicca per dettagli e orari</div>
                  </div>
                </div>

                {/* trasporto verso la prossima tappa */}
                {idx < viaggio.tappe.length - 1 && tappa.trasporto_partenza && (
                  <div className="tl-trasporto">
                    <div className="tl-trasporto__linea" />
                    <div className="tl-trasporto__testo">{tappa.trasporto_partenza}</div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* voli */}
        {viaggio.note && (
          <div className="tl-note">
            <div className="tl-note__label">Note viaggio</div>
            <div className="tl-note__corpo">{viaggio.note}</div>
          </div>
        )}

      </div>

      {/* modal tappa */}
      {tappaAperta && (
        <TappaModal
          tappa={tappaAperta}
          palette={PALETTE[viaggio.tappe.findIndex(t => t.id === tappaAperta.id) % PALETTE.length]}
          onChiudi={() => setTappaAperta(null)}
        />
      )}
    </div>
  )
}

export default TimelineViaggio