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
          'INSERT INTO tappe (viaggio_id, nome, lat, lng, paese_iso, ordine, notti, data_arrivo, data_partenza, hotel) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        ).bind(nuovoId, tappa.nome, tappa.lat, tappa.lng, tappa.paese_iso || null, tappa.ordine, tappa.notti || null, tappa.data_arrivo || null, tappa.data_partenza || null, JSON.stringify(tappa.hotel || {})).run()
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
            'UPDATE tappe SET nome = ?, lat = ?, lng = ?, paese_iso = ?, ordine = ?, notti = ?, data_arrivo = ?, data_partenza = ?, hotel = ? WHERE id = ?'
          ).bind(tappa.nome, tappa.lat, tappa.lng, tappa.paese_iso || null, tappa.ordine, tappa.notti || null, tappa.data_arrivo || null, tappa.data_partenza || null, JSON.stringify(tappa.hotel || {}), tappa.id).run()
        } else {
          // Tappa nuova → INSERT
          await env.sito_viaggi_db.prepare(
            'INSERT INTO tappe (viaggio_id, nome, lat, lng, paese_iso, ordine, notti, data_arrivo, data_partenza, hotel) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
          ).bind(id, tappa.nome, tappa.lat, tappa.lng, tappa.paese_iso || null, tappa.ordine, tappa.notti || null, tappa.data_arrivo || null, tappa.data_partenza || null, JSON.stringify(tappa.hotel || {})).run()
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
    return notFound()
  }
}