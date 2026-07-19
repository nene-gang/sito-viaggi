import { useState } from 'react'
import './PannelloTappa.css'
import AlloggioTappa from './AlloggioTappa'
import TrasportoTappa from './TrasportoTappa'
import AttivitaForm, { ATTIVITA_VUOTA } from './AttivitaForm'

function PannelloTappa({
  tappa, giornoSelezionato, onCambiaGiorno, onChiudi, tuttiGiorni, onTuttiGiorni,
  onSalvaCampo, onCreaGiorno, onEliminaGiorno, onCreaAttivita, onModificaAttivita, onEliminaAttivita,
}) {
  const [salvando, setSalvando] = useState(null) // quale campo si sta salvando: 'hotel' | 'trasporto_arrivo' | 'trasporto_partenza' | null
  const [errore, setErrore]     = useState(null)
  const [inModifica, setInModifica] = useState(null) // stesso set di valori, quale sezione è aperta in modifica
  const [bozza, setBozza]       = useState(null)

  // Aggiunta di un nuovo giorno
  const [aggiungendoGiorno, setAggiungendoGiorno] = useState(false)
  const [bozzaGiorno, setBozzaGiorno]             = useState({ numero: '', data: '', titolo: '' })
  const [salvandoGiorno, setSalvandoGiorno]       = useState(false)

  // Aggiunta/modifica di un'attività ('nuova' | id | null)
  const [attivitaInModifica, setAttivitaInModifica] = useState(null)
  const [bozzaAttivita, setBozzaAttivita]           = useState(null)
  const [salvandoAttivita, setSalvandoAttivita]     = useState(false)
  const [erroreAttivita, setErroreAttivita]         = useState(null)

  const haGiorni = tappa.giorni && tappa.giorni.length > 0
  const giorno = haGiorni && typeof giornoSelezionato === 'number' ? tappa.giorni[giornoSelezionato] : null
  const avvisiGiorno = giorno ? giorno.attivita.filter(a => a.avviso) : []

  const hotel = tappa.hotel
  const haHotel = hotel && hotel.nome

  function iniziaModifica(campo) {
    setBozza(tappa[campo] || {})
    setErrore(null)
    setInModifica(campo)
  }

  function fineModifica() {
    const campo = inModifica
    setErrore(null)
    setSalvando(campo)
    Promise.resolve(onSalvaCampo(tappa.id, campo, bozza))
      .then(() => setInModifica(null))
      .catch(err => setErrore(err.message))
      .finally(() => setSalvando(null))
  }

  function iniziaNuovoGiorno() {
    setBozzaGiorno({ numero: (tappa.giorni?.length || 0) + 1, data: '', titolo: '' })
    setErroreAttivita(null)
    setAggiungendoGiorno(true)
  }

  function salvaGiorno() {
    setErroreAttivita(null)
    setSalvandoGiorno(true)
    Promise.resolve(onCreaGiorno(tappa.id, bozzaGiorno))
      .then(() => setAggiungendoGiorno(false))
      .catch(err => setErroreAttivita(err.message))
      .finally(() => setSalvandoGiorno(false))
  }

  function eliminaGiornoCorrente() {
    if (!giorno) return
    if (!window.confirm(`Eliminare "Giorno ${giorno.numero}" e tutte le sue attività?`)) return
    onEliminaGiorno(giorno.id)
  }

  function iniziaNuovaAttivita() {
    setBozzaAttivita({ ...ATTIVITA_VUOTA })
    setErroreAttivita(null)
    setAttivitaInModifica('nuova')
  }

  function iniziaModificaAttivita(att) {
    setBozzaAttivita({ ...att, aggiungi_checklist: !!att.aggiungi_checklist })
    setErroreAttivita(null)
    setAttivitaInModifica(att.id)
  }

  function salvaAttivita() {
    setErroreAttivita(null)
    setSalvandoAttivita(true)
    const promessa = attivitaInModifica === 'nuova'
      ? onCreaAttivita(giorno.id, bozzaAttivita)
      : onModificaAttivita(attivitaInModifica, bozzaAttivita)

    Promise.resolve(promessa)
      .then(() => setAttivitaInModifica(null))
      .catch(err => setErroreAttivita(err.message))
      .finally(() => setSalvandoAttivita(false))
  }

  function rimuoviAttivita(id) {
    if (!window.confirm('Eliminare questa attività?')) return
    onEliminaAttivita(id)
  }

  return (
    <aside className="pannello">

      {/* ── INTESTAZIONE ── */}
      <div className="pannello__head">
        <button className="pannello__torna" onClick={onChiudi}>
          ← tutti i viaggi
        </button>
        <h2 className="pannello__nome">{tappa.nome}</h2>
        <div className="pannello__meta">
          <span>{tappa.paese}</span>
          <span className="pannello__meta-dot" />
          <span>{tappa.notti} notti</span>
          {tappa.data_arrivo && (
            <>
              <span className="pannello__meta-dot" />
              <span>{tappa.data_arrivo}</span>
            </>
          )}
        </div>
      </div>

      {/* ── TAB NAVIGAZIONE ── */}
      <div className="pannello__tabs">

        {/* tab Info — sempre presente */}
        <button
          className={`pannello__tab${giornoSelezionato === 'info' ? ' pannello__tab--attivo' : ''}`}
          onClick={() => onCambiaGiorno('info')}
        >
          Info
        </button>

        {/* tab giorni — solo se presenti */}
        {haGiorni && tappa.giorni.map((g, i) => (
          <button
            key={i}
            onClick={() => onCambiaGiorno(i)}
            className={`pannello__tab${!tuttiGiorni && giornoSelezionato === i ? ' pannello__tab--attivo' : ''}`}
          >
            Giorno {g.numero}
          </button>
        ))}

        {/* tab Tutti — solo se più giorni */}
        {haGiorni && tappa.giorni.length > 1 && (
          <button
            onClick={onTuttiGiorni}
            className={`pannello__tab${tuttiGiorni ? ' pannello__tab--attivo' : ''}`}
          >
            Tutti
          </button>
        )}

        {/* tab + Giorno — apre il form per aggiungerne uno nuovo */}
        <button
          className="pannello__tab pannello__tab--aggiungi"
          onClick={iniziaNuovoGiorno}
        >
          + Giorno
        </button>

      </div>

      {/* ── CORPO ── */}
      <div className="pannello__corpo">

        {aggiungendoGiorno ? (
          <div>
            <div className="pannello__sezione-label">📅 Nuovo giorno</div>
            <div className="form-viaggio__riga">
              <input
                className="form-viaggio__input"
                type="number"
                min="1"
                placeholder="Numero"
                value={bozzaGiorno.numero}
                onChange={e => setBozzaGiorno(g => ({ ...g, numero: e.target.value }))}
              />
              <input
                className="form-viaggio__input"
                type="date"
                value={bozzaGiorno.data}
                onChange={e => setBozzaGiorno(g => ({ ...g, data: e.target.value }))}
              />
            </div>
            <input
              className="form-viaggio__input"
              placeholder="Titolo (es. Esplorazione centro storico)"
              value={bozzaGiorno.titolo}
              onChange={e => setBozzaGiorno(g => ({ ...g, titolo: e.target.value }))}
            />
            {erroreAttivita && <p className="pannello__errore">{erroreAttivita}</p>}
            <div className="pannello__giorno-azioni">
              <button className="pannello__modifica-btn" onClick={() => setAggiungendoGiorno(false)} disabled={salvandoGiorno}>
                Annulla
              </button>
              <button className="pannello__hotel-fine" onClick={salvaGiorno} disabled={salvandoGiorno}>
                {salvandoGiorno ? 'Salvataggio...' : 'Crea giorno'}
              </button>
            </div>
          </div>
        ) : (
        <>

        {/* ── TAB INFO ── */}
        {giornoSelezionato === 'info' && (
          <>
            {/* Hotel */}
            {inModifica === 'hotel' ? (
              <div>
                <div className="pannello__sezione-label">🏨 Hotel</div>
                <AlloggioTappa
                  hotel={bozza || {}}
                  onCambia={setBozza}
                  apertoDiDefault
                />
                {errore && <p className="pannello__errore">{errore}</p>}
                <button
                  className="pannello__hotel-fine"
                  onClick={fineModifica}
                  disabled={salvando === 'hotel'}
                >
                  {salvando === 'hotel' ? 'Salvataggio...' : 'Fatto'}
                </button>
              </div>
            ) : haHotel ? (
              <div>
                <div className="pannello__sezione-label pannello__sezione-label--con-azione">
                  <span>🏨 Hotel</span>
                  <button className="pannello__modifica-btn" onClick={() => iniziaModifica('hotel')}>✎ Modifica</button>
                </div>
                <div className="info-card">
                  <div className="info-card__nome">{hotel.nome}</div>
                  {hotel.indirizzo && (
                    <div className="info-card__riga">
                      <span className="info-card__icona">📍</span>
                      <span>{hotel.indirizzo}</span>
                    </div>
                  )}
                  {hotel.costo && (
                    <div className="info-card__riga">
                      <span className="info-card__icona">💶</span>
                      <span>{hotel.costo}</span>
                    </div>
                  )}
                  {hotel.prenotazione && (
                    <div className="info-card__riga">
                      <span className="info-card__icona">🔖</span>
                      <span className="info-card__code">#{hotel.prenotazione}</span>
                    </div>
                  )}
                  {hotel.link && (
                    <a
                      href={hotel.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="info-card__link"
                    >
                      Apri in Google Maps →
                    </a>
                  )}
                  {hotel.link_prenotazione && (
                    <a
                      href={hotel.link_prenotazione}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="info-card__link"
                    >
                      Vai alla prenotazione →
                    </a>
                  )}
                  {hotel.note && (
                    <div className="info-card__note">{hotel.note}</div>
                  )}
                </div>
              </div>
            ) : (
              <div className="pannello__vuoto">
                <span className="pannello__vuoto-icona">🏨</span>
                <p>Nessun hotel inserito.</p>
                <button className="pannello__modifica-btn" onClick={() => iniziaModifica('hotel')}>+ Aggiungi alloggio</button>
              </div>
            )}

            {/* Trasporti */}
            <div>
              <div className="pannello__sezione-label">🚆 Trasporti</div>

              {inModifica === 'trasporto_arrivo' ? (
                <>
                  <TrasportoTappa
                    trasporto={bozza || {}}
                    onCambia={setBozza}
                    direzione="arrivo"
                    apertoDiDefault
                  />
                  {errore && <p className="pannello__errore">{errore}</p>}
                  <button
                    className="pannello__hotel-fine"
                    onClick={fineModifica}
                    disabled={salvando === 'trasporto_arrivo'}
                  >
                    {salvando === 'trasporto_arrivo' ? 'Salvataggio...' : 'Fatto'}
                  </button>
                </>
              ) : (
                <div className="info-card info-card--azionabile" onClick={() => iniziaModifica('trasporto_arrivo')} role="button" tabIndex={0}>
                  <div className="info-card__riga">
                    <span className="info-card__icona">→</span>
                    <div>
                      <div className="info-card__label">Arrivo {tappa.trasporto_arrivo?.mezzo && `(${tappa.trasporto_arrivo.mezzo})`}</div>
                      <div>{tappa.trasporto_arrivo?.dettagli || 'Tocca per aggiungere i dettagli'}</div>
                    </div>
                  </div>
                </div>
              )}

              {inModifica === 'trasporto_partenza' ? (
                <>
                  <TrasportoTappa
                    trasporto={bozza || {}}
                    onCambia={setBozza}
                    direzione="partenza"
                    apertoDiDefault
                  />
                  {errore && <p className="pannello__errore">{errore}</p>}
                  <button
                    className="pannello__hotel-fine"
                    onClick={fineModifica}
                    disabled={salvando === 'trasporto_partenza'}
                  >
                    {salvando === 'trasporto_partenza' ? 'Salvataggio...' : 'Fatto'}
                  </button>
                </>
              ) : (
                <div className="info-card info-card--azionabile" onClick={() => iniziaModifica('trasporto_partenza')} role="button" tabIndex={0}>
                  <div className="info-card__riga">
                    <span className="info-card__icona">←</span>
                    <div>
                      <div className="info-card__label">Partenza {tappa.trasporto_partenza?.mezzo && `(${tappa.trasporto_partenza.mezzo})`}</div>
                      <div>{tappa.trasporto_partenza?.dettagli || 'Tocca per aggiungere i dettagli'}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Note tappa */}
            {tappa.note && (
              <div>
                <div className="pannello__sezione-label">📝 Note</div>
                <div className="info-card info-card--note">
                  {tappa.note}
                </div>
              </div>
            )}


          </>
        )}

        {/* ── TAB GIORNO / TUTTI ── */}
        {giornoSelezionato !== 'info' && (
          <>
            {!haGiorni ? (
              <div className="pannello__vuoto">
                <span className="pannello__vuoto-icona">📋</span>
                <p>Nessun itinerario inserito per questa tappa.</p>
              </div>
            ) : (
              <>
                <div className="pannello__giorno-head">
                  <div>
                    <div className="pannello__giorno-titolo">{giorno.titolo}</div>
                    <div className="pannello__giorno-data">{giorno.data}</div>
                  </div>
                  <button className="pannello__modifica-btn" onClick={eliminaGiornoCorrente}>🗑 Elimina giorno</button>
                </div>

                {avvisiGiorno.length > 0 && (
                  <div>
                    <div className="pannello__sezione-label">⚑ Avvisi</div>
                    {avvisiGiorno.map((a, i) => (
                      <div key={i} className="avviso">
                        <div className="avviso__nome">{a.nome}</div>
                        <div className="avviso__testo">{a.avviso}</div>
                      </div>
                    ))}
                  </div>
                )}

                <div>
                  <div className="pannello__sezione-label">Programma</div>

                  <div className="attivita-lista">
                    {giorno.attivita.map((att) => (
                      attivitaInModifica === att.id ? (
                        <div key={att.id} className="pannello__attivita-form">
                          <AttivitaForm attivita={bozzaAttivita} onCambia={setBozzaAttivita} />
                          {erroreAttivita && <p className="pannello__errore">{erroreAttivita}</p>}
                          <div className="pannello__giorno-azioni">
                            <button className="pannello__modifica-btn" onClick={() => rimuoviAttivita(att.id)}>🗑 Elimina</button>
                            <button className="pannello__hotel-fine" onClick={salvaAttivita} disabled={salvandoAttivita}>
                              {salvandoAttivita ? 'Salvataggio...' : 'Fatto'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div
                          key={att.id}
                          className={`attivita attivita--${att.tipo || 'default'} attivita--azionabile`}
                          onClick={() => iniziaModificaAttivita(att)}
                          role="button"
                          tabIndex={0}
                        >
                          <span className="attivita__ora">{att.ora}</span>
                          <div className="attivita__dot" />
                          <div className="attivita__contenuto">
                            <div className={`attivita__nome${att.tipo === 'logistica' ? ' attivita__nome--logistica' : ''}`}>
                              {att.nome || 'Attività senza nome'}
                            </div>
                            {att.note && (
                              <div className="attivita__note">{att.note}</div>
                            )}
                            {att.link && (
                              <a
                                href={att.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="info-card__link"
                                onClick={e => e.stopPropagation()}
                              >
                                Apri link →
                              </a>
                            )}
                          </div>
                        </div>
                      )
                    ))}
                  </div>

                  {attivitaInModifica === 'nuova' ? (
                    <div className="pannello__attivita-form">
                      <AttivitaForm attivita={bozzaAttivita} onCambia={setBozzaAttivita} />
                      {erroreAttivita && <p className="pannello__errore">{erroreAttivita}</p>}
                      <div className="pannello__giorno-azioni">
                        <button className="pannello__modifica-btn" onClick={() => setAttivitaInModifica(null)}>Annulla</button>
                        <button className="pannello__hotel-fine" onClick={salvaAttivita} disabled={salvandoAttivita}>
                          {salvandoAttivita ? 'Salvataggio...' : 'Aggiungi'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button className="pannello__modifica-btn pannello__aggiungi-attivita" onClick={iniziaNuovaAttivita}>
                      + Aggiungi attività
                    </button>
                  )}
                </div>
              </>
            )}
          </>
        )}

        </>
        )}

      </div>
    </aside>
  )
}

export default PannelloTappa