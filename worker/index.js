const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  })
}

function notFound() {
  return json({ errore: 'Non trovato' }, 404)
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

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const path = url.pathname

    // Preflight CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS })
    }

    // GET /api/viaggi
    if (request.method === 'GET' && path === '/api/viaggi') {
      const { results } = await env.sito_viaggi_db.prepare(
        'SELECT id, titolo, stato, data_inizio, data_fine, descrizione FROM viaggi ORDER BY id'
      ).all()

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
      const id = path.split('/')[3]
      if (!id) return notFound()

      const viaggio = await env.sito_viaggi_db.prepare(
        'SELECT * FROM viaggi WHERE id = ?'
      ).bind(id).first()
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
      const id = path.split('/')[3]
      if (!id) return notFound()

      const { results } = await env.sito_viaggi_db.prepare(
        'SELECT * FROM checklist_voci WHERE viaggio_id = ? ORDER BY ordine'
      ).bind(id).all()
      return json(results)
    }

    // PUT /api/checklist/:voceId
    if (request.method === 'PUT' && path.startsWith('/api/checklist/')) {
      const id = path.split('/')[3]
      if (!id) return notFound()

      const body = await request.json()
      await env.sito_viaggi_db.prepare(
        'UPDATE checklist_voci SET completata = ? WHERE id = ?'
      ).bind(body.completata ? 1 : 0, id).run()

      return json({ ok: true })
    }
    
    // GET /api/wandex
    if (request.method === 'GET' && path === '/api/wandex') {
      const { results } = await env.sito_viaggi_db.prepare(
        'SELECT categoria, chiave FROM wandex_voci'
      ).all()
      return json(results)
    }

    // POST /api/wandex  (toggle: inserisce se non esiste, cancella se esiste)
    if (request.method === 'POST' && path === '/api/wandex') {
      const { categoria, chiave } = await request.json()
      if (!categoria || !chiave) return json({ errore: 'Parametri mancanti' }, 400)

      const esistente = await env.sito_viaggi_db.prepare(
        'SELECT 1 FROM wandex_voci WHERE categoria = ? AND chiave = ?'
      ).bind(categoria, chiave).first()

      if (esistente) {
        await env.sito_viaggi_db.prepare(
          'DELETE FROM wandex_voci WHERE categoria = ? AND chiave = ?'
        ).bind(categoria, chiave).run()
      } else {
        await env.sito_viaggi_db.prepare(
          'INSERT INTO wandex_voci (categoria, chiave) VALUES (?, ?)'
        ).bind(categoria, chiave).run()
      }

      return json({ ok: true })
    }

        // POST /api/viaggi — crea nuovo viaggio
    if (request.method === 'POST' && path === '/api/viaggi') {
      const body = await request.json()
      const { titolo, stato, data_inizio, data_fine, descrizione, tappe = [] } = body

      // Inserisce il viaggio e recupera l'id generato
      const risultato = await env.sito_viaggi_db.prepare(
        'INSERT INTO viaggi (titolo, stato, data_inizio, data_fine, descrizione) VALUES (?, ?, ?, ?, ?)'
      ).bind(titolo, stato, data_inizio || null, data_fine || null, descrizione || null).run()

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
      const id = path.split('/')[3]
      if (!id) return notFound()

      const body = await request.json()
      const { titolo, stato, data_inizio, data_fine, descrizione, tappe = [] } = body

      // Aggiorna i dati del viaggio
      await env.sito_viaggi_db.prepare(
        'UPDATE viaggi SET titolo = ?, stato = ?, data_inizio = ?, data_fine = ?, descrizione = ? WHERE id = ?'
      ).bind(titolo, stato, data_inizio || null, data_fine || null, descrizione || null, id).run()

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
      const id = path.split('/')[3]
      if (!id) return notFound()

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
      const id = path.split('/')[3]
      if (!id) return notFound()

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
      const tappaId = path.split('/')[3]
      const { numero, data, titolo } = await request.json()

      const risultato = await env.sito_viaggi_db.prepare(
        'INSERT INTO giorni (tappa_id, numero, data, titolo) VALUES (?, ?, ?, ?)'
      ).bind(tappaId, numero || null, data || null, titolo || null).run()

      return json({ id: risultato.meta.last_row_id, tappa_id: Number(tappaId), numero, data, titolo, attivita: [] })
    }

    // DELETE /api/giorni/:id — elimina un giorno, le sue attività, e le voci checklist collegate
    if (request.method === 'DELETE' && path.startsWith('/api/giorni/')) {
      const id = path.split('/')[3]
      if (!id) return notFound()

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
      const giornoId = path.split('/')[3]
      const body = await request.json()

      const risultato = await env.sito_viaggi_db.prepare(
        'INSERT INTO attivita (giorno_id, ora, nome, note, tipo, lat, lng, link) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
      ).bind(giornoId, body.ora || null, body.nome || null, body.note || null, body.tipo || null, body.lat || null, body.lng || null, body.link || null).run()

      const nuovoId = risultato.meta.last_row_id

      const riga = await env.sito_viaggi_db.prepare(
        'SELECT t.viaggio_id AS viaggio_id FROM giorni g JOIN tappe t ON t.id = g.tappa_id WHERE g.id = ?'
      ).bind(giornoId).first()

      if (riga) {
        const testo = costruisciTestoChecklist(body.nome, body.note)
        await sincronizzaChecklist(env, nuovoId, riga.viaggio_id, body.aggiungi_checklist, testo)
      }

      return json({ id: nuovoId, giorno_id: Number(giornoId), ...body })
    }

    // PUT /api/attivita/:id — modifica un'attività
    if (request.method === 'PUT' && path.startsWith('/api/attivita/')) {
      const id = path.split('/')[3]
      if (!id) return notFound()
      const body = await request.json()

      await env.sito_viaggi_db.prepare(
        'UPDATE attivita SET ora = ?, nome = ?, note = ?, tipo = ?, lat = ?, lng = ?, link = ? WHERE id = ?'
      ).bind(body.ora || null, body.nome || null, body.note || null, body.tipo || null, body.lat || null, body.lng || null, body.link || null, id).run()

      const riga = await env.sito_viaggi_db.prepare(
        'SELECT t.viaggio_id AS viaggio_id FROM attivita a JOIN giorni g ON g.id = a.giorno_id JOIN tappe t ON t.id = g.tappa_id WHERE a.id = ?'
      ).bind(id).first()

      if (riga) {
        const testo = costruisciTestoChecklist(body.nome, body.note)
        await sincronizzaChecklist(env, id, riga.viaggio_id, body.aggiungi_checklist, testo)
      }

      return json({ ok: true })
    }

    // DELETE /api/attivita/:id — elimina un'attività (e l'eventuale voce checklist collegata)
    if (request.method === 'DELETE' && path.startsWith('/api/attivita/')) {
      const id = path.split('/')[3]
      if (!id) return notFound()

      await env.sito_viaggi_db.prepare('DELETE FROM checklist_voci WHERE attivita_id = ?').bind(id).run()
      await env.sito_viaggi_db.prepare('DELETE FROM attivita WHERE id = ?').bind(id).run()

      return json({ ok: true })
    }

    return notFound()
  }
}