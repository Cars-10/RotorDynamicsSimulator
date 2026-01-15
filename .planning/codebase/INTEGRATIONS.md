# Integrations

## External Services

### Google Gemini API
- **Purpose:** Generates realistic rotor dynamics simulation data (geometry, modes, frequencies).
- **Library:** `@google/genai` SDK.
- **Model:** `gemini-2.5-flash`.
- **Auth:** `process.env.API_KEY` (injected via Vite define).
- **Prompting:** Uses system instructions with JSON schema enforcement (`responseMimeType: "application/json"`).

## CDNs
- **Tailwind CSS:** Loaded via CDN in `index.html` (`cdn.tailwindcss.com`).
- **Import Maps:** `index.html` contains an import map for `aistudiocdn.com` (likely for specific deployment targets).
