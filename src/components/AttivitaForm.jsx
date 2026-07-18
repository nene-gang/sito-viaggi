import { useState } from 'react'
import RicercaLuogo from './RicercaLuogo'
import { estraiCoordDaLink } from '../utils/luogo'

export const ATTIVITA_VUOTA = { ora: '', nome: '', tipo: '', note: '', link: '', lat: '', lng: '', aggiungi_checklist: false }

export const TIPI_ATTIVITA = [
  { valore: 'attrazione', label: '📍 Attrazione' },
  { valore: 'ristorante', label: '🍽 Ristorante/locale' },
  { valore: 'logistica', label: '🚌 Logistica' },
  { valore: 'altro', label: 'Altro' },
]

function AttivitaForm({ attivita, onCambia }) {
  const [linkMappaInput, setLinkMappaInput] = useState('')

  function aggiorna(campo, valore) {
    onCambia({ ...attivita, [campo]: valore })
  }

  function daRicerca(datiLuogo) {
    onCambia({ ...attivita, lat: datiLuogo.lat, lng: datiLuogo.lng })
  }

  function usaLinkMappa() {
    if (!linkMappaInput.trim()) return
    const coord = estraiCoordDaLink(linkMappaInput)
    if (coord) onCambia({ ...attivita, ...coord })
    setLinkMappaInput('')
  }

  return (
    <div className="form-viaggio__alloggio-corpo">
      <div className="form-viaggio__riga">
        <input
          className="form-viaggio__input"
          type="time"
          value={attivita.ora || ''}
          onChange={e => aggiorna('ora', e.target.value)}
        />
        <select
          className="form-viaggio__input"
          value={attivita.tipo || ''}
          onChange={e => aggiorna('tipo', e.target.value)}
        >
          <option value="">Tipo...</option>
          {TIPI_ATTIVITA.map(t => (
            <option key={t.valore} value={t.valore}>{t.label}</option>
          ))}
        </select>
      </div>

      <input
        className="form-viaggio__input"
        placeholder="Nome (es. Tempio d'Oro, Trattoria da Mario...)"
        value={attivita.nome || ''}
        onChange={e => aggiorna('nome', e.target.value)}
      />

      <textarea
        className="form-viaggio__textarea"
        placeholder="Note (es. prenotazione consigliata, biglietto da comprare...)"
        rows={2}
        value={attivita.note || ''}
        onChange={e => aggiorna('note', e.target.value)}
      />

      <input
        className="form-viaggio__input"
        placeholder="Link (prenotazione, biglietti, sito...)"
        value={attivita.link || ''}
        onChange={e => aggiorna('link', e.target.value)}
      />

      <p className="form-viaggio__label form-viaggio__label--small">Posizione sulla mappa (facoltativa)</p>
      <RicercaLuogo onSeleziona={daRicerca} />
      <div className="form-viaggio__riga-link">
        <input
          className="form-viaggio__input"
          placeholder="...oppure incolla un link Google Maps"
          value={linkMappaInput}
          onChange={e => setLinkMappaInput(e.target.value)}
        />
        <button type="button" onClick={usaLinkMappa} disabled={!linkMappaInput.trim()}>Usa</button>
      </div>

      <label className="form-viaggio__checkbox">
        <input
          type="checkbox"
          checked={!!attivita.aggiungi_checklist}
          onChange={e => aggiorna('aggiungi_checklist', e.target.checked)}
        />
        Aggiungi alla checklist di partenza
      </label>
    </div>
  )
}

export default AttivitaForm