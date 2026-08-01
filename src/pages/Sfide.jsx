import './Sfide.css'

function Sfide() {
  return (
    <div className="sfide-wrap">
      <div className="sfide-contenuto">

        <div className="sfide-header">
          <h1 className="sfide-titolo">Sfide</h1>
          <p className="sfide-sub">La parte competitiva del viaggio</p>
        </div>

        <div className="sfide-wip">
          <div className="sfide-wip__icona">◇</div>
          <h2 className="sfide-wip__titolo">Lavori in corso</h2>
          <p className="sfide-wip__testo">
            Questa sezione non è ancora stata costruita. L'idea è di poter lanciare
            obiettivi di viaggio — da soli o insieme agli amici — e seguirne
            l'avanzamento nel tempo.
          </p>

          <ul className="sfide-wip__lista">
            <li>Obiettivi personali (es. 50 province italiane entro fine anno)</li>
            <li>Sfide a due, collegate al Wandex e agli amici</li>
            <li>Avanzamento automatico dai viaggi già registrati</li>
          </ul>

          <p className="sfide-wip__nota">
            Nel frattempo puoi confrontare il tuo Wandex con quello degli amici
            dalla sezione <strong>Amici</strong>.
          </p>
        </div>

      </div>
    </div>
  )
}

export default Sfide
