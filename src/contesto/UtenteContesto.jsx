import { createContext, useContext, useEffect, useState } from 'react'
import { fetchUtenteCorrente, urlLogin, logout as logoutApi, registrati as registratiApi, accedi as accediApi } from '../api/client'

const UtenteContesto = createContext(null)

// Avvolge l'app: al primo caricamento chiede al Worker "chi sono?" tramite
// il cookie di sessione, e mette il risultato a disposizione di ogni pagina
// con useUtente(), senza dover rifare la chiamata ad ogni componente.
export function UtenteProvider({ children }) {
  const [utente, setUtente] = useState(null)
  const [caricando, setCaricando] = useState(true)

  useEffect(() => {
    fetchUtenteCorrente()
      .then(dati => setUtente(dati.utente))
      .catch(() => setUtente(null))
      .finally(() => setCaricando(false))
  }, [])

  function login() {
    window.location.href = urlLogin()
  }

  async function logout() {
    await logoutApi()
    window.location.reload()
  }

  // Dopo la registrazione/login nativo il server ha già creato la sessione
  // (cookie impostato nella risposta). Ricarichiamo la pagina invece di
  // limitarci ad aggiornare lo stato: è lo stesso identico comportamento
  // che ha già il login Google (redirect completo), e garantisce che ogni
  // componente riparta da zero con la sessione valida — evita che pagine
  // già montate prima del login restino con dati/errori vecchi.
  async function registrati(email, password, nome) {
    await registratiApi(email, password, nome)
    window.location.reload()
  }

  async function accedi(email, password) {
    await accediApi(email, password)
    window.location.reload()
  }

  return (
    <UtenteContesto.Provider value={{ utente, caricando, login, logout, registrati, accedi }}>
      {children}
    </UtenteContesto.Provider>
  )
}

export function useUtente() {
  return useContext(UtenteContesto)
}