import { useUtente } from '../contesto/UtenteContesto'
import './BarraUtente.css'

function BarraUtente() {
  const { utente, caricando, login, logout } = useUtente()

  if (caricando) return null

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
        <button className="barra-utente-bottone" onClick={login}>Accedi con Google</button>
      )}
    </div>
  )
}

export default BarraUtente