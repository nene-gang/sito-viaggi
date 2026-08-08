// Fusione di una proposta estratta da un testo dentro un elenco di tappe.
// Usato sia dalla chat di creazione sia dal form di modifica, così le regole
// stanno scritte in un posto solo.
//
// Regola generale: vince sempre il dato già presente. La fonte nuova riempie
// i campi vuoti; le discordanze finiscono negli avvisi, non sovrascrivono.

import { HOTEL_VUOTO } from '../components/AlloggioTappa'

const MAPPA_MEZZI = {
  aereo: 'aereo',
  volo: 'aereo',
  treno: 'treno',
  auto: 'auto',
  nave: 'nave',
  traghetto: 'nave',
}

const CAMPI_TAPPA = {
  data_arrivo: 'data di arrivo',
  data_partenza: 'data di partenza',
}

const CAMPI_HOTEL = {
  nome: 'alloggio',
  indirizzo: 'indirizzo alloggio',
  prenotazione: 'riferimento alloggio',
}

// Confronto tra nomi di località: senza accenti, maiuscole e spazi doppi.
export function chiaveNome(s) {
  return String(s || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().trim().replace(/\s+/g, ' ')
}

export function calcolaNotti(arrivo, partenza) {
  if (!arrivo || !partenza) return ''
  const n = Math.round((Date.parse(partenza) - Date.parse(arrivo)) / 86400000)
  return Number.isNaN(n) || n < 0 ? '' : n
}

// Da proposta del modello a tappa nella forma usata dal form e dal database.
export function tappaDaProposta(t) {
  return {
    nome: t.nome || '',
    lat: '',
    lng: '',
    paese_iso: '',
    paese: t.paese || '',
    ordine: 1,
    data_arrivo: t.data_arrivo || '',
    data_partenza: t.data_partenza || '',
    notti: t.notti || '',
    incerta: !!t.incerta,
    hotel: {
      ...HOTEL_VUOTO,
      nome: t.alloggio_nome || '',
      indirizzo: t.alloggio_indirizzo || '',
      prenotazione: t.alloggio_riferimento || '',
    },
  }
}

// Una tratta diventa il trasporto_arrivo della tappa in cui arriva.
export function trasportoDaTratta(tratta) {
  const mezzo = MAPPA_MEZZI[(tratta.mezzo || '').toLowerCase()] || 'altro'
  const dettagli = [
    tratta.da ? `da ${tratta.da}` : '',
    tratta.scali ? `scalo: ${tratta.scali}` : '',
    tratta.riferimento || '',
  ].filter(Boolean).join(' · ')

  return {
    mezzo,
    mezzo_altro: mezzo === 'altro' ? (tratta.mezzo || '') : '',
    dettagli,
    lat: '',
    lng: '',
    link: '',
  }
}

/**
 * Fonde una proposta dentro un elenco di tappe esistenti.
 * @param tappe elenco attuale (forma del form)
 * @param proposta output di /api/viaggi/proponi
 * @param opzioni.nuovoId funzione che genera un id stabile, se servono
 * @returns { tappe, avvisi }
 */
export function fondiProposta(tappe, proposta, opzioni = {}) {
  const nuovoId = opzioni.nuovoId || (() => undefined)
  const avvisi = []
  const risultato = tappe.map(t => ({ ...t, novita: false }))

  for (const grezza of proposta.tappe || []) {
    const nuova = tappaDaProposta(grezza)
    const indice = risultato.findIndex(t => chiaveNome(t.nome) === chiaveNome(nuova.nome))

    if (indice === -1) {
      risultato.push({ ...nuova, _id: nuovoId(), novita: true })
      avvisi.push(`Aggiunta la tappa ${nuova.nome}`)
      continue
    }

    const esistente = risultato[indice]
    let modificata = false

    for (const [campo, etichetta] of Object.entries(CAMPI_TAPPA)) {
      if (!nuova[campo]) continue
      if (!esistente[campo]) {
        esistente[campo] = nuova[campo]
        modificata = true
        avvisi.push(`${esistente.nome}: aggiunto ${etichetta}`)
      } else if (String(esistente[campo]) !== String(nuova[campo])) {
        avvisi.push(`${esistente.nome}: questa fonte dice "${nuova[campo]}" come ${etichetta}, ho tenuto "${esistente[campo]}"`)
      }
    }

    esistente.hotel = { ...HOTEL_VUOTO, ...(esistente.hotel || {}) }
    for (const [campo, etichetta] of Object.entries(CAMPI_HOTEL)) {
      const valoreNuovo = nuova.hotel[campo]
      if (!valoreNuovo) continue
      if (!esistente.hotel[campo]) {
        esistente.hotel[campo] = valoreNuovo
        modificata = true
        avvisi.push(`${esistente.nome}: aggiunto ${etichetta}`)
      } else if (esistente.hotel[campo] !== valoreNuovo) {
        avvisi.push(`${esistente.nome}: questa fonte dice "${valoreNuovo}" come ${etichetta}, ho tenuto "${esistente.hotel[campo]}"`)
      }
    }

    if (modificata) esistente.novita = true
  }

  // Trasporti: una tratta riempie il trasporto_arrivo della tappa di destinazione,
  // ma solo se non c'è già.
  for (const tratta of proposta.tratte || []) {
    const tappa = risultato.find(t => chiaveNome(t.nome) === chiaveNome(tratta.a))
    if (!tappa) continue
    if (tappa.trasporto_arrivo?.mezzo) {
      avvisi.push(`${tappa.nome}: c'è già un trasporto in arrivo, ho lasciato quello`)
      continue
    }
    tappa.trasporto_arrivo = trasportoDaTratta(tratta)
    tappa.novita = true
    avvisi.push(`${tappa.nome}: aggiunto il trasporto in arrivo`)
  }

  // Notti sempre ricalcolate dalle date, mai ereditate dalla fonte.
  for (const t of risultato) {
    const n = calcolaNotti(t.data_arrivo, t.data_partenza)
    if (n !== '') t.notti = n
  }

  // Ordine cronologico; le tappe senza data restano in fondo.
  risultato.sort((a, b) => {
    if (!a.data_arrivo) return 1
    if (!b.data_arrivo) return -1
    return a.data_arrivo.localeCompare(b.data_arrivo)
  })
  risultato.forEach((t, i) => { t.ordine = i + 1 })

  return { tappe: risultato, avvisi }
}

// Estremi del viaggio calcolati dalle tappe e dalle tratte.
export function periodoDaTappe(tappe, tratte = []) {
  const date = []
  for (const t of tappe) {
    if (t.data_arrivo) date.push(t.data_arrivo)
    if (t.data_partenza) date.push(t.data_partenza)
  }
  for (const t of tratte) if (t.data) date.push(t.data)
  date.sort()
  return { inizio: date[0] || '', fine: date[date.length - 1] || '' }
}
