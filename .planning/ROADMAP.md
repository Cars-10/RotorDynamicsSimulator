# Roadmap: Rotor Dynamics Simulator

## Overview

A phased approach to evolve the validated prototype into a professional-grade engineering tool, starting with architectural solidity, then visual polish, extended modeling depth, and finally advanced analysis capabilities.

## Domain Expertise

None

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation & Refactor** - Architecture cleanup and data portability
- [x] **Phase 2: UI Modernization** - High-fidelity visualization overhaul
- [x] **Phase 3: Expanded Modeling** - Complex components (bearings, seals, materials)
- [x] **Phase 4: Advanced Analysis** - Campbell diagrams and stability maps
- [ ] **Phase 5: UI Overhaul & Layout Restructuring** - Modernize UI, dark blue theme, and specific viewport layout

## Phase Details

### Phase 1: Foundation & Refactor
**Goal**: Solidify architecture and enable data portability
**Depends on**: Nothing (first phase)
**Requirements**: ARCH-01, DATA-01
**Research**: Unlikely (Standard refactoring and JSON serialization)
**Plans**: 4/4

### Phase 2: UI Modernization
**Goal**: Upgrade visual fidelity of rotor and mode shapes
**Depends on**: Phase 1
**Requirements**: UI-01
**Research**: Unlikely (Internal UI/UX design)
**Plans**: 1/1

### Phase 3: Expanded Modeling
**Goal**: Support complex rotor components (bearings, seals, materials)
**Depends on**: Phase 2
**Requirements**: MOD-01, MOD-02, MOD-03
**Research**: Likely (Domain modeling)
**Research topics**: Data structures for seals/bearings, visual representation of complex components
**Plans**:
- [x] **03-01**: Material System Implementation
- [x] **03-02**: Advanced Component Data Models
- [x] **03-03**: Component Property Editors
- [x] **03-04**: Component Visualization

### Phase 4: Advanced Analysis
**Goal**: Implement professional engineering analysis tools
**Depends on**: Phase 3
**Requirements**: ANA-01, ANA-02, ANA-03
**Research**: Likely (Domain-specific visualizations)
**Research topics**: Campbell diagram plotting libraries/techniques, Stability map visualization patterns
**Plans**:
- [x] **04-01**: Analysis Data Infrastructure
- [x] **04-02**: Campbell Diagram Implementation
- [x] **04-03**: Stability Map Implementation
- [x] **04-04**: Analysis Integration & Dashboard

### Phase 5: UI Overhaul & Layout Restructuring
**Goal**: Complete visual transformation to a modern, dark-blue themed engineering tool with a specific multi-viewport layout.
**Depends on**: Phase 4
**Requirements**: UI-02
**Research**: Unlikely (UI implementation)
**Plans**:
- [ ] **05-01**: Theme & Layout Overhaul

**Details:**
"We need significant UI changes. It's reaaly ugly. The radial view should in the top left region. The Iso in the center runing diagionaaly from the bottom left to the to right. The long view should be in the bottom right. Make a Dark blue background. Review the theming and and make it look like a modern UI"

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Refactor | 4/4 | Completed | 2026-01-15 |
| 2. UI Modernization | 1/1 | Completed | 2026-01-15 |
| 3. Expanded Modeling | 4/4 | Completed | 2026-01-15 |
| 4. Advanced Analysis | 4/4 | Completed | 2026-01-15 |
| 5. UI Overhaul | 0/0 | Not started | - |