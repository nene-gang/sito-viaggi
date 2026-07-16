import './PannelloTappa.css'

function PannelloTappa({ tappa, giornoSelezionato, onCambiaGiorno, onChiudi, tuttiGiorni, onTuttiGiorni }) {
  const haGiorni = tappa.giorni && tappa.giorni.length > 0
  const giorno = haGiorni ? tappa.giorni[giornoSelezionato] : null
  const avvisiGiorno = giorno ? giorno.attivita.filter(a => a.avviso) : []

  const hotel = tappa.hotel
  const haHotel = hotel && hotel.nome

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

      </div>

      {/* ── CORPO ── */}
      <div className="pannello__corpo">

        {/* ── TAB INFO ── */}
        {giornoSelezionato === 'info' && (
          <>
            {/* Hotel */}
            {haHotel ? (
              <div>
                <div className="pannello__sezione-label">🏨 Hotel</div>
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
              </div>
            )}

            {/* Trasporti */}
            {(tappa.trasporto_arrivo || tappa.trasporto_partenza) && (
              <div>
                <div className="pannello__sezione-label">🚆 Trasporti</div>
                <div className="info-card">
                  {tappa.trasporto_arrivo && (
                    <div className="info-card__riga">
                      <span className="info-card__icona">→</span>
                      <div>
                        <div className="info-card__label">Arrivo</div>
                        <div>{tappa.trasporto_arrivo}</div>
                      </div>
                    </div>
                  )}
                  {tappa.trasporto_partenza && (
                    <div className="info-card__riga">
                      <span className="info-card__icona">←</span>
                      <div>
                        <div className="info-card__label">Partenza</div>
                        <div>{tappa.trasporto_partenza}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Note tappa */}
            {tappa.note && (
              <div>
                <div className="pannello__sezione-label">📝 Note</div>
                <div className="info-card info-card--note">
                  {tappa.note}
                </div>
              </div>
            )}

            {/* Stato vuoto completo */}
            {!haHotel && !tappa.trasporto_arrivo && !tappa.trasporto_partenza && !tappa.note && (
              <div className="pannello__vuoto">
                <span className="pannello__vuoto-icona">📋</span>
                <p>Nessuna informazione logistica inserita.</p>
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
                <div>
                  <div className="pannello__giorno-titolo">{giorno.titolo}</div>
                  <div className="pannello__giorno-data">{giorno.data}</div>
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
                    {giorno.attivita.map((att, i) => (
                      <div key={i} className={`attivita attivita--${att.tipo || 'default'}`}>
                        <span className="attivita__ora">{att.ora}</span>
                        <div className="attivita__dot" />
                        <div className="attivita__contenuto">
                          <div className={`attivita__nome${att.tipo === 'logistica' ? ' attivita__nome--logistica' : ''}`}>
                            {att.nome}
                          </div>
                          {att.note && (
                            <div className="attivita__note">{att.note}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </>
        )}

      </div>
    </aside>
  )
}

export default PannelloTappa