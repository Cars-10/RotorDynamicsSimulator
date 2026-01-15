import { renderHook, act } from '@testing-library/react';
import { useSimulation } from './useSimulation';
import { DEFAULT_ROTOR_DATA } from '../constants';
import { describe, it, expect } from 'vitest';

describe('useSimulation', () => {
  it('initializes with default data', () => {
    const { result } = renderHook(() => useSimulation());
    expect(result.current.data).toEqual(DEFAULT_ROTOR_DATA);
    expect(result.current.activeModeIndex).toBe(0);
    expect(result.current.isDirty).toBe(false);
  });

  it('updates segment and sets dirty flag', () => {
    const { result } = renderHook(() => useSimulation());
    
    act(() => {
      result.current.updateSegment(0, { length: 999 });
    });

    expect(result.current.data.shaftSegments[0].length).toBe(999);
    expect(result.current.isDirty).toBe(true);
  });

  it('updates physics when diameter changes', () => {
    const { result } = renderHook(() => useSimulation());
    const initialRpm = result.current.data.modes[0].rpm;
    const currentDia = result.current.data.shaftSegments[0].outerDiameter;
    
    act(() => {
       // Increase diameter by 10
       result.current.updateSegmentWithPhysics(0, { outerDiameter: currentDia + 10 });
    });

    const newRpm = result.current.data.modes[0].rpm;
    
    // Logic: diaChange = 10. rpmShiftPercent = 10 * 0.05 = 0.5 (50% increase)
    // New RPM should be roughly 1.5x old RPM.
    expect(newRpm).toBeGreaterThan(initialRpm);
    expect(result.current.data.shaftSegments[0].outerDiameter).toBe(currentDia + 10);
  });

  it('updates rotor component physics', () => {
    const { result } = renderHook(() => useSimulation());
    
    // Add a component to test with
    act(() => {
        result.current.addRotorComponent({
            name: "Test Bearing",
            type: "bearing",
            position: 0.5
        });
    });

    const newComp = result.current.data.rotors.find(r => r.name === "Test Bearing");
    expect(newComp).toBeDefined();
    if (!newComp) return;

    // Update physics
    const newKxx = { constant: 999 };
    act(() => {
        result.current.updateRotorComponent(newComp.id, {
            physics: {
                ...newComp.physics!,
                kxx: newKxx
            }
        });
    });

    const updatedComp = result.current.data.rotors.find(r => r.id === newComp.id);
    expect(updatedComp?.physics?.kxx.constant).toBe(999);
    expect(result.current.isDirty).toBe(true);
  });
});
