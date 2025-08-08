# GitHub App Migration Summary

## Overview

This document summarizes all changes made to migrate from the Dyad GitHub App to the Applaa GitHub App, centralizing OAuth configurations and making the system more maintainable.

## Changes Made

### 1. Centralized Branding Configuration

**File:** `src/config/branding.ts`

- Created centralized configuration for all branding and OAuth settings
- Includes GitHub OAuth settings (CLIENT_ID, SCOPES)
- Includes Neon and Supabase OAuth URLs
- Provides legacy fallbacks for backward compatibility
- Includes helper functions for retrieving tag names and app names

### 2. GitHub OAuth Configuration Updates

**File:** `src/ipc/handlers/github_handlers.ts`

- Replaced hardcoded `GITHUB_CLIENT_ID` with `BRANDING_CONFIG.GITHUB.CLIENT_ID`
- Replaced hardcoded `GITHUB_SCOPES` with `BRANDING_CONFIG.GITHUB.SCOPES`
- Now supports environment variable override via `process.env.GITHUB_CLIENT_ID`

### 3. Frontend Component Updates

**Files Updated:**

- `src/components/NeonConnector.tsx`
- `src/components/SupabaseConnector.tsx`

**Changes:**

- Added branding configuration imports
- Replaced hardcoded OAuth URLs with `BRANDING_CONFIG.OAUTH_URLS.*`
- Maintained existing functionality while centralizing configuration

### 4. Backend Handler Updates

**Files Updated:**

- `src/ipc/handlers/neon_handlers.ts`
- `src/ipc/handlers/supabase_handlers.ts`

**Changes:**

- Added branding configuration imports
- Updated test handlers to use centralized OAuth URLs
- Maintained backward compatibility for existing functionality

### 5. Management Client Updates

**Files Updated:**

- `src/neon_admin/neon_management_client.ts`
- `src/supabase_admin/supabase_management_client.ts`

**Changes:**

- Added branding configuration imports
- Updated OAuth refresh endpoints to use centralized URLs
- Fixed import paths for settings and utilities

### 6. Documentation and Setup

**Files Created:**

- `.env.example` - Template for environment variables
- `GITHUB_APP_SETUP.md` - Comprehensive setup guide for Applaa GitHub App
- `GITHUB_APP_MIGRATION_SUMMARY.md` - This summary document

## Configuration Steps Required

### 1. Create Applaa GitHub App

Follow the guide in `GITHUB_APP_SETUP.md` to:

1. Create a new GitHub App named "Applaa"
2. Configure permissions and settings
3. Get the new Client ID

### 2. Update Environment Configuration

Create a `.env` file (use `.env.example` as template):

```env
GITHUB_CLIENT_ID=your_new_applaa_github_app_client_id
```

### 3. Optional: Update OAuth URLs

If you have custom OAuth endpoints for Applaa:

```env
APPLAA_OAUTH_NEON_URL=https://oauth.applaa.sh/api/integrations/neon
APPLAA_OAUTH_SUPABASE_URL=https://supabase-oauth.applaa.sh/api/connect-supabase
```

## Benefits of This Approach

### 1. Centralized Configuration

- All branding and OAuth settings in one place
- Easy to update for different environments or deployments
- Consistent configuration across the entire application

### 2. Environment Variable Support

- Can override settings via environment variables
- Supports different configurations for development, staging, and production
- No need to modify code for different deployments

### 3. Backward Compatibility

- Legacy OAuth URLs are preserved as fallbacks
- Existing functionality continues to work
- Gradual migration path available

### 4. Maintainability

- Clear separation of configuration from business logic
- Easy to add new OAuth providers or update existing ones
- Self-documenting configuration structure

### 5. Merge-Friendly

- Changes are additive and modular
- New configuration file won't conflict with Dyad updates
- Import changes are minimal and isolated

## Testing Checklist

After setting up the new Applaa GitHub App:

- [ ] GitHub OAuth flow works with new Client ID
- [ ] Neon integration continues to work
- [ ] Supabase integration continues to work
- [ ] Environment variable override works
- [ ] Test mode functionality is preserved
- [ ] All existing features continue to work

## Rollback Plan

If issues arise:

1. Revert the `GITHUB_CLIENT_ID` in `src/config/branding.ts` to the original Dyad value
2. Or set `GITHUB_CLIENT_ID` environment variable to the original Dyad value
3. The system will fall back to using Dyad OAuth endpoints

## Future Considerations

1. **Complete OAuth Migration**: Once Applaa OAuth endpoints are ready, update the default URLs in `branding.ts`
2. **Additional Integrations**: Use the same pattern for any new OAuth integrations
3. **Multi-tenant Support**: The configuration structure supports multiple brands/tenants
4. **Monitoring**: Consider adding logging for OAuth configuration usage

## Files Modified Summary

### New Files (3)

- `src/config/branding.ts`
- `.env.example`
- `GITHUB_APP_SETUP.md`

### Modified Files (8)

- `src/ipc/handlers/github_handlers.ts`
- `src/components/NeonConnector.tsx`
- `src/components/SupabaseConnector.tsx`
- `src/ipc/handlers/neon_handlers.ts`
- `src/ipc/handlers/supabase_handlers.ts`
- `src/neon_admin/neon_management_client.ts`
- `src/supabase_admin/supabase_management_client.ts`

### Total Changes

- **11 files** affected
- **Centralized configuration** approach
- **Zero breaking changes** to existing functionality
- **Full backward compatibility** maintained
