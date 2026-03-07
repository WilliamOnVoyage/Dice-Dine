# PORTFOLIO CONTRACT COMPLIANCE

This repository feeds into a central portfolio showcase. The file `PORTFOLIO.json` in the root directory controls the narrative.

## 1. THE CONTRACT
The `PORTFOLIO.json` schema:
```json
{
  "tagline": "String. One sentence summary.",
  "publicDescription": "String. Markdown supported. Detailed explanation.",
  "demoUrl": "String. URL to a video or demo.",
  "liveUrl": "String. URL to the deployed application.",
  "thumbnail": "String. Path to image (e.g. /images/demo.png)."
}
```

## 2. YOUR RESPONSIBILITIES
If you are an AI assistant editing this code:

1.  **DETECT**: Check if `PORTFOLIO.json` exists.
2.  **MAINTAIN NARRATIVE**: If you make significant architectural changes, propose an update to `publicDescription` to reflect the new capabilities.
3.  **PROTECT PRIVACY**: NEVER add secrets, internal IPs, or PII.

# Development

This project is a Next.js application.

## Prerequisites

- Node.js 18+
- npm

## Installation

```bash
npm install
```

## Running Locally

1. Create a `.env.local` file with required keys:
   - `OPENAI_API_KEY`
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `NEXTAUTH_SECRET`
   
2. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Testing

Run `npm run lint` to check for linting errors.
Run `npm run build` to verify production build.