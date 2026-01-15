import React, { useState, useRef } from 'react';
import { SimulationData, ShaftSegment } from '../../../types';
import { getDisplacementAt } from '../../../utils/visualizerUtils';

interface LongitudinalViewProps {
  data: SimulationData;
  phase: number;
  amplitudeScale: number;
  damping: number;
  activeModeIndex: number;
  isEditing: boolean;
  onUpdateSegment: (index: number, updates: Partial<ShaftSegment>) => void;
  selectedIndices: Set<number>;
  onSelectSegment: (index: number) => void;
  isOverlay?: boolean;
  isTripped?: boolean;
}

export const LongitudinalView: React.FC<LongitudinalViewProps> = ({
    data,
    phase,
    amplitudeScale,
    damping,
    activeModeIndex,
    isEditing,
    onUpdateSegment,
    selectedIndices,
    onSelectSegment,
    isOverlay = false,
    isTripped = false
}) => {
    const viewWidth = 1400; 
    const viewHeight = 600; 
    const paddingX = 30; 
    const drawWidth = viewWidth - (paddingX * 2);
    const centerY = viewHeight / 2;
    
    const SCALE_LONGITUDINAL = 40;
    const DAMPING_MODIFIER = (1 - damping * 0.8);
    const yScale = SCALE_LONGITUDINAL * amplitudeScale * DAMPING_MODIFIER;
    
    const segmentWidth = drawWidth / data.shaftSegments.length;
    const activeMode = data.modes[activeModeIndex];

    // Editing State
    const editStartYRef = useRef<number>(0);
    const editStartDiameterRef = useRef<number>(0);
    const editCurrentIndexRef = useRef<number | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleSegmentMouseDown = (e: React.MouseEvent, index: number, currentDiameter: number) => {
        if (!isEditing) return;
        e.stopPropagation();
        onSelectSegment(index);
        setIsDragging(true); 
        editStartYRef.current = e.clientY;
        editStartDiameterRef.current = currentDiameter;
        editCurrentIndexRef.current = index;
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isEditing && editCurrentIndexRef.current !== null && isDragging) {
            const deltaY = editStartYRef.current - e.clientY;
            const scaleFactor = 0.005; 
            const newDiameter = Math.max(0.1, Math.min(1.5, editStartDiameterRef.current + deltaY * scaleFactor));
            onUpdateSegment(editCurrentIndexRef.current, { outerDiameter: newDiameter });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        editCurrentIndexRef.current = null;
    };

    const chunks = [];
    let currentChunk = [data.shaftSegments[0]];
    for (let i = 1; i < data.shaftSegments.length; i++) {
        const prev = data.shaftSegments[i-1];
        const curr = data.shaftSegments[i];
        if (curr.outerDiameter === prev.outerDiameter && curr.color === prev.color && !isEditing) {
            currentChunk.push(curr);
        } else {
            chunks.push(currentChunk);
            currentChunk = [curr];
        }
    }
    chunks.push(currentChunk);

    return (
      <div 
        className={`w-full h-full ${isOverlay ? 'bg-slate-950/80 backdrop-blur-md' : 'bg-slate-900'} border border-slate-700 rounded-lg overflow-hidden relative group select-none ${isTripped ? 'animate-pulse bg-red-950/50' : ''}`}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div className="absolute top-2 left-2 text-[10px] font-mono text-cyan-400 bg-slate-950/80 px-2 py-0.5 rounded z-10 flex gap-2 pointer-events-none">
            <span>SIDE VIEW</span>
            <span className="text-amber-500">DAMPING: {(damping*100).toFixed(0)}%</span>
            {isEditing && <span className="text-red-400 animate-pulse font-bold">EDIT MODE: DRAG TO RESIZE</span>}
        </div>
        <svg viewBox={`0 0 ${viewWidth} ${viewHeight}`} className="w-full h-full block">
          <line x1={0} y1={centerY} x2={viewWidth} y2={centerY} stroke="#334155" strokeDasharray="4 4" />

          {data.rotors.filter(r => r.type === 'bearing' || r.type === 'coupling').map((b, i) => {
             const x = paddingX + b.position * drawWidth;
             const w = Math.max(15, (b.width || 0.05) * drawWidth);
             const h = 50;
             const y = centerY + 30;
             return (
                 <g key={`bearing-side-${i}`}>
                    <path d={`M ${x-w/2} ${y} L ${x+w/2} ${y} L ${x+w/2 + 5} ${y+h} L ${x-w/2 - 5} ${y+h} Z`} fill="url(#bearing-pattern)" stroke="#fbbf24" strokeWidth="0.5" />
                    <rect x={x-w/2} y={y+h} width={w+10} height={5} fill="#fbbf24" />
                    <text x={x} y={y + h + 15} textAnchor="middle" fill="#fbbf24" fontSize="14" fontWeight="bold" letterSpacing="0.5px">
                        {b.name}
                    </text>
                 </g>
             );
          })}

          {isEditing ? (
             data.shaftSegments.map((seg) => {
                 const x = paddingX + seg.index * segmentWidth;
                 const disp = getDisplacementAt(seg.index, activeMode, data.shaftSegments.length);
                 const r = seg.outerDiameter * 70; 
                 const y = centerY + disp * yScale * Math.cos(phase);
                 const selected = selectedIndices.has(seg.index);

                 return (
                     <g 
                        key={seg.index} 
                        className="cursor-ns-resize"
                        onMouseDown={(e) => handleSegmentMouseDown(e, seg.index, seg.outerDiameter)}
                     >
                         <rect 
                             x={x} y={y - r/2} width={segmentWidth} height={r} 
                             fill={seg.color}
                             stroke={selected ? "#22d3ee" : "none"} strokeWidth={selected ? 1 : 0} opacity={selected ? 1 : 0.8}
                         />
                     </g>
                 )
             })
          ) : (
             chunks.map((chunk, chunkIndex) => {
                const startIdx = chunk[0].index;
                const endIdx = chunk[chunk.length - 1].index;
                let pathD = `M ${paddingX + startIdx * segmentWidth} ${centerY}`; 
                for (let i = startIdx; i <= endIdx; i++) {
                   const disp = getDisplacementAt(i, activeMode, data.shaftSegments.length);
                   const r = chunk[0].outerDiameter * 70;
                   const y = centerY + disp * yScale * Math.cos(phase) - r/2;
                   const x = paddingX + i * segmentWidth;
                   pathD += ` L ${x} ${y} L ${x + segmentWidth} ${y}`;
                }
                for (let i = endIdx; i >= startIdx; i--) {
                  const disp = getDisplacementAt(i, activeMode, data.shaftSegments.length);
                  const r = chunk[0].outerDiameter * 70;
                  const y = centerY + disp * yScale * Math.cos(phase) + r/2;
                  const x = paddingX + i * segmentWidth;
                  pathD += ` L ${x + segmentWidth} ${y} L ${x} ${y}`;
                }
                pathD += " Z";
                return (
                  <g key={chunkIndex}>
                      <path d={pathD} fill={chunk[0].color} stroke="none" />
                      <path d={pathD} fill="url(#metal-sheen-vert)" style={{ mixBlendMode: 'multiply' }} opacity="0.8" />
                      <path d={pathD} fill="url(#metal-sheen-vert)" style={{ mixBlendMode: 'screen' }} opacity="0.3" />
                  </g>
                );
            })
          )}

          {data.shaftSegments.filter(s => s.label).map((seg, i) => {
               const disp = getDisplacementAt(seg.index, activeMode, data.shaftSegments.length);
               const y = centerY + disp * yScale * Math.cos(phase) - (seg.outerDiameter * 35) - 20;
               const x = paddingX + seg.index * segmentWidth + segmentWidth/2;
               return (
                   <g key={`lbl-${i}`}>
                       <line x1={x} y1={y + 10} x2={x} y2={y + 30} stroke="#94a3b8" strokeWidth="1" />
                       <text x={x} y={y} textAnchor="middle" fill="#fcd34d" fontSize="12" fontWeight="bold" className="drop-shadow-md">
                           {seg.label}
                       </text>
                   </g>
               )
          })}
        </svg>
      </div>
    );
};
