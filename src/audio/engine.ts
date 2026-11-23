import type * as ToneNS from 'tone';

// Tone.js é pesado: só carrega quando a pessoa clica em ouvir.
let Tone: typeof ToneNS;
import type { Trilha } from '../lib/tipos';
import { MUSICAS, type Nota } from './musicas';

const VOL_NORMAL = -8;
const VOL_FALA = -22;

interface Instrumentos {
  musica: ToneNS.Volume;
  piano: ToneNS.PolySynth;
  caixinha: ToneNS.PolySynth;
  pad: ToneNS.PolySynth;
  baixo: ToneNS.PolySynth;
  sino: ToneNS.PolySynth<ToneNS.FMSynth>;
  efeitos: ToneNS.Volume;
}

let inst: Instrumentos | null = null;
let partes: ToneNS.Part[] = [];

function criar(): Instrumentos {
  const reverb = new Tone.Reverb({ decay: 3.5, wet: 0.28 }).toDestination();
  const musica = new Tone.Volume(VOL_NORMAL).connect(reverb);
  const efeitos = new Tone.Volume(-10).connect(reverb);

  const piano = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.005, decay: 0.5, sustain: 0.12, release: 1.2 },
  }).connect(musica);
  piano.volume.value = -6;

  const caixinha = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'sine' },
    envelope: { attack: 0.002, decay: 0.8, sustain: 0, release: 0.8 },
  }).connect(musica);
  caixinha.volume.value = -4;

  const filtroPad = new Tone.Filter(900, 'lowpass').connect(musica);
  const pad = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'fatsawtooth', count: 3, spread: 20 },
    envelope: { attack: 0.8, decay: 0.5, sustain: 0.7, release: 2 },
  }).connect(filtroPad);
  pad.volume.value = -24;

  const baixo = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'sine' },
    envelope: { attack: 0.01, decay: 0.3, sustain: 0.5, release: 0.6 },
  }).connect(musica);
  baixo.volume.value = -8;

  const sino = new Tone.PolySynth(Tone.FMSynth, {
    harmonicity: 3.01,
    modulationIndex: 12,
    envelope: { attack: 0.001, decay: 1.2, sustain: 0, release: 1.2 },
    modulationEnvelope: { attack: 0.001, decay: 0.4, sustain: 0, release: 0.4 },
  }).connect(efeitos);

  return { musica, piano, caixinha, pad, baixo, sino, efeitos };
}

/** Precisa ser chamado dentro de um gesto do usuário (clique). */
export async function iniciarAudio(): Promise<void> {
  Tone ??= await import('tone');
  await Tone.start();
  if (!inst) inst = criar();
}

const espera = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/** "Alô, alô": três toques de sino + uma microfonia curtinha. ~1,6 s */
export async function tocarVinheta(): Promise<void> {
  if (!inst) return;
  const agora = Tone.now() + 0.05;
  const microfonia = new Tone.Oscillator(1900, 'sine').connect(inst.efeitos);
  microfonia.volume.value = -40;
  microfonia.start(agora);
  microfonia.frequency.exponentialRampTo(2700, 0.5, agora);
  microfonia.volume.rampTo(-24, 0.25, agora);
  microfonia.volume.rampTo(-80, 0.25, agora + 0.35);
  microfonia.stop(agora + 0.65);
  setTimeout(() => microfonia.dispose(), 1500);

  inst.sino.triggerAttackRelease('G5', 0.6, agora + 0.7, 0.6);
  inst.sino.triggerAttackRelease('E5', 0.6, agora + 1.0, 0.6);
  inst.sino.triggerAttackRelease('C6', 1.0, agora + 1.3, 0.7);
  await espera(1700);
}

function criarParte(notas: Nota[], synth: ToneNS.PolySynth, bpm: number, loop: number): ToneNS.Part {
  const seg = 60 / bpm;
  const parte = new Tone.Part<{ time: number; nota: string | string[]; dur: number; vel: number }>(
    (tempo, ev) => synth.triggerAttackRelease(ev.nota, ev.dur, tempo, ev.vel),
    notas.map(([b, nota, d, vel]) => ({ time: b * seg, nota, dur: d * seg * 0.95, vel: vel ?? 0.7 })),
  );
  parte.loop = true;
  parte.loopEnd = loop * seg;
  return parte;
}

export function iniciarTrilha(trilha: Trilha): void {
  if (!inst || trilha === 'nenhuma') return;
  pararTrilha(0);
  const m = MUSICAS[trilha];
  const melodia = m.timbreMelodia === 'caixinha' ? inst.caixinha : inst.piano;
  partes = [
    criarParte(m.melodia, melodia, m.bpm, m.loop),
    criarParte(m.acordes, trilha === 'suave' || trilha === 'nostalgia' ? inst.pad : inst.piano, m.bpm, m.loop),
    criarParte(m.baixo, inst.baixo, m.bpm, m.loop),
  ];
  inst.musica.volume.cancelScheduledValues(Tone.now());
  inst.musica.volume.value = -40;
  inst.musica.volume.rampTo(VOL_NORMAL, 1.5);
  const transporte = Tone.getTransport();
  transporte.stop();
  transporte.position = 0;
  partes.forEach((p) => p.start(0));
  transporte.start('+0.05');
}

/** abaixa a música enquanto o locutor fala */
export function abaixarTrilha(): void {
  inst?.musica.volume.rampTo(VOL_FALA, 0.35);
}

export function subirTrilha(): void {
  inst?.musica.volume.rampTo(VOL_NORMAL, 0.8);
}

export function pararTrilha(fadeSeg = 2): void {
  if (!inst) return;
  const antigas = partes;
  partes = [];
  const parar = () => {
    antigas.forEach((p) => p.dispose());
    if (!partes.length) Tone.getTransport().stop();
  };
  if (fadeSeg <= 0) {
    parar();
    return;
  }
  inst.musica.volume.rampTo(-60, fadeSeg);
  setTimeout(parar, fadeSeg * 1000 + 50);
}
