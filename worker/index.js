const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, POST, OPTIONS',
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
        tappa.hotel    = JSON.parse(tappa.hotel    || '{}')
        tappa.stazione = JSON.parse(tappa.stazione || '{}')

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
    return notFound()
  }
}