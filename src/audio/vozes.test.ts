import { describe, expect, it } from 'vitest';
import { ehVozRobotica, ordenarVozesPt, palavraParaFala, rotuloVoz } from './vozes';

const v = (name: string, lang = 'pt-BR', localService = true) => ({ name, lang, localService });

describe('ordenarVozesPt', () => {
  it('prefere a voz Google à Microsoft Maria no Chrome do Windows', () => {
    const r = ordenarVozesPt([
      v('Microsoft Maria - Portuguese (Brazil)'),
      v('Microsoft Daniel - Portuguese (Brazil)'),
      v('Google português do Brasil', 'pt-BR', false),
      v('Google US English', 'en-US', false),
    ]);
    expect(r[0].name).toBe('Google português do Brasil');
    expect(r.map((x) => x.lang)).not.toContain('en-US');
  });

  it('prefere as vozes Natural do Edge', () => {
    const r = ordenarVozesPt([
      v('Google português do Brasil', 'pt-BR', false),
      v('Microsoft Francisca Online (Natural) - Portuguese (Brazil)', 'pt-BR', false),
      v('Microsoft Maria - Portuguese (Brazil)'),
    ]);
    expect(r[0].name).toMatch(/Francisca/);
  });

  it('prefere pt-BR a pt-PT', () => {
    expect(ordenarVozesPt([v('Joana', 'pt-PT'), v('Luciana', 'pt-BR')])[0].name).toBe('Luciana');
  });
});

describe('ehVozRobotica', () => {
  it('marca as vozes SAPI do Windows', () => {
    expect(ehVozRobotica(v('Microsoft Maria - Portuguese (Brazil)'))).toBe(true);
    expect(ehVozRobotica(v('Microsoft Francisca Online (Natural) - Portuguese (Brazil)'))).toBe(false);
    expect(ehVozRobotica(v('Google português do Brasil'))).toBe(false);
  });
});

describe('rotuloVoz', () => {
  it('encurta o nome', () => {
    expect(rotuloVoz(v('Microsoft Francisca Online (Natural) - Portuguese (Brazil)'))).toBe('Francisca (Natural)');
    expect(rotuloVoz(v('Google português do Brasil'))).toBe('Google');
  });
});

describe('palavraParaFala', () => {
  it('remove emojis e pontuação repetida', () => {
    expect(palavraParaFala('amo!!!❤️')).toBe('amo!');
    expect(palavraParaFala('🎉')).toBe('');
    expect(palavraParaFala('Parabéns👏🏽')).toBe('Parabéns');
  });
});
