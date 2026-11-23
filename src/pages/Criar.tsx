import { useMemo, useState } from 'react';
import { irPara } from '../App';
import { PRESETS_VOZ } from '../audio/tts';
import { ROTULO_TRILHA } from '../audio/musicas';
import { TEMPLATES, aplicarTemplate } from '../content/templates';
import { chamarIA, URL_IA, type CenaSemFrase } from '../lib/api';
import { urlDoRecado } from '../lib/payload';
import { associarCenas, mesclarCenas } from '../lib/storyboard';
import { dividirFrases } from '../lib/texto';
import {
  LIMITES,
  MOVIMENTOS,
  OCASIOES,
  PALETAS,
  ROTULO_OCASIAO,
  TONS,
  TRILHAS,
  VOZES,
  ehEmoji,
  type Cena,
  type Ocasiao,
  type Recado,
  type Tom,
  type Trilha,
  type Voz,
} from '../lib/tipos';
import { PALETA, gradiente } from '../show/paletas';
import { Show } from '../show/Show';

const ROTULO_MOV: Record<Cena['movimento'], string> = {
  flutuar: 'Flutuar',
  chover: 'Chover',
  explodir: 'Explodir',
  crescer: 'Crescer',
  orbitar: 'Orbitar',
  voar: 'Voar',
  pulsar: 'Pulsar',
  balancar: 'Balançar',
};

function separarEmojis(s: string): string[] {
  const seg = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
  return [...seg.segment(s)].map((x) => x.segment).filter(ehEmoji).slice(0, LIMITES.icones);
}

export function Criar({ params }: { params: URLSearchParams }) {
  const [para, setPara] = useState(params.get('para')?.slice(0, LIMITES.nome) ?? '');
  const [de, setDe] = useState(params.get('de')?.slice(0, LIMITES.nome) ?? '');
  const [ocasiao, setOcasiao] = useState<Ocasiao>('aniversario');
  const [msg, setMsg] = useState('');
  const [trilha, setTrilha] = useState<Trilha>('festa');
  const [voz, setVoz] = useState<Voz>('locutor');
  const [definidas, setDefinidas] = useState(() => new Map<string, CenaSemFrase>());

  const [iaAberta, setIaAberta] = useState(false);
  const [relacao, setRelacao] = useState('');
  const [lembrancas, setLembrancas] = useState(['', '', '']);
  const [tom, setTom] = useState<Tom>('carinhoso');
  const [carregando, setCarregando] = useState<'escrever' | 'animar' | null>(null);
  const [erroIA, setErroIA] = useState('');

  const [link, setLink] = useState('');
  const [copiado, setCopiado] = useState(false);

  const cenas = useMemo(() => mesclarCenas(msg, ocasiao, para, definidas), [msg, ocasiao, para, definidas]);
  const valido = para.trim() && de.trim() && msg.trim();
  const recado: Recado | null = useMemo(
    () => (valido ? { para: para.trim(), de: de.trim(), ocasiao, msg: msg.trim(), trilha, voz, cenas } : null),
    [valido, para, de, ocasiao, msg, trilha, voz, cenas],
  );

  const editarCena = (frase: string, atual: Cena, mudanca: Partial<CenaSemFrase>) => {
    const { frase: _f, ...base } = atual;
    void _f;
    setDefinidas((m) => new Map(m).set(frase, { ...base, ...mudanca }));
    setLink('');
  };

  const mudar =
    <T,>(set: (v: T) => void) =>
    (v: T) => {
      set(v);
      setLink('');
    };

  const escreverComIA = async () => {
    setErroIA('');
    setCarregando('escrever');
    const r = await chamarIA({
      acao: 'escrever',
      para: para.trim() || 'a pessoa homenageada',
      de: de.trim() || 'alguém especial',
      ocasiao,
      relacao: relacao.trim().slice(0, 60),
      lembrancas: lembrancas.map((l) => l.trim().slice(0, 120)).filter(Boolean),
      tom,
    });
    setCarregando(null);
    if (!r.ok || !r.mensagem) {
      setErroIA(r.ok ? 'A IA não devolveu um texto. Tente de novo.' : r.erro);
      return;
    }
    setMsg(r.mensagem);
    setDefinidas(associarCenas(r.mensagem, r.cenas));
    setLink('');
  };

  const animarComIA = async () => {
    setErroIA('');
    setCarregando('animar');
    const r = await chamarIA({ acao: 'animar', ocasiao, para: para.trim(), frases: dividirFrases(msg) });
    setCarregando(null);
    if (!r.ok) {
      setErroIA(r.erro);
      return;
    }
    setDefinidas(associarCenas(msg, r.cenas));
    setLink('');
  };

  const gerarLink = () => {
    if (!recado) return;
    setLink(urlDoRecado(recado));
    setCopiado(false);
  };

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopiado(true);
    } catch {
      setCopiado(false);
    }
  };

  const textoWhats = `📢 ${para.trim()}, você recebeu um TeleRecado de ${de.trim()}! Aumente o volume e abra: ${link}`;

  return (
    <main className="pagina criar">
      <header className="topo">
        <button className="btn btn-link" onClick={() => irPara('/')}>
          ← TeleRecados
        </button>
        <h1>Criar recado</h1>
      </header>

      <section className="bloco">
        <h2>
          <span className="num">1</span> Pra quem?
        </h2>
        <div className="grade-2">
          <label>
            Nome de quem vai receber
            <input value={para} maxLength={LIMITES.nome} onChange={(e) => mudar(setPara)(e.target.value)} placeholder="Ex.: Ana" />
          </label>
          <label>
            Seu nome (quem manda)
            <input value={de} maxLength={LIMITES.nome} onChange={(e) => mudar(setDe)(e.target.value)} placeholder="Ex.: Bia" />
          </label>
        </div>
        <div className="chips" role="radiogroup" aria-label="Ocasião">
          {OCASIOES.map((o) => (
            <button
              key={o}
              role="radio"
              aria-checked={ocasiao === o}
              className={ocasiao === o ? 'chip ativo' : 'chip'}
              onClick={() => mudar(setOcasiao)(o)}
            >
              {ROTULO_OCASIAO[o]}
            </button>
          ))}
        </div>
      </section>

      <section className="bloco">
        <h2>
          <span className="num">2</span> Mensagem
        </h2>
        <div className="modelos">
          <span>Modelos:</span>
          {TEMPLATES[ocasiao].map((t, i) => (
            <button key={i} className="chip" onClick={() => mudar(setMsg)(aplicarTemplate(t, para.trim()))}>
              Modelo {i + 1}
            </button>
          ))}
        </div>
        <label className="sr-only" htmlFor="msg">
          Mensagem
        </label>
        <textarea
          id="msg"
          value={msg}
          maxLength={LIMITES.msg}
          rows={6}
          onChange={(e) => mudar(setMsg)(e.target.value)}
          placeholder="Escreva aqui. Cada frase vai virar uma cena animada."
        />
        <div className="contador">
          {msg.length}/{LIMITES.msg} · {cenas.length} {cenas.length === 1 ? 'cena' : 'cenas'}
        </div>

        <div className="ia">
          <div className="ia-botoes">
            <button
              className="btn btn-secundario"
              disabled={!URL_IA || !!carregando}
              onClick={() => setIaAberta((v) => !v)}
              title={URL_IA ? undefined : 'IA não configurada (defina VITE_IA_URL)'}
            >
              ✨ Escrever com IA
            </button>
            <button
              className="btn btn-secundario"
              disabled={!URL_IA || !msg.trim() || !!carregando}
              onClick={() => void animarComIA()}
              title={URL_IA ? 'A IA escolhe ícones, movimentos e cores para cada frase' : 'IA não configurada'}
            >
              {carregando === 'animar' ? 'Animando…' : '✨ Animar com IA'}
            </button>
          </div>
          {iaAberta && URL_IA && (
            <div className="ia-painel">
              <label>
                Qual a relação de vocês?
                <input value={relacao} maxLength={60} onChange={(e) => setRelacao(e.target.value)} placeholder="Ex.: melhor amiga desde a escola" />
              </label>
              <span className="rotulo">Lembranças ou detalhes (opcional)</span>
              {lembrancas.map((l, i) => (
                <input
                  key={i}
                  value={l}
                  maxLength={120}
                  aria-label={`Lembrança ${i + 1}`}
                  onChange={(e) => setLembrancas((ls) => ls.map((x, j) => (j === i ? e.target.value : x)))}
                  placeholder={['Ex.: perdemos o ônibus na viagem pra praia', 'Ex.: ama café e pão de queijo', 'Ex.: começou a correr maratonas'][i]}
                />
              ))}
              <div className="chips" role="radiogroup" aria-label="Tom">
                {TONS.map((t) => (
                  <button key={t} role="radio" aria-checked={tom === t} className={tom === t ? 'chip ativo' : 'chip'} onClick={() => setTom(t)}>
                    {t[0].toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
              <button className="btn btn-principal" disabled={!!carregando} onClick={() => void escreverComIA()}>
                {carregando === 'escrever' ? 'Escrevendo…' : 'Gerar texto'}
              </button>
              {msg.trim() && <p className="dica-pequena">O texto atual será substituído.</p>}
            </div>
          )}
          {erroIA && <p className="erro">{erroIA} O modo automático continua funcionando.</p>}
        </div>
      </section>

      <section className="bloco">
        <h2>
          <span className="num">3</span> Cenas, som e prévia
        </h2>

        {cenas.length > 0 ? (
          <ol className="lista-cenas">
            {cenas.map((c) => (
              <li key={c.frase} className="item-cena">
                <div className="miniatura" style={{ background: gradiente(c.paleta) }} aria-hidden>
                  {c.icones.join(' ')}
                </div>
                <div className="item-cena-corpo">
                  <p className="item-frase">{c.frase}</p>
                  <div className="item-controles">
                    <label>
                      Ícones
                      <input
                        defaultValue={c.icones.join(' ')}
                        key={c.icones.join('')}
                        onBlur={(e) => {
                          const novos = separarEmojis(e.target.value);
                          if (novos.length) editarCena(c.frase, c, { icones: novos });
                          else e.target.value = c.icones.join(' ');
                        }}
                      />
                    </label>
                    <label>
                      Movimento
                      <select value={c.movimento} onChange={(e) => editarCena(c.frase, c, { movimento: e.target.value as Cena['movimento'] })}>
                        {MOVIMENTOS.map((m) => (
                          <option key={m} value={m}>
                            {ROTULO_MOV[m]}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Cores
                      <select value={c.paleta} onChange={(e) => editarCena(c.frase, c, { paleta: e.target.value as Cena['paleta'] })}>
                        {PALETAS.map((p) => (
                          <option key={p} value={p}>
                            {PALETA[p].rotulo}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <p className="vazio">As cenas aparecem aqui quando você escrever a mensagem.</p>
        )}

        <div className="grade-2">
          <label>
            Trilha
            <select value={trilha} onChange={(e) => mudar(setTrilha)(e.target.value as Trilha)}>
              {TRILHAS.map((t) => (
                <option key={t} value={t}>
                  {ROTULO_TRILHA[t]}
                </option>
              ))}
            </select>
          </label>
          <label>
            Voz do locutor
            <select value={voz} onChange={(e) => mudar(setVoz)(e.target.value as Voz)}>
              {VOZES.map((v) => (
                <option key={v} value={v}>
                  {PRESETS_VOZ[v].rotulo}
                </option>
              ))}
            </select>
          </label>
        </div>

        {recado ? (
          <div className="previa">
            <Show recado={recado} compacto />
          </div>
        ) : (
          <p className="vazio">Preencha os nomes e a mensagem para ver a prévia.</p>
        )}
      </section>

      <section className="bloco enviar">
        <button className="btn btn-principal grande" disabled={!recado} onClick={gerarLink}>
          📢 Gerar link do recado
        </button>
        {link && (
          <div className="resultado-link">
            <input readOnly value={link} onFocus={(e) => e.target.select()} aria-label="Link do recado" />
            <div className="acoes">
              <button className="btn btn-secundario" onClick={() => void copiar()}>
                {copiado ? '✓ Copiado' : 'Copiar link'}
              </button>
              <a className="btn btn-whats" href={`https://wa.me/?text=${encodeURIComponent(textoWhats)}`} target="_blank" rel="noreferrer">
                Enviar no WhatsApp
              </a>
              <a className="btn btn-link" href={link} target="_blank" rel="noreferrer">
                Abrir ↗
              </a>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
