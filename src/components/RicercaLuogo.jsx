import { useEffect, useState } from 'react'
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

// Centra/adatta la vista sui risultati ogni volta che cambiano
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

function RicercaLuogo({ onSeleziona }) {
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

  function seleziona(r) {
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
                    <button type="button" onClick={() => seleziona(r)}>
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
    </div>
  )
}

export default RicercaLuogo