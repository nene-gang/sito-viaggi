import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './MappaWandex.css'

// Colori per il confronto con un amico — indipendenti dal colore della
// categoria, così restano riconoscibili in tutte e tre le categorie.
const COLORE_ENTRAMBI = '#d4af37'
const COLORE_SOLO_AMICO = '#a855f7'
const COLORE_NESSUNO = '#c8c4bc'

function MappaWandex({ items, visitati, colore, centro, zoom, altezza = 420, visitatiAmico = null, nomeAmico = '' }) {
  const mapRef = useRef(null)
  const instanceRef = useRef(null)

  useEffect(() => {
    if (!mapRef.current) return
    if (instanceRef.current) {
      instanceRef.current.remove()
      instanceRef.current = null
    }

    const map = L.map(mapRef.current, {
      center: centro,
      zoom: zoom,
      zoomControl: true,
      attributionControl: false,
    })
    instanceRef.current = map

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png').addTo(map)

    items.forEach(item => {
      if (!item.lat || !item.lng) return
      const key = item.cod || item.nome
      const tuVisitato = visitati.has(key)
      const amicoVisitato = visitatiAmico ? visitatiAmico.has(key) : false

      let coloreMarker, coloreBordo, etichetta
      if (visitatiAmico) {
        if (tuVisitato && amicoVisitato) { coloreMarker = COLORE_ENTRAMBI; etichetta = `✓ Entrambi` }
        else if (tuVisitato) { coloreMarker = colore; etichetta = '✓ Solo tu' }
        else if (amicoVisitato) { coloreMarker = COLORE_SOLO_AMICO; etichetta = `✓ Solo ${nomeAmico || 'amico'}` }
        else { coloreMarker = COLORE_NESSUNO; etichetta = 'Nessuno dei due' }
        coloreBordo = coloreMarker
      } else {
        coloreMarker = tuVisitato ? colore : COLORE_NESSUNO
        coloreBordo = tuVisitato ? colore : '#9e9a94'
        etichetta = tuVisitato ? '✓ Visitato' : 'Non ancora'
      }

      const icon = L.divIcon({
        html: `<div style="
          width: 10px; height: 10px; border-radius: 50%;
          background: ${coloreMarker};
          border: 2px solid ${coloreBordo};
          box-shadow: 0 1px 4px rgba(0,0,0,0.2);
          transition: transform 0.15s;
        "></div>`,
        iconSize: [10, 10],
        iconAnchor: [5, 5],
        className: '',
      })

      L.marker([item.lat, item.lng], { icon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family:sans-serif;font-size:12px;min-width:100px">
            <strong style="color:${coloreMarker}">${item.nome}</strong>
            ${item.paese ? `<div style="color:#9e9a94;font-size:11px;margin-top:2px">${item.paese}</div>` : ''}
            ${item.regione ? `<div style="color:#9e9a94;font-size:11px;margin-top:2px">${item.regione}</div>` : ''}
            <div style="margin-top:4px;font-size:11px;color:${coloreMarker}">
              ${etichetta}
            </div>
          </div>
        `, { maxWidth: 180 })
    })

    setTimeout(() => map.invalidateSize(), 100)

    return () => {
      if (instanceRef.current) {
        instanceRef.current.remove()
        instanceRef.current = null
      }
    }
  }, [items, visitati, colore, centro, zoom, visitatiAmico, nomeAmico])

  return (
    <div
      ref={mapRef}
      className="mappa-wandex"
      style={{ height: altezza }}
    />
  )
}

export default MappaWandex