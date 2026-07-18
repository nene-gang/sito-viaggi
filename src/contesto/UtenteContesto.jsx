import { createContext, useContext, useEffect, useState } from 'react'
import { fetchUtenteCorrente, urlLogin, logout as logoutApi } from '../api/client'

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

  return (
    <UtenteContesto.Provider value={{ utente, caricando, login, logout }}>
      {children}
    </UtenteContesto.Provider>
  )
}

export function useUtente() {
  return useContext(UtenteContesto)
}