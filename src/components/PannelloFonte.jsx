import { useState } from 'react'
import './PannelloFonte.css'

const MESSAGGI_ATTESA = [
  'Sto leggendo il testo…',
  'Cerco date e località…',
  'Ancora un momento…',
]

/**
 * Riquadro "incolla un testo e fammelo leggere".
 * Non decide niente: chiama /api/viaggi/proponi e passa la proposta a chi lo usa.
 */
function PannelloFonte({ onProposta, onAnnulla, etichettaAnnulla = 'Annulla', testoIniziale = '' }) {
  const [testo, setTesto] = useState(testoIniziale)
  const [attesa, setAttesa] = useState(false)
  const [messaggio, setMessaggio] = useState(MESSAGGI_ATTESA[0])
  const [errore, setErrore] = useState(null)

  async function analizza() {
    if (!testo.trim()) return
    setErrore(null)
    setAttesa(true)

    let i = 0
    const timer = setInterval(() => {
      i = (i + 1) % MESSAGGI_ATTESA.length
      setMessaggio(MESSAGGI_ATTESA[i])
    }, 2500)

    try {
      const res = await fetch('/api/viaggi/proponi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ testo }),
      })
      const dati = await res.json()
      if (!res.ok || !dati.proposta) {
        throw new Error(dati.errore || 'Non sono riuscito a leggere il testo')
      }
      setTesto('')
      onProposta(dati.proposta, dati.avvisi || [])
    } catch (e) {
      setErrore(e.message)
    } finally {
      clearInterval(timer)
      setAttesa(false)
    }
  }

  if (attesa) {
    return (
      <div className="fonte fonte--attesa">
        <span className="fonte__punti"><i /><i /><i /></span>
        {messaggio}
      </div>
    )
  }

  return (
    <div className="fonte">
      <textarea
        value={testo}
        onChange={e => setTesto(e.target.value)}
        placeholder="Incolla qui una mail di conferma, un itinerario, i tuoi appunti…"
        rows={7}
      />
      {errore && <p className="fonte__errore">{errore}</p>}
      <div className="fonte__azioni">
        <button className="fonte__primario" onClick={analizza} disabled={!testo.trim()}>
          Analizza
        </button>
        {onAnnulla && (
          <button className="fonte__secondario" onClick={onAnnulla}>
            {etichettaAnnulla}
          </button>
        )}
      </div>
    </div>
  )
}

export default PannelloFonte
