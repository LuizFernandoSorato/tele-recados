import type { Trilha } from '../lib/tipos';

/** [batida inicial, nota(s), duração em batidas, intensidade 0..1] */
export type Nota = [number, string | string[], number, number?];

export interface Musica {
  bpm: number;
  /** comprimento do loop em batidas */
  loop: number;
  melodia: Nota[];
  acordes: Nota[];
  baixo: Nota[];
  timbreMelodia: 'piano' | 'caixinha';
}

const ACORDES: Record<string, string[]> = {
  C: ['C4', 'E4', 'G4'],
  G: ['B3', 'D4', 'G4'],
  Am: ['A3', 'C4', 'E4'],
  F: ['A3', 'C4', 'F4'],
  Em: ['B3', 'E4', 'G4'],
  Dm: ['A3', 'D4', 'F4'],
};
const RAIZ: Record<string, string> = { C: 'C2', G: 'G2', Am: 'A2', F: 'F2', Em: 'E2', Dm: 'D2' };

/** um acorde longo por compasso (pad) */
function pads(seq: string[], batidas: number): Nota[] {
  return seq.map((a, i) => [i * batidas, ACORDES[a], batidas, 0.5] as Nota);
}
function baixos(seq: string[], batidas: number, padrao: number[]): Nota[] {
  return seq.flatMap((a, i) => padrao.map((b) => [i * batidas + b, RAIZ[a], 1, 0.7] as Nota));
}
/** arpejo em colcheias subindo e descendo */
function arpejo(seq: string[], batidas: number, oitava = 1): Nota[] {
  const out: Nota[] = [];
  seq.forEach((a, i) => {
    const notas = ACORDES[a].map((n) => n.replace(/\d/, (d) => String(Number(d) + oitava)));
    const ciclo = [...notas, notas[1]];
    for (let k = 0; k < batidas * 2; k++) out.push([i * batidas + k / 2, ciclo[k % ciclo.length], 0.5, 0.55]);
  });
  return out;
}

const suave: Musica = {
  bpm: 72,
  loop: 16,
  timbreMelodia: 'piano',
  acordes: pads(['C', 'Am', 'F', 'G'], 4),
  baixo: baixos(['C', 'Am', 'F', 'G'], 4, [0]),
  melodia: arpejo(['C', 'Am', 'F', 'G'], 4),
};

const festa: Musica = {
  bpm: 112,
  loop: 16,
  timbreMelodia: 'piano',
  acordes: ['C', 'G', 'Am', 'F'].flatMap((a, i) =>
    [0.5, 1.5, 2.5, 3.5].map((b) => [i * 4 + b, ACORDES[a], 0.4, 0.45] as Nota),
  ),
  baixo: baixos(['C', 'G', 'Am', 'F'], 4, [0, 2]),
  melodia: [
    [0, 'E5', 0.5], [0.5, 'G5', 0.5], [1, 'A5', 1], [2, 'G5', 0.5], [2.5, 'E5', 0.5], [3, 'D5', 1],
    [4, 'D5', 0.5], [4.5, 'G5', 0.5], [5, 'B5', 1], [6, 'A5', 0.5], [6.5, 'G5', 0.5], [7, 'D5', 1],
    [8, 'C5', 0.5], [8.5, 'E5', 0.5], [9, 'A5', 1], [10, 'G5', 0.5], [10.5, 'E5', 0.5], [11, 'C5', 1],
    [12, 'A4', 0.5], [12.5, 'C5', 0.5], [13, 'F5', 1], [14, 'E5', 1], [15, 'D5', 1],
  ],
};

const nostalgia: Musica = {
  bpm: 66,
  loop: 16,
  timbreMelodia: 'caixinha',
  acordes: pads(['Am', 'F', 'C', 'G'], 4),
  baixo: baixos(['Am', 'F', 'C', 'G'], 4, [0]),
  melodia: [
    [0, 'E6', 1], [1, 'C6', 0.5], [1.5, 'B5', 0.5], [2, 'A5', 2],
    [4, 'F5', 1], [5, 'A5', 0.5], [5.5, 'C6', 0.5], [6, 'A5', 2],
    [8, 'G5', 1], [9, 'C6', 0.5], [9.5, 'E6', 0.5], [10, 'D6', 2],
    [12, 'B5', 1], [13, 'D6', 0.5], [13.5, 'B5', 0.5], [14, 'G5', 2],
  ],
};

// "Parabéns a você": apenas a melodia (domínio público), em 3/4, com anacruse.
const parabens: Musica = {
  bpm: 104,
  loop: 27,
  timbreMelodia: 'piano',
  melodia: [
    [0, 'G4', 0.75], [0.75, 'G4', 0.25], [1, 'A4', 1], [2, 'G4', 1], [3, 'C5', 1], [4, 'B4', 2],
    [6, 'G4', 0.75], [6.75, 'G4', 0.25], [7, 'A4', 1], [8, 'G4', 1], [9, 'D5', 1], [10, 'C5', 2],
    [12, 'G4', 0.75], [12.75, 'G4', 0.25], [13, 'G5', 1], [14, 'E5', 1], [15, 'C5', 1], [16, 'B4', 1], [17, 'A4', 1],
    [18, 'F5', 0.75], [18.75, 'F5', 0.25], [19, 'E5', 1], [20, 'C5', 1], [21, 'D5', 1], [22, 'C5', 3],
  ].map(([b, n, d]) => [b, n, d, 0.8] as Nota),
  // valsinha: baixo no 1º tempo, acorde no 2º e 3º
  acordes: ['C', 'G', 'G', 'C', 'C', 'F', 'C', 'C'].flatMap((a, i) =>
    [1, 2].map((b) => [1 + i * 3 + b, ACORDES[a], 0.6, 0.35] as Nota),
  ),
  baixo: ['C', 'G', 'G', 'C', 'C', 'F', 'C', 'C'].map((a, i) => [1 + i * 3, RAIZ[a], 1, 0.6] as Nota),
};

export const MUSICAS: Record<Exclude<Trilha, 'nenhuma'>, Musica> = { suave, festa, nostalgia, parabens };

export const ROTULO_TRILHA: Record<Trilha, string> = {
  suave: 'Suave (piano)',
  festa: 'Festa',
  nostalgia: 'Nostalgia (caixinha de música)',
  parabens: 'Parabéns a você',
  nenhuma: 'Sem música',
};
