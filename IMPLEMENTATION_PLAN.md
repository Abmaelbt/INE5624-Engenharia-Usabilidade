# Plano de Implementação — Protótipo Web Mobile-First Lumosity (T2 e T3)

## 1. Escopo e Decisões Fechadas

| Item | Decisão |
| :--- | :--- |
| Plataforma | Web Mobile-First + PWA instalável. Sem `.apk`, sem Capacitor. |
| Natureza | Protótipo navegacional de alta fidelidade para demonstrar ajustes de UI. Não é remodelagem final do app. |
| Fidelidade visual | Colorido, conforme `image.png`. Geometria, copy e SVGs conforme HTML exportado do Figma. |
| Tela inicial | `T2.B` (Início — Rosângela), conforme protótipo. |
| Modo facilitador | Controle discreto: painel fora da moldura no desktop; gesto oculto no mobile (5 toques no cabeçalho). Funções: alternar cenário (`T2.A`, `T2.B`, `T3.A`), resetar sessão, exportar métricas. |
| Telemetria A3 | Incluída. Silenciosa, em `localStorage`. Exportação JSON/CSV pelo modo facilitador. |
| Execução local | Docker (`Dockerfile` multi-stage non-root + `docker-compose.yml` com limites e healthcheck). |
| Deploy | GitHub Pages (custo zero) via GitHub Actions. |
| Contexto de agentes | `AGENTS.md` na raiz. |

## 2. Diagnóstico dos Assets

| Arquivo | Papel | Constatação |
| :--- | :--- | :--- |
| `A3-Sintese-Avaliacao-v1-Grupo_J-1.pdf` | Requisitos de usabilidade (ISO 9241-11), fluxos T2/T3, estados de borda do protótipo em papel | Metas: autonomia T2 25% -> 90% (<= 5 s, compreensão do IPL >= 80%); autonomia T3 62,5% -> 90% (<= 7 s, 0 abertura de paywall); SUS 66,25 -> >= 71. |
| `Lumosity Redesign (T2 e T3).html` | Export estático do Figma (bundle) | 10 telas `390x844px`, fonte `Nunito` (woff2 embutido), SVGs (ícones, gráfico de linha, tabuleiro 3x3), labels ARIA. Escala de cinza (`#111111`, `#F0F0F0`, `#F7F7F7`) com placeholder `{{accent}}`. Sem navegação entre telas. |
| `image.png` | Referência cromática definitiva | 10 telas coloridas (5 de T2 + 5 de T3). Fonte dos tokens de cor. |

Extração do HTML: bundle com `__bundler/manifest` (assets gzip+base64), `__bundler/template` (iframes) e `__bundler/page_order` (10 UUIDs). Cada tela é HTML autocontido com `<x-dc>`; telas 4 e 8 (bottom sheets) importam a tela base via `<dc-import>` com overlay `rgba(0,0,0,0.52)`.

Mapeamento UUID -> tela:

| # | Tela | ID |
| :--- | :--- | :--- |
| 1 | Fim do treino | `T2.A` |
| 2 | Início | `T2.B` |
| 3 | Meu Progresso | `T2.C` |
| 4 | O que é o IPL? | `T2.C2` |
| 5 | Evolução da área Memória | `T2.D` |
| 6 | Tarefas (todas) | `T3.A` |
| 7 | Tarefas de Memória | `T3.B` |
| 8 | Aviso: tarefa Premium | `T3.B2` |
| 9 | Ficha da tarefa Fliperamemória | `T3.C` |
| 10 | Partida de prática | `T3.D` |

## 3. Arquitetura

### 3.1 Stack

- `React 19` + `TypeScript` (strict) + `Vite` + CSS Variables. Node 22 (disponível no ambiente: `v22.22.2`).
- Roteamento: `HashRouter` (`#/...`). Compatível com subpath do GitHub Pages sem 404 e com histórico do Android.
- Sem dependência de CDN em runtime: `Nunito` empacotada localmente (extraída do HTML exportado; licença OFL, manter nota de licença).

### 3.2 Comportamento Mobile (Android-like)

- `100dvh`, `env(safe-area-inset-*)`, `overscroll-behavior: none`, `touch-action: manipulation`, `-webkit-tap-highlight-color: transparent`.
- Alvos de toque >= `44x44px`.
- Desktop: viewport central `390x844` com moldura opcional + painel do facilitador lateral.
- Botão/gesto Voltar do Android: sincronizado com `window.history`; fecha bottom sheet aberto antes de voltar de tela.
- Transições: slide horizontal `180ms ease-out` (hierarquia); slide vertical `220ms cubic-bezier` (bottom sheets). Respeitar `prefers-reduced-motion`.

### 3.3 PWA

- `manifest.webmanifest`: `display: standalone`, `orientation: portrait`, `theme_color: #F7F7F7`, ícones 192/512 (incluir `maskable`).
- Service Worker: cache offline do shell + assets. Paths relativos ao `base` (compatível com GitHub Pages).

## 4. Design System

Tokens extraídos de `image.png` (amostragem de pixels) e estrutura do HTML.

| Token | Hex | Aplicação |
| :--- | :--- | :--- |
| `--color-cta` | `#C14009` | Botões primários, tab ativa, link `Ver >` |
| `--color-cta-soft` | `#FFF2E2` | Badge de sequência, fundo da tab ativa, `Praticar` secundário no sheet Premium |
| `--color-memory` | `#6D27D8` | Área Memória: ícones, barra, chip ativo, gráfico, banner, faixa `Alto` |
| `--color-memory-mid` | `#A78BFA` | Faixa `Médio` da régua IPL |
| `--color-memory-low` | `#DDD6FE` | Faixa `Baixo` da régua IPL |
| `--color-memory-soft` | `#F3E8FF` | Chips de Memória, `PRÁTICA · sem tempo` |
| `--color-success` | `#227C48` | Check de treino concluído, `3 de 3`, selo `Grátis`, acerto |
| `--color-success-soft` | `#E2F4E8` | Fundos de confirmação |
| `--color-attention` | `#19746D` | Área Atenção |
| `--color-attention-soft` | `#E6F4F1` | Fundo de Atenção |
| `--color-info` | `#2F76D2` | Deltas (`+20 na semana`, `+12 pontos`) |
| `--color-info-soft` | `#EAF2FF` | Fundo de deltas |
| `--color-error` | `#B91C1C` | Erro pedagógico na prática (previsto no protótipo em papel) |
| `--color-error-soft` | `#FEE2E2` | Fundo de erro |
| `--color-bg` | `#F7F7F7` | Fundo de tela |
| `--color-surface` | `#FFFFFF` | Cards (`radius` 16-24px; sombra `0 1px 2px rgba(0,0,0,.06), 0 6px 20px rgba(0,0,0,.06)`) |
| `--color-text` | `#111111` | Texto principal |
| `--color-text-muted` | `#515151` | Texto secundário |
| `--color-border` | `#E6E6E6` | Bordas |
| `--color-premium-bg` | `#F2F2F2` | Cards/selos Premium |

Tipografia: `Nunito` pesos `400`, `600`, `700`, `800`, `900`. Valores de hex são amostras do PNG; validar visualmente na Fase 6 e ajustar se divergirem.

## 5. Mapa de Telas e Interatividade

### 5.1 Inventário

| ID | Tela | Interações e transições |
| :--- | :--- | :--- |
| `T2.A` | Fim do treino | `Ver meu progresso` -> `T2.C`; `Voltar ao início` -> `T2.B`. Sem bottom nav. |
| `T2.B` | Início (tela inicial) | Card IPL `885` / `Ver >` -> `T2.C`; `Como você está hoje? (opcional)` -> micro-sheet não bloqueante; `Mais tarefas no Premium (opcional)` -> sheet `Recurso Premium`; bottom nav (`Hoje`, `Tarefas`, `Progresso`). |
| `T2.C` | Meu Progresso | `O que é o IPL?` -> `T2.C2`; card `Memória` / `Atenção` -> `T2.D` (parametrizada por área); card `Velocidade` ("Faça 1 tarefa para ver") -> `T3.A`; `Comparar com outras pessoas` -> sheet `Recurso Premium` (CTA `Agora não`). |
| `T2.C2` | Sheet: O que é o IPL? | Overlay escuro sobre `T2.C`. Fecha: `Entendi`, backdrop, arrastar para baixo, Voltar do Android. |
| `T2.D` | Evolução da área | Voltar -> `T2.C`; segmentado `7 dias` / `30 dias` / `Tudo` atualiza gráfico SVG, eixos e frase-resumo; `Praticar` (Fliperamemória) -> `T3.C`. |
| `T3.A` | Tarefas (todas) | Busca em tempo real (ignora acento/caixa; nome e área); chips `Todas`/`Memória`/`Atenção`/`Veloc.`; `Praticar` grátis -> `T3.C`; item `PREMIUM` -> `T3.B2`. |
| `T3.B` | Tarefas (filtro Memória) | Mesmo componente de `T3.A` com filtro `Memória` ativo: contador `2 tarefas de Memória`; Grátis: `Fliperamemória`, `Culinária`; Premium (opcional): `Siga o Sapo`, `Batida Perfeita`. |
| `T3.B2` | Sheet: Esta tarefa é Premium | Disparado por tarefa Premium. `Praticar` em `Fliperamemória`/`Culinária` -> `T3.C`; `Ver tarefas grátis` fecha e rola à seção gratuita; `Conhecer o Premium` -> tela informativa sem cobrança. |
| `T3.C` | Ficha da tarefa | Voltar -> origem; `Praticar` -> `T3.D`; `Ver como praticar (30 s)` -> animação inline do trajeto da bola no banner (sem vídeo externo). |
| `T3.D` | Partida de prática | Minigame jogável, 3 rodadas, sem cronômetro. Tabuleiro 3x3 com círculos de saída. Fase 1: bola percorre o trajeto. Fase 2: toque no círculo de saída. Acerto: verde + explicação + `Próxima rodada`. Erro: vermelho + dica pedagógica sem punição, nova tentativa. Fim da rodada 3: resumo com retorno a `T3.B` ou `T2.C`. |

Estados adicionais (previstos no protótipo em papel do PDF): sheet `Recurso Premium`; micro-sheet `Como você está hoje? (opcional)`; tela informativa `Conhecer o Premium`.

### 5.2 Navegação

- Bottom nav persistente em `T2.B`, `T2.C`, `T2.D`, `T3.A`, `T3.B`. Oculta em `T2.A`, `T3.C`, `T3.D`.
- Tab ativa: `--color-cta` + fundo `--color-cta-soft`.
- Conteúdo de `T3.A`/`T3.B` é um único componente com filtro como estado (URL: `#/tarefas?area=memoria`).

## 6. Telemetria de Usabilidade (A3)

- Armazenamento: `localStorage` (chave versionada `lumo.telemetry.v1`). Sem rede, sem identificadores pessoais.
- Eventos: `session_start`, `screen_view`, `tap`, `task_start` / `task_end` (T2, T3), `premium_open`, `round_result` (acerto/erro, tentativas), `sheet_open/close`.
- Métricas derivadas por sessão: tempo por tarefa (alvos: T2 <= 5 s; T3 <= 7 s), nº de toques, aberturas de paywall (alvo 0), conclusão autônoma (sem uso do facilitador).
- Exportação: JSON e CSV, pelo painel do facilitador. Botão de reset entre participantes.
- Acesso: painel lateral (desktop) ou 5 toques no cabeçalho (mobile). Invisível ao participante.

## 7. Docker

### 7.1 `prototype/Dockerfile` (multi-stage)

```dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG VITE_BASE_PATH=/
ENV VITE_BASE_PATH=${VITE_BASE_PATH}
RUN npm run build

FROM nginxinc/nginx-unprivileged:1.27-alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 8080
USER nginx
```

- Runtime non-root (UID 101), porta `8080`.
- `prototype/nginx.conf`: gzip; `Cache-Control: immutable` em `/assets/`; `no-cache` em `index.html` e `sw.js`; headers `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`; `location = /healthz { return 200 'ok'; }`.

### 7.2 `docker-compose.yml` (raiz)

```yaml
services:
  prototype:
    build:
      context: ./prototype
      args:
        VITE_BASE_PATH: /
    ports:
      - "8080:8080"
    read_only: true
    tmpfs:
      - /tmp
      - /var/cache/nginx
    security_opt:
      - no-new-privileges:true
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://127.0.0.1:8080/healthz"]
      interval: 15s
      timeout: 3s
      retries: 3
    deploy:
      resources:
        limits:
          cpus: "0.50"
          memory: 128M
        reservations:
          cpus: "0.10"
          memory: 32M

  prototype-dev:
    profiles: ["dev"]
    image: node:22-alpine
    user: "node"
    working_dir: /app
    volumes:
      - ./prototype:/app
    command: sh -c "npm ci && npm run dev -- --host 0.0.0.0"
    ports:
      - "5173:5173"
    deploy:
      resources:
        limits:
          cpus: "1.0"
          memory: 512M
        reservations:
          cpus: "0.25"
          memory: 128M
```

- Risco: `read_only` + nginx exige `tmpfs` em `/tmp` e `/var/cache/nginx`; validar que a imagem unprivileged grava `nginx.pid` em `/tmp`.
- Risco: bind mount do dev com `npm ci` pode criar `node_modules` com ownership divergente; usar volume nomeado para `node_modules` se ocorrer.
- Uso: `docker compose up -d --build` (prod local, `http://localhost:8080`); `docker compose --profile dev up prototype-dev` (HMR, `http://localhost:5173`).
- `.dockerignore` em `prototype/`: `node_modules`, `dist`, `.git`.

## 8. Deploy Gratuito (GitHub Pages)

- Repo: `Abmaelbt/INE5624-Engenharia-Usabilidade`, branch `main`.
- URL final: `https://abmaelbt.github.io/INE5624-Engenharia-Usabilidade/`.
- `prototype/vite.config.ts`: `base: process.env.VITE_BASE_PATH || '/'`.
- `manifest.webmanifest`: `start_url` e `scope` relativos (`./`); SW registrado com path relativo ao `base`.
- Ação manual única: `Settings -> Pages -> Build and deployment -> Source: GitHub Actions`.

`.github/workflows/deploy-pages.yml`:

```yaml
name: deploy-pages
on:
  push:
    branches: [main]
    paths: ["prototype/**", ".github/workflows/deploy-pages.yml"]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: prototype
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
          cache-dependency-path: prototype/package-lock.json
      - run: npm ci
      - run: npm run typecheck
      - run: npm run build
        env:
          VITE_BASE_PATH: /INE5624-Engenharia-Usabilidade/
      - uses: actions/upload-pages-artifact@v3
        with:
          path: prototype/dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- Custo: zero (repo público; Actions e Pages gratuitos). Repo privado exige plano que suporte Pages.
- Fixar versões das actions por major; considerar pin por SHA se política exigir.

## 9. Estrutura de Diretórios

```text
.
├── AGENTS.md
├── IMPLEMENTATION_PLAN.md
├── docker-compose.yml
├── image.png
├── Lumosity Redesign (T2 e T3).html
├── A3-Sintese-Avaliacao-v1-Grupo_J-1.pdf
├── .github/workflows/deploy-pages.yml
└── prototype/
    ├── Dockerfile
    ├── .dockerignore
    ├── nginx.conf
    ├── index.html
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    ├── public/
    │   ├── manifest.webmanifest
    │   ├── sw.js
    │   └── icons/                 # 192, 512, maskable
    ├── scripts/
    │   └── extract-assets.py      # HTML bundle -> fonts + SVGs
    └── src/
        ├── main.tsx
        ├── App.tsx                # HashRouter, Android back, desktop frame
        ├── styles/{tokens.css,global.css,fonts.css}
        ├── assets/fonts/          # Nunito woff2 + OFL notice
        ├── data/{tasks.ts,progress.ts,fliperamemoria.ts}
        ├── components/
        │   ├── BottomNav.tsx
        │   ├── BottomSheet.tsx
        │   ├── Icons.tsx
        │   ├── IplScale.tsx
        │   ├── AreaLineChart.tsx
        │   ├── PinballBoard.tsx
        │   └── FacilitatorPanel.tsx
        ├── screens/
        │   ├── WorkoutCompleteScreen.tsx   # T2.A
        │   ├── HomeScreen.tsx              # T2.B
        │   ├── ProgressScreen.tsx          # T2.C, T2.C2
        │   ├── AreaDetailScreen.tsx        # T2.D
        │   ├── TasksScreen.tsx             # T3.A, T3.B, T3.B2
        │   ├── TaskDetailScreen.tsx        # T3.C
        │   ├── PracticeGameScreen.tsx      # T3.D
        │   └── PremiumInfoScreen.tsx
        └── utils/{normalize.ts,telemetry.ts}
```

## 10. Fases de Execução

| Fase | Entregas | Verificação |
| :--- | :--- | :--- |
| 1. Scaffold e assets | Projeto Vite+React+TS em `prototype/`; `extract-assets.py` gera fonte `Nunito` e SVGs (ícones, gráfico, tabuleiro) a partir do HTML | `npm run build` verde; fonte carrega offline |
| 2. Design system e navegação | `tokens.css`, `global.css`, `BottomNav`, `BottomSheet`, `Icons`, `IplScale`; HashRouter + Voltar do Android | Navegação entre rotas stub; sheet fecha com Voltar |
| 3. Fluxo T2 | `T2.A`, `T2.B`, `T2.C`, `T2.C2`, `T2.D`, `AreaLineChart` com 7d/30d/Tudo | Comparação lado a lado com linha superior de `image.png` |
| 4. Fluxo T3 | `T3.A`, `T3.B`, `T3.B2`, `T3.C`, `T3.D` jogável; busca tolerante a acento | Comparação com linha inferior de `image.png`; 3 rodadas completas |
| 5. Telemetria, PWA, facilitador | `telemetry.ts`, `FacilitatorPanel`, manifest, SW, exportação JSON/CSV | Instalável no Chrome Android; offline após 1º load; export válido |
| 6. Docker e Pages | `Dockerfile`, `nginx.conf`, `docker-compose.yml`, workflow | Comandos abaixo; deploy em URL Pages |

### 10.1 Comandos de verificação

```bash
cd prototype && npm ci && npm run typecheck && npm run build
docker compose config
docker compose up -d --build
curl -fsS http://localhost:8080/healthz
docker compose ps
docker compose down
```

- Auditoria visual: viewport `390x844` (DevTools mobile) contra `image.png`, tela a tela (10/10).
- Teste de fluxo: T2 (`T2.B` -> `T2.C` -> `T2.C2` -> `T2.D`) e T3 (`T3.A` -> filtro Memória -> `T3.B2` -> `T3.C` -> `T3.D`).
- Dispositivo real Android: acessar `http://<ip-lan>:8080` ou URL do Pages.

## 11. Riscos e Mitigações

| Risco | Impacto | Mitigação |
| :--- | :--- | :--- |
| Hex amostrado do PNG diverge do Figma | Divergência visual | Auditoria visual na Fase 6; tokens centralizados em `tokens.css` |
| HTML exportado usa `{{accent}}` e `<dc-import>` | Extração incompleta | Reescrever telas em React usando markup como referência; não executar o bundle |
| Fontes subset (unicode-range) | Glifos ausentes | Usar o subset `latin` (cobre PT-BR); validar acentos |
| Subpath do Pages | Assets 404 | `base` via `VITE_BASE_PATH` + HashRouter + paths relativos no SW/manifest |
| SW com cache obsoleto | Demo desatualizada | Versionar cache; `index.html` e `sw.js` sem cache longo |
| Rodadas do Fliperamemória: lógica de trajeto | Complexidade | 3 rodadas pré-definidas em `fliperamemoria.ts` (sem geração procedural) |
