import type { Movimento, Ocasiao, Paleta } from '../lib/tipos';

export interface EntradaPalavra {
  /** radicais normalizados (sem acento). Com 4+ letras casam por prefixo; menores, só exato. */
  termos: string[];
  icones: string[];
  paleta?: Paleta;
  movimento?: Movimento;
  /** termo abstrato: só manda na cena se não houver nada mais concreto */
  fraco?: boolean;
}

// A ordem importa: entradas mais específicas primeiro.
export const DICIONARIO: EntradaPalavra[] = [
  // celebração
  { termos: ['aniversari', 'niver', 'parabens'], icones: ['🎂', '🎉'], paleta: 'festa', movimento: 'explodir' },
  { termos: ['bolo', 'vela', 'velinha'], icones: ['🎂', '🕯️'], paleta: 'festa', movimento: 'crescer' },
  { termos: ['festa', 'comemor', 'celebr', 'balada'], icones: ['🎉', '🥳', '🎈'], paleta: 'festa', movimento: 'explodir' },
  { termos: ['presente', 'surpresa'], icones: ['🎁'], paleta: 'festa', movimento: 'pulsar' },
  { termos: ['balao', 'baloes'], icones: ['🎈'], paleta: 'festa', movimento: 'flutuar' },
  { termos: ['brinde', 'brindar', 'champanhe', 'espumante'], icones: ['🥂'], paleta: 'festa', movimento: 'balancar' },
  { termos: ['formatura', 'formad', 'diploma', 'faculdade', 'universidade'], icones: ['🎓', '📜'], paleta: 'festa', movimento: 'chover' },
  { termos: ['escola', 'estud', 'prova', 'aula', 'colegio'], icones: ['📚', '✏️'], paleta: 'nostalgia', movimento: 'flutuar' },
  { termos: ['casamento', 'casar', 'noivo', 'noiva', 'alianca'], icones: ['💍', '💒'], paleta: 'romantica', movimento: 'crescer' },
  { termos: ['vitoria', 'conquist', 'campe', 'vence', 'trofeu'], icones: ['🏆', '⭐'], paleta: 'quente', movimento: 'crescer' },
  { termos: ['sucesso', 'orgulho'], icones: ['🌟', '🏆'], paleta: 'quente', movimento: 'crescer' },

  // amor e afeto
  { termos: ['amor', 'amo', 'ama', 'apaixon', 'paixao'], icones: ['❤️', '💕'], paleta: 'romantica', movimento: 'pulsar' },
  { termos: ['coracao'], icones: ['❤️'], paleta: 'romantica', movimento: 'pulsar' },
  { termos: ['beijo', 'beija'], icones: ['😘', '💋'], paleta: 'romantica', movimento: 'flutuar' },
  { termos: ['abraco', 'abracar', 'abraca'], icones: ['🤗'], paleta: 'quente', movimento: 'pulsar' },
  { termos: ['carinho', 'afeto', 'cuidado', 'cuida'], icones: ['🤗', '💛'], paleta: 'quente', movimento: 'flutuar', fraco: true },
  { termos: ['namor', 'casal', 'juntos', 'junto'], icones: ['💑', '❤️'], paleta: 'romantica', movimento: 'orbitar' },
  { termos: ['saudade', 'falta', 'longe', 'distancia'], icones: ['🌙', '💭'], paleta: 'noite', movimento: 'flutuar' },
  { termos: ['amizade', 'amigo', 'amiga', 'parceir', 'parca', 'brother'], icones: ['🤝', '🫂'], paleta: 'quente', movimento: 'orbitar' },
  { termos: ['obrigad', 'agradec', 'gratidao', 'grato', 'grata'], icones: ['🙏', '✨'], paleta: 'quente', movimento: 'chover' },
  { termos: ['sorriso', 'sorri', 'feliz', 'felicidade', 'alegria', 'alegre'], icones: ['😊', '☀️'], paleta: 'quente', movimento: 'balancar', fraco: true },
  { termos: ['risada', 'rir', 'riso', 'gargalhada', 'engracad', 'piada'], icones: ['😂', '🤣'], paleta: 'quente', movimento: 'balancar' },
  { termos: ['chorar', 'choro', 'chorei', 'chorando', 'lagrima', 'emocion'], icones: ['🥹', '💧'], paleta: 'noite', movimento: 'chover' },
  { termos: ['sonho', 'sonhar', 'sonha'], icones: ['💭', '✨'], paleta: 'noite', movimento: 'flutuar' },
  { termos: ['desculpa', 'perdao', 'perdoa'], icones: ['🙏', '🕊️'], paleta: 'nostalgia', movimento: 'flutuar' },

  // família
  { termos: ['mae', 'mamae', 'mainha', 'maezinha'], icones: ['👩', '💐'], paleta: 'romantica', movimento: 'flutuar' },
  { termos: ['pai', 'papai', 'painho', 'paizao'], icones: ['👨', '💙'], paleta: 'quente', movimento: 'flutuar' },
  { termos: ['vo', 'vovo', 'avo', 'avos'], icones: ['👵', '👴'], paleta: 'nostalgia', movimento: 'flutuar' },
  { termos: ['filho', 'filha', 'filhos'], icones: ['👶', '💛'], paleta: 'quente', movimento: 'pulsar' },
  { termos: ['irma', 'irmao', 'irmaos', 'mano', 'mana'], icones: ['🫂'], paleta: 'quente', movimento: 'orbitar' },
  { termos: ['familia'], icones: ['👨‍👩‍👧‍👦', '🏡'], paleta: 'quente', movimento: 'orbitar' },
  { termos: ['bebe', 'nenem', 'nascimento', 'nasceu'], icones: ['👶', '🍼'], paleta: 'romantica', movimento: 'balancar' },

  // lugares e viagens
  { termos: ['viagem', 'viaja', 'ferias', 'passeio'], icones: ['✈️', '🧳'], paleta: 'praia', movimento: 'voar' },
  { termos: ['aviao', 'voo', 'aeroporto'], icones: ['✈️'], paleta: 'praia', movimento: 'voar' },
  { termos: ['praia', 'mar', 'onda', 'litoral', 'areia'], icones: ['🏖️', '🌊'], paleta: 'praia', movimento: 'flutuar' },
  { termos: ['piscina', 'nadar', 'nado'], icones: ['🏊', '💦'], paleta: 'praia', movimento: 'flutuar' },
  { termos: ['sol', 'verao', 'calor', 'ensolarad'], icones: ['☀️', '🌞'], paleta: 'quente', movimento: 'pulsar' },
  { termos: ['chuva', 'chove', 'tempestade'], icones: ['🌧️', '☔'], paleta: 'noite', movimento: 'chover' },
  { termos: ['neve', 'frio', 'inverno'], icones: ['❄️', '⛄'], paleta: 'noite', movimento: 'chover' },
  { termos: ['montanha', 'trilha', 'acampa', 'serra'], icones: ['⛰️', '🏕️'], paleta: 'natureza', movimento: 'flutuar' },
  { termos: ['campo', 'fazenda', 'sitio', 'roca', 'interior'], icones: ['🌾', '🐄'], paleta: 'natureza', movimento: 'balancar' },
  { termos: ['flor', 'flores', 'jardim', 'rosa', 'buque', 'girassol'], icones: ['🌻', '🌷', '💐'], paleta: 'natureza', movimento: 'chover' },
  { termos: ['arvore', 'floresta', 'natureza', 'planta'], icones: ['🌳', '🍃'], paleta: 'natureza', movimento: 'balancar' },
  { termos: ['casa', 'lar', 'mudanca', 'apartamento', 'ape'], icones: ['🏡', '🔑'], paleta: 'quente', movimento: 'crescer' },
  { termos: ['cidade', 'predio', 'metropole'], icones: ['🏙️'], paleta: 'noite', movimento: 'crescer' },
  { termos: ['estrada', 'carro', 'dirigir', 'roadtrip'], icones: ['🚗', '🛣️'], paleta: 'praia', movimento: 'voar' },
  { termos: 'onibus metro trem'.split(' '), icones: ['🚌', '🚆'], paleta: 'nostalgia', movimento: 'voar' },
  { termos: ['moto', 'bicicleta', 'bike', 'pedal'], icones: ['🚲', '🏍️'], paleta: 'natureza', movimento: 'voar' },
  { termos: ['paris', 'franca', 'europa'], icones: ['🗼', '🥐'], paleta: 'romantica', movimento: 'flutuar' },

  // céu e tempo
  { termos: ['estrela', 'ceu', 'universo', 'galaxia', 'lua', 'luar'], icones: ['⭐', '🌙', '✨'], paleta: 'noite', movimento: 'chover' },
  { termos: ['noite', 'madrugada'], icones: ['🌙', '🌃'], paleta: 'noite', movimento: 'flutuar' },
  { termos: ['manha', 'amanhecer', 'acordar', 'acorda'], icones: ['🌅', '☕'], paleta: 'quente', movimento: 'crescer' },
  { termos: ['arco-iris', 'arcoiris'], icones: ['🌈'], paleta: 'festa', movimento: 'crescer' },
  { termos: ['tempo', 'anos', 'idade', 'velho', 'velha', 'velhinh'], icones: ['⏳', '🕰️'], paleta: 'nostalgia', movimento: 'balancar', fraco: true },
  { termos: ['lembr', 'memoria', 'recorda', 'infancia', 'antigamente', 'passado'], icones: ['📸', '🎞️'], paleta: 'nostalgia', movimento: 'flutuar', fraco: true },
  { termos: ['foto', 'fotografia', 'selfie'], icones: ['📸'], paleta: 'nostalgia', movimento: 'chover' },
  { termos: ['futuro', 'amanha', 'proxim', 'planos', 'plano'], icones: ['🚀', '✨'], paleta: 'noite', movimento: 'voar', fraco: true },
  { termos: ['natal', 'papai noel'], icones: ['🎄', '🎅'], paleta: 'festa', movimento: 'chover' },
  { termos: ['ano novo', 'reveillon', 'virada'], icones: ['🎆', '🥂'], paleta: 'noite', movimento: 'explodir' },
  { termos: ['fogos', 'fogo'], icones: ['🎆', '🎇'], paleta: 'noite', movimento: 'explodir' },

  // comida e bebida
  { termos: ['cafe', 'cafezinho'], icones: ['☕'], paleta: 'nostalgia', movimento: 'flutuar' },
  { termos: ['cerveja', 'cervejinha', 'chopp', 'chope', 'bar', 'boteco'], icones: ['🍺', '🍻'], paleta: 'quente', movimento: 'balancar' },
  { termos: ['vinho'], icones: ['🍷'], paleta: 'romantica', movimento: 'balancar' },
  { termos: ['pizza'], icones: ['🍕'], paleta: 'quente', movimento: 'orbitar' },
  { termos: ['churrasco', 'churras', 'picanha'], icones: ['🍖', '🔥'], paleta: 'quente', movimento: 'balancar' },
  { termos: ['comida', 'comer', 'janta', 'almoco', 'cozinh', 'receita'], icones: ['🍽️', '😋'], paleta: 'quente', movimento: 'orbitar' },
  { termos: ['doce', 'chocolate', 'brigadeiro', 'sorvete'], icones: ['🍫', '🍦'], paleta: 'romantica', movimento: 'chover' },
  { termos: ['pao', 'padaria', 'pao de queijo'], icones: ['🥖', '🧀'], paleta: 'nostalgia', movimento: 'balancar' },
  { termos: ['acai', 'fruta', 'morango'], icones: ['🍓', '🍇'], paleta: 'natureza', movimento: 'chover' },

  // lazer
  { termos: ['futebol', 'bola', 'gol', 'jogo', 'time', 'estadio'], icones: ['⚽', '🥅'], paleta: 'natureza', movimento: 'voar' },
  { termos: ['musica', 'cantar', 'canta', 'cancao', 'show', 'samba', 'pagode', 'forro'], icones: ['🎶', '🎤'], paleta: 'festa', movimento: 'flutuar' },
  { termos: ['danca', 'dancar', 'dancando', 'baile'], icones: ['💃', '🕺'], paleta: 'festa', movimento: 'balancar' },
  { termos: ['violao', 'guitarra'], icones: ['🎸'], paleta: 'quente', movimento: 'balancar' },
  { termos: ['filme', 'cinema', 'serie', 'netflix'], icones: ['🎬', '🍿'], paleta: 'noite', movimento: 'orbitar' },
  { termos: ['livro', 'leitura', 'ler'], icones: ['📖'], paleta: 'nostalgia', movimento: 'flutuar' },
  { termos: ['videogame', 'game', 'jogar', 'console'], icones: ['🎮', '👾'], paleta: 'noite', movimento: 'pulsar' },
  { termos: ['academia', 'treino', 'corrida', 'correr', 'maratona'], icones: ['💪', '🏃'], paleta: 'quente', movimento: 'pulsar' },
  { termos: ['carnaval', 'bloco', 'fantasia'], icones: ['🎭', '🎊'], paleta: 'festa', movimento: 'chover' },

  // trabalho e vida
  { termos: ['trabalho', 'trampo', 'emprego', 'escritorio', 'carreira', 'promocao'], icones: ['💼', '📈'], paleta: 'nostalgia', movimento: 'crescer' },
  { termos: ['dinheiro', 'grana', 'salario', 'divida', 'pix'], icones: ['💸', '🪙'], paleta: 'quente', movimento: 'chover' },
  { termos: ['saude', 'hospital', 'recupera', 'melhora'], icones: ['🩺', '💚'], paleta: 'natureza', movimento: 'pulsar' },
  { termos: ['forca', 'coragem', 'garra', 'luta', 'guerreir'], icones: ['💪', '🔥'], paleta: 'quente', movimento: 'pulsar' },
  { termos: ['fe', 'deus', 'bencao', 'abencoad', 'oracao', 'reza'], icones: ['🙏', '🕊️'], paleta: 'quente', movimento: 'flutuar' },
  { termos: ['sorte', 'boa sorte'], icones: ['🍀'], paleta: 'natureza', movimento: 'chover' },
  { termos: ['paz', 'calma', 'tranquil'], icones: ['🕊️', '🌿'], paleta: 'natureza', movimento: 'flutuar' },
  { termos: ['luz', 'brilh', 'ilumin'], icones: ['✨', '💡'], paleta: 'noite', movimento: 'pulsar', fraco: true },

  // bichos
  { termos: ['cachorro', 'cachorra', 'cao', 'dog', 'doguinho', 'pet', 'au au'], icones: ['🐶', '🦴'], paleta: 'quente', movimento: 'balancar' },
  { termos: ['gato', 'gata', 'gatinho', 'miau'], icones: ['🐱'], paleta: 'quente', movimento: 'balancar' },
  { termos: ['passaro', 'passarinho', 'voar', 'asas'], icones: ['🐦', '🕊️'], paleta: 'praia', movimento: 'voar' },
  { termos: ['borboleta'], icones: ['🦋'], paleta: 'natureza', movimento: 'voar' },
  { termos: ['peixe', 'pescar', 'pescaria'], icones: ['🐟', '🎣'], paleta: 'praia', movimento: 'flutuar' },

  // comunicação
  { termos: ['carta', 'recado', 'mensagem', 'bilhete'], icones: ['💌', '✉️'], paleta: 'romantica', movimento: 'voar' },
  { termos: ['telefone', 'ligar', 'ligacao', 'celular', 'whatsapp', 'zap'], icones: ['📱', '💬'], paleta: 'nostalgia', movimento: 'pulsar' },
];

export interface PadraoOcasiao {
  icones: string[];
  paleta: Paleta;
  movimentos: Movimento[];
}

export const PADRAO_OCASIAO: Record<Ocasiao, PadraoOcasiao> = {
  aniversario: { icones: ['🎂', '🎉', '🎈'], paleta: 'festa', movimentos: ['explodir', 'flutuar', 'chover'] },
  maes: { icones: ['💐', '💕', '🌷'], paleta: 'romantica', movimentos: ['flutuar', 'chover', 'pulsar'] },
  pais: { icones: ['💙', '☕', '⭐'], paleta: 'quente', movimentos: ['flutuar', 'crescer', 'orbitar'] },
  namoro: { icones: ['❤️', '💌', '✨'], paleta: 'romantica', movimentos: ['pulsar', 'flutuar', 'orbitar'] },
  formatura: { icones: ['🎓', '⭐', '📜'], paleta: 'festa', movimentos: ['chover', 'crescer', 'explodir'] },
  agradecimento: { icones: ['🙏', '✨', '💛'], paleta: 'quente', movimentos: ['flutuar', 'chover', 'crescer'] },
  saudade: { icones: ['🌙', '💭', '⭐'], paleta: 'noite', movimentos: ['flutuar', 'chover', 'orbitar'] },
  outro: { icones: ['✨', '💬', '💛'], paleta: 'nostalgia', movimentos: ['flutuar', 'orbitar', 'crescer'] },
};
