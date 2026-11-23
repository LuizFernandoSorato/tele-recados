import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';
import { z } from 'zod';
import { dividirFrases } from './texto';
import { cenaLocal } from './storyboard';
import {
  LIMITES,
  MOVIMENTOS,
  OCASIOES,
  PALETAS,
  TRILHAS,
  VOZES,
  ehEmoji,
  type Cena,
  type Recado,
} from './tipos';

/**
 * Formato compacto que vai no link (v1). A frase de cada cena NÃO vai no link:
 * é recalculada a partir de `m` com dividirFrases().
 * c[i] = [icones, índice do movimento, índice da paleta, destaques]
 */
const texto = (max: number) => z.string().trim().max(max * 4).transform((s) => s.slice(0, max));

const CenaCompacta = z.tuple([
  z.array(z.string()).max(8),
  z.number().int(),
  z.number().int(),
  z.array(z.string()).max(12),
]);

const PayloadV1 = z.object({
  v: z.literal(1),
  p: texto(LIMITES.nome).pipe(z.string().min(1)),
  d: texto(LIMITES.nome).pipe(z.string().min(1)),
  o: z.enum(OCASIOES),
  m: texto(LIMITES.msg).pipe(z.string().min(1)),
  t: z.enum(TRILHAS).catch('suave'),
  z: z.enum(VOZES).catch('locutor'),
  c: z.array(CenaCompacta).max(LIMITES.cenas * 2).catch([]),
});
type PayloadV1 = z.infer<typeof PayloadV1>;

export function codificar(r: Recado): string {
  const p: PayloadV1 = {
    v: 1,
    p: r.para,
    d: r.de,
    o: r.ocasiao,
    m: r.msg,
    t: r.trilha,
    z: r.voz,
    c: r.cenas.map((c) => [
      c.icones,
      MOVIMENTOS.indexOf(c.movimento),
      PALETAS.indexOf(c.paleta),
      c.destaques,
    ]),
  };
  return compressToEncodedURIComponent(JSON.stringify(p));
}

function sanitizarCena(
  bruta: z.infer<typeof CenaCompacta> | undefined,
  frase: string,
  indice: number,
  r: Pick<Recado, 'ocasiao' | 'para'>,
): Cena {
  const local = cenaLocal(frase, indice, r.ocasiao, r.para);
  if (!bruta) return local;
  const [icones, mov, pal, destaques] = bruta;
  const iconesOk = icones.filter(ehEmoji).slice(0, LIMITES.icones);
  return {
    frase,
    icones: iconesOk.length ? iconesOk : local.icones,
    movimento: MOVIMENTOS[mov] ?? local.movimento,
    paleta: PALETAS[pal] ?? local.paleta,
    destaques: destaques
      .map((d) => d.slice(0, LIMITES.destaque))
      .filter(Boolean)
      .slice(0, LIMITES.destaques),
  };
}

/** Decodifica e valida o link. Retorna null se o recado for inválido. */
export function decodificar(codigo: string): Recado | null {
  if (!codigo || codigo.length > 20_000) return null;
  let json: unknown;
  try {
    const bruto = decompressFromEncodedURIComponent(codigo);
    if (!bruto) return null;
    json = JSON.parse(bruto);
  } catch {
    return null;
  }
  const res = PayloadV1.safeParse(json);
  if (!res.success) return null;
  const p = res.data;
  const base = { para: p.p, de: p.d, ocasiao: p.o, msg: p.m, trilha: p.t, voz: p.z };
  const cenas = dividirFrases(p.m).map((frase, i) => sanitizarCena(p.c[i], frase, i, base));
  return { ...base, cenas };
}

export function urlDoRecado(r: Recado, origem = `${location.origin}${import.meta.env.BASE_URL}`): string {
  return `${origem}#/r/${codificar(r)}`;
}
