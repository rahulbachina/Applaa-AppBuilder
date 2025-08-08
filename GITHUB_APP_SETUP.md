# Applaa GitHub App Setup Guide

This guide explains how to create and configure a GitHub App for Applaa to replace the existing Dyad GitHub App integration.

## Why Create a New GitHub App?

Currently, Applaa uses the Dyad GitHub App (`Ov23liWV2HdC0RBLecWx`) for GitHub integration. To fully rebrand to Applaa, you need to create your own GitHub App.

## Step 1: Create a GitHub App

1. Go to [GitHub Developer Settings](https://github.com/settings/apps)
2. Click **"New GitHub App"**
3. Fill in the following details:

### Basic Information

- **GitHub App name**: `Applaa App Builder`
- **Description**: `AI-powered app builder that creates, deploys, and manages applications with GitHub integration`
- **Homepage URL**: `https://applaa.com` (or your domain)

### Callback URLs

- **User authorization callback URL**: `http://localhost:3000/auth/github/callback`
- **Device flow callback URL**: Leave empty (not needed for device flow)

### Webhook

- **Webhook URL**: Leave empty for now
- **Webhook secret**: Leave empty for now
- Uncheck **"Active"** (we don't need webhooks initially)

### Permissions

#### Repository permissions:

- **Contents**: Read and write
- **Metadata**: Read
- **Pull requests**: Read and write
- **Issues**: Read and write
- **Actions**: Read and write

#### Account permissions:

- **Email addresses**: Read
- **Profile**: Read

### Where can this GitHub App be installed?

- Select **"Any account"** (allows installation on any GitHub account/organization)

## Step 2: Configure the App

After creating the app:

1. **Note the Client ID**: You'll see it on the app's settings page
2. **Generate a Client Secret**: Click "Generate a new client secret"
3. **Enable Device Flow**:
   - Scroll down to "Device flow"
   - Check **"Enable Device Flow"**

## Step 3: Update Applaa Configuration

1. Copy `.env.example` to `.env`:

   ```bash
   cp .env.example .env
   ```

2. Update the `.env` file with your GitHub App Client ID:
   ```env
   GITHUB_CLIENT_ID=your_new_applaa_github_app_client_id
   ```

## Step 4: Test the Integration

1. Start Applaa in development mode
2. Go to Settings → Connect to GitHub
3. You should see the device flow with your new GitHub App

## Step 5: Update OAuth URLs (Optional)

If you want to host your own OAuth service (instead of using Dyad's), you'll need to:

1. Set up OAuth endpoints for Neon and Supabase integrations
2. Update the URLs in your `.env` file:
   ```env
   APPLAA_NEON_OAUTH_URL=https://oauth.applaa.com/api/integrations/neon
   APPLAA_SUPABASE_OAUTH_URL=https://supabase-oauth.applaa.com/api/connect-supabase
   ```

## Troubleshooting

### "Invalid Client ID" Error

- Double-check that your `GITHUB_CLIENT_ID` in `.env` matches the Client ID from your GitHub App
- Ensure the `.env` file is in the project root
- Restart the application after changing environment variables

### Device Flow Not Working

- Ensure "Enable Device Flow" is checked in your GitHub App settings
- Verify the Client ID is correct
- Check that the app has the required permissions

### Permission Errors

- Review the repository and account permissions in your GitHub App settings
- Ensure the app is installed on the repositories you want to access

## Security Notes

- Never commit your `.env` file to version control
- Keep your Client Secret secure
- Regularly rotate your Client Secret if needed
- Consider using different GitHub Apps for development and production

## Migration from Dyad

The current implementation includes backward compatibility:

- If no `GITHUB_CLIENT_ID` is set, it falls back to the Dyad app
- This allows for gradual migration without breaking existing installations
- Once you've set up your Applaa GitHub App, all new connections will use it

## Next Steps

After setting up the GitHub App:

1. Test the GitHub integration thoroughly
2. Update any documentation that references the old Dyad GitHub App
3. Consider setting up separate apps for development and production environments
4. Plan the migration strategy for existing users
