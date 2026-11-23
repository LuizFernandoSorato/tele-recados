import type { Paleta } from '../lib/tipos';

export interface Estilo {
  fundo: [string, string, string];
  destaque: string;
  rotulo: string;
}

export const PALETA: Record<Paleta, Estilo> = {
  quente: { fundo: ['#ffb347', '#ff7e5f', '#c94b4b'], destaque: '#fff3b0', rotulo: 'Quente' },
  romantica: { fundo: ['#ff9a9e', '#e85d8c', '#6a1b4d'], destaque: '#ffe3ef', rotulo: 'Romântica' },
  noite: { fundo: ['#2c5364', '#203a43', '#0f2027'], destaque: '#ffd86b', rotulo: 'Noite estrelada' },
  praia: { fundo: ['#4fd1c5', '#3a8dde', '#2b4f9e'], destaque: '#fff7c2', rotulo: 'Praia' },
  natureza: { fundo: ['#a8e063', '#56ab2f', '#1e5631'], destaque: '#f4ffd6', rotulo: 'Natureza' },
  festa: { fundo: ['#f857a6', '#a43ee6', '#4b1d9e'], destaque: '#ffe66d', rotulo: 'Festa' },
  nostalgia: { fundo: ['#e6b980', '#c79081', '#5d4157'], destaque: '#fff0d9', rotulo: 'Nostalgia' },
};

export function gradiente(p: Paleta): string {
  const [a, b, c] = PALETA[p].fundo;
  return `linear-gradient(135deg, ${a} 0%, ${b} 50%, ${c} 100%)`;
}
