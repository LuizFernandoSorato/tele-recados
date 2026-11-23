import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import * as audio from '../audio/engine';
import { carregarVoz, definirVozPreferida, falar, pararFala, suportaFala, tocarAmostra, vozesPt } from '../audio/tts';
import { ehVozRobotica, rotuloVoz } from '../audio/vozes';
import type { Recado } from '../lib/tipos';
import { CenaView, Final, Vinheta } from './Cenas';
import { executarShow, textoVinheta, type DepsShow, type Fase } from './Director';

type Estado = { tipo: 'portao' } | Fase;

const esperar = (ms: number, signal: AbortSignal) =>
  new Promise<void>((resolve) => {
    const t = setTimeout(resolve, ms);
    signal.addEventListener('abort', () => {
      clearTimeout(t);
      resolve();
    });
  });

export function Show({
  recado,
  compacto = false,
  aoResponder,
}: {
  recado: Recado;
  compacto?: boolean;
  aoResponder?: () => void;
}) {
  const [estado, setEstado] = useState<Estado>({ tipo: 'portao' });
  const [vozes, setVozes] = useState<SpeechSynthesisVoice[] | null>(null);
  const [vozEscolhida, setVozEscolhida] = useState<SpeechSynthesisVoice | null>(null);
  const ctrl = useRef<AbortController | null>(null);

  useEffect(() => {
    // pré-carrega as vozes (no Chrome elas chegam de forma assíncrona)
    void vozesPt().then(setVozes);
    void carregarVoz().then(setVozEscolhida);
  }, []);

  const parar = useCallback(() => {
    ctrl.current?.abort();
    pararFala();
    audio.pararTrilha(0.4);
  }, []);

  // se o recado mudar (prévia no criador) ou o componente sair, para tudo
  useEffect(() => {
    parar();
    setEstado({ tipo: 'portao' });
  }, [recado, parar]);
  useEffect(() => parar, [parar]);

  const iniciar = async (silencioso: boolean) => {
    parar();
    const c = new AbortController();
    ctrl.current = c;
    if (!silencioso) {
      try {
        await audio.iniciarAudio();
      } catch {
        /* sem áudio: segue só com legenda */
      }
      if (suportaFala()) speechSynthesis.cancel();
    }
    const comSom = !silencioso;
    const deps: DepsShow = {
      falar: (texto, onPalavra, signal) => falar(texto, { voz: recado.voz, onPalavra, signal, silencioso }),
      esperar,
      aoMudar: (f) => !c.signal.aborted && setEstado(f),
      audio: {
        vinheta: () => (comSom ? audio.tocarVinheta() : esperar(800, c.signal)),
        iniciarTrilha: () => comSom && audio.iniciarTrilha(recado.trilha),
        abaixar: () => comSom && audio.abaixarTrilha(),
        subir: () => comSom && audio.subirTrilha(),
        parar: () => comSom && audio.pararTrilha(3),
      },
    };
    await executarShow(recado, deps, c.signal);
  };

  const pular = () => {
    parar();
    setEstado({ tipo: 'final' });
  };

  return (
    <div className={compacto ? 'show show-compacto' : 'show'}>
      <AnimatePresence mode="wait">
        {estado.tipo === 'portao' && (
          <motion.div
            key="portao"
            className="palco portao"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="cartao-portao"
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              <motion.div
                className="megafone pequeno"
                aria-hidden
                animate={{ rotate: [-6, 6, -6] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              >
                📢
              </motion.div>
              <p className="sobretitulo">TeleRecados</p>
              <h1>
                {recado.para}, você recebeu um recado de <strong>{recado.de}</strong>
              </h1>
              <p className="dica">🔊 Aumente o volume</p>
              <button className="btn btn-principal" onClick={() => void iniciar(false)} autoFocus={!compacto}>
                ▶ Ouvir recado
              </button>
              <button className="btn btn-link" onClick={() => void iniciar(true)}>
                Ver sem som (só legendas)
              </button>
              {vozes && vozes.length === 0 && (
                <p className="aviso">
                  Este aparelho não tem voz em português, então o recado vai aparecer com música e legendas.
                </p>
              )}
              {vozes && vozes.length > 1 && vozEscolhida && (
                <div className="seletor-voz">
                  <label>
                    Voz
                    <select
                      value={vozEscolhida.name}
                      onChange={(e) => {
                        const v = vozes.find((x) => x.name === e.target.value) ?? null;
                        definirVozPreferida(v && v !== vozes[0] ? v.name : null);
                        setVozEscolhida(v);
                        if (v) tocarAmostra(v.name);
                      }}
                    >
                      {vozes.map((v) => (
                        <option key={v.name} value={v.name}>
                          {rotuloVoz(v)}
                          {ehVozRobotica(v) ? ' (robótica)' : ''}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button className="btn btn-link" onClick={() => tocarAmostra(vozEscolhida.name)}>
                    🔈 ouvir amostra
                  </button>
                </div>
              )}
              {vozes && vozes.length > 0 && vozes.every(ehVozRobotica) && (
                <p className="aviso">
                  As vozes deste navegador são bem robóticas. Para ouvir uma voz mais natural, abra o link no
                  Microsoft Edge ou no celular.
                </p>
              )}
            </motion.div>
          </motion.div>
        )}

        {estado.tipo === 'vinheta' && (
          <Vinheta key="vinheta" fala={textoVinheta(recado)} reveladas={estado.falaRevelada} />
        )}

        {estado.tipo === 'cena' && (
          <CenaView
            key={`cena-${estado.indice}`}
            cena={recado.cenas[estado.indice]}
            indice={estado.indice}
            reveladas={estado.reveladas}
            nome={recado.para}
          />
        )}

        {estado.tipo === 'final' && (
          <Final
            key="final"
            recado={recado}
            compacto={compacto}
            aoRepetir={() => void iniciar(false)}
            aoResponder={aoResponder}
          />
        )}
      </AnimatePresence>

      {(estado.tipo === 'vinheta' || estado.tipo === 'cena') && (
        <div className="controles">
          {estado.tipo === 'cena' && (
            <div className="progresso" aria-label={`Cena ${estado.indice + 1} de ${recado.cenas.length}`}>
              {recado.cenas.map((_, i) => (
                <span key={i} className={i <= estado.indice ? 'ponto ativo' : 'ponto'} />
              ))}
            </div>
          )}
          <button className="btn btn-fantasma" onClick={pular}>
            Pular ⏭
          </button>
        </div>
      )}
    </div>
  );
}
