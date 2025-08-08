// Applaa Branding Configuration
// This file controls whether to use Applaa or Dyad branding throughout the app

export const BRANDING_CONFIG = {
  // App name and branding
  APP_NAME: "Applaa",
  LEGACY_APP_NAME: "Dyad",

  // Tag prefixes for AI commands
  TAG_PREFIX: "applaa",
  LEGACY_TAG_PREFIX: "dyad",

  // Whether to support legacy Dyad tags
  SUPPORT_LEGACY_TAGS: true,

  // GitHub OAuth Configuration
  GITHUB: {
    // Applaa GitHub App Client ID (you'll need to create this)
    CLIENT_ID: "YOUR_APPLAA_GITHUB_APP_CLIENT_ID",
    // Legacy Dyad GitHub App Client ID (fallback)
    LEGACY_CLIENT_ID: "Ov23liWV2HdC0RBLecWx",
    // OAuth scopes needed
    SCOPES: "repo,user,workflow",
  },

  // OAuth URLs for integrations
  OAUTH_URLS: {
    NEON: "https://oauth.applaa.com/api/integrations/neon",
    SUPABASE: "https://supabase-oauth.applaa.com/api/connect-supabase",
    // Legacy URLs (fallback)
    LEGACY_NEON: "https://oauth.dyad.sh/api/integrations/neon",
    LEGACY_SUPABASE: "https://supabase-oauth.dyad.sh/api/connect-supabase",
  },

  // UI text replacements
  UI_REPLACEMENTS: {
    Dyad: "Applaa",
    dyad: "applaa",
  } as const,
} as const;

// Helper functions
export function getTagName(tagType: string): string {
  return `${BRANDING_CONFIG.TAG_PREFIX}-${tagType}`;
}

export function getLegacyTagName(tagType: string): string {
  return `${BRANDING_CONFIG.LEGACY_TAG_PREFIX}-${tagType}`;
}

export function getAllTagNames(tagType: string): string[] {
  const tags = [getTagName(tagType)];
  if (BRANDING_CONFIG.SUPPORT_LEGACY_TAGS) {
    tags.push(getLegacyTagName(tagType));
  }
  return tags;
}
