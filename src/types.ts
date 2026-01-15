export interface RotorComponent {
  id: string;
  name: string;
  type: 'bearing' | 'disc' | 'shaft' | 'coupling';
  position: number; // Normalized position 0-1 along the shaft
  width?: number; // Visual width
  diameter?: number; // Visual diameter
  color?: string;
}

export interface ShaftSegment {
  index: number;
  length: number; // normalized (usually 0.01 for 100 segments)
  outerDiameter: number; // normalized relative to max
  color: string;
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