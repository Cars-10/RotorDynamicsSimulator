# Testing

## Status
- **Current State:** No automated tests found.
- **Frameworks:** None configured (no Jest, Vitest, or Playwright).
- **Coverage:** 0%.

## Gaps
- No unit tests for `geminiService` (API handling).
- No component tests for visualization logic.
- No end-to-end tests for critical flows (Generate -> Visualize).

## Recommendations
- Install **Vitest** for unit/integration testing.
- Install **React Testing Library** for component testing.
- Create `__tests__` directories or co-locate tests (`*.test.tsx`).
