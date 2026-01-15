import { RotorComponent, StiffnessDampingMatrix, SpeedDependentCoefficients } from '../types';

/**
 * Type guard to check if a component is a bearing with physics properties
 */
export const isBearing = (component: RotorComponent): component is RotorComponent & { physics: StiffnessDampingMatrix } => {
  return component.type === 'bearing' && component.physics !== undefined;
};

/**
 * Type guard to check if a component is a seal with physics properties
 */
export const isSeal = (component: RotorComponent): component is RotorComponent & { physics: StiffnessDampingMatrix } => {
  return component.type === 'seal' && component.physics !== undefined;
};

/**
 * Type guard to check if a component has physics properties (bearing or seal)
 */
export const hasPhysics = (component: RotorComponent): component is RotorComponent & { physics: StiffnessDampingMatrix } => {
  return (component.type === 'bearing' || component.type === 'seal') && component.physics !== undefined;
};

/**
 * Calculates the value of a speed-dependent coefficient at a specific RPM
 */
export const calculateCoefficient = (coeff: SpeedDependentCoefficients, rpm: number): number => {
    // Convert rpm to rad/s for physical calculation
    // w = 2 * pi * (RPM / 60)
    const w = (rpm * 2 * Math.PI) / 60;
    
    return coeff.constant + (coeff.linear || 0) * w + (coeff.quadratic || 0) * w * w;
};
