import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import ModificaViaggio from './pages/ModificaViaggio'
import { UtenteProvider } from './contesto/UtenteContesto'
import BarraUtente from './components/BarraUtente'

function App() {
  return (
    <UtenteProvider>
      <BarraUtente />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/modifica/nuovo" element={<ModificaViaggio />} />
        <Route path="/modifica/:id" element={<ModificaViaggio />} />
      </Routes>
    </UtenteProvider>
  )
}

export default App