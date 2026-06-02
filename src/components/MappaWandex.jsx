import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './MappaWandex.css'

function MappaWandex({ items, visitati, colore, centro, zoom, altezza = 420 }) {
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
      const isVisitato = visitati.has(key)

      const icon = L.divIcon({
        html: `<div style="
          width: 10px; height: 10px; border-radius: 50%;
          background: ${isVisitato ? colore : '#c8c4bc'};
          border: 2px solid ${isVisitato ? colore : '#9e9a94'};
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
            <strong style="color:${isVisitato ? colore : '#5c5750'}">${item.nome}</strong>
            ${item.paese ? `<div style="color:#9e9a94;font-size:11px;margin-top:2px">${item.paese}</div>` : ''}
            ${item.regione ? `<div style="color:#9e9a94;font-size:11px;margin-top:2px">${item.regione}</div>` : ''}
            <div style="margin-top:4px;font-size:11px;color:${isVisitato ? colore : '#9e9a94'}">
              ${isVisitato ? '✓ Visitato' : 'Non ancora'}
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
  }, [items, visitati, colore, centro, zoom])

  return (
    <div
      ref={mapRef}
      className="mappa-wandex"
      style={{ height: altezza }}
    />
  )
}

export default MappaWandex