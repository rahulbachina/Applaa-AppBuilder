# Applaa Merge Strategy

This document outlines how to handle updates from the original Dyad repository while preserving our Applaa customizations.

## Our Applaa-Specific Changes

### Files We've Modified:

1. **`src/prompts/system_prompt.ts`** - Updated tag references from `<dyad-*>` to `<applaa-*>`
2. **`src/prompts/summarize_chat_system_prompt.ts`** - Updated chat summary tag
3. **Import statements in multiple files** - Changed to use `applaa_tag_parser`

### Files We've Added:

1. **`src/ipc/utils/applaa_tag_parser.ts`** - New tag parser with `<applaa-*>` support + legacy compatibility

## Merge Strategy for Dyad Updates

### Setup (One-time):

```bash
# Add original Dyad repo as upstream
git remote add upstream https://github.com/dyad-sh/dyad.git
git fetch upstream
```

### Regular Update Process:

```bash
# 1. Fetch latest from Dyad
git fetch upstream main

# 2. Create a merge branch
git checkout -b merge-dyad-updates

# 3. Merge Dyad changes
git merge upstream/main

# 4. Resolve conflicts (see below)
# 5. Test thoroughly
# 6. Merge back to main
```

## Conflict Resolution Guidelines

### For `system_prompt.ts`:

- **Keep our Applaa tags** in the prompt text
- **Accept Dyad's functional changes** (new features, bug fixes)
- **Manual merge required** - this file will likely conflict

### For other core files:

- **Accept Dyad changes** unless they break our tag system
- **Our `applaa_tag_parser.ts` should handle compatibility**

### For new Dyad features:

- **Accept all new files** from Dyad
- **Update our imports** if needed to use `applaa_tag_parser`

## Testing After Merge:

1. Verify `<applaa-*>` tags still work in the AI prompts
2. Verify `<dyad-*>` tags still work (legacy compatibility)
3. Test all core functionality
4. Run existing tests

## Emergency Rollback:

If merge causes issues:

```bash
git reset --hard HEAD~1  # Rollback the merge
```

## Files to Watch for Conflicts:

- `src/prompts/system_prompt.ts` (high probability)
- `src/prompts/summarize_chat_system_prompt.ts` (medium probability)
- Any files that import tag parsers (low probability - our compatibility layer should handle this)
