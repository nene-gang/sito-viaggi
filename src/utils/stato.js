// Stati possibili di un viaggio, in ordine di avanzamento del ciclo di vita:
// bozza (in fase di programmazione) → futuro (programmazione finita, in attesa
// della partenza) → passato (viaggio concluso).
export const STATI_VIAGGIO = [
  { valore: 'bozza',   label: 'Bozza' },
  { valore: 'futuro',  label: 'In programma' },
  { valore: 'passato', label: 'Completato' },
]

export function etichettaStato(stato) {
  return STATI_VIAGGIO.find(s => s.valore === stato)?.label || stato
}