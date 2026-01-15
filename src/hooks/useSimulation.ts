import { useState, useCallback, useEffect } from 'react';
import { SimulationData, ShaftSegment, RotorComponent } from '../types';
import { generateRotorData } from '../services/geminiService';
import { DEFAULT_ROTOR_DATA } from '../constants';
import { DEFAULT_MATERIAL_ID } from '../constants/materials';

export const useSimulation = () => {
  const [data, setData] = useState<SimulationData>(DEFAULT_ROTOR_DATA);
  
  // Migration logic for old data (e.g. from localStorage or older versions)
  useEffect(() => {
    setData(prev => {
      let needsMigration = false;
      const migratedSegments = prev.shaftSegments.map(seg => {
        if (!(seg as any).materialId && (seg as any).color) {
          needsMigration = true;
          // Simple heuristic: map common colors to materials
          let materialId = DEFAULT_MATERIAL_ID;
          if ((seg as any).color === '#ef4444') materialId = 'titanium';
          return { ...seg, materialId };
        }
        return seg;
      });

      if (needsMigration) {
        return { ...prev, shaftSegments: migratedSegments };
      }
      return prev;
    });
  }, []);
  const [activeModeIndex, setActiveModeIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  const generate = useCallback(async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const newData = await generateRotorData();
      setData(newData);
      setActiveModeIndex(0);
      setIsDirty(false);
      return true;
    } catch (e) {
      console.error(e);
      setError("Failed to generate new simulation data. Check API Key or try again.");
      return false;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const updateSegment = useCallback((index: number, updates: Partial<ShaftSegment>) => {
      setData(prev => {
          const newSegments = [...prev.shaftSegments];
          newSegments[index] = { ...newSegments[index], ...updates };
          return { ...prev, shaftSegments: newSegments };
      });
      setIsDirty(true);
  }, []);

  const updateSegmentWithPhysics = useCallback((index: number, updates: Partial<ShaftSegment>) => {
      // We need to apply updates to state, but updateSegment is async-ish (state update).
      // However, here we need the OLD state to calc physics, so we can do it all in one setData if possible?
      // Or just duplicate the logic.
      // The original App.tsx called handleUpdateSegment THEN had its own setData for physics.
      // This caused two renders/updates. 
      // Let's combine them for efficiency and correctness in the hook.
      
      setData(prev => {
          // 1. Update Segment
          const newSegments = [...prev.shaftSegments];
          const oldSeg = prev.shaftSegments[index];
          newSegments[index] = { ...oldSeg, ...updates };
          
          let newModes = prev.modes;

          // 2. Apply Physics if diameter changed
          if (updates.outerDiameter !== undefined) {
            const diaChange = updates.outerDiameter - oldSeg.outerDiameter;
            const rpmShiftPercent = diaChange * 0.05; 
            
            newModes = prev.modes.map(m => ({
                 ...m,
                 rpm: m.rpm * (1 + rpmShiftPercent),
                 frequencyHz: (m.rpm * (1 + rpmShiftPercent)) / 60
             }));
          }

          return { ...prev, shaftSegments: newSegments, modes: newModes };
      });
      setIsDirty(true);
  }, []);

  const addRotorComponent = useCallback((component: Omit<RotorComponent, 'id'>) => {
      setData(prev => {
          const id = Math.random().toString(36).substr(2, 9);
          const newComp: RotorComponent = { ...component, id };
          
          if ((newComp.type === 'bearing' || newComp.type === 'seal') && !newComp.physics) {
             newComp.physics = {
                kxx: { constant: 1e8 },
                kyy: { constant: 1e8 },
                kxy: { constant: 0 },
                kyx: { constant: 0 },
                cxx: { constant: 1e5 },
                cyy: { constant: 1e5 },
                cxy: { constant: 0 },
                cyx: { constant: 0 }
             };
          }
          
          return {
              ...prev,
              rotors: [...prev.rotors, newComp]
          };
      });
      setIsDirty(true);
  }, []);

  return {
    addRotorComponent,
    data,
    setData,
    activeModeIndex,
    setActiveModeIndex,
    isGenerating,
    error,
    setError,
    isDirty,
    generate,
    updateSegment,
    updateSegmentWithPhysics
  };
};
