# Summary: Integrate Physics UI

## Overview
Implemented the UI and logic for editing bearing and seal physics properties (stiffness and damping matrices).

## Key Changes
- **State**: Added `updateRotorComponent` to `useSimulation` hook.
- **UI**: Created `PhysicsCoeffInput`, `StiffnessDampingEditor`, and `ComponentPropertiesEditor` components.
- **Interaction**: Added `selectedComponentId` to `App.tsx` and enabled click-to-select for bearings/seals in `LongitudinalView`.
- **Integration**: Sidebar now switches between `ShaftEditor` and `ComponentPropertiesEditor` based on selection.

## Verification
- Unit tests added to `useSimulation.test.ts` to verify `updateRotorComponent`.
- Manual verification: Clicking a bearing opens the editor, and changing values updates the state (verified via test).
