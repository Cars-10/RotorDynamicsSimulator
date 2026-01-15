import React from 'react';
import { StiffnessDampingMatrix, SpeedDependentCoefficients } from '../../types';
import { PhysicsCoeffInput } from './PhysicsCoeffInput';

interface StiffnessDampingEditorProps {
  physics: StiffnessDampingMatrix;
  onChange: (newPhysics: StiffnessDampingMatrix) => void;
}

export const StiffnessDampingEditor: React.FC<StiffnessDampingEditorProps> = ({ physics, onChange }) => {
  const handleCoeffChange = (key: keyof StiffnessDampingMatrix, newValue: SpeedDependentCoefficients) => {
    onChange({ ...physics, [key]: newValue });
  };

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-semibold text-cyan-400 mb-2">Stiffness (K) [N/m]</h4>
        <div className="grid grid-cols-2 gap-2">
          <PhysicsCoeffInput label="Kxx" value={physics.kxx} onChange={(v) => handleCoeffChange('kxx', v)} />
          <PhysicsCoeffInput label="Kxy" value={physics.kxy} onChange={(v) => handleCoeffChange('kxy', v)} />
          <PhysicsCoeffInput label="Kyx" value={physics.kyx} onChange={(v) => handleCoeffChange('kyx', v)} />
          <PhysicsCoeffInput label="Kyy" value={physics.kyy} onChange={(v) => handleCoeffChange('kyy', v)} />
        </div>
      </div>
      
      <div>
        <h4 className="text-sm font-semibold text-cyan-400 mb-2">Damping (C) [N-s/m]</h4>
        <div className="grid grid-cols-2 gap-2">
          <PhysicsCoeffInput label="Cxx" value={physics.cxx} onChange={(v) => handleCoeffChange('cxx', v)} />
          <PhysicsCoeffInput label="Cxy" value={physics.cxy} onChange={(v) => handleCoeffChange('cxy', v)} />
          <PhysicsCoeffInput label="Cyx" value={physics.cyx} onChange={(v) => handleCoeffChange('cyx', v)} />
          <PhysicsCoeffInput label="Cyy" value={physics.cyy} onChange={(v) => handleCoeffChange('cyy', v)} />
        </div>
      </div>
    </div>
  );
};
