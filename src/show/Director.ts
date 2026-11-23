import type { Recado } from '../lib/tipos';

export type Fase =
  | { tipo: 'vinheta'; falaRevelada: number }
  | { tipo: 'cena'; indice: number; reveladas: number }
  | { tipo: 'final' };

export interface DepsShow {
  falar(texto: string, onPalavra: (n: number) => void, signal: AbortSignal): Promise<void>;
  esperar(ms: number, signal: AbortSignal): Promise<void>;
  aoMudar(fase: Fase): void;
  audio: {
    vinheta(): Promise<void>;
    iniciarTrilha(): void;
    abaixar(): void;
    subir(): void;
    parar(): void;
  };
}

export function textoVinheta(r: Pick<Recado, 'para' | 'de'>): string {
  return `Alô, alô! Atenção, ${r.para}! Este recado é pra você, de ${r.de}.`;
}

/** Roteiro do show: vinheta → uma cena por frase → final. */
export async function executarShow(r: Recado, deps: DepsShow, signal: AbortSignal): Promise<void> {
  const { audio } = deps;
  const vivo = () => !signal.aborted;

  deps.aoMudar({ tipo: 'vinheta', falaRevelada: 0 });
  await audio.vinheta();
  if (!vivo()) return;
  await deps.falar(textoVinheta(r), (n) => deps.aoMudar({ tipo: 'vinheta', falaRevelada: n }), signal);
  if (!vivo()) return;

  audio.iniciarTrilha();
  await deps.esperar(900, signal);

  for (let i = 0; i < r.cenas.length; i++) {
    if (!vivo()) return;
    deps.aoMudar({ tipo: 'cena', indice: i, reveladas: 0 });
    await deps.esperar(700, signal); // ícones entram antes da voz
    if (!vivo()) return;
    audio.abaixar();
    await deps.falar(r.cenas[i].frase, (n) => deps.aoMudar({ tipo: 'cena', indice: i, reveladas: n }), signal);
    if (!vivo()) return;
    audio.subir();
    await deps.esperar(1100, signal);
  }

  if (!vivo()) return;
  deps.aoMudar({ tipo: 'final' });
  await deps.esperar(9000, signal);
  if (vivo()) audio.parar();
}
