import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import { useEffect } from 'react'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import viaggi from '../data/viaggi'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// componente interno che gestisce lo zoom automatico
function ControlloZoom({ tappaSelezionata }) {
  const map = useMap()

  useEffect(() => {
    if (tappaSelezionata) {
      map.flyTo([tappaSelezionata.lat, tappaSelezionata.lng], 12, { duration: 1.2 })
    } else {
      map.flyTo([35, 105], 4, { duration: 1.2 })
    }
  }, [tappaSelezionata])

  return null
}

function Mappa({ onTappaClick, tappaSelezionata }) {
  const tappe = viaggi.flatMap(viaggio =>
    viaggio.tappe.map(tappa => ({
      ...tappa,
      viaggioTitolo: viaggio.titolo,
      viaggioStato: viaggio.stato,
    }))
  )

  const percorso = tappe
    .sort((a, b) => a.ordine - b.ordine)
    .map(t => [t.lat, t.lng])

  return (
    <MapContainer
      center={[35, 105]}
      zoom={4}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="© OpenStreetMap contributors"
      />

      <ControlloZoom tappaSelezionata={tappaSelezionata} />

      {/* vista globale: polyline + tutti i pin */}
      {!tappaSelezionata && (
        <>
          <Polyline
            positions={percorso}
            color="#b5451b"
            weight={2}
            dashArray="6 4"
          />
          {tappe.map((tappa) => (
            <Marker
              key={tappa.id}
              position={[tappa.lat, tappa.lng]}
              eventHandlers={{ click: () => onTappaClick(tappa) }}
            >
              <Popup>
                <strong>{tappa.nome}</strong><br />
                <small>{tappa.notti} notti · {tappa.data_arrivo}</small>
              </Popup>
            </Marker>
          ))}
        </>
      )}

      {/* vista tappa: solo il pin della tappa selezionata */}
      {tappaSelezionata && (
        <Marker position={[tappaSelezionata.lat, tappaSelezionata.lng]}>
          <Popup>{tappaSelezionata.nome}</Popup>
        </Marker>
      )}
    </MapContainer>
  )
}

export default Mappa