import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import ModificaViaggio from './pages/ModificaViaggio'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/modifica/nuovo" element={<ModificaViaggio />} />
      <Route path="/modifica/:id" element={<ModificaViaggio />} />
    </Routes>
  )
}

export default App