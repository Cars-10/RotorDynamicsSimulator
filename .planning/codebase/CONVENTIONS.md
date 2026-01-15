# Conventions

## Coding Style
- **Language:** TypeScript.
- **Component Style:** Functional Components (`React.FC`).
- **Hooks:** Extensive use of `useState`, `useEffect`, `useCallback`, `useMemo`.
- **Styling:** Tailwind CSS utility classes (e.g., `flex`, `bg-slate-950`).
- **Imports:** Absolute imports configured (alias `@` mapped to root), but relative imports used in practice.

## Naming
- **Files:** PascalCase for Components (`BearingAnalyst.tsx`), camelCase for helpers/services (`geminiService.ts`).
- **Variables:** camelCase (`operatingRpm`, `activeModeIndex`).
- **Types:** PascalCase (`SimulationData`, `ShaftSegment`).

## Patterns
- **Prop Types:** Defined interfaces for component props.
- **Async/Await:** Used for API calls.
- **Safe Access:** Optional chaining (`?.`) and type guards used.
