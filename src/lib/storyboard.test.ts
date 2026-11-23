import { describe, expect, it } from 'vitest';
import { associarCenas, cenaLocal, mesclarCenas, storyboardLocal } from './storyboard';

describe('cenaLocal', () => {
  it('reconhece viagem e praia', () => {
    const c = cenaLocal('Lembra daquela viagem pra praia em que perdemos o ônibus?', 0, 'aniversario', 'Ana');
    expect(c.icones).toContain('✈️');
    expect(c.icones).toContain('🏖️');
    expect(c.paleta).toBe('praia');
    expect(c.movimento).toBe('voar');
    expect(c.destaques).toEqual(expect.arrayContaining(['viagem', 'praia', 'ônibus']));
    expect(c.icones.length).toBeLessThanOrEqual(4);
  });

  it('usa o padrão da ocasião quando não há palavra-chave', () => {
    const c = cenaLocal('Hoje é um dia especial demais.', 0, 'aniversario', 'Ana');
    expect(c.icones).toEqual(['🎂', '🎉', '🎈']);
    expect(c.paleta).toBe('festa');
  });

  it('destaca o nome do homenageado', () => {
    const c = cenaLocal('Ana, você é demais!', 0, 'outro', 'Ana');
    expect(c.destaques).toContain('Ana');
  });

  it('não confunde palavras curtas com prefixos', () => {
    const c = cenaLocal('Foi tremendo o susto.', 0, 'outro', 'X');
    expect(c.icones).not.toContain('🚆');
  });

  it('casa termos compostos', () => {
    expect(cenaLocal('Boa sorte nessa nova fase.', 0, 'outro', 'X').icones).toContain('🍀');
  });
});

describe('mesclarCenas', () => {
  it('preserva cenas definidas e completa o resto localmente', () => {
    const msg = 'Feliz aniversário, Ana! Que venham muitas viagens.';
    const definidas = new Map([
      ['Feliz aniversário, Ana!', { icones: ['🦄'], movimento: 'orbitar' as const, paleta: 'noite' as const, destaques: [] }],
    ]);
    const cenas = mesclarCenas(msg, 'aniversario', 'Ana', definidas);
    expect(cenas[0].icones).toEqual(['🦄']);
    expect(cenas[1]).toEqual(storyboardLocal(msg, 'aniversario', 'Ana')[1]);
  });
});

describe('associarCenas', () => {
  it('associa frases da IA mesmo quando a divisão difere', () => {
    const cena = { icones: ['🦄'], movimento: 'orbitar' as const, paleta: 'noite' as const, destaques: [] };
    const outra = { ...cena, icones: ['🐙'] };
    const msg = 'Oi! Tudo bem? Hoje é seu dia especial. Lembra da praia?';
    const mapa = associarCenas(msg, [
      { frase: 'Oi!', cena },
      { frase: 'Lembra da praia?', cena: outra },
    ]);
    expect(mapa.get('Oi! Tudo bem? Hoje é seu dia especial.')?.icones).toEqual(['🦄']);
    expect(mapa.get('Lembra da praia?')?.icones).toEqual(['🐙']);
  });
});
