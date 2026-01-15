import React, { useState, useRef, useEffect } from 'react';
import { SimulationData, ShaftSegment } from '../../../types';
import { getDisplacementAt } from '../../../utils/visualizerUtils';
import { getMaterialById } from '../../../constants/materials';

interface IsometricViewProps {
  data: SimulationData;
  activeModeIndex: number;
  phase: number;
  showTrace: boolean;
  amplitudeScale: number;
  damping: number;
  isEditing: boolean;
  selectedIndices: Set<number>;
  onSelectSegment: (index: number) => void;
  systemHealth: { status: 'string' };
  gameMode: boolean;
}

export const IsometricView: React.FC<IsometricViewProps> = ({
    data,
    activeModeIndex,
    phase,
    showTrace,
    amplitudeScale,
    damping,
    isEditing,
    selectedIndices,
    onSelectSegment,
    systemHealth,
    gameMode
}) => {
    // Zoom & Pan
    const [zoom, setZoom] = useState(2.1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [rotation, setRotation] = useState({ yaw: -Math.PI / 4, pitch: Math.PI / 6 });
    
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [dragMode, setDragMode] = useState<'pan' | 'rotate'>('pan');
    
    const traceIsoRef = useRef<string[]>([]);
    const MAX_TRACE_HISTORY = 60;
    const isTripped = gameMode && systemHealth.status === 'danger';
    const FLOOR_LEVEL = -0.6;

    const activeMode = data.modes[activeModeIndex];

    useEffect(() => {
        traceIsoRef.current = [];
    }, [activeModeIndex, amplitudeScale, damping]);

    const handleWheel = (e: React.WheelEvent) => {
        if (isEditing) return;
        const scaleFactor = 0.1;
        const newZoom = Math.max(0.1, Math.min(10, zoom + (e.deltaY < 0 ? scaleFactor : -scaleFactor)));
        setZoom(newZoom);
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (isEditing) return;
        setIsDragging(true);
        setDragStart({ x: e.clientX, y: e.clientY });
        if (e.button === 2 || e.shiftKey) {
            setDragMode('pan');
        } else {
            setDragMode('rotate');
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        const dx = e.clientX - dragStart.x;
        const dy = e.clientY - dragStart.y;

        if (dragMode === 'pan') {
            setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
        } else if (dragMode === 'rotate') {
            const rotateSpeed = 0.005;
            setRotation(prev => ({
                yaw: prev.yaw + dx * rotateSpeed,
                pitch: Math.max(-Math.PI/2, Math.min(Math.PI/2, prev.pitch - dy * rotateSpeed))
            }));
        }
        setDragStart({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const resetZoom = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setZoom(2.1);
        setPan({x: 0, y: 0});
        setRotation({ yaw: -Math.PI / 4, pitch: Math.PI / 6 });
    };

    // Rendering Helpers
    const width = 1200;
    const height = 900;
    const cx = width / 2;
    const cy = height / 2;
    const scaleFactor = 750;
    const SCALE_ISOMETRIC = 0.2;
    const DAMPING_MODIFIER = (1 - damping * 0.8);

    const project = (x: number, y: number, z: number) => {
        const cosYaw = Math.cos(rotation.yaw);
        const sinYaw = Math.sin(rotation.yaw);
        const x1 = x * cosYaw - z * sinYaw;
        const z1 = x * sinYaw + z * cosYaw;

        const cosPitch = Math.cos(rotation.pitch);
        const sinPitch = Math.sin(rotation.pitch);
        const y2 = y * cosPitch - z1 * sinPitch;
        const z2 = y * sinPitch + z1 * cosPitch;

        const depth = 2.5; 
        const p = 1 / (depth + z2 * 0.5); 
        
        return {
            x: cx + x1 * scaleFactor * p,
            y: cy - y2 * scaleFactor * p,
            scale: p
        };
    };

    const renderFloorGrid = () => {
        const floorY = FLOOR_LEVEL; 
        const width = 1.2; 
        const depth = 0.5;
        const steps = 10;
        const lines = [];
        for (let i = 0; i <= steps; i++) {
            const z = -depth + (depth * 2 * i) / steps;
            const p1 = project(-0.6, floorY, z);
            const p2 = project(0.6, floorY, z);
            lines.push(`M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}`);
        }
        for (let i = 0; i <= steps; i++) {
            const x = -0.6 + (1.2 * i) / steps;
            const p1 = project(x, floorY, -depth);
            const p2 = project(x, floorY, depth);
            lines.push(`M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}`);
        }
        return <path d={lines.join(' ')} stroke="#475569" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" fill="none" />;
    };

    const renderWorldAxis = () => {
        const originX = -0.6; const originY = FLOOR_LEVEL; const originZ = 0;
        const axisLength = 0.1;
        const o = project(originX, originY, originZ);
        const shaftAxisEnd = project(originX + axisLength, originY, originZ);
        const vertAxisEnd = project(originX, originY + axisLength, originZ);
        const transAxisEnd = project(originX, originY, originZ + axisLength);
        return (
            <g opacity="0.9">
                <line x1={o.x} y1={o.y} x2={transAxisEnd.x} y2={transAxisEnd.y} stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
                <text x={transAxisEnd.x} y={transAxisEnd.y} fill="#ef4444" fontSize="12" fontWeight="bold">X</text>
                <line x1={o.x} y1={o.y} x2={vertAxisEnd.x} y2={vertAxisEnd.y} stroke="#22c55e" strokeWidth="3" strokeLinecap="round" />
                <text x={vertAxisEnd.x} y={vertAxisEnd.y - 10} fill="#22c55e" fontSize="12" fontWeight="bold">Y</text>
                <line x1={o.x} y1={o.y} x2={shaftAxisEnd.x} y2={shaftAxisEnd.y} stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" />
                <text x={shaftAxisEnd.x} y={shaftAxisEnd.y} fill="#3b82f6" fontSize="12" fontWeight="bold">Z</text>
                <circle cx={o.x} cy={o.y} r="2" fill="white" />
            </g>
        );
    };

    const deflectionScale = SCALE_ISOMETRIC * amplitudeScale * DAMPING_MODIFIER;
    
    const rings = data.shaftSegments.map((seg, i) => {
        const u = i / (data.shaftSegments.length - 1);
        const xPos = u - 0.5;
        const disp = getDisplacementAt(i, activeMode, data.shaftSegments.length);
        const yDef = disp * deflectionScale * Math.cos(phase);
        const zDef = disp * deflectionScale * Math.sin(phase);
        const center = project(xPos, yDef, zDef);
        const r = seg.outerDiameter * 20 * center.scale;
        return { center, r, seg, u, xPos, yDef, zDef };
    });

    const tracePath = rings.map(r => `${r.center.x},${r.center.y}`).join(' ');
    if (showTrace) {
        traceIsoRef.current.push(tracePath);
        if (traceIsoRef.current.length > MAX_TRACE_HISTORY) traceIsoRef.current.shift();
    }

    return (
      <div 
        className={`w-full h-full bg-slate-900 relative overflow-hidden ${isDragging && dragMode === 'rotate' ? 'cursor-grabbing' : 'cursor-grab'} ${isTripped ? 'animate-pulse bg-red-950/50' : ''}`}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onContextMenu={(e) => e.preventDefault()}
      >
        <div className="absolute top-2 left-2 text-[10px] font-mono text-cyan-400 bg-slate-950/80 px-2 py-0.5 rounded z-10 pointer-events-none">
            ISOMETRIC 3D • {dragMode === 'rotate' ? 'DRAG TO ROTATE' : 'DRAG TO PAN'}
        </div>
        
        {!isEditing && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-slate-800/90 backdrop-blur rounded-full px-4 py-2 border border-slate-600 shadow-2xl z-30">
            <button onClick={() => setZoom(z => Math.max(0.1, z - 0.1))} className="text-slate-300 hover:text-white p-1 hover:bg-slate-700 rounded-full">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
            </button>
            <span className="text-xs font-mono w-12 text-center text-cyan-400">{(zoom * 100).toFixed(0)}%</span>
            <button onClick={() => setZoom(z => Math.min(10, z + 0.1))} className="text-slate-300 hover:text-white p-1 hover:bg-slate-700 rounded-full">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
            </button>
            <div className="w-px h-4 bg-slate-600 mx-1"></div>
            <button onClick={resetZoom} className="flex items-center gap-1 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-700 px-3 py-1 rounded bg-slate-700/50 transition-colors">
                RESET
            </button>
        </div>
        )}

        <svg 
            viewBox={`0 0 ${width} ${height}`} 
            className="w-full h-full origin-center transition-transform duration-75 ease-out"
            style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
        >
            {renderFloorGrid()}
            
            {/* Bearings */}
            {data.rotors.filter(r => r.type === 'bearing' || r.type === 'coupling').map((b, i) => {
                const xPos = b.position - 0.5;
                const sideW = 0.15; 
                const pyramidStartY = FLOOR_LEVEL; 
                const apex = project(xPos, 0, 0); 
                const pt1 = project(xPos, pyramidStartY, sideW);
                const pt2 = project(xPos + sideW, pyramidStartY, 0);
                const pt3 = project(xPos, pyramidStartY, -sideW);
                const pt4 = project(xPos - sideW, pyramidStartY, 0);
                const face1 = `M ${pt1.x} ${pt1.y} L ${pt2.x} ${pt2.y} L ${apex.x} ${apex.y} Z`; 
                const face2 = `M ${pt2.x} ${pt2.y} L ${pt3.x} ${pt3.y} L ${apex.x} ${apex.y} Z`; 
                const face3 = `M ${pt3.x} ${pt3.y} L ${pt4.x} ${pt4.y} L ${apex.x} ${apex.y} Z`; 
                const face4 = `M ${pt4.x} ${pt4.y} L ${pt1.x} ${pt1.y} L ${apex.x} ${apex.y} Z`; 
                return (
                    <g key={`b-iso-${i}`}>
                        <path d={face3} fill="#fbbf24" fillOpacity="0.05" stroke="#fbbf24" strokeWidth="0.5" strokeOpacity="0.3" />
                        <path d={face4} fill="#fbbf24" fillOpacity="0.05" stroke="#fbbf24" strokeWidth="0.5" strokeOpacity="0.3" />
                        <path d={face2} fill="#fbbf24" fillOpacity="0.05" stroke="#fbbf24" strokeWidth="0.5" strokeOpacity="0.3" />
                        <path d={face1} fill="#fbbf24" fillOpacity="0.05" stroke="#fbbf24" strokeWidth="0.5" strokeOpacity="0.3" />
                    </g>
                );
            })}

            {renderWorldAxis()}

            {showTrace && traceIsoRef.current.map((pts, i) => (
               <polyline key={`tr-${i}`} points={pts} fill="none" stroke="#22d3ee" strokeWidth="4" opacity={(i/MAX_TRACE_HISTORY)*0.3}/>
            ))}

            {rings.slice().reverse().map((r1, i) => {
                const originalIndex = rings.length - 1 - i;
                if (originalIndex >= rings.length - 1) return null;
                const r2 = rings[originalIndex + 1];
                const seg = r1.seg;

                const dx = r2.center.x - r1.center.x;
                const dy = r2.center.y - r1.center.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                const nx = -dy / (dist || 1);
                const ny = dx / (dist || 1);
                
                const p1a = { x: r1.center.x + nx * r1.r, y: r1.center.y + ny * r1.r };
                const p1b = { x: r1.center.x - nx * r1.r, y: r1.center.y - ny * r1.r };
                const p2a = { x: r2.center.x + nx * r2.r, y: r2.center.y + ny * r2.r };
                const p2b = { x: r2.center.x - nx * r2.r, y: r2.center.y - ny * r2.r };
                
                const pathSkin = `M ${p1a.x} ${p1a.y} L ${p2a.x} ${p2a.y} L ${p2b.x} ${p2b.y} L ${p1b.x} ${p1b.y} Z`;
                const selected = selectedIndices.has(originalIndex);
                const color = getMaterialById(seg.materialId).color;

                return (
                    <g 
                        key={originalIndex}
                        onClick={(e) => { e.stopPropagation(); onSelectSegment(originalIndex); }}
                        className={isEditing ? "cursor-pointer hover:opacity-90" : ""}
                    >
                         <path d={pathSkin} fill={color} stroke={selected ? "#22d3ee" : "none"} strokeWidth={selected ? 1 : 0} />
                         <path d={pathSkin} fill="url(#metal-sheen-iso)" style={{mixBlendMode: 'multiply'}} opacity="0.8" className="pointer-events-none" />
                         <path d={pathSkin} fill="url(#metal-sheen-iso)" style={{mixBlendMode: 'screen'}} opacity="0.1" className="pointer-events-none" />
                    </g>
                );
            })}
            
            <polyline points={tracePath} fill="none" stroke="#22d3ee" strokeWidth="2" strokeOpacity="0.4" pointerEvents="none" />
        </svg>
      </div>
    );
};
