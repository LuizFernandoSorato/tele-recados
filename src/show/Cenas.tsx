import confetti from 'canvas-confetti';
import { motion } from 'motion/react';
import { useEffect } from 'react';
import type { Cena, Ocasiao, Recado } from '../lib/tipos';
import { IconesAnimados } from './IconesAnimados';
import { PALETA, gradiente } from './paletas';
import { TextoCinetico } from './TextoCinetico';

export function Vinheta({ fala, reveladas }: { fala: string; reveladas: number }) {
  return (
    <motion.div
      className="palco vinheta"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.6 }}
    >
      <div className="megafone-wrap" aria-hidden>
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="onda"
            initial={{ scale: 0.4, opacity: 0.7 }}
            animate={{ scale: 2.6, opacity: 0 }}
            transition={{ duration: 1.8, delay: i * 0.6, repeat: Infinity, ease: 'easeOut' }}
          />
        ))}
        <motion.span
          className="megafone"
          animate={{ rotate: [-8, 6, -8], scale: [1, 1.08, 1] }}
          transition={{ duration: 0.9, repeat: Infinity }}
        >
          📢
        </motion.span>
      </div>
      <TextoCinetico frase={fala} reveladas={reveladas} destaques={[]} nome="" corDestaque="#ffd86b" />
    </motion.div>
  );
}

export function CenaView({ cena, indice, reveladas, nome }: { cena: Cena; indice: number; reveladas: number; nome: string }) {
  const estilo = PALETA[cena.paleta];
  return (
    <motion.div
      className="palco cena"
      style={{ background: gradiente(cena.paleta) }}
      initial={{ opacity: 0, scale: 1.04 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.7, ease: 'easeInOut' }}
    >
      <div className="brilho" aria-hidden />
      <IconesAnimados icones={cena.icones} movimento={cena.movimento} semente={indice * 7 + cena.frase.length} />
      <TextoCinetico
        frase={cena.frase}
        reveladas={reveladas}
        destaques={cena.destaques}
        nome={nome}
        corDestaque={estilo.destaque}
      />
    </motion.div>
  );
}

const TITULO: Record<Ocasiao, (n: string) => string> = {
  aniversario: (n) => `Feliz aniversário, ${n}!`,
  maes: (n) => `Feliz Dia das Mães, ${n}!`,
  pais: (n) => `Feliz Dia dos Pais, ${n}!`,
  namoro: (n) => `Pra você, ${n} ❤️`,
  formatura: (n) => `Parabéns pela formatura, ${n}!`,
  agradecimento: (n) => `Obrigado, ${n}!`,
  saudade: (n) => `Saudade de você, ${n}`,
  outro: (n) => `Com carinho, pra ${n}`,
};
const FESTIVAS: Ocasiao[] = ['aniversario', 'formatura', 'namoro', 'maes', 'pais'];

export function Final({
  recado,
  compacto,
  aoRepetir,
  aoResponder,
}: {
  recado: Recado;
  compacto?: boolean;
  aoRepetir: () => void;
  aoResponder?: () => void;
}) {
  const paleta = recado.cenas.at(-1)?.paleta ?? 'festa';

  useEffect(() => {
    if (!FESTIVAS.includes(recado.ocasiao) || compacto) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const fim = Date.now() + 1800;
    const cores = [PALETA[paleta].destaque, '#ffffff', ...PALETA[paleta].fundo];
    const quadro = () => {
      confetti({ particleCount: 4, angle: 60, spread: 60, origin: { x: 0, y: 0.7 }, colors: cores });
      confetti({ particleCount: 4, angle: 120, spread: 60, origin: { x: 1, y: 0.7 }, colors: cores });
      if (Date.now() < fim) requestAnimationFrame(quadro);
    };
    quadro();
  }, [recado.ocasiao, paleta, compacto]);

  return (
    <motion.div
      className="palco final"
      style={{ background: gradiente(paleta) }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <motion.h1
        className="titulo-final"
        initial={{ opacity: 0, y: 30, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.9, ease: 'easeOut', delay: 0.2 }}
      >
        {TITULO[recado.ocasiao](recado.para)}
      </motion.h1>
      <motion.p className="assinatura" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}>
        — com carinho, {recado.de}
      </motion.p>
      <motion.div className="acoes-final" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }}>
        <button className="btn btn-claro" onClick={aoRepetir}>
          ↺ Ver de novo
        </button>
        {aoResponder && (
          <button className="btn btn-claro" onClick={aoResponder}>
            📢 Responder com um TeleRecado
          </button>
        )}
      </motion.div>
    </motion.div>
  );
}

