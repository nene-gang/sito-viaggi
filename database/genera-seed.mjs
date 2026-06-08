import viaggi from '../src/data/viaggi.js'
import fs from 'fs'

const righe = []
let giornoId = 1
let attivitaId = 1

for (const v of viaggi) {
  const note = v.note?.replace(/'/g, "''") ?? ''
  const desc = v.descrizione?.replace(/'/g, "''") ?? ''

  righe.push(
    `INSERT INTO viaggi (id, titolo, stato, data_inizio, data_fine, descrizione, note) VALUES ` +
    `(${v.id}, '${v.titolo}', '${v.stato}', '${v.data_inizio}', '${v.data_fine}', '${desc}', '${note}');`
  )

  for (const t of v.tappe ?? []) {
    const hotel    = JSON.stringify(t.hotel    ?? {}).replace(/'/g, "''")
    const stazione = JSON.stringify(t.stazione ?? {}).replace(/'/g, "''")
    const tnote    = (t.note ?? '').replace(/'/g, "''")
    const ta       = (t.trasporto_arrivo   ?? '').replace(/'/g, "''")
    const tp       = (t.trasporto_partenza ?? '').replace(/'/g, "''")

    righe.push(
      `INSERT INTO tappe (id, viaggio_id, nome, paese, paese_iso, lat, lng, ordine, notti, data_arrivo, data_partenza, hotel, stazione, note, trasporto_arrivo, trasporto_partenza) VALUES ` +
      `(${t.id}, ${v.id}, '${t.nome}', '${t.paese}', '${t.paese_iso}', ${t.lat}, ${t.lng}, ${t.ordine}, ${t.notti}, '${t.data_arrivo}', '${t.data_partenza}', '${hotel}', '${stazione}', '${tnote}', '${ta}', '${tp}');`
    )

    for (const g of t.giorni ?? []) {
      const gId     = giornoId++
      const gtitolo = (g.titolo ?? '').replace(/'/g, "''")

      righe.push(
        `INSERT INTO giorni (id, tappa_id, numero, titolo, data) VALUES ` +
        `(${gId}, ${t.id}, ${g.numero}, '${gtitolo}', '${g.data}');`
      )

      for (const a of g.attivita ?? []) {
        const anome = (a.nome ?? '').replace(/'/g, "''")
        const anote = (a.note ?? '').replace(/'/g, "''")
        const alat  = a.lat  ?? 'NULL'
        const alng  = a.lng  ?? 'NULL'

        righe.push(
          `INSERT INTO attivita (id, giorno_id, ora, nome, note, tipo, lat, lng) VALUES ` +
          `(${attivitaId++}, ${gId}, '${a.ora ?? ''}', '${anome}', '${anote}', '${a.tipo ?? ''}', ${alat}, ${alng});`
        )
      }
    }
  }

  for (const [i, c] of (v.checklist_partenza ?? []).entries()) {
    const testo = c.voce.replace(/'/g, "''")
    righe.push(
      `INSERT INTO checklist_voci (viaggio_id, testo, completata, ordine) VALUES ` +
      `(${v.id}, '${testo}', ${c.completata ? 1 : 0}, ${i});`
    )
  }
}

fs.writeFileSync('database/seed.sql', righe.join('\n'))
console.log(`Generato seed.sql con ${righe.length} righe`)