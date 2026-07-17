import { useState } from 'react'
import RicercaLuogo from './RicercaLuogo'
import { estraiCoordDaLink } from '../utils/luogo'

export const TRASPORTO_VUOTO = { mezzo: '', mezzo_altro: '', dettagli: '', lat: '', lng: '', link: '' }

const MEZZI = [
  { valore: 'aereo', label: '✈ Aereo' },
  { valore: 'treno', label: '🚆 Treno' },
  { valore: 'auto', label: '🚗 Auto' },
  { valore: 'nave', label: '⛴ Nave' },
  { valore: 'altro', label: 'Altro' },
]

function etichettaMezzo(t) {
  if (!t?.mezzo) return null
  const voce = MEZZI.find(m => m.valore === t.mezzo)
  return t.mezzo === 'altro' ? (t.mezzo_altro || 'Altro') : (voce?.label || t.mezzo)
}

function TrasportoTappa({ trasporto, onCambia, direzione, apertoDiDefault = false }) {
  const [espanso, setEspanso]     = useState(apertoDiDefault)
  const [linkInput, setLinkInput] = useState('')

  function aggiorna(campo, valore) {
    onCambia({ ...trasporto, [campo]: valore })
  }

  function daRicerca(datiLuogo) {
    onCambia({
      ...trasporto,
      lat: datiLuogo.lat,
      lng: datiLuogo.lng,
      link: '',
    })
  }

  function usaLink() {
    if (!linkInput.trim()) return
    const coord = estraiCoordDaLink(linkInput)
    onCambia({
      ...trasporto,
      link: linkInput.trim(),
      ...(coord || {}),
    })
    setLinkInput('')
  }

  function rimuovi() {
    onCambia({ ...TRASPORTO_VUOTO })
    setEspanso(false)
  }

  const haTrasporto = !!(trasporto?.mezzo || trasporto?.dettagli)
  const icona = direzione === 'arrivo' ? '→' : '←'
  const etichettaDirezione = direzione === 'arrivo' ? 'Arrivo' : 'Partenza'

  return (
    <div className="form-viaggio__alloggio">
      <button
        type="button"
        className="form-viaggio__alloggio-toggle"
        onClick={() => setEspanso(e => !e)}
      >
        <span>
          {icona} {etichettaDirezione}
          {haTrasporto ? ` — ${etichettaMezzo(trasporto)}` : ': aggiungi dettagli'}
        </span>
        <span>{espanso ? '▲' : '▼'}</span>
      </button>

      {espanso && (
        <div className="form-viaggio__alloggio-corpo">
          <select
            className="form-viaggio__input"
            value={trasporto?.mezzo || ''}
            onChange={e => aggiorna('mezzo', e.target.value)}
          >
            <option value="">Mezzo...</option>
            {MEZZI.map(m => (
              <option key={m.valore} value={m.valore}>{m.label}</option>
            ))}
          </select>

          {trasporto?.mezzo === 'altro' && (
            <input
              className="form-viaggio__input"
              placeholder="Specifica il mezzo"
              value={trasporto?.mezzo_altro || ''}
              onChange={e => aggiorna('mezzo_altro', e.target.value)}
            />
          )}

          <textarea
            className="form-viaggio__textarea"
            placeholder="Dettagli (numero volo/treno, orario...)"
            rows={2}
            value={trasporto?.dettagli || ''}
            onChange={e => aggiorna('dettagli', e.target.value)}
          />

          <p className="form-viaggio__label form-viaggio__label--small">
            Posizione stazione/aeroporto (facoltativa)
          </p>
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

          {haTrasporto && (
            <button type="button" className="form-viaggio__alloggio-rimuovi" onClick={rimuovi}>
              Rimuovi trasporto
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default TrasportoTappa