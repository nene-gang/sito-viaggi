import { useState } from 'react'
import { useUtente } from '../contesto/UtenteContesto'
import './BarraUtente.css'

function BarraUtente() {
  const { utente, caricando, login, logout, registrati, accedi } = useUtente()
  const [formAperto, setFormAperto] = useState(false)
  const [modo, setModo] = useState('accedi') // 'accedi' | 'registrati'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nome, setNome] = useState('')
  const [errore, setErrore] = useState(null)
  const [inCorso, setInCorso] = useState(false)

  if (caricando) return null

  function cambiaModo(nuovoModo) {
    setModo(nuovoModo)
    setErrore(null)
  }

  async function invia(e) {
    e.preventDefault()
    setErrore(null)
    setInCorso(true)
    try {
      if (modo === 'accedi') {
        await accedi(email, password)
      } else {
        await registrati(email, password, nome)
      }
    } catch (err) {
      setErrore(err.message)
    } finally {
      setInCorso(false)
    }
  }

  return (
    <div className="barra-utente">
      {utente ? (
        <>
          {utente.avatar_url && (
            <img src={utente.avatar_url} alt="" className="barra-utente-avatar" />
          )}
          <span className="barra-utente-nome">{utente.nome || utente.email}</span>
          <button className="barra-utente-bottone" onClick={logout}>Esci</button>
        </>
      ) : (
        <div className="barra-utente__accesso">
          <button className="barra-utente-bottone" onClick={login}>Accedi con Google</button>
          <button
            type="button"
            className="barra-utente-link"
            onClick={() => setFormAperto(f => !f)}
          >
            oppure con email
          </button>

          {formAperto && (
            <form className="barra-utente__form" onSubmit={invia}>
              {modo === 'registrati' && (
                <input
                  className="barra-utente__input"
                  placeholder="Nome"
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                />
              )}
              <input
                className="barra-utente__input"
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <input
                className="barra-utente__input"
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={8}
              />
              {errore && <p className="barra-utente__errore">{errore}</p>}
              <button type="submit" className="barra-utente-bottone" disabled={inCorso}>
                {inCorso ? '...' : modo === 'accedi' ? 'Accedi' : 'Crea account'}
              </button>
              <button
                type="button"
                className="barra-utente-link"
                onClick={() => cambiaModo(modo === 'accedi' ? 'registrati' : 'accedi')}
              >
                {modo === 'accedi' ? 'Non hai un account? Registrati' : 'Hai già un account? Accedi'}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  )
}

export default BarraUtente