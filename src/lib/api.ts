import type { Cena, Ocasiao, Tom } from './tipos';
import { ehEmoji, LIMITES, MOVIMENTOS, PALETAS } from './tipos';

/** URL do Worker da IA. Sem ela, os botões de IA ficam desativados. */
export const URL_IA: string | undefined = import.meta.env.VITE_IA_URL || undefined;

export type CenaSemFrase = Omit<Cena, 'frase'>;

export interface PedidoEscrever {
  acao: 'escrever';
  para: string;
  de: string;
  ocasiao: Ocasiao;
  relacao: string;
  lembrancas: string[];
  tom: Tom;
}
export interface PedidoAnimar {
  acao: 'animar';
  ocasiao: Ocasiao;
  para: string;
  frases: string[];
}

export type RespostaIA =
  | { ok: true; mensagem?: string; cenas: { frase: string; cena: CenaSemFrase }[] }
  | { ok: false; erro: string };

function validarCena(bruta: unknown): CenaSemFrase | null {
  if (!bruta || typeof bruta !== 'object') return null;
  const c = bruta as Record<string, unknown>;
  const icones = Array.isArray(c.icones) ? c.icones.filter((i): i is string => typeof i === 'string' && ehEmoji(i)) : [];
  if (!icones.length) return null;
  if (!MOVIMENTOS.includes(c.movimento as never) || !PALETAS.includes(c.paleta as never)) return null;
  const destaques = Array.isArray(c.destaques)
    ? c.destaques.filter((d): d is string => typeof d === 'string').map((d) => d.slice(0, LIMITES.destaque))
    : [];
  return {
    icones: icones.slice(0, LIMITES.icones),
    movimento: c.movimento as Cena['movimento'],
    paleta: c.paleta as Cena['paleta'],
    destaques: destaques.slice(0, LIMITES.destaques),
  };
}

export async function chamarIA(pedido: PedidoEscrever | PedidoAnimar, signal?: AbortSignal): Promise<RespostaIA> {
  if (!URL_IA) return { ok: false, erro: 'A IA não está configurada neste site.' };
  let res: Response;
  try {
    res = await fetch(`${URL_IA.replace(/\/$/, '')}/recado`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(pedido),
      signal,
    });
  } catch {
    return { ok: false, erro: 'Não consegui falar com a IA. Verifique sua conexão.' };
  }
  if (res.status === 429) return { ok: false, erro: 'Muitos pedidos seguidos. Espere um minutinho.' };
  let corpo: Record<string, unknown>;
  try {
    corpo = await res.json();
  } catch {
    return { ok: false, erro: 'A IA respondeu algo estranho. Tente de novo.' };
  }
  if (!res.ok || corpo.fallback) {
    return { ok: false, erro: typeof corpo.erro === 'string' ? corpo.erro : 'A IA não conseguiu desta vez.' };
  }
  const cenasBrutas = Array.isArray(corpo.cenas) ? corpo.cenas : [];
  const cenas = cenasBrutas
    .map((c) => {
      const frase = (c as { frase?: unknown })?.frase;
      const cena = validarCena(c);
      return typeof frase === 'string' && cena ? { frase, cena } : null;
    })
    .filter((x): x is { frase: string; cena: CenaSemFrase } => !!x);
  const mensagem = typeof corpo.mensagem === 'string' ? corpo.mensagem.slice(0, LIMITES.msg) : undefined;
  return { ok: true, mensagem, cenas };
}
