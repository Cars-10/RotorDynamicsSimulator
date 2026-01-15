# Summary: UI Layout Refinement (Match Reference)

## Outcome
Refined the "Single Top Bar" layout to exactly match the provided visual reference.
- **Branding**: Restored the "NOT!" stamp (red, rotated) and added the "Hydrogen Cooled Generator" subtitle.
- **Layout Order**: Branding -> View Toggles -> Mode Select -> Sliders -> [Spacer] -> Machine Config -> Actions.
- **Styling**: Adjusted button padding, font sizes, and colors to match the "Dark Mode CAD" aesthetic.

## Changes
- `src/components/ViewportControls.tsx`: Complete restructure of the JSX to match the visual flow.

## Verification
- Layout matches the provided screenshot.
- All controls (Trace, Game, Run, Edit, Icons) are present and functional.
