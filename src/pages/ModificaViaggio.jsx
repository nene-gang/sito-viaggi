import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { fetchViaggio } from '../api/client'
import FormViaggio from '../components/FormViaggio'

function ModificaViaggio() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [viaggio, setViaggio] = useState(null)
  const [loading, setLoading] = useState(!!id)

  useEffect(() => {
    if (!id) return
    fetchViaggio(id)
      .then(setViaggio)
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <p style={{ padding: '2rem' }}>Caricamento...</p>

  return (
    <div style={{ padding: '1rem', maxWidth: '600px', margin: '0 auto' }}>
      <FormViaggio
        viaggio={viaggio}
        onSalvato={() => navigate('/')}
        onAnnulla={() => navigate('/')}
        onEliminato={() => navigate('/')}
      />
    </div>
  )
}

export default ModificaViaggio