# Research: Expanded Modeling

## 1. Introduction
Phase 3 expands the Rotor Dynamics Simulator from a geometric sketchpad to a physically meaningful engineering tool. The core challenges are representing speed-dependent properties (stiffness/damping), visualizing non-geometric components (bearings/seals), and managing a library of standard materials.

## 2. Architecture & Data Structures

### 2.1. Speed-Dependent Coefficients
Bearings and seals in rotor dynamics are characterized by $4 \times 4$ stiffness ($K$) and damping ($C$) matrices that vary with rotor speed ($\Omega$).

**Proposed Schema (`src/types.ts`):**

```typescript
// Represents a single operating point in the lookup table
export interface CoefficientDataPoint {
  rpm: number;
  kxx: number; kxy: number; kyx: number; kyy: number; // Stiffness (N/m)
  cxx: number; cxy: number; cyx: number; cyy: number; // Damping (N*s/m)
}

export interface Bearing {
  id: string;
  name: string;
  type: 'journal' | 'rolling' | 'squeeze-film';
  stationIndex: number; // Which node/segment is it attached to?
  coefficients: CoefficientDataPoint[]; // Lookup table
  // Visual props
  housingColor?: string;
  housingDiameter?: number;
}
```

### 2.2. Interpolation Strategy
Since simulation runs at arbitrary RPMs not necessarily matching the lookup table:
- **Requirement:** Linear interpolation is sufficient for most rotor dynamics applications between defined points.
- **Implementation:** Custom utility function `interpolateCoefficients(rpm, dataPoints)`.
- **Libraries:** No external heavy math library needed for 1D interpolation.

### 2.3. Material Library
Standardize material properties using SI units.

**Defaults:**
| Material | Density ($\rho$) [kg/m³] | Young's Modulus ($E$) [Pa] | Color |
| :--- | :--- | :--- | :--- |
| **Steel** | 7850 | $2.05 \times 10^{11}$ (205 GPa) | `#71717a` (Zinc-500) |
| **Titanium** | 4507 | $1.15 \times 10^{11}$ (115 GPa) | `#94a3b8` (Slate-400) |
| **Aluminum** | 2700 | $6.90 \times 10^{10}$ (69 GPa) | `#d4d4d8` (Zinc-300) |

## 3. Visualization Strategy

### 3.1. Representation (Three.js)
Current `RotorVisualizer` uses basic geometries. Bearings/Seals should be distinct from the shaft.

- **Bearings:** Represent as a translucent "Block" or "Pedestal" at the node location.
  - *Geometry:* `BoxGeometry` or `CylinderGeometry` (short, large diameter).
  - *Material:* `MeshPhysicalMaterial` with `transmission: 0.5` (glass-like) to see the shaft inside.
  - *Symbol:* Optional "Zig-Zag" spring lines using `LineSegments` if visual clarity is needed, but a semi-transparent housing is more "CAD-like".

- **Seals:** Represent as a thin ring.
  - *Geometry:* `TorusGeometry` or `TubeGeometry`.
  - *Color:* Distinct (e.g., Orange/Red) to signify fluid interaction.

### 3.2. Interaction
- **Click Handling:** The Raycaster in `VisualizerContainer` must now intercept clicks on Bearing meshes, not just ShaftSegments.
- **Selection State:** Selecting a bearing should open a "Bearing Editor" in the sidebar instead of the "Shaft Editor".

## 4. Physics Integration (`useSimulation.ts`)

The current `generateRotorData` is a mock. To support real analysis later (Phase 4), the data structure must be ready now.

- **Current State:** `modes` are calculated via API (Gemini) or simple heuristics.
- **Phase 3 Goal:** We are *modeling* the inputs. We do not necessarily need to solve the complex eigenvalue problem client-side *yet* (that is Phase 4), but we must store the *inputs* correctly.
- **Immediate Physics:**
  - Update `useSimulation` to accept `Bearing` objects.
  - When `generate` is called, pass the interpolated $K/C$ values to the backend/solver.

## 5. Potential Pitfalls

1.  **Unit Confusion:** Rotor dynamics often mixes units (mils, inches, mm, microns).
    - *Decision:* Store EVERYTHING in SI (meters, kg, N) internally. Convert only for display if needed.
2.  **Cross-Coupling Signs:** $K_{xy}$ vs $K_{yx}$ signs are critical for stability.
    - *Decision:* Adhere to a standard coordinate system (Z-axis = shaft, X/Y = radial).
3.  **Complexity Overload:** Users can't type 8 coefficients for 10 speed points manually.
    - *Mitigation:* Provide "Presets" (e.g., "Generic Cylindrical Bearing") that auto-fill a curve.

## 6. Recommended Stack Changes
- **No new npm packages** required for math/interpolation (write utility).
- **Icons:** Use `lucide-react` for UI icons (bearing, seal).

```