import { describe, expect, it } from 'vitest';
import { dividirFrases, normalizar } from './texto';

describe('normalizar', () => {
  it('remove acentos, caixa e pontuação nas pontas', () => {
    expect(normalizar('Coração!')).toBe('coracao');
    expect(normalizar('"Ônibus,"')).toBe('onibus');
  });
});

describe('dividirFrases', () => {
  it('divide por pontuação final e quebra de linha', () => {
    expect(dividirFrases('Feliz aniversário, Ana! Que dia lindo pra você.\nTe amo demais, viu?')).toEqual([
      'Feliz aniversário, Ana!',
      'Que dia lindo pra você.',
      'Te amo demais, viu?',
    ]);
  });

  it('junta fragmentos curtos', () => {
    expect(dividirFrases('Oi! Tudo bem? Hoje é seu dia especial.')).toEqual(['Oi! Tudo bem? Hoje é seu dia especial.']);
  });

  it('quebra frases longas na vírgula', () => {
    const longa =
      'Lembra daquela viagem pra praia em que perdemos o ônibus de volta e tivemos que dormir na rodoviária, comendo pastel frio e rindo de tudo até amanhecer sem nenhuma preocupação no mundo inteiro';
    const frases = dividirFrases(longa);
    expect(frases.length).toBe(2);
    expect(frases.every((f) => f.length <= 170)).toBe(true);
    expect(frases.join(' ')).toBe(longa);
  });

  it('limita a 16 cenas sem perder texto', () => {
    const msg = Array.from({ length: 20 }, (_, i) => `Esta é a frase número ${i}.`).join(' ');
    const frases = dividirFrases(msg);
    expect(frases).toHaveLength(16);
    expect(frases.join(' ')).toBe(msg);
  });

  it('é determinística', () => {
    const msg = 'Parabéns! Você merece tudo de bom. Beijos.';
    expect(dividirFrases(msg)).toEqual(dividirFrases(msg));
  });
});
