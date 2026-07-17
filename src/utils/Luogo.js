// Prova a estrarre lat/lng da un link Google Maps del tipo ".../@45.464,9.19,17z..."
// Se il link non contiene quel pattern, restituisce null e si salva comunque solo il link.
export function estraiCoordDaLink(link) {
  const match = link.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
  return match ? { lat: parseFloat(match[1]), lng: parseFloat(match[2]) } : null
}