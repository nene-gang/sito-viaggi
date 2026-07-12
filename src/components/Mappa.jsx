import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker, useMap, GeoJSON } from 'react-leaflet'
import { useEffect, useState } from 'react'
import 'leaflet/dist/leaflet.css'
import './Mappa.css'
import L from 'leaflet'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// Un colore per viaggio — si assegna in ordine
const COLORI_VIAGGIO = ['#b5451b', '#1b6eb5', '#1bb57a', '#9b1bb5', '#b5a01b']

function ControlloZoom({ tappaSelezionata, vistaGlobale }) {
  const map = useMap()
  useEffect(() => {
    if (tappaSelezionata) {
      map.flyTo([tappaSelezionata.lat, tappaSelezionata.lng], 12, { duration: 1.2 })
    } else if (vistaGlobale) {
      map.flyTo([20, 15], 2, { duration: 1.2 })
    } else {
      map.flyTo([35, 105], 4, { duration: 1.2 })
    }
  }, [tappaSelezionata, vistaGlobale])
  return null
}

function Mappa({ viaggi = [], onTappaClick, tappaSelezionata, vistaGlobale, giornoSelezionato, tuttiGiorni }) {
  const [geoData, setGeoData] = useState(null)

  // Mappa ISO → stato del viaggio ('passato' o 'futuro')
  const paesiPerStato = {}
  viaggi.forEach(v => {
    v.tappe.forEach(t => {
      if (!t.paese_iso) return
      // se il paese appare in più viaggi, 'passato' ha priorità
      if (!paesiPerStato[t.paese_iso] || v.stato === 'passato') {
        paesiPerStato[t.paese_iso] = v.stato
      }
    })
  })

  // Carica GeoJSON solo quando serve la vista globale
  useEffect(() => {
    if (!vistaGlobale) return
    if (geoData) return
    fetch('https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson')
      .then(r => r.json())
      .then(data => setGeoData(data))
      .catch(err => console.error('Errore caricamento GeoJSON:', err))
  }, [vistaGlobale])

  // Stile poligoni — colore in base allo stato del viaggio
  function stilePaese(feature) {
    const iso = feature.properties['ISO3166-1-Alpha-2']
    const stato = paesiPerStato[iso]
    if (stato === 'passato') {
      return { fillColor: '#b5451b', fillOpacity: 0.25, color: '#b5451b', weight: 1 }
    }
    if (stato === 'futuro') {
      return { fillColor: 'transparent', fillOpacity: 0, color: '#1b6eb5', weight: 1.5, dashArray: '4 3' }
    }
    return { fillColor: 'transparent', fillOpacity: 0, color: 'transparent', weight: 0 }
  }

  return (
    <MapContainer
      center={vistaGlobale ? [20, 15] : [35, 105]}
      zoom={vistaGlobale ? 2 : 4}
      style={{ height: '100%', width: '100%' }}
      minZoom={2}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>'
      />

      <ControlloZoom tappaSelezionata={tappaSelezionata} vistaGlobale={vistaGlobale} />

      {/* paesi colorati — solo vista globale */}
      {vistaGlobale && geoData && (
        <GeoJSON key="paesi" data={geoData} style={stilePaese} />
      )}

      {/* vista viaggi: una polyline per viaggio + pin */}
      {!vistaGlobale && !tappaSelezionata && viaggi.map((viaggio, idx) => {
        const percorso = viaggio.tappe
          .slice()
          .sort((a, b) => a.ordine - b.ordine)
          .map(t => [t.lat, t.lng])
        const colore = COLORI_VIAGGIO[idx % COLORI_VIAGGIO.length]

        return (
          <Polyline
            key={viaggio.id}
            positions={percorso}
            color={colore}
            weight={2}
            dashArray="6 4"
          />
        )
      })}

      {!vistaGlobale && !tappaSelezionata && viaggi.flatMap((viaggio, idx) => {
        const colore = COLORI_VIAGGIO[idx % COLORI_VIAGGIO.length]
        return viaggio.tappe.map(tappa => (
          <Marker
            key={tappa.id}
            position={[tappa.lat, tappa.lng]}
            eventHandlers={{ click: () => onTappaClick(tappa) }}
          >
            <Popup>
              <div className="popup-nome">{tappa.nome}</div>
              <div className="popup-info">{tappa.notti} notti · {tappa.data_arrivo}</div>
            </Popup>
          </Marker>
        ))
      })}

      {/* vista tappa: pin attrazioni + polyline percorso giorno */}
      {tappaSelezionata && (() => {
        const haGiorni = tappaSelezionata.giorni && tappaSelezionata.giorni.length > 0

        // Se non ha itinerario: solo marker città
        if (!haGiorni) {
          return (
            <Marker position={[tappaSelezionata.lat, tappaSelezionata.lng]}>
              <Popup><div className="popup-nome">{tappaSelezionata.nome}</div></Popup>
            </Marker>
          )
        }

        // Seleziona i giorni da mostrare
        // 'info' o tuttiGiorni → mostra tutte le attrazioni
        const giorniDaMostrare = (tuttiGiorni || giornoSelezionato === 'info')
          ? tappaSelezionata.giorni
          : [tappaSelezionata.giorni[giornoSelezionato]].filter(Boolean)

        // Attrazioni con coordinate per i giorni selezionati
        const attrazioni = giorniDaMostrare.flatMap(g =>
          g.attivita.filter(a => a.tipo === 'attrazione' && a.lat && a.lng)
        )

        // Polyline che unisce le attrazioni nell'ordine dell'itinerario
        const percorsoGiorno = attrazioni.map(a => [a.lat, a.lng])

        return (
          <>
            {percorsoGiorno.length > 1 && (
              <Polyline
                positions={percorsoGiorno}
                color="#b5451b"
                weight={2}
                dashArray="4 3"
                opacity={0.6}
              />
            )}
            {attrazioni.map((a, i) => (
              <CircleMarker
                key={`att-${i}`}
                center={[a.lat, a.lng]}
                radius={7}
                pathOptions={{
                  fillColor: '#b5451b',
                  fillOpacity: 0.9,
                  color: '#fff',
                  weight: 2,
                }}
              >
                <Popup>
                  <div className="popup-nome">{a.nome}</div>
                  {a.ora && <div className="popup-info">{a.ora}</div>}
                </Popup>
              </CircleMarker>
            ))}
          </>
        )
      })()}

    </MapContainer>
  )
}

export default Mappa