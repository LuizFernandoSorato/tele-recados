import { LIMITES } from './tipos';

/** minúsculas, sem acento, sem pontuação nas pontas */
export function normalizar(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '');
}

/** Divide a frase em palavras, preservando a pontuação grudada (para exibição). */
export function palavras(frase: string): string[] {
  return frase.split(/\s+/).filter(Boolean);
}

const MIN_FRASE = 14;
const MAX_FRASE = 170;

/**
 * Divide a mensagem em frases — cada uma vira uma cena.
 * Determinística: o criador e o destinatário precisam chegar nas mesmas frases.
 */
export function dividirFrases(texto: string): string[] {
  const brutas = texto
    .replace(/\r/g, '')
    .split(/\n+|(?<=[.!?…])\s+/)
    .map((f) => f.trim())
    .filter(Boolean);

  // quebra frases longas demais na vírgula mais próxima do meio
  const quebradas: string[] = [];
  for (const f of brutas) {
    let resto = f;
    while (resto.length > MAX_FRASE) {
      const meio = Math.floor(resto.length / 2);
      const virgulas = [...resto.matchAll(/[,;:]\s/g)].map((m) => m.index!);
      const corte = virgulas.length
        ? virgulas.reduce((a, b) => (Math.abs(b - meio) < Math.abs(a - meio) ? b : a)) + 1
        : resto.lastIndexOf(' ', MAX_FRASE);
      if (corte <= 0) break;
      quebradas.push(resto.slice(0, corte).trim());
      resto = resto.slice(corte).trim();
    }
    if (resto) quebradas.push(resto);
  }

  // junta fragmentos curtos com o próximo
  const juntas: string[] = [];
  for (const f of quebradas) {
    const ultima = juntas[juntas.length - 1];
    if (ultima !== undefined && ultima.length < MIN_FRASE) {
      juntas[juntas.length - 1] = `${ultima} ${f}`;
    } else {
      juntas.push(f);
    }
  }
  // último fragmento curto gruda no anterior
  if (juntas.length > 1 && juntas[juntas.length - 1].length < MIN_FRASE) {
    const ultimo = juntas.pop()!;
    juntas[juntas.length - 1] += ` ${ultimo}`;
  }

  // excesso de frases: junta o final na última cena permitida
  if (juntas.length > LIMITES.cenas) {
    const resto = juntas.splice(LIMITES.cenas - 1).join(' ');
    juntas.push(resto);
  }
  return juntas.map((f) => f.slice(0, LIMITES.frase));
}
