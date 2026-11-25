# AGENTS.md

Context file for AI coding agents working in this repository.

## Project

UFSC INE5624 (Usability Engineering). High-fidelity, navigational, mobile-only web prototype of a Lumosity redesign covering Task 2 (check IPL score) and Task 3 (search and practice a memory task). Purpose: demonstrate UI adjustments, not ship a production app.

Full specification: [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) (PT-BR).

## Source of Truth (priority order)

1. `image.png` — visual and color reference for all 10 screens. Final output must be colorful as shown.
2. `Lumosity Redesign (T2 e T3).html` — Figma export. Authority for layout geometry (`390x844`), copy, ARIA labels, SVGs, embedded `Nunito` woff2. Exported in grayscale with `{{accent}}` placeholder: do NOT copy its grayscale colors.
3. `A3-Sintese-Avaliacao-v1-Grupo_J-1.pdf` — usability goals (ISO 9241-11) and paper-prototype edge states (Premium feature sheet, pedagogical error feedback in Fliperamemoria).
4. `IMPLEMENTATION_PLAN.md` — implementation spec.

## Locked Decisions

- Web Mobile-First + installable PWA only. No APK, no Capacitor.
- Default entry screen: `T2.B` (Inicio, user "Rosangela").
- Silent usability telemetry in `localStorage` (`lumo.telemetry.v1`), exported as JSON/CSV via hidden facilitator panel (desktop side panel; mobile: 5 taps on header).
- `HashRouter` (required for GitHub Pages subpath).
- Docker runtime: `nginxinc/nginx-unprivileged` (non-root).
- Free deploy: GitHub Pages via GitHub Actions.

## Stack

| Layer | Choice |
| :--- | :--- |
| Runtime | Node 22 |
| Build | Vite |
| UI | React 19 + TypeScript (`strict`) |
| Styling | Plain CSS with CSS Variables (`tokens.css`, `global.css`) |
| Routing | `HashRouter` |
| Offline | Service Worker + `manifest.webmanifest` |
| Fonts | `Nunito` bundled locally (OFL). No runtime CDN calls |

## Conventions

- UI copy: PT-BR, exactly as in `image.png` / exported HTML.
- Code, identifiers, comments, configs: EN-US.
- Touch targets >= `44x44px`. Use `100dvh` and `env(safe-area-inset-*)`.
- Desktop preview: centered `390x844` frame; mobile: full screen.
- Respect `prefers-reduced-motion`.
- Screen IDs: `T2.A` workout complete, `T2.B` home, `T2.C` progress, `T2.C2` IPL sheet, `T2.D` area detail, `T3.A` tasks, `T3.B` tasks filtered (Memory), `T3.B2` Premium sheet, `T3.C` task detail, `T3.D` practice game.

## Design Tokens

| Token | Hex |
| :--- | :--- |
| `--color-cta` | `#C14009` |
| `--color-cta-soft` | `#FFF2E2` |
| `--color-memory` | `#6D27D8` |
| `--color-memory-mid` | `#A78BFA` |
| `--color-memory-low` | `#DDD6FE` |
| `--color-memory-soft` | `#F3E8FF` |
| `--color-success` | `#227C48` |
| `--color-success-soft` | `#E2F4E8` |
| `--color-attention` | `#19746D` |
| `--color-attention-soft` | `#E6F4F1` |
| `--color-info` | `#2F76D2` |
| `--color-info-soft` | `#EAF2FF` |
| `--color-error` | `#B91C1C` |
| `--color-error-soft` | `#FEE2E2` |
| `--color-bg` | `#F7F7F7` |
| `--color-surface` | `#FFFFFF` |
| `--color-text` | `#111111` |
| `--color-text-muted` | `#515151` |
| `--color-border` | `#E6E6E6` |
| `--color-premium-bg` | `#F2F2F2` |

Hex values are sampled from `image.png`; adjust in `tokens.css` only if visual audit shows divergence.

## Target Repository Layout

```text
AGENTS.md
IMPLEMENTATION_PLAN.md
docker-compose.yml
.github/workflows/deploy-pages.yml
prototype/
  Dockerfile  nginx.conf  .dockerignore
  index.html  package.json  tsconfig.json  vite.config.ts
  public/     (manifest.webmanifest, sw.js, icons/)
  scripts/    (extract-assets.py)
  src/        (main.tsx, App.tsx, styles/, assets/fonts/, data/, components/, screens/, utils/)
```

## Docker Rules

- Multi-stage build: `node:22-alpine` builder, `nginxinc/nginx-unprivileged:1.27-alpine` runtime, port `8080`, `USER nginx`.
- Compose service must keep: `read_only: true`, `tmpfs` (`/tmp`, `/var/cache/nginx`), `no-new-privileges:true`, healthcheck on `/healthz`, explicit CPU/memory limits and reservations.
- Dev profile (`prototype-dev`) runs as non-root `node` with resource limits.

## GitHub Pages Rules

- Site URL: `https://abmaelbt.github.io/INE5624-Engenharia-Usabilidade/`.
- Build with `VITE_BASE_PATH=/INE5624-Engenharia-Usabilidade/`; `vite.config.ts` reads `base` from it (default `/`).
- Manifest `start_url`/`scope` and Service Worker registration must use relative paths.
- Workflow permissions: `contents: read`, `pages: write`, `id-token: write`. One-time manual step: Settings -> Pages -> Source: GitHub Actions.

## Commands (once `prototype/` exists)

```bash
cd prototype
npm ci
npm run dev
npm run typecheck
npm run build
cd .. && docker compose up -d --build && curl -fsS http://localhost:8080/healthz
```

## Verification Before Finishing

- `npm run typecheck && npm run build` pass.
- `docker compose config` valid; container healthy.
- Visual audit at `390x844` against `image.png` (10 screens).
- Flows work end to end: T2 (`T2.B` -> `T2.C` -> `T2.C2` -> `T2.D`) and T3 (`T3.A` -> Memory filter -> `T3.B2` -> `T3.C` -> `T3.D`).

## Git

- Conventional Commits in PT-BR: `feat(escopo): descricao concisa`.
- Do not commit `node_modules`, `dist`, or `.env` files.
