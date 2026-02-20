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