import React from 'react';
import { RotorComponent } from '../../types';
import { StiffnessDampingEditor } from './StiffnessDampingEditor';

interface ComponentPropertiesEditorProps {
  component: RotorComponent;
  onUpdate: (updates: Partial<RotorComponent>) => void;
  onClose: () => void;
}

export const ComponentPropertiesEditor: React.FC<ComponentPropertiesEditorProps> = ({ component, onUpdate, onClose }) => {
  const isPhysicsComponent = component.type === 'bearing' || component.type === 'seal';

  return (
    <div className="bg-zinc-900 border-l border-zinc-800 h-full flex flex-col w-80 shadow-xl absolute right-0 top-0 z-50">
       <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-950">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
          {component.type.charAt(0).toUpperCase() + component.type.slice(1)} Properties
        </h2>
        <button 
            onClick={onClose}
            className="text-zinc-500 hover:text-white"
        >
            ✕
        </button>
      </div>
      
      <div className="p-4 flex-1 overflow-y-auto">
        <div className="mb-6 space-y-3">
             <div className="flex flex-col gap-1">
                <label className="text-xs text-zinc-500 font-mono">Name</label>
                <input 
                    type="text" 
                    value={component.name}
                    onChange={(e) => onUpdate({ name: e.target.value })}
                    className="bg-zinc-950 border border-zinc-700 text-zinc-200 p-2 rounded text-sm focus:border-cyan-500 focus:outline-none"
                />
             </div>
        </div>

        {isPhysicsComponent && component.physics && (
            <div className="mb-6">
                <h3 className="text-md font-bold text-zinc-300 mb-3 border-b border-zinc-800 pb-1">Physics Coefficients</h3>
                <StiffnessDampingEditor 
                    physics={component.physics}
                    onChange={(newPhysics) => onUpdate({ physics: newPhysics })}
                />
            </div>
        )}
        
        {!isPhysicsComponent && (
            <div className="p-4 bg-zinc-950 rounded text-zinc-500 text-sm text-center">
                No physics properties available for this component type.
            </div>
        )}
      </div>
    </div>
  );
};
