import { motion, useReducedMotion, type TargetAndTransition, type Transition } from 'motion/react';
import type { CSSProperties } from 'react';
import type { Movimento } from '../lib/tipos';

/** gerador pseudo-aleatório determinístico (mesma cena = mesma coreografia) */
function sorteador(semente: number) {
  let s = (semente * 9301 + 49297) % 233280 || 1;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

interface Particula {
  icone: string;
  estilo: CSSProperties;
  inicial: TargetAndTransition;
  animar: TargetAndTransition;
  transicao: Transition;
  /** ângulo inicial (só no movimento orbitar) */
  fase?: number;
}

const loop = (duracao: number, atraso = 0): Transition => ({
  duration: duracao,
  delay: atraso,
  repeat: Infinity,
  ease: 'easeInOut',
});

function coreografia(icones: string[], mov: Movimento, semente: number): Particula[] {
  const r = sorteador(semente + 1);
  const n = icones.length;
  const ic = (i: number) => icones[i % n];

  switch (mov) {
    case 'chover':
      return Array.from({ length: 16 }, (_, i) => ({
        icone: ic(i),
        estilo: { left: `${4 + r() * 92}%`, top: '-12%', fontSize: `${2.2 + r() * 2.4}rem` },
        inicial: { y: '-10vh', opacity: 0, rotate: r() * 40 - 20 },
        animar: { y: '125vh', opacity: [0, 1, 1, 0.8], rotate: r() * 120 - 60 },
        transicao: { duration: 4.5 + r() * 3, delay: i * 0.25 + r() * 0.3, repeat: Infinity, ease: 'linear' },
      }));

    case 'explodir':
      return Array.from({ length: 12 }, (_, i) => {
        const ang = (i / 12) * Math.PI * 2 + r() * 0.4;
        const raio = 28 + r() * 16;
        return {
          icone: ic(i),
          estilo: { left: '50%', top: '50%', fontSize: `${2 + r() * 1.6}rem` },
          inicial: { x: '-50%', y: '-50%', scale: 0, opacity: 0 },
          animar: {
            x: `calc(-50% + ${Math.cos(ang) * raio}vmin)`,
            y: [`-50%`, `calc(-50% + ${Math.sin(ang) * raio}vmin)`, `calc(-50% + ${Math.sin(ang) * raio + 3}vmin)`],
            scale: [0, 1.3, 1],
            opacity: [0, 1, 0.9],
          },
          transicao: { duration: 1.4, delay: r() * 0.25, ease: 'easeOut' },
        };
      });

    case 'crescer':
      return [
        {
          icone: ic(0),
          estilo: { left: '50%', top: '50%', fontSize: 'min(48vmin, 22rem)', opacity: 0.35 },
          inicial: { x: '-50%', y: '-50%', scale: 0.2, opacity: 0 },
          animar: { scale: [0.2, 1.05, 1], opacity: 0.35, rotate: [0, -4, 4, 0] },
          transicao: { duration: 2.4, ease: 'easeOut' },
        },
        ...icones.slice(1).map((icone, i) => ({
          icone,
          estilo: { left: `${15 + i * 32 + r() * 8}%`, top: `${10 + r() * 15}%`, fontSize: '2.6rem' },
          inicial: { scale: 0, opacity: 0 },
          animar: { scale: [0, 1.2, 1], opacity: 1, y: [0, -10, 0] },
          transicao: { duration: 1.4, delay: 0.5 + i * 0.3 },
        })),
      ];

    case 'orbitar':
      return Array.from({ length: Math.max(n, 4) }, (_, i) => {
        const fase = (i / Math.max(n, 4)) * 360;
        return {
          fase,
          icone: ic(i),
          estilo: { left: '50%', top: '50%', fontSize: '2.8rem', width: 0, height: 0 },
          inicial: { rotate: fase, opacity: 0 },
          animar: { rotate: fase + 360, opacity: 1 },
          transicao: { rotate: { duration: 14, repeat: Infinity, ease: 'linear' }, opacity: { duration: 0.8 } },
        };
      });

    case 'voar':
      return Array.from({ length: Math.max(n * 2, 5) }, (_, i) => {
        const altura = 8 + r() * 70;
        return {
          icone: ic(i),
          estilo: { left: 0, top: `${altura}%`, fontSize: `${2.8 + r() * 1.8}rem` },
          inicial: { x: '-15vw', opacity: 0 },
          animar: { x: '115vw', y: [0, -30 - r() * 30, 10, -20, 0], opacity: [0, 1, 1, 1, 0] },
          transicao: { duration: 6 + r() * 3, delay: i * 0.9 + r() * 0.4, repeat: Infinity, ease: 'linear' },
        };
      });

    case 'pulsar':
      return [
        {
          icone: ic(0),
          estilo: { left: '50%', top: '50%', fontSize: 'min(40vmin, 18rem)', opacity: 0.4 },
          inicial: { x: '-50%', y: '-50%', scale: 0.6, opacity: 0 },
          animar: { scale: [1, 1.18, 1, 1.12, 1], opacity: 0.4 },
          transicao: { scale: loop(1.4), opacity: { duration: 0.6 } },
        },
        ...icones.slice(1).flatMap((icone, i) => [0, 1].map((k) => ({
          icone,
          estilo: { left: `${k ? 78 - i * 6 : 10 + i * 6}%`, top: `${18 + i * 22}%`, fontSize: '2.4rem' },
          inicial: { scale: 0 },
          animar: { scale: [1, 1.25, 1] },
          transicao: loop(1.4, 0.2 * i),
        }))),
      ];

    case 'balancar':
      return Array.from({ length: Math.max(n, 3) }, (_, i) => ({
        icone: ic(i),
        estilo: {
          left: `${12 + (i * 76) / Math.max(n - 1, 2)}%`,
          top: `${12 + (i % 2) * 58}%`,
          fontSize: '3.2rem',
          transformOrigin: '50% 0%',
        },
        inicial: { opacity: 0, y: -30 },
        animar: { opacity: 1, y: 0, rotate: [-14, 14, -14] },
        transicao: { rotate: loop(2.2, i * 0.3), opacity: { duration: 0.6 }, y: { duration: 0.6 } },
      }));

    case 'flutuar':
    default:
      return Array.from({ length: Math.max(n * 2, 6) }, (_, i) => ({
        icone: ic(i),
        estilo: {
          left: `${6 + r() * 84}%`,
          top: `${i % 2 ? 8 + r() * 22 : 66 + r() * 22}%`,
          fontSize: `${2.8 + r() * 2}rem`,
        },
        inicial: { opacity: 0, scale: 0.4 },
        animar: { opacity: [0, 1, 1], scale: 1, y: [0, -22, 0], x: [0, r() * 16 - 8, 0] },
        transicao: { duration: 3.5 + r() * 2, repeat: Infinity, ease: 'easeInOut', delay: r() * 0.8 },
      }));
  }
}

export function IconesAnimados({
  icones,
  movimento,
  semente,
}: {
  icones: string[];
  movimento: Movimento;
  semente: number;
}) {
  const reduzido = useReducedMotion();

  if (reduzido) {
    return (
      <div className="icones icones-estaticos" aria-hidden>
        {icones.map((ic, i) => (
          <motion.span key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.2 }}>
            {ic}
          </motion.span>
        ))}
      </div>
    );
  }

  const particulas = coreografia(icones, movimento, semente);
  return (
    <div className="icones" aria-hidden>
      {particulas.map((p, i) =>
        movimento === 'orbitar' ? (
          // o braço gira; o emoji fica na ponta e é "desgirado" para continuar em pé
          <motion.div key={i} className="particula" style={p.estilo} initial={p.inicial} animate={p.animar} transition={p.transicao}>
            <div className="orbita-braco">
              <motion.span
                className="orbita-ponta"
                initial={{ rotate: -(p.fase ?? 0) }}
                animate={{ rotate: -(p.fase ?? 0) - 360 }}
                transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
              >
                {p.icone}
              </motion.span>
            </div>
          </motion.div>
        ) : (
          <motion.span key={i} className="particula" style={p.estilo} initial={p.inicial} animate={p.animar} transition={p.transicao}>
            {p.icone}
          </motion.span>
        ),
      )}
    </div>
  );
}
