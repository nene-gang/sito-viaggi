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
    setUtente(null)
  }

  // Dopo la registrazione/login nativo il server ha già creato la sessione
  // (cookie impostato nella risposta), quindi basta ricaricare "chi sono"
  // invece di rifare tutto il giro come per Google.
  async function registrati(email, password, nome) {
    await registratiApi(email, password, nome)
    const dati = await fetchUtenteCorrente()
    setUtente(dati.utente)
  }

  async function accedi(email, password) {
    await accediApi(email, password)
    const dati = await fetchUtenteCorrente()
    setUtente(dati.utente)
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