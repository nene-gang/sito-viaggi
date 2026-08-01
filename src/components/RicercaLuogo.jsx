import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Stesso fix icone di Mappa.jsx — ripetuto qui perché questo componente
// può essere montato prima che Mappa.jsx sia mai stato caricato (è dentro
// il drawer di modifica, non nella vista principale).
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const CENTRO_DEFAULT = [41.9, 12.5] // Italia, usato se non si conosce ancora la posizione della tappa

// Categorie di POI mostrate in modalità Esplora, con etichetta ed emoji
// per il popup — presa dai tag OpenStreetMap (tourism/amenity).
const CATEGORIE_POI = {
  attraction:  { emoji: '🏛️', label: 'Attrazione' },
  museum:      { emoji: '🏛️', label: 'Museo' },
  viewpoint:   { emoji: '👁️', label: 'Panorama' },
  gallery:     { emoji: '🎨', label: 'Galleria' },
  zoo:         { emoji: '🦁', label: 'Zoo' },
  theme_park:  { emoji: '🎢', label: 'Parco divertimenti' },
  restaurant:  { emoji: '🍽️', label: 'Ristorante' },
  cafe:        { emoji: '☕', label: 'Caffè' },
  bar:         { emoji: '🍺', label: 'Bar' },
  pub:         { emoji: '🍺', label: 'Pub' },
  fast_food:   { emoji: '🍔', label: 'Fast food' },
}

// Centra/adatta la vista sui risultati della ricerca per nome
function AdattaVista({ risultati }) {
  const map = useMap()
  useEffect(() => {
    if (risultati.length === 0) return
    if (risultati.length === 1) {
      map.setView([parseFloat(risultati[0].lat), parseFloat(risultati[0].lon)], 15)
    } else {
      const punti = risultati.map(r => [parseFloat(r.lat), parseFloat(r.lon)])
      map.fitBounds(punti, { padding: [30, 30] })
    }
  }, [risultati, map])
  return null
}

async function cercaPoiNellaZona(bounds) {
  const sud = bounds.getSouth(), ovest = bounds.getWest(), nord = bounds.getNorth(), est = bounds.getEast()
  const query = `[out:json][timeout:25];(
    node["tourism"~"attraction|museum|viewpoint|gallery|zoo|theme_park"](${sud},${ovest},${nord},${est});
    node["amenity"~"restaurant|cafe|bar|pub|fast_food"](${sud},${ovest},${nord},${est});
  );out body;`

  const res = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: 'data=' + encodeURIComponent(query),
  })
  const dati = await res.json()

  return dati.elements
    .filter(el => el.lat && el.lon && el.tags?.name)
    .map(el => ({
      id: el.id,
      nome: el.tags.name,
      lat: el.lat,
      lng: el.lon,
      tipo: el.tags.tourism || el.tags.amenity,
      indirizzo: [el.tags['addr:street'], el.tags['addr:housenumber']].filter(Boolean).join(' '),
    }))
    .slice(0, 80) // evita di sovraccaricare la mappa se la zona è molto ampia
}

function BottoneCercaQui({ onClick, caricando }) {
  return (
    <button type="button" className="ricerca-luogo__cerca-qui" onClick={onClick} disabled={caricando}>
      {caricando ? 'Cerco...' : '📍 Cerca in quest\'area'}
    </button>
  )
}

function RicercaLuogo({ onSeleziona, centroIniziale = null }) {
  const [modalita, setModalita] = useState('nome') // 'nome' | 'esplora'

  // --- Ricerca per nome ---
  const [query, setQuery]         = useState('')
  const [risultati, setRisultati] = useState([])
  const [cercando, setCercando]   = useState(false)

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

  function selezionaDaNome(r) {
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

  // --- Esplora dintorni ---
  const mapRef = useRef(null)
  const [poi, setPoi] = useState([])
  const [caricandoPoi, setCaricandoPoi] = useState(false)
  const [erroreEsplora, setErroreEsplora] = useState(null)
  const centro = centroIniziale || CENTRO_DEFAULT

  async function cercaQui() {
    if (!mapRef.current) return
    setCaricandoPoi(true)
    setErroreEsplora(null)
    try {
      const risultatiPoi = await cercaPoiNellaZona(mapRef.current.getBounds())
      setPoi(risultatiPoi)
    } catch {
      setErroreEsplora('Ricerca non riuscita, riprova tra qualche secondo.')
    } finally {
      setCaricandoPoi(false)
    }
  }

  function selezionaDaPoi(p) {
    onSeleziona({
      nome: p.nome,
      lat: p.lat,
      lng: p.lng,
      paese_iso: '',
      indirizzo: p.indirizzo,
    })
  }

  return (
    <div className="ricerca-luogo">
      <div className="ricerca-luogo__modalita">
        <button
          type="button"
          className={`ricerca-luogo__modalita-btn${modalita === 'nome' ? ' ricerca-luogo__modalita-btn--attiva' : ''}`}
          onClick={() => setModalita('nome')}
        >
          🔍 Cerca per nome
        </button>
        <button
          type="button"
          className={`ricerca-luogo__modalita-btn${modalita === 'esplora' ? ' ricerca-luogo__modalita-btn--attiva' : ''}`}
          onClick={() => setModalita('esplora')}
        >
          🧭 Esplora dintorni
        </button>
      </div>

      {modalita === 'nome' ? (
        <>
          <div className="ricerca-luogo__riga">
            <input
              className="ricerca-luogo__input"
              placeholder="Cerca città o luogo..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && cerca()}
            />
            <button className="ricerca-luogo__btn" onClick={cerca} disabled={cercando}>
              {cercando ? '...' : '🔍'}
            </button>
            {risultati.length > 0 && (
              <button
                type="button"
                className="ricerca-luogo__btn ricerca-luogo__btn--chiudi"
                onClick={() => setRisultati([])}
                title="Chiudi mappa risultati"
              >
                ✕
              </button>
            )}
          </div>

          {risultati.length > 0 && (
            <div className="ricerca-luogo__mappa-contenitore">
              <MapContainer
                center={[parseFloat(risultati[0].lat), parseFloat(risultati[0].lon)]}
                zoom={13}
                className="ricerca-luogo__mappa"
                scrollWheelZoom={true}
              >
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                  attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>'
                />
                <AdattaVista risultati={risultati} />
                {risultati.map(r => (
                  <Marker key={r.place_id} position={[parseFloat(r.lat), parseFloat(r.lon)]}>
                    <Popup>
                      <div className="ricerca-luogo__popup">
                        <strong>{r.display_name.split(',')[0].trim()}</strong>
                        <div className="ricerca-luogo__popup-indirizzo">{r.display_name}</div>
                        <button type="button" onClick={() => selezionaDaNome(r)}>
                          Aggiungi questo luogo
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
              <p className="ricerca-luogo__suggerimento">
                Clicca un marker per vedere i dettagli e aggiungerlo.
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="ricerca-luogo__mappa-contenitore">
          <MapContainer
            ref={mapRef}
            center={centro}
            zoom={14}
            className="ricerca-luogo__mappa"
            scrollWheelZoom={true}
            whenReady={cercaQui}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>'
            />
            {poi.map(p => (
              <Marker key={p.id} position={[p.lat, p.lng]}>
                <Popup>
                  <div className="ricerca-luogo__popup">
                    <strong>{CATEGORIE_POI[p.tipo]?.emoji || '📍'} {p.nome}</strong>
                    <div className="ricerca-luogo__popup-indirizzo">
                      {CATEGORIE_POI[p.tipo]?.label || p.tipo}
                      {p.indirizzo && ` · ${p.indirizzo}`}
                    </div>
                    <button type="button" onClick={() => selezionaDaPoi(p)}>
                      Aggiungi questo luogo
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
          <div className="ricerca-luogo__esplora-barra">
            <BottoneCercaQui onClick={cercaQui} caricando={caricandoPoi} />
            <span className="ricerca-luogo__esplora-conteggio">
              {caricandoPoi ? '' : `${poi.length} luoghi in quest'area`}
            </span>
          </div>
          {erroreEsplora && <p className="ricerca-luogo__esplora-errore">{erroreEsplora}</p>}
          <p className="ricerca-luogo__suggerimento">
            Muovi la mappa e premi "Cerca in quest'area" per aggiornare i risultati.
          </p>
        </div>
      )}
    </div>
  )
}

export default RicercaLuogo
