function PannelloTappa({ tappa, giornoSelezionato, onCambiaGiorno, onChiudi }) {
  const giorno = tappa.giorni[giornoSelezionato]

  const avvisiGiorno = giorno.attivita.filter(a => a.avviso)

  return (
    <div style={{
      width: '360px',
      overflowY: 'auto',
      borderLeft: '1px solid #ddd',
      padding: '20px',
      backgroundColor: '#fafafa',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    }}>

      {/* intestazione con bottone torna */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <button
            onClick={onChiudi}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', fontSize: '0.8rem', padding: 0, marginBottom: '6px' }}
          >
            ← tutti i viaggi
          </button>
          <h2 style={{ margin: 0, fontSize: '1.4rem' }}>{tappa.nome}</h2>
          <small style={{ color: '#666' }}>{tappa.paese} · {tappa.notti} notti</small>
        </div>
      </div>

      {/* tab giorni */}
      {tappa.giorni.length > 1 && (
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {tappa.giorni.map((g, i) => (
            <button
              key={i}
              onClick={() => onCambiaGiorno(i)}
              style={{
                padding: '4px 12px',
                borderRadius: '20px',
                border: '1px solid #ddd',
                cursor: 'pointer',
                fontSize: '0.8rem',
                backgroundColor: giornoSelezionato === i ? '#b5451b' : '#fff',
                color: giornoSelezionato === i ? '#fff' : '#444',
              }}
            >
              Giorno {g.numero}
            </button>
          ))}
        </div>
      )}

      {/* titolo giorno */}
      <div>
        <div style={{ fontWeight: 700, fontSize: '1rem' }}>{giorno.titolo}</div>
        <div style={{ color: '#888', fontSize: '0.8rem' }}>{giorno.data}</div>
      </div>

      {/* avvisi del giorno */}
      {avvisiGiorno.length > 0 && (
        <div>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888', marginBottom: '8px' }}>
            ⚑ Avvisi
          </div>
          {avvisiGiorno.map((a, i) => (
            <div key={i} style={{ backgroundColor: '#fff8e1', border: '1px solid #ffe082', borderRadius: '6px', padding: '8px 10px', marginBottom: '6px', fontSize: '0.85rem' }}>
              <strong>{a.nome}</strong><br />
              <span style={{ color: '#666' }}>{a.avviso}</span>
            </div>
          ))}
        </div>
      )}

      {/* attività del giorno */}
      <div>
        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888', marginBottom: '10px' }}>
          Programma
        </div>
        {giorno.attivita.map((att, i) => (
          <div key={i} style={{ display: 'flex', gap: '10px', padding: '6px 0', borderBottom: '1px solid #eee', fontSize: '0.875rem' }}>
            <span style={{ color: '#aaa', minWidth: '52px', fontSize: '0.8rem', paddingTop: '2px', flexShrink: 0 }}>
              {att.ora}
            </span>
            <div>
              <div style={{ color: att.tipo === 'logistica' ? '#888' : '#1c1a17' }}>{att.nome}</div>
              {att.note && <div style={{ color: '#888', fontSize: '0.8rem', marginTop: '2px' }}>{att.note}</div>}
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}

export default PannelloTappa