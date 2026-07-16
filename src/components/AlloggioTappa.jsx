import { useState } from 'react'
import RicercaLuogo from './RicercaLuogo'

export const HOTEL_VUOTO = { nome: '', lat: '', lng: '', indirizzo: '', link: '', link_prenotazione: '', costo: '', prenotazione: '', note: '' }

// Prova a estrarre lat/lng da un link Google Maps del tipo ".../@45.464,9.19,17z..."
// Se il link non contiene quel pattern, restituisce null e si salva comunque solo il link.
function estraiCoordDaLink(link) {
  const match = link.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
  return match ? { lat: parseFloat(match[1]), lng: parseFloat(match[2]) } : null
}

function AlloggioTappa({ hotel, onCambia, apertoDiDefault = false }) {
  const [espanso, setEspanso]     = useState(apertoDiDefault)
  const [linkInput, setLinkInput] = useState('')

  function aggiorna(campo, valore) {
    onCambia({ ...hotel, [campo]: valore })
  }

  function daRicerca(datiLuogo) {
    onCambia({
      ...hotel,
      nome: datiLuogo.nome,
      lat: datiLuogo.lat,
      lng: datiLuogo.lng,
      indirizzo: datiLuogo.indirizzo || hotel.indirizzo,
    })
  }

  function usaLink() {
    if (!linkInput.trim()) return
    const coord = estraiCoordDaLink(linkInput)
    onCambia({
      ...hotel,
      link: linkInput.trim(),
      ...(coord || {}),
    })
    setLinkInput('')
  }

  function rimuovi() {
    onCambia({ ...HOTEL_VUOTO })
    setEspanso(false)
  }

  const haHotel = !!(hotel?.nome || hotel?.link)

  return (
    <div className="form-viaggio__alloggio">
      <button
        type="button"
        className="form-viaggio__alloggio-toggle"
        onClick={() => setEspanso(e => !e)}
      >
        <span>🏨 {haHotel ? (hotel.nome || 'Alloggio (via link)') : 'Aggiungi alloggio'}</span>
        <span>{espanso ? '▲' : '▼'}</span>
      </button>

      {espanso && (
        <div className="form-viaggio__alloggio-corpo">
          <RicercaLuogo onSeleziona={daRicerca} />

          <div className="form-viaggio__riga-link">
            <input
              className="form-viaggio__input"
              placeholder="...oppure incolla un link Google Maps"
              value={linkInput}
              onChange={e => setLinkInput(e.target.value)}
            />
            <button type="button" onClick={usaLink} disabled={!linkInput.trim()}>Usa</button>
          </div>

          {haHotel && (
            <>
              <input
                className="form-viaggio__input"
                placeholder="Nome alloggio"
                value={hotel.nome || ''}
                onChange={e => aggiorna('nome', e.target.value)}
              />
              <input
                className="form-viaggio__input"
                placeholder="Indirizzo"
                value={hotel.indirizzo || ''}
                onChange={e => aggiorna('indirizzo', e.target.value)}
              />
              <div className="form-viaggio__riga">
                <input
                  className="form-viaggio__input"
                  placeholder="Costo (es. 80€/notte)"
                  value={hotel.costo || ''}
                  onChange={e => aggiorna('costo', e.target.value)}
                />
                <input
                  className="form-viaggio__input"
                  placeholder="Codice prenotazione"
                  value={hotel.prenotazione || ''}
                  onChange={e => aggiorna('prenotazione', e.target.value)}
                />
              </div>
              <input
                className="form-viaggio__input"
                placeholder="Link prenotazione (Booking, Trip.com...)"
                value={hotel.link_prenotazione || ''}
                onChange={e => aggiorna('link_prenotazione', e.target.value)}
              />
              <textarea
                className="form-viaggio__textarea"
                placeholder="Note (check-in, colazione...)"
                rows={2}
                value={hotel.note || ''}
                onChange={e => aggiorna('note', e.target.value)}
              />
              <button type="button" className="form-viaggio__alloggio-rimuovi" onClick={rimuovi}>
                Rimuovi alloggio
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default AlloggioTappa