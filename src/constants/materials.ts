import { Material } from '../types';

export const MATERIALS: Material[] = [
  {
    id: 'steel',
    name: 'Steel',
    density: 7850,
    youngsModulus: 210e9,
    color: '#94a3b8', // slate-400
    description: 'High strength, heavy material'
  },
  {
    id: 'aluminum',
    name: 'Aluminum',
    density: 2700,
    youngsModulus: 70e9,
    color: '#cbd5e1', // slate-300
    description: 'Lightweight, lower stiffness'
  },
  {
    id: 'titanium',
    name: 'Titanium',
    density: 4500,
    youngsModulus: 110e9,
    color: '#9ca3af', // gray-400
    description: 'High strength-to-weight ratio'
  }
];

export const DEFAULT_MATERIAL_ID = 'steel';

export const getMaterialById = (id: string): Material => {
  return MATERIALS.find(m => m.id === id) || MATERIALS[0];
};
