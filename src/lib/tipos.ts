// Tipos e enums compartilhados entre o site e o Worker da IA.
// Mantenha este arquivo sem dependências de DOM.

export const MOVIMENTOS = [
  'flutuar',
  'chover',
  'explodir',
  'crescer',
  'orbitar',
  'voar',
  'pulsar',
  'balancar',
] as const;
export type Movimento = (typeof MOVIMENTOS)[number];

export const PALETAS = [
  'quente',
  'romantica',
  'noite',
  'praia',
  'natureza',
  'festa',
  'nostalgia',
] as const;
export type Paleta = (typeof PALETAS)[number];

export const OCASIOES = [
  'aniversario',
  'maes',
  'pais',
  'namoro',
  'formatura',
  'agradecimento',
  'saudade',
  'outro',
] as const;
export type Ocasiao = (typeof OCASIOES)[number];

export const TRILHAS = ['suave', 'festa', 'nostalgia', 'parabens', 'nenhuma'] as const;
export type Trilha = (typeof TRILHAS)[number];

export const VOZES = ['locutor', 'calma', 'animada'] as const;
export type Voz = (typeof VOZES)[number];

export const TONS = ['carinhoso', 'divertido', 'emocionante'] as const;
export type Tom = (typeof TONS)[number];

export interface Cena {
  frase: string;
  icones: string[];
  movimento: Movimento;
  paleta: Paleta;
  destaques: string[];
}

export interface Recado {
  para: string;
  de: string;
  ocasiao: Ocasiao;
  msg: string;
  trilha: Trilha;
  voz: Voz;
  cenas: Cena[];
}

export const LIMITES = {
  nome: 40,
  msg: 1000,
  // igual ao limite da mensagem: a última cena pode acumular as frases excedentes, e nada pode ser cortado
  frase: 1000,
  cenas: 16,
  icones: 4,
  icone: 16,
  destaques: 6,
  destaque: 40,
} as const;

export const ROTULO_OCASIAO: Record<Ocasiao, string> = {
  aniversario: 'Aniversário',
  maes: 'Dia das Mães',
  pais: 'Dia dos Pais',
  namoro: 'Amor / namoro',
  formatura: 'Formatura',
  agradecimento: 'Agradecimento',
  saudade: 'Saudade',
  outro: 'Outro',
};

/** Aceita apenas sequências de emoji (sem letras, HTML ou URLs). */
const RE_EMOJI = /^(?:\p{Extended_Pictographic}|\p{Emoji_Modifier}|\p{Regional_Indicator}|‍|️|⃣)+$/u;
export function ehEmoji(s: string): boolean {
  return s.length > 0 && s.length <= LIMITES.icone && RE_EMOJI.test(s);
}
