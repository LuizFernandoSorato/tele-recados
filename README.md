# TeleRecados 📢

Antes das redes sociais, um carro de som parava na porta e o locutor anunciava um recado pra rua inteira ouvir.
O TeleRecados faz isso por link: você escreve, cada frase vira uma **cena animada** que ilustra o que foi dito,
e quem recebe ouve o recado narrado, com trilha sonora.

- **Site estático** (Vite + React + TypeScript) no GitHub Pages. O recado vai inteiro no link, depois do `#`, sem banco de dados.
- **Locutor** com a voz do próprio navegador (Web Speech API). As palavras aparecem no ritmo da fala.
- **Trilhas** sintetizadas com Tone.js. Nenhum arquivo de música de terceiros.
- **IA opcional** (Claude) num Cloudflare Worker: escreve o texto e escolhe ícones, movimentos e cores de cada cena.
  Sem o Worker, o app funciona igual, usando um dicionário local de palavras-chave.

## Rodando local

```bash
npm install
npm run dev          # http://localhost:5173/TeleRecados/
npm test             # testes unitários (Vitest)
npm run e2e          # testes ponta a ponta (Playwright: build + preview)
```

### Com a IA

```bash
cd worker
npm install
echo "ANTHROPIC_API_KEY=sk-ant-..." > .dev.vars   # nunca commite este arquivo
npm run dev                                       # http://localhost:8787
```

Na raiz, crie `.env.local` com `VITE_IA_URL=http://localhost:8787` (veja `.env.example`) e rode `npm run dev`.

## Publicando

1. **Site:** suba o repositório no GitHub com o nome `TeleRecados` (ou mude `base` em `vite.config.ts`).
   Em *Settings → Pages*, escolha *Source: GitHub Actions*. Cada push na `main` publica em
   `https://<usuario>.github.io/TeleRecados/`.
2. **IA (opcional):**
   ```bash
   cd worker
   # em wrangler.toml, troque SEU-USUARIO em ORIGENS pelo seu usuário do GitHub
   npx wrangler login
   npx wrangler secret put ANTHROPIC_API_KEY
   npm run deploy
   ```
   Copie a URL do Worker (`https://telerecados-ia.<conta>.workers.dev`) para a variável de repositório
   `VITE_IA_URL` (*Settings → Secrets and variables → Actions → Variables*) e rode o deploy de novo.
   Recomendado: defina um limite de gastos no Console da Anthropic. O Worker já limita 10 pedidos/min por IP.

## Estrutura

| Caminho | O quê |
|---|---|
| `src/lib/payload.ts` | codifica/decodifica e valida o recado no link |
| `src/lib/storyboard.ts` + `src/content/palavras.ts` | frase → cena (ícones, movimento, paleta, destaques) sem IA |
| `src/show/` | o show: vinheta, cenas animadas, texto cinético, final |
| `src/audio/` | voz (TTS) e trilhas |
| `worker/` | endpoint `POST /recado` com Claude (`escrever` / `animar`) |
