import { SimulationData, ShaftSegment } from './types';

export const MATERIAL_COLORS = [
    '#cbd5e1', // Steel (Slate 300)
    '#94a3b8', // Darker Steel (Slate 400)
    '#ef4444', // Red (Exciter/Hot)
    '#f59e0b', // Amber (Brass/Bearing)
    '#3b82f6', // Blue (Generator)
    '#10b981', // Emerald (LP)
    '#8b5cf6', // Violet (HP)
    '#f472b6', // Pink (Experimental)
    '#0f172a', // Black/Carbon
    '#e2e8f0', // Aluminum
];

// Helper to generate realistic shaft profile
const generateDefaultShaft = (): ShaftSegment[] => {
  const segments: ShaftSegment[] = [];
  const COUNT = 100;
  
  for (let i = 0; i < COUNT; i++) {
    const pos = i / COUNT;
    let diameter = 0.2; // Base shaft
    let color = '#cbd5e1'; // Slate-300 (Steel)
    let label = undefined;

    // Exciter (0.0 - 0.1)
    if (pos < 0.1) {
      diameter = 0.45;
      color = '#ef4444';
      if (i === 5) label = "Exciter Core";
    } 
    // Bearing 1 (0.1 - 0.12)
    else if (pos < 0.12) {
      diameter = 0.25;
      color = '#f59e0b';
    }
    // Generator Main Body (0.12 - 0.45) - Massive
    else if (pos < 0.45) {
      diameter = 0.95;
      color = '#3b82f6';
      if (i === 28) label = "Rotor Body";
    }
    // Bearing 2 / Coupling (0.45 - 0.50)
    else if (pos < 0.50) {
      diameter = 0.25;
      color = '#f59e0b';
    }
    // LP Turbine (0.50 - 0.75) - Discs and spacers
    else if (pos < 0.75) {
      // Create disc pattern every few segments
      if (i % 5 === 0 || i % 5 === 1) {
         diameter = 1.0; // Blade disc
         color = '#10b981';
      } else {
         diameter = 0.4; // Shaft between discs
         color = '#64748b';
      }
      if (i === 62) label = "L-0 Stage";
    }
    // Bearing 3 / Coupling (0.75 - 0.80)
    else if (pos < 0.80) {
      diameter = 0.25;
      color = '#f59e0b';
    }
    // HP Turbine (0.80 - 0.95) - Dense stepping
    else if (pos < 0.95) {
       // Stepped rotor
       if (i % 3 === 0) {
         diameter = 0.8;
         color = '#8b5cf6';
       } else {
         diameter = 0.6;
         color = '#7c3aed';
       }
       if (i === 87) label = "HP Inlet";
    }
    // Bearing 4 (0.95 - 1.0)
    else {
      diameter = 0.25;
      color = '#f59e0b';
    }

    segments.push({
      index: i,
      length: 1 / COUNT,
      outerDiameter: diameter,
      color: color,
      label: label
    });
  }
  return segments;
};

export const DEFAULT_ROTOR_DATA: SimulationData = {
  // We keep high-level components for labeling if needed, but rendering uses shaftSegments
  rotors: [
    { id: 'brg1', name: 'Bearing #1', type: 'bearing', position: 0.11, width: 0.05, diameter: 0.25, color: '#f59e0b' },
    { id: 'brg2', name: 'Bearing #2', type: 'bearing', position: 0.48, width: 0.05, diameter: 0.25, color: '#f59e0b' },
    { id: 'brg3', name: 'Bearing #3', type: 'bearing', position: 0.78, width: 0.05, diameter: 0.25, color: '#f59e0b' },
    { id: 'brg4', name: 'Bearing #4', type: 'bearing', position: 0.98, width: 0.05, diameter: 0.25, color: '#f59e0b' },
  ],
  shaftSegments: generateDefaultShaft(),
  modes: [
    {
      order: 1,
      frequencyHz: 12.5,
      rpm: 750,
      qFactor: 4.5,
      description: "First critical speed. Simple bending mode (U-shape) dominated by the heavy generator and LP turbine mass.",
      displacements: Array.from({length: 100}, (_, i) => Math.sin((i/99) * Math.PI)) 
    },
    {
      order: 2,
      frequencyHz: 28.3,
      rpm: 1700,
      qFactor: 8.2,
      description: "Second critical speed. S-shape mode where the Generator and LP turbine oscillate out of phase.",
      displacements: Array.from({length: 100}, (_, i) => Math.sin((i/99) * 2 * Math.PI))
    },
    {
      order: 3,
      frequencyHz: 45.1,
      rpm: 2706,
      qFactor: 12.0,
      description: "Third mode involving significant excitation of the Exciter overhang and HP turbine coupling.",
      displacements: Array.from({length: 100}, (_, i) => Math.sin((i/99) * 3 * Math.PI) * 0.8) 
    },
    {
      order: 4,
      frequencyHz: 60.0,
      rpm: 3600,
      qFactor: 25.0,
      description: "Operating speed resonance (High Damping). Complex multi-nodal bending.",
      displacements: Array.from({length: 100}, (_, i) => Math.sin((i/99) * 4 * Math.PI) * 0.5)
    },
     {
      order: 5,
      frequencyHz: 82.4,
      rpm: 4944,
      qFactor: 18.5,
      description: "High frequency shaft stiffness controlled mode.",
      displacements: Array.from({length: 100}, (_, i) => Math.sin((i/99) * 5 * Math.PI) * 0.4)
    }
  ]
};