# Stack

## Core
- **Language:** TypeScript 5.8
- **Framework:** React 19
- **Build Tool:** Vite 6.2
- **Runtime:** Browser (ESNext target)

## Dependencies
- **UI Library:** React / React DOM
- **AI SDK:** `@google/genai` (Google GenAI SDK)
- **Styling:** Tailwind CSS (via CDN in `index.html`)

## Environment
- **Node:** Required for build/dev server (types suggest Node 22+)
- **Package Manager:** NPM (implied by `package-lock.json`)

## Configuration
- **Vite:** `vite.config.ts` configured with `react()` plugin and `@` alias.
- **TypeScript:** `tsconfig.json` set to `ES2022`, `bundler` resolution, strict mode implied.
