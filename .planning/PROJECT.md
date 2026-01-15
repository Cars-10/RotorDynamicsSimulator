# Rotor Dynamics Simulator

A professional, visually impressive rotor dynamics simulation tool that leverages AI for realistic data generation and provides advanced analysis capabilities.

## Vision

To provide engineers with an intuitive, browser-based environment for modeling, simulating, and analyzing complex rotor systems, using AI to bridge the gap between simple models and realistic FEA-derived data.

## Requirements

### Validated

- ✓ AI-powered simulation data generation (Gemini 2.5 Flash) — existing
- ✓ 2D/SVG Rotor visualization with mode shape overlays — existing
- ✓ Bearing orbit analysis (polar plots) and vibration scopes — existing
- ✓ Shaft segment editing with real-time (mock) physics updates — existing
- ✓ Basic analysis table and tutorial system — existing

### Active

- [ ] **UI Modernization & Polish:** Overhaul the rotor and mode shape visualizations for a more professional, "high-fidelity" feel.
- [ ] **Advanced Analysis Tools:** Implement Campbell diagrams, stability maps, and transient response visualizations.
- [ ] **Expanded Component Modeling:** Add support for diverse bearing types, seals, and varying material properties for shaft segments.
- [ ] **Data Portability:** Implement local export/import functionality for simulation configurations (JSON/CSV).
- [ ] **Codebase Refactoring:** Decouple `App.tsx` state management to improve maintainability and scalability.

### Out of Scope

- **Real-time Collaboration:** Multiple users editing the same rotor simultaneously is not planned for v1.
- **Complex 3D Rendering:** Migration to Three.js/WebGL is deferred; v1 will focus on high-quality 2D/SVG representations.
- **Backend Persistence:** No centralized database for saving rotors; focus is on local file-based portability.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Gemini-Powered FEA | Uses LLM as a "creative FEA engine" to generate complex datasets without local solver overhead. | — Validated |
| React/Vite/Tailwind | Modern, fast development stack with excellent component-based structure. | — Validated |
| 2D/SVG Visualization | Provides high performance and precise control over mathematical visualizations without 3D complexity. | — Validated |
| Hybrid Physics | Combines AI-generated baselines with local mock-physics for immediate interactive feedback. | — Validated |

---
*Last updated: 2026-01-15 after initialization*
