import { motion } from 'motion/react';
import { Fragment } from 'react';
import { normalizar, palavras } from '../lib/texto';

export function TextoCinetico({
  frase,
  reveladas,
  destaques,
  nome,
  corDestaque,
}: {
  frase: string;
  reveladas: number;
  destaques: string[];
  nome: string;
  corDestaque: string;
}) {
  const alvo = new Set([...destaques, nome].map(normalizar).filter(Boolean));
  const lista = palavras(frase);

  return (
    <p className="texto-cinetico" aria-label={frase}>
      {lista.map((p, i) => {
        const visivel = i < reveladas;
        const destaque = alvo.has(normalizar(p));
        return (
          <Fragment key={i}>
          <motion.span
            aria-hidden
            className={destaque ? 'palavra destaque' : 'palavra'}
            style={destaque ? { color: corDestaque } : undefined}
            initial={false}
            animate={
              visivel
                ? { opacity: 1, y: 0, scale: destaque ? [1.35, 1] : 1, filter: 'blur(0px)' }
                : { opacity: 0.12, y: 14, scale: 1, filter: 'blur(4px)' }
            }
            transition={{ duration: destaque ? 0.45 : 0.28, ease: 'easeOut' }}
          >
            {p}
          </motion.span>{' '}
          </Fragment>
        );
      })}
    </p>
  );
}
