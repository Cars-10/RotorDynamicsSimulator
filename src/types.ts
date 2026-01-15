export interface Material {
  id: string;
  name: string;
  density: number; // kg/m^3
  youngsModulus: number; // Pa
  color: string; // Display color
  description?: string;
}

export interface SpeedDependentCoefficients {
  constant: number;
  linear?: number;
  quadratic?: number;
}

export interface StiffnessDampingMatrix {
  kxx: SpeedDependentCoefficients;
  kxy: SpeedDependentCoefficients;
  kyx: SpeedDependentCoefficients;
  kyy: SpeedDependentCoefficients;
  cxx: SpeedDependentCoefficients;
  cxy: SpeedDependentCoefficients;
  cyx: SpeedDependentCoefficients;
  cyy: SpeedDependentCoefficients;
}

export interface RotorComponent {
  id: string;
  name: string;
  type: 'bearing' | 'disc' | 'shaft' | 'coupling' | 'seal';
  position: number; // Normalized position 0-1 along the shaft
  width?: number; // Visual width
  diameter?: number; // Visual diameter
  color?: string;
  physics?: StiffnessDampingMatrix;
}

export interface ShaftSegment {
  index: number;
  length: number; // normalized (usually 0.01 for 100 segments)
  outerDiameter: number; // normalized relative to max
  materialId: string;
  label?: string; // User defined marker/annotation
}

export interface ModeShape {
  order: number;
  frequencyHz: number;
  rpm: number;
  qFactor: number; // Quality factor (1/2zeta)
  description: string;
  // Array of displacement magnitudes (normalized -1 to 1) at 100 points along the shaft
  displacements: number[];
}

export interface SimulationData {
  rotors: RotorComponent[]; // Kept for labels/annotations
  shaftSegments: ShaftSegment[]; // The 100 physical elements modeling the rotor
  modes: ModeShape[];
}

export enum ViewType {
  RADIAL = 'Radial',
  LONGITUDINAL = 'Longitudinal',
  ISOMETRIC = 'Isometric',
  ALL = 'All Views'
}