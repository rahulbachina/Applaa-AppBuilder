# Applaa MVP — Technical Task Break‑Down (`taskmaster.md`)

> **Goal:** Ship the lean MVP in **8 dev‑days** (single engineer) allowing users to pick
> _React/Next_ (web), _Expo (native)_ or _Capacitor (web‑view)_ templates, preview via
> QR / browser, inject 4 core features, and build artefacts.

---

## 📅 Day‑by‑Day Plan

|  Day      |  Epic                                                                                 |  Concrete Tasks                             |
| --------- | ------------------------------------------------------------------------------------- | ------------------------------------------- |
|  Day 1    |  **Repo Bootstrap & Rebrand**                                                         |
|           |  1.1 Fork `dyad-sh/dyad` → `applaa/applaa` (gh cli).                                  |
|           |  1.2 Run `scripts/rename-to-applaa.sh` → CLI bin **`applaa`**.                        |
|           |  1.3 Add root `LICENSES/` folder & copy Dyad `LICENSE`, `NOTICE`.                     |
|           |  1.4 Replace logos/Banner in desktop UI (`apps/desktop/public/*`).                    |
|           |  1.5 Create mono‑repo scopes: `packages/engine-expo`, `packages/engine-cap`.          |
|           |  1.6 Verify `pnpm i && pnpm dev` still runs (web UI).                                 |
|  Day 2–3  |  **Expo Template Library (10 items)**                                                 |
|           |  2.1 Generate starter via `npx create-expo-app -t tabs`. Repeat for all 10.           |
|           |  2.2 Add `template.json` & `AI_RULES.md` per template (see list).                     |
|           |  2.3 Capture iPhone‐mock `preview.png` (1242×2688).                                   |
|           |  2.4 Push to `templates/expo-*`.                                                      |
|           |  2.5 Keep Dyad’s original 3 Next.js templates intact.                                 |
|  Day 4    |  **Runtime Flag & CLI Hooks**                                                         |
|           |  4.1 Add `--runtime expo                                                              | cap`option to`packages/cli/src/create.ts`.  |
|           |  4.2 Implement post‑scaffold script:                                                  |
|           |       • `expo` → `npx expo prebuild --no-install`                                     |
|           |       • `cap` → `npx cap init && npx cap sync`                                        |
|           |  4.3 Unit‑test both paths with `jest`.                                                |
|  Day 5    |  **Remote Workspace Pod (Docker)**                                                    |
|           |  5.1 Author `Dockerfile` with Node 20, PNPM, Expo CLI, Capacitor CLI, Vite.           |
|           |  5.2 Write `packages/workspace-server` (Express + WS).                                |
|           |       Routes: `POST /create`, `POST /exec`, WS `/logs`.                               |
|           |  5.3 `exec preview`:                                                                  |
|           |       • expo: spawn `expo start --tunnel --dev-client`. Parse tunnel URL → WS `{qr}`. |
|           |       • cap: spawn `vite dev --host`, emit URL `{url}`.                               |
|           |  5.4 Deploy pod spec to K8s minikube (for dev).                                       |
|  Day 6    |  **Feature Injectors (4 core)**                                                       |
|           |  6.1 Create `modules/expo/{admob,push,sqlite,auth}`.                                  |
|           |  6.2 Create `modules/cap/{admob,push,sqlite,auth}`.                                   |
|           |  6.3 Implement `scripts/inject-feature.ts` picking runtime folder & patching:         |
|           |       • Expo → `app.json` plugins array                                               |
|           |       • Capacitor → `capacitor.config.ts` plugins block                               |
|           |  6.4 Add checkbox UI in wizard → sends feature list to CLI.                           |
|  Day 7    |  **Preview Pane & Snack Share**                                                       |
|           |  7.1 Update React component `PreviewPane.tsx`:                                        |
|           |       • If `qr` present show `<img>`.                                                 |
|           |       • Else show `<iframe src={url}>`.                                               |
|           |  7.2 Add optional “Try in Browser (Snack)” button → call `expo-snackify` endpoint.    |
|           |  7.3 Throttle Snack uploads (5/day/user) via Redis.                                   |
|  Day 8    |  **Stripe Limits + QA + Docs**                                                        |
|           |  8.1 Integrate Stripe metered-billing: Free tier runtime = cap only, 2 builds/day.    |
|           |  8.2 Run E2E (Playwright): create Expo template, inject Push, preview QR.             |
|           |  8.3 Generate OSS licence report (`license-checker`). Include in **About** screen.    |
|           |  8.4 Publish alpha to Vercel + DigitalOcean builder node.                             |

---

## 2. Back‑log / Phase‑2 tickets (not MVP‑blocking)

1. **Add Kilo CLI agents** for multi‑file refactor.
2. Integrate `create-expo-stack` as "Advanced Stack" generator.
3. Sandpack in‑browser web preview (optional) to replace Vite server.
4. OTA publishing via EAS Update.
5. Cloudflare Tunnel vanity URLs for Expo preview.
6. Tamagui styling option (Pro tier).
7. Analytics dashboard (PostHog or Amplitude) for template usage.

---

## 3. Environment / tooling prerequisites

- **Node 20**, **PNPM 8**
- Docker ≥ 24 (buildx)
- Expo CLI ≥ 7.6 (matches SDK 53)
- Capacitor CLI ≥ 5
- Stripe test keys
- K8s (or Docker Compose) for workspace‑server pods

---

## 4. Definition of Done (MVP)

- User can **sign up, pick template, runtime, features, preview, download build** with no manual terminal steps.
- Expo QR scans successfully on real device (Android + iOS simulator).
- Capacitor Vite preview opens in browser.
- No Expo warnings, ESLint passes, CI green.
- Free tier limits enforced; Stripe Pro tier unlocks native runtime.
- OSS licences page lists Dyad, Expo, Capacitor, snackify.

---

> **Maintainers:** update this file whenever scope or timelines change.
