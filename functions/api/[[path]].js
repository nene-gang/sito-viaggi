const DURATA_SESSIONE_SECONDI = 60 * 60 * 24 * 30 // 30 giorni

// --- Sessione: cookie firmato, senza tabella sessioni ---

function bufferAHex(buffer) {
  return [...new Uint8Array(buffer)].map(b => b.toString(16).padStart(2, '0')).join('')
}

async function chiaveFirma(secret) {
  return crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  )
}

async function firmaSessione(userId, secret) {
  const scadenza = Date.now() + DURATA_SESSIONE_SECONDI * 1000
  const payload = `${userId}.${scadenza}`
  const chiave = await chiaveFirma(secret)
  const firma = await crypto.subtle.sign('HMAC', chiave, new TextEncoder().encode(payload))
  return `${payload}.${bufferAHex(firma)}`
}

async function verificaSessione(token, secret) {
  if (!token) return null
  const parti = token.split('.')
  if (parti.length !== 3) return null

  const [userId, scadenza, firmaRicevuta] = parti
  if (Date.now() > Number(scadenza)) return null

  const chiave = await chiaveFirma(secret)
  const firma = await crypto.subtle.sign('HMAC', chiave, new TextEncoder().encode(`${userId}.${scadenza}`))
  if (bufferAHex(firma) !== firmaRicevuta) return null

  return Number(userId)
}

function leggiCookie(request, nome) {
  const cookieHeader = request.headers.get('Cookie') || ''
  const match = cookieHeader.match(new RegExp(`(?:^|; )${nome}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

// SameSite=Lax basta ora che frontend e backend sono sullo stesso dominio:
// il cookie viaggia con qualunque richiesta di prima parte, comprese le
// fetch dal sito e la navigazione top-level di ritorno da Google.
function cookieSessione(token, maxAge) {
  return `sessione=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${maxAge}`
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function notFound() {
  return json({ errore: 'Non trovato' }, 404)
}

function nonAutorizzato() {
  return json({ errore: 'Devi effettuare il login' }, 401)
}

function vietato() {
  return json({ errore: 'Non hai accesso a questa risorsa' }, 403)
}

async function viaggioAppartieneA(env, viaggioId, userId) {
  const riga = await env.sito_viaggi_db.prepare(
    'SELECT id FROM viaggi WHERE id = ? AND utente_id = ?'
  ).bind(viaggioId, userId).first()
  return !!riga
}

async function viaggioIdDiTappa(env, tappaId) {
  const riga = await env.sito_viaggi_db.prepare('SELECT viaggio_id FROM tappe WHERE id = ?').bind(tappaId).first()
  return riga ? riga.viaggio_id : null
}

async function viaggioIdDiGiorno(env, giornoId) {
  const riga = await env.sito_viaggi_db.prepare(
    'SELECT t.viaggio_id AS viaggio_id FROM giorni g JOIN tappe t ON t.id = g.tappa_id WHERE g.id = ?'
  ).bind(giornoId).first()
  return riga ? riga.viaggio_id : null
}

async function viaggioIdDiAttivita(env, attivitaId) {
  const riga = await env.sito_viaggi_db.prepare(
    'SELECT t.viaggio_id AS viaggio_id FROM attivita a JOIN giorni g ON g.id = a.giorno_id JOIN tappe t ON t.id = g.tappa_id WHERE a.id = ?'
  ).bind(attivitaId).first()
  return riga ? riga.viaggio_id : null
}

async function viaggioIdDiChecklist(env, voceId) {
  const riga = await env.sito_viaggi_db.prepare('SELECT viaggio_id FROM checklist_voci WHERE id = ?').bind(voceId).first()
  return riga ? riga.viaggio_id : null
}

// Costruisce il testo di una voce checklist a partire da nome/nota di un'attività
function costruisciTestoChecklist(nome, note) {
  if (nome && note) return `${nome}: ${note}`
  return nome || note || ''
}

// Mantiene sincronizzata la voce di checklist collegata a un'attività:
// la crea se serve, la aggiorna se il testo è cambiato, la rimuove se la spunta viene tolta.
async function sincronizzaChecklist(env, attivitaId, viaggioId, aggiungiChecklist, testo) {
  const esistente = await env.sito_viaggi_db.prepare(
    'SELECT id FROM checklist_voci WHERE attivita_id = ?'
  ).bind(attivitaId).first()

  if (aggiungiChecklist && testo) {
    if (esistente) {
      await env.sito_viaggi_db.prepare('UPDATE checklist_voci SET testo = ? WHERE id = ?').bind(testo, esistente.id).run()
    } else {
      await env.sito_viaggi_db.prepare(
        'INSERT INTO checklist_voci (viaggio_id, testo, attivita_id) VALUES (?, ?, ?)'
      ).bind(viaggioId, testo, attivitaId).run()
    }
  } else if (esistente) {
    await env.sito_viaggi_db.prepare('DELETE FROM checklist_voci WHERE id = ?').bind(esistente.id).run()
  }
}

export async function onRequest(context) {
  const { request, env } = context
  const url = new URL(request.url)
  const path = url.pathname

  // Utente loggato (null se nessuna sessione valida) — calcolato una volta,
  // usato da tutte le rotte sotto per filtrare/autorizzare i dati.
  const userId = await verificaSessione(leggiCookie(request, 'sessione'), env.SESSION_SECRET)

  // GET /api/auth/login — reindirizza l'utente alla schermata di login Google
    if (request.method === 'GET' && path === '/api/auth/login') {
      const redirectUri = `${url.origin}/api/auth/callback`
      const parametri = new URLSearchParams({
        client_id: env.GOOGLE_CLIENT_ID,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: 'openid email profile',
        access_type: 'online',
        prompt: 'select_account',
      })
      return Response.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${parametri}`, 302)
    }

    // GET /api/auth/callback — Google torna qui col codice, lo scambiamo per i dati utente
    if (request.method === 'GET' && path === '/api/auth/callback') {
      const code = url.searchParams.get('code')
      if (!code) return json({ errore: 'Codice mancante' }, 400)

      const redirectUri = `${url.origin}/api/auth/callback`
      const tokenRisposta = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: env.GOOGLE_CLIENT_ID,
          client_secret: env.GOOGLE_CLIENT_SECRET,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }),
      })
      const tokenDati = await tokenRisposta.json()
      if (!tokenDati.access_token) return json({ errore: 'Scambio token con Google fallito' }, 400)

      const utenteRisposta = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${tokenDati.access_token}` },
      })
      const googleUser = await utenteRisposta.json()
      if (!googleUser.id) return json({ errore: 'Impossibile leggere il profilo Google' }, 400)

      let utente = await env.sito_viaggi_db.prepare(
        'SELECT id FROM utenti WHERE google_id = ?'
      ).bind(googleUser.id).first()

      if (!utente) {
        const risultato = await env.sito_viaggi_db.prepare(
          'INSERT INTO utenti (google_id, email, nome, avatar_url) VALUES (?, ?, ?, ?)'
        ).bind(googleUser.id, googleUser.email || null, googleUser.name || null, googleUser.picture || null).run()
        utente = { id: risultato.meta.last_row_id }
      }

      const token = await firmaSessione(utente.id, env.SESSION_SECRET)

      const headers = new Headers({ Location: url.origin })
      headers.append('Set-Cookie', cookieSessione(token, DURATA_SESSIONE_SECONDI))
      return new Response(null, { status: 302, headers })
    }

    // GET /api/auth/me — chi è l'utente loggato, in base al cookie
    if (request.method === 'GET' && path === '/api/auth/me') {
      if (!userId) return json({ utente: null })

      const utente = await env.sito_viaggi_db.prepare(
        'SELECT id, email, nome, avatar_url FROM utenti WHERE id = ?'
      ).bind(userId).first()

      return json({ utente: utente || null })
    }

    // POST /api/auth/logout — cancella il cookie di sessione
    if (request.method === 'POST' && path === '/api/auth/logout') {
      const headers = new Headers({ 'Content-Type': 'application/json' })
      headers.append('Set-Cookie', cookieSessione('', 0))
      return new Response(JSON.stringify({ ok: true }), { headers })
    }

    // GET /api/utenti — elenco di chi è registrato sul sito, con lo stato
    // di amicizia rispetto a te (per poter cercare persone da aggiungere)
    if (request.method === 'GET' && path === '/api/utenti') {
      if (!userId) return nonAutorizzato()

      const { results: utenti } = await env.sito_viaggi_db.prepare(
        'SELECT id, nome, email, avatar_url FROM utenti WHERE id != ? ORDER BY nome'
      ).bind(userId).all()

      const { results: amicizie } = await env.sito_viaggi_db.prepare(
        'SELECT * FROM amicizie WHERE richiedente_id = ? OR destinatario_id = ?'
      ).bind(userId, userId).all()

      const conStato = utenti.map(u => {
        const relazione = amicizie.find(a => a.richiedente_id === u.id || a.destinatario_id === u.id)
        let stato = 'nessuna'
        if (relazione) {
          if (relazione.stato === 'accettata') stato = 'amici'
          else if (relazione.richiedente_id === userId) stato = 'richiesta_inviata'
          else stato = 'richiesta_ricevuta'
        }
        return { ...u, stato_amicizia: stato, amicizia_id: relazione?.id || null }
      })

      return json(conStato)
    }

    // GET /api/amicizie — le tue amicizie accettate + richieste in sospeso (in entrata e in uscita)
    if (request.method === 'GET' && path === '/api/amicizie') {
      if (!userId) return nonAutorizzato()

      const { results } = await env.sito_viaggi_db.prepare(`
        SELECT a.id, a.stato, a.richiedente_id, a.destinatario_id,
               u.id AS altro_id, u.nome AS altro_nome, u.avatar_url AS altro_avatar
        FROM amicizie a
        JOIN utenti u ON u.id = (CASE WHEN a.richiedente_id = ? THEN a.destinatario_id ELSE a.richiedente_id END)
        WHERE a.richiedente_id = ? OR a.destinatario_id = ?
      `).bind(userId, userId, userId).all()

      const amici = results.filter(r => r.stato === 'accettata')
      const inviate = results.filter(r => r.stato === 'in_attesa' && r.richiedente_id === userId)
      const ricevute = results.filter(r => r.stato === 'in_attesa' && r.destinatario_id === userId)

      return json({ amici, richieste_inviate: inviate, richieste_ricevute: ricevute })
    }

    // POST /api/amicizie — invia una richiesta di amicizia
    if (request.method === 'POST' && path === '/api/amicizie') {
      if (!userId) return nonAutorizzato()

      const { destinatario_id } = await request.json()
      if (!destinatario_id || Number(destinatario_id) === userId) {
        return json({ errore: 'Destinatario non valido' }, 400)
      }

      const esistente = await env.sito_viaggi_db.prepare(
        'SELECT id FROM amicizie WHERE (richiedente_id = ? AND destinatario_id = ?) OR (richiedente_id = ? AND destinatario_id = ?)'
      ).bind(userId, destinatario_id, destinatario_id, userId).first()
      if (esistente) return json({ errore: 'Esiste già una relazione con questo utente' }, 400)

      const risultato = await env.sito_viaggi_db.prepare(
        'INSERT INTO amicizie (richiedente_id, destinatario_id, stato) VALUES (?, ?, ?)'
      ).bind(userId, destinatario_id, 'in_attesa').run()

      return json({ id: risultato.meta.last_row_id, ok: true })
    }

    // PUT /api/amicizie/:id — accetta o rifiuta una richiesta ricevuta
    if (request.method === 'PUT' && path.startsWith('/api/amicizie/')) {
      if (!userId) return nonAutorizzato()

      const id = path.split('/')[3]
      const richiesta_esistente = await env.sito_viaggi_db.prepare(
        'SELECT * FROM amicizie WHERE id = ?'
      ).bind(id).first()

      if (!richiesta_esistente || richiesta_esistente.destinatario_id !== userId) return vietato()

      const { azione } = await request.json()
      if (azione === 'accetta') {
        await env.sito_viaggi_db.prepare("UPDATE amicizie SET stato = 'accettata' WHERE id = ?").bind(id).run()
      } else if (azione === 'rifiuta') {
        await env.sito_viaggi_db.prepare('DELETE FROM amicizie WHERE id = ?').bind(id).run()
      } else {
        return json({ errore: 'Azione non valida' }, 400)
      }

      return json({ ok: true })
    }

    // DELETE /api/amicizie/:id — rimuove un'amicizia (o annulla una richiesta inviata)
    if (request.method === 'DELETE' && path.startsWith('/api/amicizie/')) {
      if (!userId) return nonAutorizzato()

      const id = path.split('/')[3]
      const riga = await env.sito_viaggi_db.prepare('SELECT * FROM amicizie WHERE id = ?').bind(id).first()
      if (!riga || (riga.richiedente_id !== userId && riga.destinatario_id !== userId)) return vietato()

      await env.sito_viaggi_db.prepare('DELETE FROM amicizie WHERE id = ?').bind(id).run()
      return json({ ok: true })
    }

    // GET /api/viaggi
    if (request.method === 'GET' && path === '/api/viaggi') {
      if (!userId) return nonAutorizzato()

      const { results } = await env.sito_viaggi_db.prepare(
        'SELECT id, titolo, stato, data_inizio, data_fine, descrizione FROM viaggi WHERE utente_id = ? ORDER BY id'
      ).bind(userId).all()

      for (const viaggio of results) {
        const { results: tappe } = await env.sito_viaggi_db.prepare(
          'SELECT id, nome, lat, lng, paese_iso, ordine, notti, data_arrivo FROM tappe WHERE viaggio_id = ? ORDER BY ordine'
        ).bind(viaggio.id).all()
        viaggio.tappe = tappe
      }

      return json(results)
    }

    // GET /api/viaggi/:id
    if (request.method === 'GET' && path.startsWith('/api/viaggi/')) {
      if (!userId) return nonAutorizzato()

      const id = path.split('/')[3]
      if (!id) return notFound()

      const viaggio = await env.sito_viaggi_db.prepare(
        'SELECT * FROM viaggi WHERE id = ? AND utente_id = ?'
      ).bind(id, userId).first()
      if (!viaggio) return notFound()

      const { results: tappe } = await env.sito_viaggi_db.prepare(
        'SELECT * FROM tappe WHERE viaggio_id = ? ORDER BY ordine'
      ).bind(id).all()

      for (const tappa of tappe) {
        tappa.hotel = JSON.parse(tappa.hotel || '{}')
        tappa.trasporto_arrivo    = tappa.trasporto_arrivo    ? JSON.parse(tappa.trasporto_arrivo)    : null
        tappa.trasporto_partenza  = tappa.trasporto_partenza  ? JSON.parse(tappa.trasporto_partenza)  : null

        const { results: giorni } = await env.sito_viaggi_db.prepare(
          'SELECT * FROM giorni WHERE tappa_id = ? ORDER BY numero'
        ).bind(tappa.id).all()

        for (const giorno of giorni) {
          const { results: attivita } = await env.sito_viaggi_db.prepare(
            'SELECT * FROM attivita WHERE giorno_id = ? ORDER BY ora'
          ).bind(giorno.id).all()
          giorno.attivita = attivita
        }

        tappa.giorni = giorni
      }

      viaggio.tappe = tappe

      const { results: checklist } = await env.sito_viaggi_db.prepare(
        'SELECT * FROM checklist_voci WHERE viaggio_id = ? ORDER BY ordine'
      ).bind(id).all()
      viaggio.checklist_partenza = checklist

      return json(viaggio)
    }

    // GET /api/checklist/:viaggioId
    if (request.method === 'GET' && path.startsWith('/api/checklist/')) {
      if (!userId) return nonAutorizzato()

      const id = path.split('/')[3]
      if (!id) return notFound()
      if (!(await viaggioAppartieneA(env, id, userId))) return vietato()

      const { results } = await env.sito_viaggi_db.prepare(
        'SELECT * FROM checklist_voci WHERE viaggio_id = ? ORDER BY ordine'
      ).bind(id).all()
      return json(results)
    }

    // PUT /api/checklist/:voceId
    if (request.method === 'PUT' && path.startsWith('/api/checklist/')) {
      if (!userId) return nonAutorizzato()

      const id = path.split('/')[3]
      if (!id) return notFound()

      const viaggioId = await viaggioIdDiChecklist(env, id)
      if (!viaggioId || !(await viaggioAppartieneA(env, viaggioId, userId))) return vietato()

      const body = await request.json()
      await env.sito_viaggi_db.prepare(
        'UPDATE checklist_voci SET completata = ? WHERE id = ?'
      ).bind(body.completata ? 1 : 0, id).run()

      return json({ ok: true })
    }
    
    // GET /api/wandex/catalogo — elenco condiviso (province, capitali), uguale per tutti, nessun login richiesto
    if (request.method === 'GET' && path === '/api/wandex/catalogo') {
      const { results } = await env.sito_viaggi_db.prepare(
        'SELECT categoria, chiave, nome, gruppo, paese, iso, lat, lng FROM wandex_catalogo ORDER BY categoria, nome'
      ).all()
      return json(results)
    }

    // GET /api/wandex
    if (request.method === 'GET' && path === '/api/wandex') {
      if (!userId) return nonAutorizzato()

      const { results } = await env.sito_viaggi_db.prepare(
        'SELECT categoria, chiave FROM wandex_voci WHERE utente_id = ?'
      ).bind(userId).all()
      return json(results)
    }

    // POST /api/wandex  (toggle: inserisce se non esiste, cancella se esiste)
    if (request.method === 'POST' && path === '/api/wandex') {
      if (!userId) return nonAutorizzato()

      const { categoria, chiave } = await request.json()
      if (!categoria || !chiave) return json({ errore: 'Parametri mancanti' }, 400)

      const esistente = await env.sito_viaggi_db.prepare(
        'SELECT 1 FROM wandex_voci WHERE utente_id = ? AND categoria = ? AND chiave = ?'
      ).bind(userId, categoria, chiave).first()

      if (esistente) {
        await env.sito_viaggi_db.prepare(
          'DELETE FROM wandex_voci WHERE utente_id = ? AND categoria = ? AND chiave = ?'
        ).bind(userId, categoria, chiave).run()
      } else {
        await env.sito_viaggi_db.prepare(
          'INSERT INTO wandex_voci (utente_id, categoria, chiave) VALUES (?, ?, ?)'
        ).bind(userId, categoria, chiave).run()
      }

      return json({ ok: true })
    }

        // POST /api/viaggi — crea nuovo viaggio
    if (request.method === 'POST' && path === '/api/viaggi') {
      if (!userId) return nonAutorizzato()

      const body = await request.json()
      const { titolo, stato, data_inizio, data_fine, descrizione, tappe = [] } = body

      // Inserisce il viaggio e recupera l'id generato
      const risultato = await env.sito_viaggi_db.prepare(
        'INSERT INTO viaggi (utente_id, titolo, stato, data_inizio, data_fine, descrizione) VALUES (?, ?, ?, ?, ?, ?)'
      ).bind(userId, titolo, stato, data_inizio || null, data_fine || null, descrizione || null).run()

      const nuovoId = risultato.meta.last_row_id

      // Inserisce le tappe
      for (const tappa of tappe) {
        await env.sito_viaggi_db.prepare(
          'INSERT INTO tappe (viaggio_id, nome, lat, lng, paese_iso, ordine, notti, data_arrivo, data_partenza, hotel, trasporto_arrivo, trasporto_partenza) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        ).bind(
          nuovoId, tappa.nome, tappa.lat, tappa.lng, tappa.paese_iso || null, tappa.ordine,
          tappa.notti || null, tappa.data_arrivo || null, tappa.data_partenza || null,
          JSON.stringify(tappa.hotel || {}),
          tappa.trasporto_arrivo ? JSON.stringify(tappa.trasporto_arrivo) : null,
          tappa.trasporto_partenza ? JSON.stringify(tappa.trasporto_partenza) : null
        ).run()
      }

      return json({ ok: true, id: nuovoId })
    }

    // PUT /api/viaggi/:id — modifica viaggio esistente
    if (request.method === 'PUT' && path.startsWith('/api/viaggi/')) {
      if (!userId) return nonAutorizzato()

      const id = path.split('/')[3]
      if (!id) return notFound()
      if (!(await viaggioAppartieneA(env, id, userId))) return vietato()

      const body = await request.json()
      const { titolo, stato, data_inizio, data_fine, descrizione, tappe = [] } = body

      // Aggiorna i dati del viaggio
      await env.sito_viaggi_db.prepare(
        'UPDATE viaggi SET titolo = ?, stato = ?, data_inizio = ?, data_fine = ?, descrizione = ? WHERE id = ? AND utente_id = ?'
      ).bind(titolo, stato, data_inizio || null, data_fine || null, descrizione || null, id, userId).run()

      // Riconciliazione intelligente delle tappe
      // 1. Recupera gli id delle tappe esistenti nel DB
      const { results: tappeEsistenti } = await env.sito_viaggi_db.prepare(
        'SELECT id FROM tappe WHERE viaggio_id = ?'
      ).bind(id).all()

      const idEsistenti = new Set(tappeEsistenti.map(t => t.id))
      const idArrivo    = new Set(tappe.filter(t => t.id).map(t => t.id))

      // 2. Cancella le tappe che non sono più nel body
      for (const idEx of idEsistenti) {
        if (!idArrivo.has(idEx)) {
          // Cancella a cascata giorni e attività di questa tappa
          const { results: giorni } = await env.sito_viaggi_db.prepare(
            'SELECT id FROM giorni WHERE tappa_id = ?'
          ).bind(idEx).all()

          for (const g of giorni) {
            await env.sito_viaggi_db.prepare(
              'DELETE FROM attivita WHERE giorno_id = ?'
            ).bind(g.id).run()
          }

          await env.sito_viaggi_db.prepare(
            'DELETE FROM giorni WHERE tappa_id = ?'
          ).bind(idEx).run()

          await env.sito_viaggi_db.prepare(
            'DELETE FROM tappe WHERE id = ?'
          ).bind(idEx).run()
        }
      }

      // 3. Aggiorna le tappe esistenti, inserisce le nuove
      for (const tappa of tappe) {
        if (tappa.id && idEsistenti.has(tappa.id)) {
          // Tappa esistente → UPDATE (preserva giorni e attività)
          await env.sito_viaggi_db.prepare(
            'UPDATE tappe SET nome = ?, lat = ?, lng = ?, paese_iso = ?, ordine = ?, notti = ?, data_arrivo = ?, data_partenza = ?, hotel = ?, trasporto_arrivo = ?, trasporto_partenza = ? WHERE id = ?'
          ).bind(
            tappa.nome, tappa.lat, tappa.lng, tappa.paese_iso || null, tappa.ordine,
            tappa.notti || null, tappa.data_arrivo || null, tappa.data_partenza || null,
            JSON.stringify(tappa.hotel || {}),
            tappa.trasporto_arrivo ? JSON.stringify(tappa.trasporto_arrivo) : null,
            tappa.trasporto_partenza ? JSON.stringify(tappa.trasporto_partenza) : null,
            tappa.id
          ).run()
        } else {
          // Tappa nuova → INSERT
          await env.sito_viaggi_db.prepare(
            'INSERT INTO tappe (viaggio_id, nome, lat, lng, paese_iso, ordine, notti, data_arrivo, data_partenza, hotel, trasporto_arrivo, trasporto_partenza) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
          ).bind(
            id, tappa.nome, tappa.lat, tappa.lng, tappa.paese_iso || null, tappa.ordine,
            tappa.notti || null, tappa.data_arrivo || null, tappa.data_partenza || null,
            JSON.stringify(tappa.hotel || {}),
            tappa.trasporto_arrivo ? JSON.stringify(tappa.trasporto_arrivo) : null,
            tappa.trasporto_partenza ? JSON.stringify(tappa.trasporto_partenza) : null
          ).run()
        }
      }

      return json({ ok: true })
    }

    // DELETE /api/viaggi/:id — elimina viaggio e tutto il suo contenuto
    if (request.method === 'DELETE' && path.startsWith('/api/viaggi/')) {
      if (!userId) return nonAutorizzato()

      const id = path.split('/')[3]
      if (!id) return notFound()
      if (!(await viaggioAppartieneA(env, id, userId))) return vietato()

      // Elimina in ordine: prima i figli, poi il genitore
      const { results: tappeIds } = await env.sito_viaggi_db.prepare(
        'SELECT id FROM tappe WHERE viaggio_id = ?'
      ).bind(id).all()

      for (const tappa of tappeIds) {
        const { results: giorniIds } = await env.sito_viaggi_db.prepare(
          'SELECT id FROM giorni WHERE tappa_id = ?'
        ).bind(tappa.id).all()

        for (const giorno of giorniIds) {
          await env.sito_viaggi_db.prepare(
            'DELETE FROM attivita WHERE giorno_id = ?'
          ).bind(giorno.id).run()
        }

        await env.sito_viaggi_db.prepare(
          'DELETE FROM giorni WHERE tappa_id = ?'
        ).bind(tappa.id).run()
      }

      await env.sito_viaggi_db.prepare('DELETE FROM tappe WHERE viaggio_id = ?').bind(id).run()
      await env.sito_viaggi_db.prepare('DELETE FROM checklist_voci WHERE viaggio_id = ?').bind(id).run()
      await env.sito_viaggi_db.prepare('DELETE FROM viaggi WHERE id = ?').bind(id).run()

      return json({ ok: true })
    }
    // PUT /api/tappe/:id — aggiornamento leggero di una singola tappa
    // (usato dal drawer laterale, per non dover rimandare l'intero viaggio)
    if (request.method === 'PUT' && path.startsWith('/api/tappe/')) {
      if (!userId) return nonAutorizzato()

      const id = path.split('/')[3]
      if (!id) return notFound()

      const viaggioId = await viaggioIdDiTappa(env, id)
      if (!viaggioId || !(await viaggioAppartieneA(env, viaggioId, userId))) return vietato()

      const body = await request.json()
      const campiAggiornabili = ['nome', 'lat', 'lng', 'paese_iso', 'ordine', 'notti', 'data_arrivo', 'data_partenza', 'hotel', 'trasporto_arrivo', 'trasporto_partenza']
      const campiJson = ['hotel', 'trasporto_arrivo', 'trasporto_partenza']

      const set = []
      const valori = []
      for (const campo of campiAggiornabili) {
        if (campo in body) {
          set.push(`${campo} = ?`)
          valori.push(campiJson.includes(campo) ? JSON.stringify(body[campo] || {}) : body[campo])
        }
      }

      if (set.length === 0) return json({ ok: true }) // niente da aggiornare

      valori.push(id)
      await env.sito_viaggi_db.prepare(
        `UPDATE tappe SET ${set.join(', ')} WHERE id = ?`
      ).bind(...valori).run()

      return json({ ok: true })
    }

    // POST /api/tappe/:id/giorni — crea un nuovo giorno per una tappa
    if (request.method === 'POST' && path.match(/^\/api\/tappe\/\d+\/giorni$/)) {
      if (!userId) return nonAutorizzato()

      const tappaId = path.split('/')[3]
      const viaggioId = await viaggioIdDiTappa(env, tappaId)
      if (!viaggioId || !(await viaggioAppartieneA(env, viaggioId, userId))) return vietato()

      const { numero, data, titolo } = await request.json()

      const risultato = await env.sito_viaggi_db.prepare(
        'INSERT INTO giorni (tappa_id, numero, data, titolo) VALUES (?, ?, ?, ?)'
      ).bind(tappaId, numero || null, data || null, titolo || null).run()

      return json({ id: risultato.meta.last_row_id, tappa_id: Number(tappaId), numero, data, titolo, attivita: [] })
    }

    // DELETE /api/giorni/:id — elimina un giorno, le sue attività, e le voci checklist collegate
    if (request.method === 'DELETE' && path.startsWith('/api/giorni/')) {
      if (!userId) return nonAutorizzato()

      const id = path.split('/')[3]
      if (!id) return notFound()

      const viaggioId = await viaggioIdDiGiorno(env, id)
      if (!viaggioId || !(await viaggioAppartieneA(env, viaggioId, userId))) return vietato()

      const { results: attivitaEsistenti } = await env.sito_viaggi_db.prepare(
        'SELECT id FROM attivita WHERE giorno_id = ?'
      ).bind(id).all()

      for (const a of attivitaEsistenti) {
        await env.sito_viaggi_db.prepare('DELETE FROM checklist_voci WHERE attivita_id = ?').bind(a.id).run()
      }

      await env.sito_viaggi_db.prepare('DELETE FROM attivita WHERE giorno_id = ?').bind(id).run()
      await env.sito_viaggi_db.prepare('DELETE FROM giorni WHERE id = ?').bind(id).run()

      return json({ ok: true })
    }

    // POST /api/giorni/:id/attivita — crea una nuova attività in un giorno
    if (request.method === 'POST' && path.match(/^\/api\/giorni\/\d+\/attivita$/)) {
      if (!userId) return nonAutorizzato()

      const giornoId = path.split('/')[3]
      const viaggioId = await viaggioIdDiGiorno(env, giornoId)
      if (!viaggioId || !(await viaggioAppartieneA(env, viaggioId, userId))) return vietato()

      const body = await request.json()

      const risultato = await env.sito_viaggi_db.prepare(
        'INSERT INTO attivita (giorno_id, ora, nome, note, tipo, lat, lng, link) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
      ).bind(giornoId, body.ora || null, body.nome || null, body.note || null, body.tipo || null, body.lat || null, body.lng || null, body.link || null).run()

      const nuovoId = risultato.meta.last_row_id

      const testo = costruisciTestoChecklist(body.nome, body.note)
      await sincronizzaChecklist(env, nuovoId, viaggioId, body.aggiungi_checklist, testo)

      return json({ id: nuovoId, giorno_id: Number(giornoId), ...body })
    }

    // PUT /api/attivita/:id — modifica un'attività
    if (request.method === 'PUT' && path.startsWith('/api/attivita/')) {
      if (!userId) return nonAutorizzato()

      const id = path.split('/')[3]
      if (!id) return notFound()

      const viaggioId = await viaggioIdDiAttivita(env, id)
      if (!viaggioId || !(await viaggioAppartieneA(env, viaggioId, userId))) return vietato()

      const body = await request.json()

      await env.sito_viaggi_db.prepare(
        'UPDATE attivita SET ora = ?, nome = ?, note = ?, tipo = ?, lat = ?, lng = ?, link = ? WHERE id = ?'
      ).bind(body.ora || null, body.nome || null, body.note || null, body.tipo || null, body.lat || null, body.lng || null, body.link || null, id).run()

      const testo = costruisciTestoChecklist(body.nome, body.note)
      await sincronizzaChecklist(env, id, viaggioId, body.aggiungi_checklist, testo)

      return json({ ok: true })
    }

    // DELETE /api/attivita/:id — elimina un'attività (e l'eventuale voce checklist collegata)
    if (request.method === 'DELETE' && path.startsWith('/api/attivita/')) {
      if (!userId) return nonAutorizzato()

      const id = path.split('/')[3]
      if (!id) return notFound()

      const viaggioId = await viaggioIdDiAttivita(env, id)
      if (!viaggioId || !(await viaggioAppartieneA(env, viaggioId, userId))) return vietato()

      await env.sito_viaggi_db.prepare('DELETE FROM checklist_voci WHERE attivita_id = ?').bind(id).run()
      await env.sito_viaggi_db.prepare('DELETE FROM attivita WHERE id = ?').bind(id).run()

      return json({ ok: true })
    }
    return notFound()
}