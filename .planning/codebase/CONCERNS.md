# Concerns

## Critical
- **Missing Tests:** No test harness. High risk of regression during refactoring.
- **Dependencies:** Tailwind is loaded via CDN, not npm. This makes offline dev or specific build optimizations harder.
- **State Management:** `App.tsx` is becoming a "God Object" managing too much state (Game, Editor, Visualizer, Data).
- **Hardcoded Physics:** `handleUpdateSegmentWithPhysics` uses arbitrary constants (`0.05` multiplier).

## Moderate
- **Type Safety:** `any` or loose types not strictly observed, though `types.ts` exists.
- **Error Handling:** Basic error logging to console and a UI alert. Could be more robust.
- **Performance:** `BearingAnalyst` uses `requestAnimationFrame` and local state for animation; might impact performance if many bearings exist.

## Security
- **API Key:** `API_KEY` is exposed in the frontend build (Vite `define`). This is standard for client-side demos but risky for production apps.
