import { DICIONARIO, PADRAO_OCASIAO, type EntradaPalavra } from '../content/palavras';
import { dividirFrases, normalizar, palavras } from './texto';
import { LIMITES, type Cena, type Ocasiao } from './tipos';

function casaToken(token: string, termo: string): boolean {
  if (termo.length >= 5) return token.startsWith(termo);
  return token === termo || token === `${termo}s` || token === `${termo}es`;
}

function entradaDoToken(token: string): EntradaPalavra | undefined {
  return DICIONARIO.find((e) => e.termos.some((t) => !t.includes(' ') && casaToken(token, t)));
}

/** Gera a cena de uma frase sem IA, a partir do dicionário de palavras-chave. */
export function cenaLocal(frase: string, indice: number, ocasiao: Ocasiao, nome: string): Cena {
  const padrao = PADRAO_OCASIAO[ocasiao];
  const fraseNorm = ` ${normalizar(frase).replace(/[^\p{L}\p{N}]+/gu, ' ')} `;
  const nomeNorm = normalizar(nome);

  const encontradas: EntradaPalavra[] = [];
  const destaques: string[] = [];

  // termos compostos ("boa sorte", "ano novo") casam na frase inteira
  for (const e of DICIONARIO) {
    if (e.termos.some((t) => t.includes(' ') && fraseNorm.includes(` ${t} `))) encontradas.push(e);
  }

  for (const palavra of palavras(frase)) {
    const token = normalizar(palavra);
    if (!token) continue;
    if (nomeNorm && token === nomeNorm) {
      destaques.push(palavra);
      continue;
    }
    const e = entradaDoToken(token);
    if (e) {
      if (!encontradas.includes(e)) encontradas.push(e);
      destaques.push(palavra);
    }
  }

  // concretos primeiro (ordem de aparição), abstratos depois
  encontradas.sort((a, b) => Number(!!a.fraco) - Number(!!b.fraco));

  // round-robin: o 1º ícone de cada termo, depois os 2ºs...
  const icones: string[] = [];
  for (let n = 0; icones.length < LIMITES.icones && n < 3; n++) {
    for (const e of encontradas) {
      const ic = e.icones[n];
      if (ic && !icones.includes(ic) && icones.length < LIMITES.icones) icones.push(ic);
    }
  }
  const principal = encontradas[0];

  return {
    frase,
    icones: icones.length ? icones : padrao.icones,
    movimento: principal?.movimento ?? padrao.movimentos[indice % padrao.movimentos.length],
    paleta: encontradas.find((e) => e.paleta)?.paleta ?? padrao.paleta,
    destaques: [...new Set(destaques.map((d) => d.replace(/[^\p{L}\p{N}-]+/gu, '')))]
      .filter(Boolean)
      .slice(0, LIMITES.destaques),
  };
}

export function storyboardLocal(msg: string, ocasiao: Ocasiao, nome: string): Cena[] {
  return dividirFrases(msg).map((f, i) => cenaLocal(f, i, ocasiao, nome));
}

/**
 * Junta as frases atuais com cenas já definidas (pela IA ou editadas à mão).
 * Frases sem cena definida recebem a cena local.
 */
export function mesclarCenas(
  msg: string,
  ocasiao: Ocasiao,
  nome: string,
  definidas: Map<string, Omit<Cena, 'frase'>>,
): Cena[] {
  return dividirFrases(msg).map((frase, i) => {
    const d = definidas.get(frase);
    return d ? { ...d, frase } : cenaLocal(frase, i, ocasiao, nome);
  });
}

/**
 * Associa cenas vindas da IA (cada uma com a sua frase) às frases que o app
 * realmente vai usar. Casa por inclusão de texto normalizado; o que não casar fica com a cena local.
 */
export function associarCenas(
  msg: string,
  cenasIA: { frase: string; cena: Omit<Cena, 'frase'> }[],
): Map<string, Omit<Cena, 'frase'>> {
  const chave = (s: string) => normalizar(s).replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
  const ia = cenasIA.map((c) => ({ ...c, k: chave(c.frase) })).filter((c) => c.k);
  const mapa = new Map<string, Omit<Cena, 'frase'>>();
  for (const frase of dividirFrases(msg)) {
    const k = chave(frase);
    const achou = ia.find((c) => k.includes(c.k) || c.k.includes(k));
    if (achou) mapa.set(frase, achou.cena);
  }
  return mapa;
}
