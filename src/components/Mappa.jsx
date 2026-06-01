import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import viaggi from '../data/viaggi'

// fix per un bug noto di Leaflet con React
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

function Mappa() {
  return (
    <MapContainer
      center={[48, 10]}
      zoom={4}
      style={{ height: '500px', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="© OpenStreetMap contributors"
      />
      {viaggi.map((viaggio) => (
        <Marker key={viaggio.id} position={[viaggio.lat, viaggio.lng]}>
          <Popup>
            <strong>{viaggio.nome}</strong><br />
            {viaggio.paese} — {viaggio.anno}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}

export default Mappa