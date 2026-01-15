import { useState, useCallback } from 'react';
import { SimulationData, ShaftSegment } from '../types';
import { generateRotorData } from '../services/geminiService';
import { DEFAULT_ROTOR_DATA } from '../constants';

export const useSimulation = () => {
  const [data, setData] = useState<SimulationData>(DEFAULT_ROTOR_DATA);
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

  return {
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
