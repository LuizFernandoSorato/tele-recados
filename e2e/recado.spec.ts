import { expect, test, type Page } from '@playwright/test';

// Fala falsa e rápida: dispara boundary por palavra e onend, sem áudio real.
async function mockarFala(page: Page) {
  await page.addInitScript(() => {
    const voz = { name: 'Teste pt-BR', lang: 'pt-BR', default: true, localService: true, voiceURI: 'x' };
    class FakeUtterance {
      text: string; voice = null; lang = ''; rate = 1; pitch = 1;
      onstart?: () => void; onend?: () => void; onerror?: () => void;
      onboundary?: (e: { name: string; charIndex: number }) => void;
      constructor(t: string) { this.text = t; }
    }
    const synth = {
      getVoices: () => [voz],
      addEventListener() {}, removeEventListener() {},
      cancel() {},
      speak(u: FakeUtterance) {
        u.onstart?.();
        const inicios = [...u.text.matchAll(/\S+/g)].map((m) => m.index!);
        inicios.forEach((ci, i) => setTimeout(() => u.onboundary?.({ name: 'word', charIndex: ci }), 40 * (i + 1)));
        setTimeout(() => u.onend?.(), 40 * (inicios.length + 2));
      },
    };
    Object.defineProperty(window, 'speechSynthesis', { value: synth, configurable: true });
    Object.defineProperty(window, 'SpeechSynthesisUtterance', { value: FakeUtterance, configurable: true });
  });
}

test('cria um recado, gera o link e assiste até o final', async ({ page }, info) => {
  await mockarFala(page);
  await page.goto('./');
  await expect(page.getByRole('heading', { name: 'TeleRecados' })).toBeVisible();
  await page.screenshot({ path: `test-results/shots/${info.project.name}-1-landing.png`, fullPage: true });

  await page.getByRole('button', { name: 'Criar meu recado' }).click();
  await page.getByLabel('Nome de quem vai receber').fill('Carla');
  await page.getByLabel('Seu nome (quem manda)').fill('Dudu');
  await page.getByRole('radio', { name: 'Aniversário' }).click();
  await page.getByLabel('Mensagem').fill(
    'Feliz aniversário, Carla! Lembra da nossa viagem pra praia com aquele cachorro maluco? Que venham muitos anos de risada e café. Te amo muito, irmã!',
  );
  await expect(page.locator('.item-cena')).toHaveCount(4);
  await expect(page.locator('.item-cena').nth(1)).toContainText('praia');
  await page.screenshot({ path: `test-results/shots/${info.project.name}-2-criar.png`, fullPage: true });

  await page.getByRole('button', { name: /Gerar link/ }).click();
  const link = await page.getByLabel('Link do recado').inputValue();
  expect(link).toContain('#/r/');

  await page.goto(link);
  await expect(page.getByText('você recebeu um recado de')).toBeVisible();
  await page.screenshot({ path: `test-results/shots/${info.project.name}-3-portao.png` });
  await page.getByRole('button', { name: /Ouvir recado/ }).click();

  await expect(page.locator('.vinheta')).toBeVisible();
  await expect(page.locator('.cena')).toBeVisible({ timeout: 15_000 });
  await expect(page.locator('.cena .palavra.destaque').first()).toBeVisible();
  // espera a cena da praia para o screenshot
  await expect(page.locator('.cena')).toContainText('praia', { timeout: 15_000 });
  await page.waitForTimeout(900);
  await page.screenshot({ path: `test-results/shots/${info.project.name}-4-cena.png` });

  await expect(page.getByRole('heading', { name: 'Feliz aniversário, Carla!' })).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText('— com carinho, Dudu')).toBeVisible();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `test-results/shots/${info.project.name}-5-final.png` });

  await page.getByRole('button', { name: /Responder/ }).click();
  await expect(page.getByLabel('Nome de quem vai receber')).toHaveValue('Dudu');
});

test('link quebrado mostra mensagem amigável', async ({ page }) => {
  await page.goto('./#/r/lixo-total');
  await expect(page.getByRole('heading', { name: 'Esse recado se perdeu no caminho' })).toBeVisible();
});

test('modo sem som funciona sem voz nenhuma', async ({ page }) => {
  await page.goto('./#/criar');
  await page.getByLabel('Nome de quem vai receber').fill('Zé');
  await page.getByLabel('Seu nome (quem manda)').fill('Lu');
  await page.getByLabel('Mensagem').fill('Obrigado por tudo, Zé! Você é demais.');
  await page.getByRole('button', { name: /Gerar link/ }).click();
  await page.goto(await page.getByLabel('Link do recado').inputValue());
  await page.getByRole('button', { name: /sem som/ }).click();
  await expect(page.locator('.cena')).toBeVisible({ timeout: 15_000 });
  await page.getByRole('button', { name: /Pular/ }).click();
  await expect(page.getByRole('heading', { name: /Zé/ })).toBeVisible();
});
