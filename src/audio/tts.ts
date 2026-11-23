import type { Voz } from '../lib/tipos';
import { ordenarVozesPt, palavraParaFala, pontuarVoz } from './vozes';

// Tom (pitch) sempre neutro: mexer no tom é o que mais deixa a voz sintética robótica.
// A personalidade vem só da velocidade.
export const PRESETS_VOZ: Record<Voz, { rate: number; pitch: number; rotulo: string }> = {
  locutor: { rate: 1.0, pitch: 1, rotulo: 'Locutor (ritmo normal)' },
  calma: { rate: 0.92, pitch: 1, rotulo: 'Calma e carinhosa' },
  animada: { rate: 1.08, pitch: 1, rotulo: 'Animada' },
};

const CHAVE_PREFERENCIA = 'telerecados:voz';
/** voz top de linha: não precisa esperar outras chegarem */
const NOTA_EXCELENTE = 155;

export function suportaFala(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
}

let listaCache: Promise<SpeechSynthesisVoice[]> | null = null;

/**
 * Vozes em português, da melhor para a pior. No Chrome as vozes chegam aos poucos
 * (as locais antes das de rede), então espera a lista assentar antes de decidir.
 */
export function vozesPt(): Promise<SpeechSynthesisVoice[]> {
  if (!suportaFala()) return Promise.resolve([]);
  if (listaCache) return listaCache;
  const p = new Promise<SpeechSynthesisVoice[]>((resolve) => {
    let assentar: ReturnType<typeof setTimeout> | undefined;
    const ler = () => ordenarVozesPt(speechSynthesis.getVoices());
    const terminar = () => {
      clearTimeout(assentar);
      clearTimeout(limite);
      speechSynthesis.removeEventListener('voiceschanged', tentar);
      resolve(ler());
    };
    function tentar() {
      const pt = ler();
      if (!pt.length) return;
      if (pontuarVoz(pt[0]) >= NOTA_EXCELENTE) return terminar();
      clearTimeout(assentar);
      assentar = setTimeout(terminar, 1200);
    }
    const limite = setTimeout(terminar, 3500);
    speechSynthesis.addEventListener('voiceschanged', tentar);
    tentar();
  });
  listaCache = p;
  // lista vazia não fica em cache: no iOS as vozes podem aparecer depois
  void p.then((l) => {
    if (!l.length && listaCache === p) listaCache = null;
  });
  return p;
}

function lerPreferencia(): string | null {
  try {
    return localStorage.getItem(CHAVE_PREFERENCIA);
  } catch {
    return null;
  }
}

/** Salva a voz escolhida por quem está ouvindo (null = automática). */
export function definirVozPreferida(nome: string | null): void {
  try {
    if (nome) localStorage.setItem(CHAVE_PREFERENCIA, nome);
    else localStorage.removeItem(CHAVE_PREFERENCIA);
  } catch {
    /* modo privado: tudo bem, só não lembra */
  }
}

export function vozPreferida(): string | null {
  return lerPreferencia();
}

/** A voz que será usada: a escolhida pela pessoa, ou a melhor disponível. */
export async function carregarVoz(): Promise<SpeechSynthesisVoice | null> {
  const lista = await vozesPt();
  const pref = lerPreferencia();
  return lista.find((v) => v.name === pref) ?? lista[0] ?? null;
}

function msPorPalavra(palavra: string, rate: number): number {
  return ((palavra.length + 1) * 62) / rate + 40;
}

export interface OpcoesFala {
  voz: Voz;
  /** chamado com a quantidade de palavras já ditas (1..n) */
  onPalavra?: (quantas: number) => void;
  signal?: AbortSignal;
  /** força leitura silenciosa (só legenda no ritmo da fala) */
  silencioso?: boolean;
}

// Referência global: o Chrome às vezes coleta o utterance e nunca dispara onend.
let utteranceAtual: SpeechSynthesisUtterance | null = null;

/** Lê o texto em voz alta (ou em silêncio, no mesmo ritmo), revelando as palavras. */
export async function falar(texto: string, opcoes: OpcoesFala): Promise<void> {
  const { voz, onPalavra, signal } = opcoes;
  const preset = PRESETS_VOZ[voz];
  const palavrasTxt = texto.split(/\s+/).filter(Boolean);
  const total = palavrasTxt.length;
  const estimativa = palavrasTxt.reduce((s, p) => s + msPorPalavra(p, preset.rate), 0);

  // Texto que vai para a voz (sem emojis) + mapa palavra falada → palavra exibida
  const inicios: number[] = [];
  const mapa: number[] = [];
  const faladas: string[] = [];
  let pos = 0;
  palavrasTxt.forEach((p, i) => {
    const f = palavraParaFala(p);
    if (!f) return;
    inicios.push(pos);
    mapa.push(i);
    faladas.push(f);
    pos += f.length + 1;
  });
  const textoFalado = faladas.join(' ');

  const vozPt = opcoes.silencioso || !textoFalado ? null : await carregarVoz();

  return new Promise<void>((resolve) => {
    if (signal?.aborted) return resolve();
    let terminou = false;
    let reveladas = 0;
    let timerEstimado: ReturnType<typeof setTimeout> | undefined;
    let timerSeguranca: ReturnType<typeof setTimeout> | undefined;
    let timerSemBoundary: ReturnType<typeof setTimeout> | undefined;
    let recebeuBoundary = false;

    const revelar = (n: number) => {
      if (n > reveladas) {
        reveladas = Math.min(n, total);
        onPalavra?.(reveladas);
      }
    };

    const fim = () => {
      if (terminou) return;
      terminou = true;
      clearTimeout(timerEstimado);
      clearTimeout(timerSeguranca);
      clearTimeout(timerSemBoundary);
      signal?.removeEventListener('abort', abortar);
      revelar(total);
      resolve();
    };

    const abortar = () => {
      if (vozPt) speechSynthesis.cancel();
      fim();
    };
    signal?.addEventListener('abort', abortar);

    // revela palavra por palavra no ritmo estimado (sem voz, ou voz sem eventos boundary
    // — a voz Google do Chrome, por exemplo, não emite boundary)
    const revelarPorEstimativa = (aoAcabar?: () => void) => {
      const passo = (i: number) => {
        if (terminou || recebeuBoundary) return;
        revelar(i + 1);
        if (i + 1 >= total) {
          aoAcabar?.();
          return;
        }
        timerEstimado = setTimeout(() => passo(i + 1), msPorPalavra(palavrasTxt[i + 1], preset.rate));
      };
      passo(reveladas);
    };

    if (!vozPt) {
      revelarPorEstimativa(() => {
        timerEstimado = setTimeout(fim, 450);
      });
      return;
    }

    const u = new SpeechSynthesisUtterance(textoFalado);
    utteranceAtual = u;
    u.voice = vozPt;
    u.lang = vozPt.lang;
    u.rate = preset.rate;
    u.pitch = preset.pitch;
    u.onstart = () => {
      timerSemBoundary = setTimeout(() => {
        if (!recebeuBoundary) revelarPorEstimativa();
      }, 600);
    };
    u.onboundary = (e) => {
      if (e.name && e.name !== 'word') return;
      recebeuBoundary = true;
      clearTimeout(timerEstimado);
      let n = 0;
      while (n < inicios.length && inicios[n] <= e.charIndex) n++;
      if (n > 0) revelar(mapa[n - 1] + 1);
    };
    u.onend = fim;
    u.onerror = fim;
    timerSeguranca = setTimeout(() => {
      speechSynthesis.cancel();
      fim();
    }, estimativa * 2.2 + 4000);
    speechSynthesis.speak(u);
    void utteranceAtual;
  });
}

/** Amostra curta para a pessoa comparar vozes. */
export function tocarAmostra(nome: string): void {
  if (!suportaFala()) return;
  void vozesPt().then((lista) => {
    const v = lista.find((x) => x.name === nome);
    if (!v) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance('Alô, alô! Esta é a voz do seu recado.');
    u.voice = v;
    u.lang = v.lang;
    utteranceAtual = u;
    speechSynthesis.speak(u);
  });
}

export function pararFala(): void {
  if (suportaFala()) speechSynthesis.cancel();
}
