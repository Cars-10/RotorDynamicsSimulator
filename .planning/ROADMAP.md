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
- [ ] **Phase 3: Expanded Modeling** - Complex components (bearings, seals, materials)
- [ ] **Phase 4: Advanced Analysis** - Campbell diagrams and stability maps

## Phase Details

### Phase 1: Foundation & Refactor
**Goal**: Solidify architecture and enable data portability
**Depends on**: Nothing (first phase)
**Requirements**: ARCH-01, DATA-01
**Research**: Unlikely (Standard refactoring and JSON serialization)
**Plans**: TBD

### Phase 2: UI Modernization
**Goal**: Upgrade visual fidelity of rotor and mode shapes
**Depends on**: Phase 1
**Requirements**: UI-01
**Research**: Unlikely (Internal UI/UX design)
**Plans**: TBD

### Phase 3: Expanded Modeling
**Goal**: Support complex rotor components (bearings, seals, materials)
**Depends on**: Phase 2
**Requirements**: MOD-01, MOD-02, MOD-03
**Research**: Likely (Domain modeling)
**Research topics**: Data structures for seals/bearings, visual representation of complex components
**Plans**:
- [x] **03-01**: Material System Implementation
- [ ] **03-02**: Advanced Component Data Models
- [ ] **03-03**: Component Property Editors
- [ ] **03-04**: Component Visualization

### Phase 4: Advanced Analysis
**Goal**: Implement professional engineering analysis tools
**Depends on**: Phase 3
**Requirements**: ANA-01, ANA-02, ANA-03
**Research**: Likely (Domain-specific visualizations)
**Research topics**: Campbell diagram plotting libraries/techniques, Stability map visualization patterns
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Refactor | 4/4 | Completed | 2026-01-15 |
| 2. UI Modernization | 1/1 | Completed | 2026-01-15 |
| 3. Expanded Modeling | 1/4 | In Progress | - |
| 4. Advanced Analysis | 0/0 | Not started | - |
