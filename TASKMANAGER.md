# Applaa Builder — Implementation Task Manager

Agent Mode: Enabled (autonomous execution of planned tasks)

Branch: `feature/customization`

Objective: Add GPT‑5 support, then add Expo and Flutter mobile templates with high‑quality UI generation and minimal‑prompt workflows, avoiding hallucinations.

## Principles

- IPC handlers must throw `Error` for failures; renderer handles via TanStack Query.
- Deterministic scaffolds over free‑form codegen; validate outputs with static checks and tests.
- Keep model/provider/data in `settings`; `ModelPicker` controls `selectedModel`.
- Follow Dyad template guidelines to host templates on GitHub and register in Hub.
  - Docs: Add Template (Dyad) — https://www.dyad.sh/docs/templates/add-template

---

## Phase 1 — Add GPT‑5 model support

### Edits

- `src/ipc/shared/language_model_helpers.ts`
  - In `MODEL_OPTIONS.openai` add:
    - `{ name: "gpt-5", displayName: "GPT 5", description: "OpenAI's latest flagship model", maxOutputTokens: 32768, contextWindow: 1000000 }`
    - `{ name: "gpt-5-mini", displayName: "GPT 5 Mini", description: "Smaller, fast & cost‑effective", maxOutputTokens: 32768, contextWindow: 1000000 }` (optional)
- `src/ipc/utils/get_model_client.ts`
  - Prepend to `AUTO_MODELS`: `{ provider: "openai", name: "gpt-5" }`

### QA checklist

- Model visible in `ModelPicker`.
- Streaming works with `OPENAI_API_KEY`.
- Auto mode prefers GPT‑5, falls back cleanly.

### DoD

- Chats stream with GPT‑5; errors surfaced via Query; no token‑limit regressions.

---

## Phase 2 — Mobile templates in Hub (Expo + Flutter)

### Repos to create (public)

- Expo template (e.g., `applaa/expo-template`)
  - Base: Expo blank TS + `expo-router`, EAS config, `react-native-reanimated`, `react-native-gesture-handler`, icons/splash/fonts.
  - UI kits: `ahmedbna/ui`; optional Tailwind/nativewind.
  - Production: env handling, linting, unit tests.
  - Optional: align with create-expo-stack patterns — https://github.com/roninoss/create-expo-stack
  - Add `AI_RULES.md` (arch + editing rules).
- Flutter template (e.g., `applaa/flutter-template`)
  - Base: `flutter create`.
  - Packages: `go_router`, `riverpod`, `freezed`/`json_serializable` (+build_runner), `dio`, `intl`, `logger`.
  - UI: Material 3 theme + tokens; consider GetWidget/Fluent/Iconsax; Rive/Lottie optional.
  - Add `AI_RULES.md`.

### Register in Hub

- `src/shared/templates.ts` add:
  - `{ id: "expo", title: "Expo (React Native) Template", description: "...", imageUrl: "<cover>", githubUrl: "https://github.com/<org>/expo-template", isOfficial: true }`
  - `{ id: "flutter", title: "Flutter Template", description: "...", imageUrl: "<cover>", githubUrl: "https://github.com/<org>/flutter-template", isOfficial: true }`

### Creation flow

- Existing `createFromTemplate` clones by GitHub URL; no extra IPC needed.

### QA checklist

- New templates appear; “Create App” works.
- Expo: `npm i && npx expo start`; Flutter: `flutter pub get && flutter run` succeed.

### DoD

- Hub lists Expo/Flutter; projects open and run dev.

---

## Phase 2.1 — Mobile system prompts & library mapping (critical)

Purpose: Ensure the system prompt and AI rules have first-class knowledge of mobile stacks so minimal prompts reliably translate into deterministic edits.

### Deliverables

- Mobile-specific rules injected into the system prompt for the selected template (Expo or Flutter).
- Feature → Library mapping with install/config/playbook steps for each platform.
- Prompt templates that enumerate supported capabilities and how to wire them.

### Implementation

- `src/prompts/system_prompt.ts`:
  - Allow injecting per-template mobile rules (Expo/Flutter) from `AI_RULES.md` inside the template repo.
  - Add a mobile block outlining capability toggles and guardrails.
- Template repos (`AI_RULES.md`):
  - Include the mappings below and exact commands/config/plugin notes.

### Expo capability mapping

- **Offline (SQLite)**: `expo-sqlite` — docs: https://docs.expo.dev/versions/latest/sdk/sqlite/
- **Ads**: `react-native-admob-native-ads` (requires config plugin / EAS build) — repo: https://github.com/ammarahm-ed/react-native-admob-native-ads
- **Camera**: `expo-camera` — docs: https://docs.expo.dev/versions/latest/sdk/camera/
- **Sharing**: `expo-sharing` — docs: https://docs.expo.dev/versions/latest/sdk/sharing/
- **Contacts**: `expo-contacts` — docs: https://docs.expo.dev/versions/latest/sdk/contacts/
- **Payments**: `@stripe/stripe-react-native` (Expo guide) — docs: https://docs.expo.dev/versions/latest/sdk/stripe/

Notes:

- Use EAS Build for native modules and config plugins where required (Ads, Stripe). Validate by running `expo prebuild` in CI for template verification.

### Flutter capability mapping

- **Offline (SQLite)**: `sqflite`
- **Ads**: `google_mobile_ads`
- **Camera**: `camera`
- **Sharing**: `share_plus`
- **Contacts**: `flutter_contacts` (or `contacts_service` for simpler API)
- **Payments**: `flutter_stripe`

Notes:

- Centralize setup in `pubspec.yaml` + platform-specific config; include iOS/Android permission templates and proguard rules in the template repo.

### Prompt templates (renderer side)

- Add preset intents (e.g., "Enable Ads", "Enable Offline/SQLite", "Enable Camera", "Enable Sharing", "Enable Contacts", "Enable Stripe").
- Each preset expands to deterministic actions: add dependency, apply config plugin (Expo) or platform config (Flutter), create module service, example screen, and permissions.

### QA / DoD

- Minimal prompts like “Enable camera and share flow” generate the correct packages, permissions, and example usage on both Expo and Flutter templates.
- Builds succeed locally after generation without manual steps beyond the documented run commands.

---

## Phase 3 — Minimal‑prompt, high‑quality UI generation

### Expo

- Design generation: `superdesign-UI-AI` — https://github.com/rbachinas/superdesign-UI-AI
- Component lib: `ahmedbna/ui` — https://github.com/ahmedbna/ui
- Deterministic inserts: screens/tabs/stacks via constrained prompts → known component templates.

### Flutter

- Design tokens + Material 3 recipes; deterministic widget assembly.
- Guardrails: dart analyzer, widget + golden tests.

### Shared guardrails

- Only write under curated dirs (`app/` for Expo, `lib/features/**` for Flutter).
- Validate: typecheck, tests, lint, snapshot diffs.
- Auto‑retry with narrowed constraints; rollback if still failing.

### DoD

- Small prompts (e.g., “Login + Home with tabs”) compile and render first try; tests pass.

---

## Phase 4 — Builder UX

### Edits

- `src/pages/hub.tsx`: ensure new cards and badges (Official/Experimental).
- `src/components/CreateAppDialog.tsx`: template‑aware subtitle.
- Post‑create notices:
  - Expo: show run commands; Node/Xcode/Android Studio check hints.
  - Flutter: show SDK path and `flutter doctor` hint.

### Optional environment checks

- Detect Expo CLI / Flutter SDK and display non‑blocking warnings.

### DoD

- Clear guidance after create; no dead ends.

---

## Tracking Checklist

- [ ] Phase 1: GPT‑5 entries added and verified in picker
- [ ] Phase 1: Auto‑models order updated and tested
- [ ] Phase 2: Expo repo created with `AI_RULES.md` and README
- [ ] Phase 2: Flutter repo created with `AI_RULES.md` and README
- [ ] Phase 2: `src/shared/templates.ts` updated (Expo/Flutter)
- [ ] Phase 2: Create app from both templates verified
- [ ] Phase 3: Prompt templates + deterministic insert pipeline (Expo)
- [ ] Phase 3: Prompt templates + deterministic insert pipeline (Flutter)
- [ ] Phase 3: Static checks/tests wired and pass
- [ ] Phase 4: Hub UI & dialog updates
- [ ] Phase 4: Env checks (optional)

---

## Commands

Commit this file and push

- PowerShell:
  - `git add TASKMANAGER.md; git commit -m "chore: add TASKMANAGER plan (Agent Mode)"; git push -u applaa feature/customization`

After creating an Expo app

- `cd <app>; npm i; npx expo start`

After creating a Flutter app

- `cd <app>; flutter pub get; flutter run`
