# Structure

## Directory Layout

```
/
├── components/          # React UI components
│   ├── AnalysisTable.tsx
│   ├── BearingAnalyst.tsx
│   ├── Controls.tsx
│   ├── RotorVisualizer.tsx
│   ├── ShaftEditor.tsx
│   └── Tutorial.tsx
├── services/            # API and Business Logic
│   └── geminiService.ts
├── .gemini/             # Gemini CLI Configuration
├── App.tsx              # Main Application Component
├── index.tsx            # Entry Point
├── index.html           # HTML Template (Tailwind CDN)
├── types.ts             # TypeScript Interfaces (SimulationData, ModeShape, etc.)
├── constants.ts         # Default Data / Config
├── vite.config.ts       # Vite Configuration
├── tsconfig.json        # TypeScript Configuration
└── package.json         # Dependencies
```

## Key Files
- `App.tsx`: Main application logic and layout.
- `services/geminiService.ts`: Interface to Google Gemini.
- `types.ts`: Domain models for Rotor/Shaft/Modes.
