import { compressToEncodedURIComponent } from 'lz-string';
import { describe, expect, it } from 'vitest';
import { codificar, decodificar } from './payload';
import { storyboardLocal } from './storyboard';
import type { Recado } from './tipos';

const msg = 'Feliz aniversário, Ana! Que venham muitas viagens pra praia. Te amo!';
const recado: Recado = {
  para: 'Ana',
  de: 'Bia',
  ocasiao: 'aniversario',
  msg,
  trilha: 'parabens',
  voz: 'animada',
  cenas: storyboardLocal(msg, 'aniversario', 'Ana'),
};

const cru = (obj: unknown) => compressToEncodedURIComponent(JSON.stringify(obj));

describe('payload', () => {
  it('faz roundtrip', () => {
    expect(decodificar(codificar(recado))).toEqual(recado);
  });

  it('gera link de tamanho razoável', () => {
    expect(codificar(recado).length).toBeLessThan(800);
  });

  it('rejeita lixo', () => {
    expect(decodificar('')).toBeNull();
    expect(decodificar('nao-e-um-payload')).toBeNull();
    expect(decodificar(cru({ v: 2 }))).toBeNull();
    expect(decodificar(cru({ v: 1, p: '', d: 'x', o: 'aniversario', m: 'oi' }))).toBeNull();
  });

  it('corta campos grandes demais', () => {
    const r = decodificar(cru({ v: 1, p: 'A'.repeat(100), d: 'B', o: 'outro', m: 'M'.repeat(1200) }));
    expect(r?.para).toHaveLength(40);
    expect(r?.msg).toHaveLength(1000);
  });

  it('descarta ícones que não são emoji e enums inválidos', () => {
    const r = decodificar(
      cru({
        v: 1, p: 'Ana', d: 'Bia', o: 'outro', m: 'Uma frase qualquer aqui.', t: 'rock', z: 'x',
        c: [[['<img src=x>', 'javascript:', '🎉'], 99, -1, ['qualquer']]],
      }),
    )!;
    expect(r.trilha).toBe('suave');
    expect(r.voz).toBe('locutor');
    expect(r.cenas[0].icones).toEqual(['🎉']);
    expect(r.cenas[0].movimento).toBeDefined();
    expect(r.cenas[0].paleta).toBeDefined();
  });

  it('completa cenas faltando com o storyboard local', () => {
    const r = decodificar(cru({ v: 1, p: 'Ana', d: 'Bia', o: 'aniversario', m: msg, c: [] }))!;
    expect(r.cenas).toEqual(recado.cenas);
  });
});

describe('mensagem longa', () => {
  it('aceita 1000 caracteres com link de tamanho aceitável', () => {
    const longa = Array.from({ length: 40 }, (_, i) => `Frase ${i} com amor e viagem.`).join(' ').slice(0, 1000);
    const r: Recado = { ...recado, msg: longa, cenas: storyboardLocal(longa, 'aniversario', 'Ana') };
    const volta = decodificar(codificar(r))!;
    expect(volta.msg).toBe(longa.trim());
    expect(volta.cenas.map((c) => c.frase).join(' ')).toBe(longa.trim());
    expect(codificar(r).length).toBeLessThan(4000);
  });
});
