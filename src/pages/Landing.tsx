import { motion } from 'motion/react';
import { irPara } from '../App';
import { codificar } from '../lib/payload';
import { storyboardLocal } from '../lib/storyboard';
import type { Recado } from '../lib/tipos';

const msgExemplo =
  'Feliz aniversário, Ana! Lembra daquela viagem pra praia em que perdemos o ônibus? Até hoje eu rio disso. Que esse ano venha cheio de bolo, música e abraço apertado. Te amo, amiga!';
const exemplo: Recado = {
  para: 'Ana',
  de: 'Bia',
  ocasiao: 'aniversario',
  msg: msgExemplo,
  trilha: 'festa',
  voz: 'animada',
  cenas: storyboardLocal(msgExemplo, 'aniversario', 'Ana'),
};

const passos = [
  { icone: '✍️', titulo: 'Escreva', texto: 'Escreva o recado do seu jeito, use um modelo pronto ou peça ajuda à IA.' },
  { icone: '🎬', titulo: 'Veja a animação', texto: 'Cada frase vira uma cena animada que ilustra o que você escreveu.' },
  { icone: '📲', titulo: 'Mande o link', texto: 'A pessoa abre o link, aumenta o volume e ouve o recado anunciado.' },
];

export function Landing() {
  return (
    <main className="pagina landing">
      <section className="hero">
        <motion.div
          className="megafone hero-megafone"
          aria-hidden
          animate={{ rotate: [-8, 6, -8] }}
          transition={{ duration: 1.6, repeat: Infinity }}
        >
          📢
        </motion.div>
        <h1>TeleRecados</h1>
        <p className="lead">
          Lembra do carro de som que parava na porta para anunciar um recado? Agora ele chega por link: com locutor,
          trilha sonora e uma animação feita a partir das suas palavras.
        </p>
        <div className="acoes">
          <button className="btn btn-principal" onClick={() => irPara('/criar')}>
            Criar meu recado
          </button>
          <button className="btn btn-secundario" onClick={() => irPara(`/r/${codificar(exemplo)}`)}>
            ▶ Ver um exemplo
          </button>
        </div>
      </section>

      <section className="passos">
        {passos.map((p, i) => (
          <motion.div
            key={p.titulo}
            className="passo"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.12 }}
          >
            <span className="passo-icone" aria-hidden>
              {p.icone}
            </span>
            <h2>{p.titulo}</h2>
            <p>{p.texto}</p>
          </motion.div>
        ))}
      </section>

      <footer className="rodape">TeleRecados: o recado que a rua inteira ouviria 📢</footer>
    </main>
  );
}
