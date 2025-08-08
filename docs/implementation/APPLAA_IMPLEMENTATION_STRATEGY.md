# Applaa MVP Implementation Strategy

## 🎯 Overview

This document outlines the strategic implementation plan for Applaa MVP based on `taskmaster.md`, ensuring we can maintain compatibility with upstream Dyad updates while building Applaa-specific features.

## 🔄 Git Strategy for Dyad Updates

### Current Remote Configuration

```bash
applaa     https://github.com/rahulbachina/Applaa-AppBuilder.git (main Applaa repo)
origin     https://github.com/rbachinas/dyad-applaa.git (your fork)
upstream   https://github.com/dyad-sh/dyad.git (original Dyad - for updates)
```

### Branching Strategy

1. **main** - Stable Applaa version with all customizations
2. **applaa/feature-\*** - Feature branches for Applaa-specific development
3. **upstream-sync** - Branch for merging upstream Dyad updates
4. **release/v\*\*** - Release preparation branches

### Update Workflow

```bash
# To pull Dyad updates:
git checkout upstream-sync
git pull upstream main
git checkout main
git merge upstream-sync
# Resolve conflicts, test, then push
```

## 📋 8-Day Implementation Plan

### Day 1: Repository Bootstrap & Rebrand Foundation ✅ (Partially Complete)

**Status**: Logo and branding partially done, need CLI and structure work

**Completed**:

- ✅ Logo replacement in desktop UI
- ✅ "Applaa" branding in title bar
- ✅ Git upstream configuration

**Remaining Tasks**:

- [ ] CLI rename from `dyad` to `applaa`
- [ ] Create `LICENSES/` folder with Dyad attribution
- [ ] Prepare mono-repo structure for `packages/engine-expo` and `packages/engine-cap`
- [ ] Update package.json and build configs

### Day 2-3: Expo Template Library Creation

**Goal**: 10 Expo templates with proper structure

**Tasks**:

- [ ] Generate templates using `npx create-expo-app -t tabs`
- [ ] Create template variants: tabs, blank, navigation, typescript, etc.
- [ ] Add `template.json` metadata for each
- [ ] Create `AI_RULES.md` for each template
- [ ] Capture iPhone mock previews (1242×2688)
- [ ] Organize in `templates/expo-*` structure
- [ ] Preserve existing Next.js templates

### Day 4: Runtime Flag & CLI Integration

**Goal**: Support `--runtime expo|cap` in CLI

**Tasks**:

- [ ] Modify CLI to accept runtime parameter
- [ ] Implement post-scaffold hooks:
  - `expo`: `npx expo prebuild --no-install`
  - `cap`: `npx cap init && npx cap sync`
- [ ] Add runtime detection and validation
- [ ] Create comprehensive unit tests
- [ ] Update CLI help and documentation

### Day 5: Remote Workspace Pod Infrastructure

**Goal**: Docker-based workspace server

**Tasks**:

- [ ] Create Dockerfile with Node 20, PNPM, Expo CLI, Capacitor CLI, Vite
- [ ] Build `packages/workspace-server` with Express + WebSocket
- [ ] Implement routes: `POST /create`, `POST /exec`, `WS /logs`
- [ ] Add preview execution:
  - Expo: `expo start --tunnel --dev-client` → QR code
  - Capacitor: `vite dev --host` → URL
- [ ] Set up K8s/Docker Compose deployment

### Day 6: Feature Injection System

**Goal**: Modular feature injection for both runtimes

**Tasks**:

- [ ] Create `modules/expo/{admob,push,sqlite,auth}`
- [ ] Create `modules/cap/{admob,push,sqlite,auth}`
- [ ] Build `scripts/inject-feature.ts` with runtime detection
- [ ] Implement injection logic:
  - Expo: Modify `app.json` plugins array
  - Capacitor: Update `capacitor.config.ts` plugins
- [ ] Add UI checkboxes in project wizard
- [ ] Test feature combinations

### Day 7: Preview Pane & Snack Integration

**Goal**: Seamless preview experience

**Tasks**:

- [ ] Update `PreviewPane.tsx` component:
  - QR code display for Expo
  - iframe for Capacitor web preview
- [ ] Implement "Try in Browser (Snack)" functionality
- [ ] Add rate limiting (5 Snack uploads/day/user) via Redis
- [ ] Ensure responsive design for different preview types

### Day 8: Billing, QA & Deployment

**Goal**: Production-ready MVP

**Tasks**:

- [ ] Integrate Stripe metered billing
- [ ] Implement free tier limits (Capacitor only, 2 builds/day)
- [ ] Pro tier unlocks Expo runtime
- [ ] Run comprehensive E2E tests (Playwright)
- [ ] Generate OSS license report with `license-checker`
- [ ] Add "About" screen with license information
- [ ] Deploy alpha to Vercel + DigitalOcean

## 🏗️ Architecture Considerations

### File Structure Changes

```
packages/
├── engine-expo/          # Expo-specific build engine
├── engine-cap/           # Capacitor-specific build engine
├── workspace-server/     # Remote workspace management
└── cli/                  # Enhanced CLI with runtime support

templates/
├── expo-tabs/           # Expo tab navigation template
├── expo-blank/          # Expo blank template
├── expo-navigation/     # Expo stack navigation
└── ...                  # 7 more Expo templates

modules/
├── expo/
│   ├── admob/
│   ├── push/
│   ├── sqlite/
│   └── auth/
└── cap/
    ├── admob/
    ├── push/
    ├── sqlite/
    └── auth/
```

### Key Technical Decisions

1. **Runtime Detection**: Use CLI flags and project structure analysis
2. **Feature Injection**: Template-based file modification with validation
3. **Preview Strategy**:
   - Expo: Tunnel URLs with QR codes for device testing
   - Capacitor: Local Vite dev server for web preview
4. **Billing Integration**: Stripe metered billing with usage tracking
5. **Template Management**: JSON metadata with AI rules and preview images

## 🔧 Development Environment Setup

### Prerequisites

- Node 20+
- PNPM 8+
- Docker ≥ 24
- Expo CLI ≥ 7.6 (SDK 53)
- Capacitor CLI ≥ 5
- Git (for native Git operations)

### Environment Variables

```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
REDIS_URL=redis://localhost:6379
WORKSPACE_SERVER_URL=http://localhost:3001
```

## 🚀 Next Steps

1. **Immediate**: Complete Day 1 remaining tasks (CLI rename, licenses)
2. **Week 1**: Focus on template creation and runtime integration
3. **Week 2**: Build workspace infrastructure and feature injection
4. **Testing**: Continuous E2E testing throughout development
5. **Deployment**: Alpha release with limited user testing

## 📝 Notes

- Maintain backward compatibility with existing Dyad features
- Ensure all Applaa additions are clearly documented
- Regular upstream sync to stay current with Dyad improvements
- Focus on MVP features first, defer advanced features to Phase 2

---

**Last Updated**: $(date)
**Status**: Planning Phase → Implementation Ready
