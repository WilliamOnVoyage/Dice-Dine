# Google Authentication Setup Guide

This guide explains how to configure Google OAuth for **Dice-Dine** for both local development and production.

## 1. Create Google Cloud Project

1.  Go to the [Google Cloud Console](https://console.cloud.google.com/).
2.  Create a new project (e.g., "Dice-Dine-Auth").
3.  Navigate to **APIs & Services** > **Credentials**.
4.  Click **Create Credentials** > **OAuth client ID**.
5.  If prompted, configure the **OAuth consent screen**:
    -   **User Type**: External (unless you are in an org).
    -   **App Name**: Dice-Dine.
    -   **User Support Email**: Your email.
    -   **Developer Contact Info**: Your email.
    -   Click **Save and Continue**.

## 2. Configure OAuth Client ID

Select **Web application** as the Application type.

### For Local Development
Add the following under **Authorized redirect URIs**:
-   `http://localhost:3000/api/auth/callback/google`

### For Production (Remote Hosting)
Add the following under **Authorized redirect URIs**:
-   `https://www.dice-dine.com/api/auth/callback/google`

*(Note: You can add both URIs to the same Client ID, or create separate Client IDs for clearer separation).*

### Essential Information
Once created, you will get two important strings:
-   **Client ID**
-   **Client Secret**

## 3. Configuration in Project

### Local Development (`.env.local`)
Open (or create) the `.env.local` file in the root of your project and add the credentials:

```bash
GOOGLE_CLIENT_ID=your-client-id-here
GOOGLE_CLIENT_SECRET=your-client-secret-here
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=changeme_to_random_string
```

### Production Environment
When deploying (e.g., to Vercel, AWS, or Railway), you must set these as **Environment Variables** in your hosting provider's dashboard:

-   `GOOGLE_CLIENT_ID`: *[Your Production Client ID]*
-   `GOOGLE_CLIENT_SECRET`: *[Your Production Client Secret]*
-   `NEXTAUTH_URL`: `https://www.dice-dine.com`
-   `NEXTAUTH_SECRET`: *[A strong, random string]*

## 4. Testing

### Local
1.  Run `npm run dev`.
2.  Click "Sign in with Google".
3.  Confirm you are redirected to Google, sign in, and return to the dashboard.

### Remote
1.  Deploy your changes.
2.  Ensure your `NEXTAUTH_URL` matches your domain strictly.
3.  Click "Sign in with Google".
