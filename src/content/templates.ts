import type { Ocasiao } from '../lib/tipos';

/** {nome} é substituído pelo nome do homenageado. */
export const TEMPLATES: Record<Ocasiao, string[]> = {
  aniversario: [
    'Feliz aniversário, {nome}! Hoje o dia é todo seu. Que esse novo ano venha cheio de saúde, risadas e viagens boas. Obrigado por deixar a vida de todo mundo por perto mais leve. Bora comemorar!',
    '{nome}, mais um ano de você no mundo, e o mundo agradece! Que não falte bolo, abraço apertado e motivo pra sorrir. Parabéns!',
  ],
  maes: [
    'Mãe, hoje o recado é todo seu. Obrigado por cada cuidado, cada café passado e cada conselho que eu fingi não ouvir. Te amo demais!',
    'Feliz Dia das Mães, {nome}! Você é o abraço que vira casa. Obrigado por tudo, sempre.',
  ],
  pais: [
    'Pai, feliz dia! Obrigado pelas caronas, pelas piadas ruins e por estar sempre por perto. Você é meu herói, mesmo quando erra o caminho no GPS.',
    'Feliz Dia dos Pais, {nome}! Obrigado por ensinar com paciência e amar sem medida. Te amo!',
  ],
  namoro: [
    '{nome}, eu podia mandar uma mensagem comum, mas preferi anunciar pra todo mundo: eu te amo! Obrigado por cada risada, cada viagem e cada domingo de filme no sofá.',
    'Amor, esse recado é só pra lembrar que meu dia fica melhor com você. Te amo, {nome}!',
  ],
  formatura: [
    'Parabéns pela formatura, {nome}! Foram muitas noites de estudo e muito café, e agora o diploma é seu. Que venha o futuro, porque você está pronto para ele!',
    '{nome}, que orgulho! Você conquistou cada passo até aqui. O mundo que se prepare. Parabéns!',
  ],
  agradecimento: [
    '{nome}, passando para dizer obrigado. Sua ajuda fez toda a diferença, e eu não ia deixar isso passar em branco. Gratidão de verdade!',
    'Obrigado, {nome}! Gente como você deixa tudo mais fácil. Fica aqui meu abraço e minha gratidão.',
  ],
  saudade: [
    '{nome}, a saudade apertou e eu resolvi mandar um recado. Lembra das nossas conversas até de madrugada? Logo a gente se vê. Um abraço enorme!',
    'Saudade de você, {nome}. A distância é grande, mas o carinho continua do mesmo tamanho.',
  ],
  outro: [
    'Atenção, {nome}! Esse recado é só para dizer que você é muito especial. Tenha um dia lindo!',
  ],
};

export function aplicarTemplate(t: string, nome: string): string {
  return t.replaceAll('{nome}', nome || 'você');
}
