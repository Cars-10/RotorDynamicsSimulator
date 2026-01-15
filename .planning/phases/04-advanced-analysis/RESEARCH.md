# Research: Advanced Analysis (Phase 4)

## 1. Introduction
Phase 4 focuses on professional-grade analysis tools required for rotor dynamics certification and deep engineering insight. This includes frequency-domain visualizations (Campbell Diagrams) and stability assessments (Logarithmic Decrement maps).

## 2. Technical Requirements

### 2.1. Campbell Diagram
A Campbell diagram plots Natural Frequencies (y-axis) vs. Rotor Speed (x-axis).

**Key Features to Implement:**
- **Mode Tracking:** Natural frequencies change with speed due to gyroscopic effects and speed-dependent bearing properties. The UI must represent these as continuous curves.
- **Excitation Lines:** Diagonal lines (1X, 2X, etc.) representing multiples of the synchronous speed.
- **Interference Points:** Visual markers (dots) where excitation lines intersect mode curves, indicating **Critical Speeds**.
- **Whirl Direction:** Color-coding or line-style differentiation between Forward Whirl (FW) and Backward Whirl (BW) modes.

### 2.2. Stability Map (Log Dec)
Plots the Logarithmic Decrement ($\delta$) vs. Rotor Speed.

**Key Features to Implement:**
- **Instability Threshold:** A clear horizontal line at $\delta = 0$. Any mode dropping below this line is unstable.
- **Sensitivity Analysis:** Often plotted for different cross-coupled stiffness values ($Q$) to find the "Stability Margin".

## 3. Recommended Ecosystem & Stack

### 3.1. Visualization Library: D3.js
While Chart.js is easier, **D3.js** is the industry standard for specialized engineering plots because:
- **SVG-based:** Better for sharp, printable engineering reports.
- **Custom Overlays:** Easy to draw custom interference points and shaded "Exclusion Zones".
- **Math Integration:** Seamlessly handles the coordinate mapping for complex log-scales or multi-axis plots.

**React Integration:** Use D3 for the math/scales and React to render the SVG elements (the "React-Faux-DOM" or "Hooks" pattern).

### 3.2. Data Processing: Math.js / Custom
- **Interpolation:** Required to generate smooth curves from discrete speed points calculated by the solver.
- **Root Finding:** To accurately identify the *exact* RPM of a critical speed intersection rather than just eyeballing the closest data point.

## 4. Architectural Patterns

### 4.1. The "Analysis Worker" Pattern
Calculating eigenvalues for 50+ speed points to generate a smooth Campbell diagram can be computationally expensive (blocking the UI thread).
- **Pattern:** Use **Web Workers** to perform the heavy matrix operations or API calls in the background.
- **Flow:** `App` -> `Worker` (Calc 100 points) -> `App` (Update D3 State).

### 4.2. State Management
Since Analysis is often iterative, use a "Snapshot" pattern:
- Allow users to "Pin" a Campbell diagram, then change a bearing property and see the new diagram overlaid on the pinned one for comparison.

## 5. Potential Pitfalls & What NOT to Hand-Roll

- **Don't Hand-Roll Axes:** Use `d3-axis`. Handling scientific notation ($10^5$) and grid lines manually is error-prone.
- **Don't Hand-Roll Interpolation:** Use `d3-interpolate` or `mathjs` spline interpolation for smooth curves.
- **Avoid Canvas for Static Reports:** Use SVG for the diagrams. Users expect to be able to export high-quality PDFs or SVGs for technical papers.

## 6. Next Steps
1. **Plan Phase 4:** Create atomic plans for Campbell Diagram UI, Stability Logic, and Report Exporting.
2. **Select Plot Library:** Confirm D3.js usage.
