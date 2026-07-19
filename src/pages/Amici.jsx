import { useEffect, useState } from 'react'
import { fetchUtenti, inviaRichiestaAmicizia, rispondiRichiestaAmicizia, rimuoviAmicizia } from '../api/client'
import './Amici.css'

function Avatar({ utente }) {
  if (utente.avatar_url) {
    return <img src={utente.avatar_url} alt="" className="amici__avatar" />
  }
  const iniziale = (utente.nome || utente.email || '?').charAt(0).toUpperCase()
  return <div className="amici__avatar amici__avatar--placeholder">{iniziale}</div>
}

function Amici() {
  const [utenti, setUtenti] = useState([])
  const [caricamento, setCaricamento] = useState(true)
  const [errore, setErrore] = useState(null)
  const [filtro, setFiltro] = useState('')
  const [inCorso, setInCorso] = useState(null) // id utente su cui è in corso un'azione

  function ricarica() {
    return fetchUtenti().then(setUtenti).catch(err => setErrore(err.message))
  }

  useEffect(() => {
    ricarica().finally(() => setCaricamento(false))
  }, [])

  async function esegui(azione, idUtente) {
    setInCorso(idUtente)
    setErrore(null)
    try {
      await azione()
      await ricarica()
    } catch (err) {
      setErrore(err.message)
    } finally {
      setInCorso(null)
    }
  }

  if (caricamento) {
    return <div className="amici-wrap"><p style={{ padding: '2rem', color: 'var(--text-muted)' }}>Caricamento...</p></div>
  }

  const ricevute = utenti.filter(u => u.stato_amicizia === 'richiesta_ricevuta')
  const amici    = utenti.filter(u => u.stato_amicizia === 'amici')
  const altri    = utenti
    .filter(u => u.stato_amicizia === 'nessuna' || u.stato_amicizia === 'richiesta_inviata')
    .filter(u => (u.nome || u.email).toLowerCase().includes(filtro.toLowerCase()))

  return (
    <div className="amici-wrap">
      <div className="amici-contenuto">

        <div className="amici-header">
          <h1 className="amici-titolo">Amici</h1>
          <p className="amici-sub">Aggiungi amici per poterli invitare nelle Sfide</p>
        </div>

        {errore && <p className="amici-errore">Errore: {errore}</p>}

        {ricevute.length > 0 && (
          <div className="amici-sezione">
            <h2 className="amici-sezione__titolo">Richieste ricevute</h2>
            <div className="amici-lista">
              {ricevute.map(u => (
                <div key={u.id} className="amici-riga">
                  <Avatar utente={u} />
                  <span className="amici-nome">{u.nome || u.email}</span>
                  <div className="amici-azioni">
                    <button
                      className="amici-btn amici-btn--accetta"
                      disabled={inCorso === u.id}
                      onClick={() => esegui(() => rispondiRichiestaAmicizia(u.amicizia_id, 'accetta'), u.id)}
                    >
                      Accetta
                    </button>
                    <button
                      className="amici-btn amici-btn--rifiuta"
                      disabled={inCorso === u.id}
                      onClick={() => esegui(() => rispondiRichiestaAmicizia(u.amicizia_id, 'rifiuta'), u.id)}
                    >
                      Rifiuta
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="amici-sezione">
          <h2 className="amici-sezione__titolo">I tuoi amici {amici.length > 0 && `(${amici.length})`}</h2>
          {amici.length === 0 ? (
            <p className="amici-vuoto">Non hai ancora amici — cercali qui sotto e invia una richiesta.</p>
          ) : (
            <div className="amici-lista">
              {amici.map(u => (
                <div key={u.id} className="amici-riga">
                  <Avatar utente={u} />
                  <span className="amici-nome">{u.nome || u.email}</span>
                  <div className="amici-azioni">
                    <button
                      className="amici-btn amici-btn--rimuovi"
                      disabled={inCorso === u.id}
                      onClick={() => {
                        if (!window.confirm(`Rimuovere ${u.nome || u.email} dagli amici?`)) return
                        esegui(() => rimuoviAmicizia(u.amicizia_id), u.id)
                      }}
                    >
                      Rimuovi
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="amici-sezione">
          <h2 className="amici-sezione__titolo">Trova persone</h2>
          <input
            className="amici-cerca"
            placeholder="Cerca per nome o email..."
            value={filtro}
            onChange={e => setFiltro(e.target.value)}
          />
          <div className="amici-lista">
            {altri.map(u => (
              <div key={u.id} className="amici-riga">
                <Avatar utente={u} />
                <span className="amici-nome">{u.nome || u.email}</span>
                <div className="amici-azioni">
                  {u.stato_amicizia === 'richiesta_inviata' ? (
                    <button
                      className="amici-btn amici-btn--annulla"
                      disabled={inCorso === u.id}
                      onClick={() => esegui(() => rimuoviAmicizia(u.amicizia_id), u.id)}
                    >
                      Richiesta inviata — annulla
                    </button>
                  ) : (
                    <button
                      className="amici-btn amici-btn--aggiungi"
                      disabled={inCorso === u.id}
                      onClick={() => esegui(() => inviaRichiestaAmicizia(u.id), u.id)}
                    >
                      Aggiungi amico
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}

export default Amici