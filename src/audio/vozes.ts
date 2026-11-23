/** Escolha da voz: lógica pura (testável), sem tocar em speechSynthesis. */

export type InfoVoz = Pick<SpeechSynthesisVoice, 'name' | 'lang' | 'localService'>;

/** Nota de qualidade da voz. Negativo = não é português. */
export function pontuarVoz(v: InfoVoz): number {
  const lang = v.lang.replace('_', '-').toLowerCase();
  const n = v.name.toLowerCase();
  let s: number;
  if (lang === 'pt-br') s = 100;
  else if (lang.startsWith('pt')) s = 40;
  else return -1;

  if (/natural|neural|online/.test(n)) s += 60; // Edge: Francisca/Antonio/Thalita Online (Natural)
  else if (/premium|enhanced|aprimorad|siri/.test(n)) s += 55; // Apple: vozes aprimoradas
  else if (/google/.test(n)) s += 45; // Chrome: "Google português do Brasil"
  else if (/network|-x-/.test(n)) s += 40; // Android: pt-br-x-afs-network
  else if (/luciana|felipe|fernanda|joana/.test(n)) s += 30; // Apple padrão

  if (/microsoft/.test(n) && !/natural|online|neural/.test(n)) s -= 20; // Maria/Daniel (SAPI)
  if (/compact|eloquence|espeak|desktop/.test(n)) s -= 25;
  return s;
}

/** Vozes que soam claramente robóticas: vale sugerir outro navegador. */
export function ehVozRobotica(v: InfoVoz): boolean {
  return pontuarVoz(v) < 130;
}

export function ordenarVozesPt<T extends InfoVoz>(vozes: T[]): T[] {
  return vozes
    .map((v) => ({ v, s: pontuarVoz(v) }))
    .filter((x) => x.s >= 0)
    .sort((a, b) => b.s - a.s || a.v.name.localeCompare(b.v.name))
    .map((x) => x.v);
}

/** "Microsoft Francisca Online (Natural) - Portuguese (Brazil)" → "Francisca (Natural)" */
export function rotuloVoz(v: InfoVoz): string {
  if (/^google\s/i.test(v.name)) return 'Google';
  return (
    v.name
      .replace(/\s*[-–]\s*(portuguese|português).*$/i, '')
      .replace(/^(microsoft|google|apple)\s+/i, '')
      .replace(/\s+online\s*/i, ' ')
      .replace(/\s+/g, ' ')
      .trim() || v.name
  );
}

const RE_EMOJI = /[\p{Extended_Pictographic}\p{Emoji_Modifier}\p{Regional_Indicator}‍️⃣]/gu;

/**
 * Versão de cada palavra para a voz: sem emojis (a voz leria "rosto sorridente")
 * e sem repetições de pontuação. Palavra vazia = não é falada.
 */
export function palavraParaFala(palavra: string): string {
  return palavra
    .replace(RE_EMOJI, '')
    .replace(/([!?.])\1+/g, '$1')
    .replace(/[*_~#]/g, '')
    .trim();
}
