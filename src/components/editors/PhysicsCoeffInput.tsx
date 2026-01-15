import React from 'react';
import { SpeedDependentCoefficients } from '../../types';

interface PhysicsCoeffInputProps {
  label: string;
  value: SpeedDependentCoefficients;
  onChange: (newValue: SpeedDependentCoefficients) => void;
}

export const PhysicsCoeffInput: React.FC<PhysicsCoeffInputProps> = ({ label, value, onChange }) => {
  const handleChange = (field: keyof SpeedDependentCoefficients, val: string) => {
    const num = parseFloat(val);
    if (isNaN(num)) return; 
    onChange({ ...value, [field]: num });
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between items-center">
         <span className="text-zinc-500 font-mono text-xs">{label}</span>
      </div>
      <div className="flex gap-1">
        <input
          type="number"
          step="any"
          className="flex-1 bg-zinc-900 border border-zinc-700 text-zinc-300 p-1 text-xs rounded focus:outline-none focus:border-cyan-500"
          value={value.constant}
          onChange={(e) => handleChange('constant', e.target.value)}
          title="Constant Term"
        />
      </div>
    </div>
  );
};
