import React from 'react';
import { SimulationData } from '../../../types';
import { getDisplacementAt } from '../../../utils/visualizerUtils';

interface RadialViewProps {
  data: SimulationData;
  phase: number;
  amplitudeScale: number;
  damping: number;
  activeModeIndex: number;
  isOverlay?: boolean;
}

export const RadialView: React.FC<RadialViewProps> = ({
    data,
    phase,
    amplitudeScale,
    damping,
    activeModeIndex,
    isOverlay = false,
}) => {
    const width = isOverlay ? 400 : 600;
    const height = isOverlay ? 400 : 600;
    const cx = width / 2;
    const cy = height / 2;
    const fov = 400; 
    
    const SCALE_RADIAL = 250;
    const DAMPING_MODIFIER = (1 - damping * 0.8);
    const deflectionScale = (SCALE_RADIAL * amplitudeScale * DAMPING_MODIFIER) * 0.1;

    const activeMode = data.modes[activeModeIndex];
    
    const project = (x: number, y: number, zNorm: number) => {
        const z = 1.0 + zNorm * 4.0; 
        const scale = 1.0 / z;
        return {
            x: cx + x * scale * fov,
            y: cy - y * scale * fov,
            scale,
            z: zNorm
        };
    };

    const axisPoints = data.shaftSegments.map((seg, i) => {
        const u = i / data.shaftSegments.length;
        const disp = getDisplacementAt(i, activeMode, data.shaftSegments.length);
        const radius = disp * deflectionScale; 
        const x = radius * Math.sin(phase);
        const y = radius * Math.cos(phase);
        return { ...project(x, y, u) };
    });

    const axisPath = axisPoints.map((p, i) => 
        `${i===0 ? 'M' : 'L'} ${p.x},${p.y}`
    ).join(' ');

    const bearingRings = data.rotors
        .filter(r => r.type === 'bearing' || r.type === 'coupling')
        .map(b => {
             const center = project(0, 0, b.position);
             const housingRadius = 55 * center.scale; 
             return { center, housingRadius, type: b.type, name: b.name };
        });

    return (
      <div className={`w-full h-full ${isOverlay ? 'bg-slate-950/80 backdrop-blur-md' : 'bg-slate-900'} border border-slate-700 rounded-lg overflow-hidden relative select-none`}>
        <div className="absolute top-2 left-2 text-[10px] font-mono text-cyan-400 bg-slate-950/80 px-2 py-0.5 rounded z-10">RADIAL ORBIT (AXIS VIEW)</div>
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
           <line x1={cx} y1={0} x2={cx} y2={height} stroke="#1e293b" strokeWidth="1" />
           <line x1={0} y1={cy} x2={width} y2={cy} stroke="#1e293b" strokeWidth="1" />
           <circle cx={cx} cy={cy} r={width/3} stroke="#1e293b" strokeWidth="1" fill="none" strokeDasharray="4 4" />

            {bearingRings.map((b, i) => (
                <g key={`b-rad-${i}`} opacity="0.6">
                    <circle cx={b.center.x} cy={b.center.y} r={b.housingRadius} stroke="#fbbf24" strokeWidth="2" fill="none" />
                </g>
            ))}

           <path d={axisPath} fill="none" stroke="#22d3ee" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" filter="drop-shadow(0 0 4px #22d3ee)" />

           {(() => {
               const front = axisPoints[0];
               return (
                   <circle cx={front.x} cy={front.y} r={4} fill="#ef4444" stroke="white" strokeWidth="1" />
               )
           })()}
        </svg>
      </div>
    );
};
