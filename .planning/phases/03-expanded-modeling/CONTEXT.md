# Context: Phase 3 — Expanded Modeling

## Vision
The goal of this phase is to move beyond simple geometry and basic material properties into professional-grade rotor modeling. The user experience shifts from "drawing shapes" to "engineering a system" where physical supports (bearings) and aerodynamic/fluid components (seals) have realistic, speed-dependent behaviors.

## Core Interactions
- **Selection-Based Placement**: Users click a specific shaft segment in the editor or visualizer to focus it, then choose "Add Bearing" or "Add Seal" to attach the component to that location.
- **Component Management**: Components are managed via the Sidebar when their parent segment is selected, allowing for precise property entry.

## Essential Outcomes
- **Speed-Dependent Physics**: Support for stiffness ($k$) and damping ($c$) coefficients that vary with rotor RPM. This requires a data structure capable of storing lookup tables or functions for these values.
- **Point-Support Model**: Both bearings and seals are modeled as discrete point-supports at specific stations along the shaft.
- **Visual Distinction**: The visualizer must clearly distinguish between shaft segments, bearings, and seals using unique geometric markers or icons.

## Non-Goals for this Phase
- Full 3D FEA of bearing housings.
- Real-time fluid film pressure calculations (use coefficients instead).
- Distributed seal modeling (keeping it as point-supports for now).
