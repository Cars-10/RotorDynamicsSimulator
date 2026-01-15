# Summary: UI Layout Restoration

## Outcome
Restored the original "Single Top Bar" layout structure while keeping the new "Deep Blue" theme.
- **Layout**: Consolidated `Header` and `ViewportControls` back into a single `sticky top-0` bar.
- **Components**: Removed `Header.tsx`. Updated `ViewportControls.tsx` to include Branding, Machine Config, and File Actions.
- **Visuals**: Maintained the `bg-panel/90 backdrop-blur-md` look for a modern feel but with the original functional density.

## Changes
- `src/components/ViewportControls.tsx`: Re-integrated branding and machine controls.
- `src/App.tsx`: Removed separate Header rendering.
- `src/components/layout/Header.tsx`: Deleted.

## Verification
- Layout now matches the "Original" structure (Left: Brand, Center: Sliders, Right: Actions).
- Theme is consistent with the Phase 5 goals.
