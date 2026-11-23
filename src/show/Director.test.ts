import { describe, expect, it, vi } from 'vitest';
import { storyboardLocal } from '../lib/storyboard';
import type { Recado } from '../lib/tipos';
import { executarShow, type DepsShow, type Fase } from './Director';

const msg = 'Feliz aniversário, Ana! Que venham muitas viagens. Te amo muito, minha irmã!';
const recado: Recado = {
  para: 'Ana', de: 'Bia', ocasiao: 'aniversario', msg, trilha: 'festa', voz: 'locutor',
  cenas: storyboardLocal(msg, 'aniversario', 'Ana'),
};

function criarDeps() {
  const log: string[] = [];
  const fases: Fase[] = [];
  const deps: DepsShow = {
    falar: vi.fn(async (texto: string, onPalavra: (n: number) => void) => {
      log.push(`falar:${texto}`);
      const n = texto.split(/\s+/).length;
      for (let i = 1; i <= n; i++) onPalavra(i);
    }),
    esperar: vi.fn(async () => {}),
    aoMudar: (f) => fases.push(f),
    audio: {
      vinheta: vi.fn(async () => void log.push('vinheta')),
      iniciarTrilha: vi.fn(() => void log.push('trilha')),
      abaixar: vi.fn(() => void log.push('abaixar')),
      subir: vi.fn(() => void log.push('subir')),
      parar: vi.fn(() => void log.push('parar')),
    },
  };
  return { deps, log, fases };
}

describe('executarShow', () => {
  it('segue a ordem vinheta → cenas → final', async () => {
    const { deps, log, fases } = criarDeps();
    await executarShow(recado, deps, new AbortController().signal);

    expect(log[0]).toBe('vinheta');
    expect(log[1]).toMatch(/^falar:Alô, alô! Atenção, Ana!/);
    expect(log[2]).toBe('trilha');
    const falas = log.filter((l) => l.startsWith('falar:')).slice(1);
    expect(falas).toEqual(recado.cenas.map((c) => `falar:${c.frase}`));
    expect(log.at(-1)).toBe('parar');

    const tipos = fases.map((f) => (f.tipo === 'cena' ? `cena${f.indice}` : f.tipo));
    expect([...new Set(tipos)]).toEqual(['vinheta', 'cena0', 'cena1', 'cena2', 'final']);
    // abaixa a música antes de cada frase e sobe depois
    expect(log.filter((l) => l === 'abaixar')).toHaveLength(3);
    expect(log.filter((l) => l === 'subir')).toHaveLength(3);
  });

  it('revela as palavras progressivamente', async () => {
    const { deps, fases } = criarDeps();
    await executarShow(recado, deps, new AbortController().signal);
    const cena0 = fases.filter((f): f is Extract<Fase, { tipo: 'cena' }> => f.tipo === 'cena' && f.indice === 0);
    expect(cena0.map((f) => f.reveladas)).toEqual([0, 1, 2, 3]);
  });

  it('para quando abortado', async () => {
    const { deps, fases } = criarDeps();
    const ctrl = new AbortController();
    deps.audio.iniciarTrilha = () => ctrl.abort();
    await executarShow(recado, deps, ctrl.signal);
    expect(fases.some((f) => f.tipo === 'cena' || f.tipo === 'final')).toBe(false);
    expect(deps.audio.parar).not.toHaveBeenCalled();
  });
});
