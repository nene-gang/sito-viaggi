import { useState } from 'react'
import Mappa from './components/Mappa'
import PannelloTappa from './components/PannelloTappa'
import './App.css'

function App() {
  const [tappaSelezionata, setTappaSelezionata] = useState(null)
  const [giornoSelezionato, setGiornoSelezionato] = useState(0)

  function apriTappa(tappa) {
    setTappaSelezionata(tappa)
    setGiornoSelezionato(0) // sempre dal primo giorno
  }

  function chiudiTappa() {
    setTappaSelezionata(null)
    setGiornoSelezionato(0)
  }

  return (
    <div style={{ display: 'flex', height: '100vh', flexDirection: 'column' }}>
      <h1 style={{ padding: '12px 20px', margin: 0, fontSize: '1.2rem', borderBottom: '1px solid #ddd' }}>
        I miei viaggi
      </h1>
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <div style={{ flex: 1 }}>
          <Mappa
            onTappaClick={apriTappa}
            tappaSelezionata={tappaSelezionata}
          />
        </div>
        {tappaSelezionata && (
          <PannelloTappa
            tappa={tappaSelezionata}
            giornoSelezionato={giornoSelezionato}
            onCambiaGiorno={setGiornoSelezionato}
            onChiudi={chiudiTappa}
          />
        )}
      </div>
    </div>
  )
}

export default App