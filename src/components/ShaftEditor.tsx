import React, { useEffect, useRef, useState } from 'react';
import { ShaftSegment } from '../types';
import { MATERIALS, getMaterialById } from '../constants/materials';

interface ShaftEditorProps {
  segments: ShaftSegment[];
  onUpdateSegment: (index: number, updates: Partial<ShaftSegment>) => void;
  onClose: () => void;
  selectedIndices: Set<number>;
  onSelectSegment: (index: number, multiSelect?: boolean) => void;
}

const ShaftEditor: React.FC<ShaftEditorProps> = ({ 
    segments, 
    onUpdateSegment, 
    onClose,
    selectedIndices,
    onSelectSegment
}) => {
  const rowRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const [lockSection, setLockSection] = useState(false);

  // Auto-scroll to the first selected item if needed
  useEffect(() => {
    const firstSelected = Array.from(selectedIndices)[0];
    if (firstSelected !== undefined && rowRefs.current[firstSelected]) {
        rowRefs.current[firstSelected]?.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest'
        });
    }
  }, [selectedIndices.size]); 

  const handleWheelDiameter = (e: React.WheelEvent, index: number, currentDia: number) => {
      e.stopPropagation();
      e.preventDefault();
      
      const delta = e.deltaY > 0 ? -0.01 : 0.01;
      const calcNewVal = (val: number) => Math.max(0.05, Math.min(2.0, val + delta));

      if (lockSection && selectedIndices.has(index)) {
          selectedIndices.forEach(idx => {
              const seg = segments[idx];
              const roundedVal = parseFloat(calcNewVal(seg.outerDiameter).toFixed(2));
              onUpdateSegment(idx, { outerDiameter: roundedVal });
          });
      } else {
          const roundedVal = parseFloat(calcNewVal(currentDia).toFixed(2));
          onUpdateSegment(index, { outerDiameter: roundedVal });
      }
  };

  const handleClick = (e: React.MouseEvent, index: number) => {
      const isMulti = e.shiftKey || e.ctrlKey || e.metaKey;
      onSelectSegment(index, isMulti);
  };

  return (
    <div className="w-64 bg-slate-900 border-r border-slate-700 flex flex-col h-full shadow-xl z-30 select-none">
      <div className="flex flex-col gap-2 px-3 py-3 bg-slate-800 border-b border-slate-700 shrink-0">
         <div className="flex justify-between items-center">
            <div>
                <h3 className="font-bold text-slate-200 text-sm">Shaft Editor</h3>
                <p className="text-[10px] text-slate-400">Wheel over DIA to resize</p>
                <p className="text-[10px] text-slate-400">Shift+Click to Multi-Select</p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
         </div>
         
         <label className="flex items-center gap-2 text-[10px] text-slate-300 cursor-pointer bg-slate-700/50 p-1.5 rounded border border-slate-600 hover:bg-slate-700 transition-colors">
             <input 
                type="checkbox" 
                checked={lockSection} 
                onChange={(e) => setLockSection(e.target.checked)}
                className="rounded bg-slate-800 border-slate-600 text-cyan-500 focus:ring-0"
             />
             <span>LOCK SELECTED ({selectedIndices.size})</span>
         </label>
      </div>

      <div className="grid grid-cols-[30px_50px_40px_1fr] gap-1 px-2 py-2 text-[9px] font-bold text-slate-500 uppercase bg-slate-900 border-b border-slate-800 shrink-0">
          <div className="text-center">#</div>
          <div className="text-center">Dia</div>
          <div className="text-center">Mat</div>
          <div className="text-left pl-1">Label</div>
      </div>

      <div 
        className="flex-1 overflow-y-auto custom-scrollbar" 
        ref={containerRef}
      >
        <div className="space-y-[1px] pb-10">
            {segments.map((seg) => {
                const isSelected = selectedIndices.has(seg.index);
                const material = getMaterialById(seg.materialId);
                return (
                    <div 
                        key={seg.index} 
                        ref={el => rowRefs.current[seg.index] = el}
                        onClick={(e) => handleClick(e, seg.index)}
                        className={`grid grid-cols-[30px_50px_40px_1fr] gap-1 items-center px-2 py-1.5 transition-colors cursor-pointer border-l-2 ${
                            isSelected 
                            ? 'bg-cyan-900/30 border-cyan-400' 
                            : 'hover:bg-slate-800 border-transparent'
                        }`}
                    >
                        <div className={`font-mono text-[10px] text-center ${isSelected ? 'text-cyan-400 font-bold' : 'text-slate-500'}`}>
                            {seg.index}
                        </div>
                        
                        <div 
                            className="text-center group"
                            onWheel={(e) => handleWheelDiameter(e, seg.index, seg.outerDiameter)}
                        >
                             <div className="bg-slate-800 text-slate-300 text-[10px] font-mono py-0.5 rounded cursor-ns-resize hover:bg-slate-700 hover:text-white transition-colors group-hover:ring-1 ring-cyan-500/50">
                                {seg.outerDiameter.toFixed(2)}
                             </div>
                             <div className="h-0.5 bg-slate-700 mt-0.5 w-full rounded-full overflow-hidden">
                                <div className="h-full bg-cyan-500/50" style={{ width: `${Math.min(100, seg.outerDiameter * 80)}%` }}></div>
                             </div>
                        </div>
                        
                        <div 
                             className="flex justify-center"
                             onClick={(e) => {
                                 e.stopPropagation();
                                 const currentIdx = MATERIALS.findIndex(m => m.id === seg.materialId);
                                 const nextMaterial = MATERIALS[(currentIdx + 1) % MATERIALS.length];
                                 
                                 if (lockSection && selectedIndices.has(seg.index)) {
                                     selectedIndices.forEach(idx => onUpdateSegment(idx, { materialId: nextMaterial.id }));
                                 } else {
                                     onUpdateSegment(seg.index, { materialId: nextMaterial.id });
                                 }
                             }}
                        >
                            <div 
                                className="w-6 h-6 rounded-full border border-slate-600 shadow-sm cursor-pointer hover:scale-110 transition-transform" 
                                style={{ backgroundColor: material.color }}
                                title={`${material.name}\nE: ${material.youngsModulus / 1e9} GPa\nρ: ${material.density} kg/m³`}
                            ></div>
                        </div>

                        <div onClick={(e) => e.stopPropagation()}>
                            <input 
                                type="text" 
                                value={seg.label || ''}
                                placeholder="..."
                                onChange={(e) => onUpdateSegment(seg.index, { label: e.target.value || undefined })}
                                className={`w-full bg-transparent border-none text-[10px] focus:ring-0 px-1 py-0.5 rounded placeholder-slate-700 ${seg.label ? 'text-amber-400 font-bold' : 'text-slate-400 focus:bg-slate-800'}`}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
      </div>
    </div>
  );
};

export default ShaftEditor;