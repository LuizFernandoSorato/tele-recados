import { expect, test, type Page } from '@playwright/test';

async function simularVozes(page: Page, nomes: string[]) {
  await page.addInitScript((nomes) => {
    const vozes = nomes.map((name) => ({ name, lang: 'pt-BR', default: false, localService: true, voiceURI: name }));
    const synth = {
      getVoices: () => vozes,
      addEventListener() {}, removeEventListener() {}, cancel() {},
      speak(u: { onend?: () => void }) { setTimeout(() => u.onend?.(), 50); },
    };
    Object.defineProperty(window, 'speechSynthesis', { value: synth, configurable: true });
    Object.defineProperty(window, 'SpeechSynthesisUtterance', {
      value: class { constructor(public text: string) {} }, configurable: true,
    });
  }, nomes);
}

const link = './#/criar';
async function abrirRecado(page: Page) {
  await page.goto(link);
  await page.getByLabel('Nome de quem vai receber').fill('Ana');
  await page.getByLabel('Seu nome (quem manda)').fill('Bia');
  await page.getByLabel('Mensagem').fill('Feliz aniversário, Ana! Que dia lindo pra você.');
  await page.getByRole('button', { name: /Gerar link/ }).click();
  await page.goto(await page.getByLabel('Link do recado').inputValue());
}

test('no Chrome do Windows escolhe a voz Google, não a Maria', async ({ page }) => {
  await simularVozes(page, [
    'Microsoft Maria - Portuguese (Brazil)',
    'Microsoft Daniel - Portuguese (Brazil)',
    'Google português do Brasil',
  ]);
  await abrirRecado(page);
  const seletor = page.getByLabel('Voz');
  await expect(seletor).toBeVisible();
  await expect(seletor).toHaveValue('Google português do Brasil');
  await expect(page.getByText(/bem robóticas/)).toHaveCount(0);
});

test('só com vozes robóticas, sugere outro navegador e lembra a escolha', async ({ page }) => {
  await simularVozes(page, ['Microsoft Maria - Portuguese (Brazil)', 'Microsoft Daniel - Portuguese (Brazil)']);
  await abrirRecado(page);
  await expect(page.getByText(/bem robóticas/)).toBeVisible();
  await page.getByLabel('Voz').selectOption('Microsoft Daniel - Portuguese (Brazil)');
  await page.reload();
  await expect(page.getByLabel('Voz')).toHaveValue('Microsoft Daniel - Portuguese (Brazil)');
});
