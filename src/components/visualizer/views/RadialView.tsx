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
  renderMode?: 'line' | '3d';
}

export const RadialView: React.FC<RadialViewProps> = ({
    data,
    phase,
    amplitudeScale,
    damping,
    activeModeIndex,
    isOverlay = false,
    renderMode = 'line',
}) => {
    const width = isOverlay ? 400 : 600;
    const height = isOverlay ? 400 : 600;
    const cx = width / 2;
    const cy = height / 2;
    const fov = 400; 
    
    // Adjusted scaling for visual fidelity (World Units relative to FOV)
    // 0.15 * 400 = 60 pixels max deflection
    const VISUAL_SCALE = 0.15; 
    const DAMPING_MODIFIER = (1 - damping * 0.8);
    const deflectionScale = VISUAL_SCALE * amplitudeScale * DAMPING_MODIFIER;

    // Helical Transform Constants (World Units)
    const HELIX_PITCH = 12.0; 
    const HELIX_RADIUS = 0.25; // 0.25 * 400 = 100 pixels radius

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

    // Calculate all points first
    const axisPoints = data.shaftSegments.map((seg, i) => {
        const u = data.shaftSegments.length > 1 ? i / (data.shaftSegments.length - 1) : 0;
        const disp = getDisplacementAt(i, activeMode, data.shaftSegments.length);
        const radius = disp * deflectionScale; 
        
        // ROTATION: Subtract phase to rotate the helix visualization
        const helixAngle = u * HELIX_PITCH - phase; 
        
        const baseX = HELIX_RADIUS * Math.cos(helixAngle);
        const baseY = HELIX_RADIUS * Math.sin(helixAngle);

        const x = baseX + radius * Math.sin(phase);
        const y = baseY + radius * Math.cos(phase);
        
        return { ...project(x, y, u), u };
    });

    const bearingRings = data.rotors
        .filter(r => r.type === 'bearing' || r.type === 'coupling')
        .map(b => {
             const u = b.position;
             // Match the helix rotation
             const helixAngle = u * HELIX_PITCH - phase;
             const baseX = HELIX_RADIUS * Math.cos(helixAngle);
             const baseY = HELIX_RADIUS * Math.sin(helixAngle);
             
             // 1. Housing Center (Static on Helix)
             const center = project(baseX, baseY, u);
             
             // 2. Shaft Center (Deflected)
             const segIdx = Math.round(u * (data.shaftSegments.length - 1));
             const disp = getDisplacementAt(segIdx, activeMode, data.shaftSegments.length);
             const deflection = disp * deflectionScale;
             
             const shaftX = baseX + deflection * Math.sin(phase);
             const shaftY = baseY + deflection * Math.cos(phase);
             const shaftCenter = project(shaftX, shaftY, u);

             // Housing Radius
             const HOUSING_RADIUS_WORLD = 0.12; 
             const housingRadius = HOUSING_RADIUS_WORLD * fov * center.scale; 
             
             // Opacity: 1.0 at front (u=0), 0.5 at back (u=1)
             const opacity = 1.0 - u * 0.5;

             return { center, shaftCenter, housingRadius, type: b.type, name: b.name, opacity };
        });

    return (
      <div className={`w-full h-full ${isOverlay ? 'bg-slate-950/80 backdrop-blur-md' : 'bg-slate-900'} border border-slate-700 rounded-lg overflow-hidden relative select-none`}>
        <div className="absolute top-2 left-2 text-[10px] font-mono text-cyan-400 bg-slate-950/80 px-2 py-0.5 rounded z-10">RADIAL ORBIT (ROTATING HELIX)</div>
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
           {/* Reference Grid */}
           <line x1={cx} y1={0} x2={cx} y2={height} stroke="#1e293b" strokeWidth="1" />
           <line x1={0} y1={cy} x2={width} y2={cy} stroke="#1e293b" strokeWidth="1" />
           <circle cx={cx} cy={cy} r={width/3} stroke="#1e293b" strokeWidth="1" fill="none" strokeDasharray="4 4" />

            {/* Bearing Housings (Yellow) */}
            {bearingRings.map((b, i) => (
                <g key={`b-rad-${i}`} opacity={b.opacity}>
                    {/* Ring: Housing Limit */}
                    <circle cx={b.center.x} cy={b.center.y} r={b.housingRadius} stroke="#fbbf24" strokeWidth="1.5" fill="none" opacity="0.4" />
                    {/* Dot: Housing Center */}
                    <circle cx={b.center.x} cy={b.center.y} r={2} fill="#fbbf24" />
                    
                    {/* Connector Line (Eccentricity Visualizer) */}
                    <line x1={b.center.x} y1={b.center.y} x2={b.shaftCenter.x} y2={b.shaftCenter.y} stroke="#fbbf24" strokeWidth="1" opacity="0.3" strokeDasharray="2 2" />

                    <text x={b.center.x + 5} y={b.center.y - 5} fill="#fbbf24" fontSize="8" className="opacity-50 font-mono">{b.name}</text>
                </g>
            ))}

           {/* Rotor Axis Path - Rendered as Segments or 3D Disks */}
           {renderMode === '3d' ? (
               // 3D Mode: Render disks from back to front
               axisPoints.slice().reverse().map((p, i) => {
                   // Correct index after reverse
                   const origIndex = axisPoints.length - 1 - i;
                   const seg = data.shaftSegments[origIndex];
                   if (!seg) return null;

                   const opacity = 1.0 - p.u * 0.5;
                   // World radius * fov * perspective scale
                   const radius = (seg.outerDiameter * 15) * p.scale; 
                   
                   return (
                       <g key={`disk-${origIndex}`} opacity={opacity}>
                           {/* Outer ring */}
                           <circle cx={p.x} cy={p.y} r={radius} fill="#0e7490" stroke="#22d3ee" strokeWidth="1" />
                           {/* Inner sheen/detail */}
                           <circle cx={p.x} cy={p.y} r={radius * 0.6} fill="#22d3ee" fillOpacity="0.2" stroke="none" />
                       </g>
                   );
               })
           ) : (
               // Line Mode: Render segments
               axisPoints.map((p, i) => {
                   if (i === 0) return null;
                   const prev = axisPoints[i-1];
                   const opacity = 1.0 - p.u * 0.5;
                   return (
                       <line 
                            key={`seg-${i}`}
                            x1={prev.x} y1={prev.y} 
                            x2={p.x} y2={p.y}
                            stroke="#22d3ee" 
                            strokeWidth="3" 
                            strokeLinecap="round" 
                            strokeOpacity={opacity}
                            filter={`drop-shadow(0 0 ${3 * opacity}px #22d3ee)`}
                       />
                   );
               })
           )}

           {/* Shaft Points at Bearings (Cyan/White) */}
           {bearingRings.map((b, i) => (
               <circle key={`b-shaft-${i}`} cx={b.shaftCenter.x} cy={b.shaftCenter.y} r={3} fill="#06b6d4" stroke="white" strokeWidth="1" opacity={b.opacity} />
           ))}

           {/* Leading Edge indicator */}
           {(() => {
               const front = axisPoints[0];
               return (
                   <circle cx={front.x} cy={front.y} r={3} fill="#ef4444" stroke="white" strokeWidth="1" />
               )
           })()}
        </svg>
      </div>
    );
};
