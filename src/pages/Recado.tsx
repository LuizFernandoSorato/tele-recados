import { useMemo } from 'react';
import { irPara } from '../App';
import { decodificar } from '../lib/payload';
import { Show } from '../show/Show';

export function PaginaRecado({ codigo }: { codigo: string }) {
  const recado = useMemo(() => decodificar(codigo), [codigo]);

  if (!recado) {
    return (
      <main className="pagina centro">
        <div className="cartao">
          <div className="emoji-grande" aria-hidden>
            📭
          </div>
          <h1>Esse recado se perdeu no caminho</h1>
          <p>O link pode ter sido cortado ao copiar. Peça para a pessoa mandar de novo, ou crie o seu.</p>
          <button className="btn btn-principal" onClick={() => irPara('/criar')}>
            Criar um TeleRecado
          </button>
        </div>
      </main>
    );
  }

  const responder = () => {
    const q = new URLSearchParams({ para: recado.de, de: recado.para });
    irPara(`/criar?${q}`);
  };

  return <Show recado={recado} aoResponder={responder} />;
}
