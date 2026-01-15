import React, { useEffect, useRef, useState } from 'react';
import { SimulationData, ViewType, ShaftSegment } from '../types';

interface RotorVisualizerProps {
  data: SimulationData;
  activeModeIndex: number;
  isPlaying: boolean;
  viewMode: ViewType;
  showTrace: boolean;
  amplitudeScale: number;
  damping: number;
  isEditing: boolean;
  onUpdateSegment: (index: number, updates: Partial<ShaftSegment>) => void;
  selectedSegmentIndex: number | null; 
  selectedIndices?: Set<number>;
  onSelectSegment: (index: number) => void;
  systemHealth: { status: 'safe' | 'warning' | 'danger', message: string, estimatedMils: number };
  gameMode: boolean;
}

const RotorVisualizer: React.FC<RotorVisualizerProps> = ({ 
    data, 
    activeModeIndex, 
    isPlaying, 
    viewMode, 
    showTrace,
    amplitudeScale,
    damping,
    isEditing,
    onUpdateSegment,
    selectedSegmentIndex,
    selectedIndices,
    onSelectSegment,
    systemHealth,
    gameMode
}) => {
  const [phase, setPhase] = useState(0);
  const requestRef = useRef<number>();
  
  // Zoom & Pan State
  const DEFAULT_ZOOM = 2.1; 
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragMode, setDragMode] = useState<'pan' | 'rotate'>('pan');

  // Rotation State (Isometric)
  const [rotation, setRotation] = useState({ yaw: -Math.PI / 4, pitch: Math.PI / 6 });

  // Visual Editing State
  const editStartYRef = useRef<number>(0);
  const editStartDiameterRef = useRef<number>(0);
  const editCurrentIndexRef = useRef<number | null>(null);

  // Tracing history buffers
  const MAX_TRACE_HISTORY = 60; 
  const traceRadialRef = useRef<string[]>([]);
  const traceIsoRef = useRef<string[]>([]);

  const activeMode = data.modes[activeModeIndex];
  
  // Trip State Visuals
  const isTripped = gameMode && systemHealth.status === 'danger';

  // Constants
  const FLOOR_LEVEL = -0.6; // Y position of the turbine deck

  // Animation Loop
  const animate = () => {
    if (isPlaying) {
      setPhase((prev) => (prev + 0.05) % (2 * Math.PI));
    }
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying]);

  useEffect(() => {
     traceRadialRef.current = [];
     traceIsoRef.current = [];
  }, [activeModeIndex, amplitudeScale, damping]);

  // Reset zoom on view change
  useEffect(() => {
    setZoom(DEFAULT_ZOOM);
    setPan({x: 0, y: 0});
    if (viewMode === ViewType.ISOMETRIC || viewMode === ViewType.ALL) {
        setRotation({ yaw: -Math.PI / 4, pitch: Math.PI / 6 });
    }
  }, [viewMode]);

  // --- Zoom Handlers ---
  const handleWheel = (e: React.WheelEvent) => {
    if (isEditing) return; 
    e.preventDefault();
    const scaleFactor = 0.1;
    const newZoom = Math.max(0.1, Math.min(10, zoom + (e.deltaY < 0 ? scaleFactor : -scaleFactor)));
    setZoom(newZoom);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isEditing) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });

    if (viewMode === ViewType.ISOMETRIC || viewMode === ViewType.ALL) {
        if (e.button === 2 || e.shiftKey) {
            setDragMode('pan');
        } else {
            setDragMode('rotate');
        }
    } else {
        setDragMode('pan');
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isEditing && editCurrentIndexRef.current !== null && isDragging) {
        const deltaY = editStartYRef.current - e.clientY;
        const scaleFactor = 0.005; 
        const newDiameter = Math.max(0.1, Math.min(1.5, editStartDiameterRef.current + deltaY * scaleFactor));
        onUpdateSegment(editCurrentIndexRef.current, { outerDiameter: newDiameter });
        return;
    }

    if (isDragging && !isEditing) {
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
    }
  };

  const handleMouseUp = () => {
      setIsDragging(false);
      editCurrentIndexRef.current = null;
  };

  const resetZoom = (e?: React.MouseEvent) => {
      e?.stopPropagation();
      setZoom(DEFAULT_ZOOM);
      setPan({x: 0, y: 0});
      setRotation({ yaw: -Math.PI / 4, pitch: Math.PI / 6 });
  };

  const handleSegmentMouseDown = (e: React.MouseEvent, index: number, currentDiameter: number) => {
      if (!isEditing) return;
      e.stopPropagation();
      onSelectSegment(index);
      setIsDragging(true); 
      editStartYRef.current = e.clientY;
      editStartDiameterRef.current = currentDiameter;
      editCurrentIndexRef.current = index;
  };

  const getDisplacementAt = (index: number) => {
    if (!activeMode) return 0;
    if (activeMode.displacements.length === data.shaftSegments.length) {
        return activeMode.displacements[index] || 0;
    }
    const ratio = index / (data.shaftSegments.length - 1);
    const dIndex = ratio * (activeMode.displacements.length - 1);
    const i = Math.floor(dIndex);
    const j = Math.ceil(dIndex);
    const w = dIndex - i;
    const valI = activeMode.displacements[i] || 0;
    const valJ = activeMode.displacements[j] || 0;
    return valI + (valJ - valI) * w;
  };

  // Check selection (support both Set and legacy single index)
  const isSelected = (index: number) => {
      if (selectedIndices) return selectedIndices.has(index);
      return selectedSegmentIndex === index;
  };

  // SCALING MODIFIERS
  const DAMPING_MODIFIER = (1 - damping * 0.8);
  const SCALE_LONGITUDINAL = 40;
  const SCALE_RADIAL = 250;
  const SCALE_ISOMETRIC = 0.2; // Reduced for less exaggerated deflection

  const renderDefs = () => (
      <defs>
        <linearGradient id="metal-sheen-vert" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="black" stopOpacity="0.5"/>
            <stop offset="30%" stopColor="white" stopOpacity="0.3"/>
            <stop offset="50%" stopColor="white" stopOpacity="0.1"/>
            <stop offset="70%" stopColor="black" stopOpacity="0.4"/>
            <stop offset="100%" stopColor="black" stopOpacity="0.6"/>
        </linearGradient>
        <linearGradient id="metal-sheen-iso" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="black" stopOpacity="0.4"/>
            <stop offset="40%" stopColor="white" stopOpacity="0.5"/>
            <stop offset="100%" stopColor="black" stopOpacity="0.7"/>
        </linearGradient>
        <pattern id="bearing-pattern" width="4" height="4" patternUnits="userSpaceOnUse">
             <line x1="0" y1="4" x2="4" y2="0" stroke="#fbbf24" strokeWidth="1" opacity="0.5" />
        </pattern>
      </defs>
  );

  // --- LONGITUDINAL VIEW ---
  const renderHorizontalView = (isOverlay = false) => {
    const viewWidth = 1400; 
    const viewHeight = 600; 
    const paddingX = 30; // Minimized padding
    const drawWidth = viewWidth - (paddingX * 2);
    const centerY = viewHeight / 2;
    
    const yScale = SCALE_LONGITUDINAL * amplitudeScale * DAMPING_MODIFIER;
    
    const segmentWidth = drawWidth / data.shaftSegments.length;

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
          {renderDefs()}
          <line x1={0} y1={centerY} x2={viewWidth} y2={centerY} stroke="#334155" strokeDasharray="4 4" />

          {/* Bearings Underlay (Labels moved here) */}
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

          {/* Render Segments */}
          {isEditing ? (
             data.shaftSegments.map((seg) => {
                 const x = paddingX + seg.index * segmentWidth;
                 const disp = getDisplacementAt(seg.index);
                 const r = seg.outerDiameter * 70; 
                 const y = centerY + disp * yScale * Math.cos(phase);
                 const selected = isSelected(seg.index);

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
                   const disp = getDisplacementAt(i);
                   const r = chunk[0].outerDiameter * 70;
                   const y = centerY + disp * yScale * Math.cos(phase) - r/2;
                   const x = paddingX + i * segmentWidth;
                   pathD += ` L ${x} ${y} L ${x + segmentWidth} ${y}`;
                }
                for (let i = endIdx; i >= startIdx; i--) {
                  const disp = getDisplacementAt(i);
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

          {/* LABELS */}
          {data.shaftSegments.filter(s => s.label).map((seg, i) => {
               const disp = getDisplacementAt(seg.index);
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

  // --- RADIAL VIEW (Simplified Axis Line) ---
  const renderRadialView = (isOverlay = false) => {
    const width = isOverlay ? 400 : 600;
    const height = isOverlay ? 400 : 600;
    const cx = width / 2;
    const cy = height / 2;
    const fov = 400; // Increased FOV
    
    // RADIAL SCALE - 1/10th
    const deflectionScale = (SCALE_RADIAL * amplitudeScale * DAMPING_MODIFIER) * 0.1;
    
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

    // Calculate axis points
    const axisPoints = data.shaftSegments.map((seg, i) => {
        const u = i / data.shaftSegments.length;
        const disp = getDisplacementAt(i);
        const radius = disp * deflectionScale; 
        const x = radius * Math.sin(phase);
        const y = radius * Math.cos(phase);
        return { ...project(x, y, u) };
    });

    // Create Smooth Path for the Axis
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
      <div className={`w-full h-full ${isOverlay ? 'bg-slate-950/80 backdrop-blur-md' : 'bg-slate-900'} border border-slate-700 rounded-lg overflow-hidden relative select-none ${isTripped ? 'animate-pulse bg-red-950/50' : ''}`}>
        <div className="absolute top-2 left-2 text-[10px] font-mono text-cyan-400 bg-slate-950/80 px-2 py-0.5 rounded z-10">RADIAL ORBIT (AXIS VIEW)</div>
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
           {renderDefs()}
           <line x1={cx} y1={0} x2={cx} y2={height} stroke="#1e293b" strokeWidth="1" />
           <line x1={0} y1={cy} x2={width} y2={cy} stroke="#1e293b" strokeWidth="1" />
           <circle cx={cx} cy={cy} r={width/3} stroke="#1e293b" strokeWidth="1" fill="none" strokeDasharray="4 4" />

            {/* Bearings - No Labels */}
            {bearingRings.map((b, i) => (
                <g key={`b-rad-${i}`} opacity="0.6">
                    <circle cx={b.center.x} cy={b.center.y} r={b.housingRadius} stroke="#fbbf24" strokeWidth="2" fill="none" />
                </g>
            ))}

           {/* The Smooth Axis Line */}
           <path d={axisPath} fill="none" stroke="#22d3ee" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" filter="drop-shadow(0 0 4px #22d3ee)" />

           {/* Tip Marker */}
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

  // --- ISOMETRIC VIEW (Rotatable) ---
  const renderIsometricView = () => {
    const width = 1200;
    const height = 900;
    const cx = width / 2;
    const cy = height / 2;
    const scaleFactor = 750; // Increased scale

    // 3D Projection Helper
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

    // ISO SCALE
    const deflectionScale = SCALE_ISOMETRIC * amplitudeScale * DAMPING_MODIFIER;
    
    // Map segments to 3D rings
    const rings = data.shaftSegments.map((seg, i) => {
        const u = i / (data.shaftSegments.length - 1); // 0 to 1
        const xPos = u - 0.5; // Centered X: -0.5 to 0.5
        
        const disp = getDisplacementAt(i);
        const yDef = disp * deflectionScale * Math.cos(phase);
        const zDef = disp * deflectionScale * Math.sin(phase);
        
        const center = project(xPos, yDef, zDef);
        const r = seg.outerDiameter * 20 * center.scale;
        
        return { center, r, seg, u, xPos, yDef, zDef };
    });

    const tracePath = rings.map(r => `${r.center.x},${r.center.y}`).join(' ');
    if (showTrace && isPlaying) {
        traceIsoRef.current.push(tracePath);
        if (traceIsoRef.current.length > MAX_TRACE_HISTORY) traceIsoRef.current.shift();
    }

    // --- Draw Axis in 3D Space (Anchored on the FLOOR) ---
    const renderWorldAxis = () => {
        const originX = -0.6; // Start slightly before the shaft
        const originY = FLOOR_LEVEL; // On the floor
        const originZ = 0;
        const axisLength = 0.1; // Reduced length

        const o = project(originX, originY, originZ);
        
        // Axis 1: Along the Shaft (My X) -> Blue (Z for user)
        const shaftAxisEnd = project(originX + axisLength, originY, originZ);
        
        // Axis 2: Vertical (My Y) -> Green (Y for user)
        const vertAxisEnd = project(originX, originY + axisLength, originZ);
        
        // Axis 3: Transverse (My Z) -> Red (X for user)
        const transAxisEnd = project(originX, originY, originZ + axisLength);

        return (
            <g opacity="0.9">
                {/* Transverse (Red) */}
                <line x1={o.x} y1={o.y} x2={transAxisEnd.x} y2={transAxisEnd.y} stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
                <text x={transAxisEnd.x} y={transAxisEnd.y} fill="#ef4444" fontSize="12" fontWeight="bold">X</text>
                
                {/* Vertical (Green) */}
                <line x1={o.x} y1={o.y} x2={vertAxisEnd.x} y2={vertAxisEnd.y} stroke="#22c55e" strokeWidth="3" strokeLinecap="round" />
                <text x={vertAxisEnd.x} y={vertAxisEnd.y - 10} fill="#22c55e" fontSize="12" fontWeight="bold">Y</text>

                {/* Shaft Axis (Blue) */}
                <line x1={o.x} y1={o.y} x2={shaftAxisEnd.x} y2={shaftAxisEnd.y} stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" />
                <text x={shaftAxisEnd.x} y={shaftAxisEnd.y} fill="#3b82f6" fontSize="12" fontWeight="bold">Z</text>
                
                <circle cx={o.x} cy={o.y} r="2" fill="white" />
            </g>
        );
    };

    // --- Render Floor Grid ---
    const renderFloorGrid = () => {
        const floorY = FLOOR_LEVEL; 
        const width = 1.2; // Extent X
        const depth = 0.5; // Extent Z
        const steps = 10;
        
        const lines = [];
        
        // Longitudinal lines
        for (let i = 0; i <= steps; i++) {
            const z = -depth + (depth * 2 * i) / steps;
            const p1 = project(-0.6, floorY, z);
            const p2 = project(0.6, floorY, z);
            lines.push(`M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}`);
        }

        // Transverse lines
        for (let i = 0; i <= steps; i++) {
            const x = -0.6 + (1.2 * i) / steps;
            const p1 = project(x, floorY, -depth);
            const p2 = project(x, floorY, depth);
            lines.push(`M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}`);
        }

        return (
            <path d={lines.join(' ')} stroke="#475569" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" fill="none" />
        );
    };

    // --- Draw Bearings ---
    const renderBearings = () => {
        return data.rotors.filter(r => r.type === 'bearing' || r.type === 'coupling').map((b, i) => {
            const xPos = b.position - 0.5;
            const sideW = 0.15; 
            const groundY = FLOOR_LEVEL; 
            const pyramidStartY = groundY; // Sit directly on floor
            const apex = project(xPos, 0, 0); 
            
            // Pyramid Base Points (At Floor Level)
            const pt1 = project(xPos, pyramidStartY, sideW);
            const pt2 = project(xPos + sideW, pyramidStartY, 0);
            const pt3 = project(xPos, pyramidStartY, -sideW);
            const pt4 = project(xPos - sideW, pyramidStartY, 0);

            // Pyramid Faces from Base to Apex
            const face1 = `M ${pt1.x} ${pt1.y} L ${pt2.x} ${pt2.y} L ${apex.x} ${apex.y} Z`; 
            const face2 = `M ${pt2.x} ${pt2.y} L ${pt3.x} ${pt3.y} L ${apex.x} ${apex.y} Z`; 
            const face3 = `M ${pt3.x} ${pt3.y} L ${pt4.x} ${pt4.y} L ${apex.x} ${apex.y} Z`; 
            const face4 = `M ${pt4.x} ${pt4.y} L ${pt1.x} ${pt1.y} L ${apex.x} ${apex.y} Z`; 
            
            return (
                <g key={`b-iso-${i}`}>
                     {/* Pyramid */}
                     <path d={face3} fill="#fbbf24" fillOpacity="0.05" stroke="#fbbf24" strokeWidth="0.5" strokeOpacity="0.3" />
                     <path d={face4} fill="#fbbf24" fillOpacity="0.05" stroke="#fbbf24" strokeWidth="0.5" strokeOpacity="0.3" />
                     <path d={face2} fill="#fbbf24" fillOpacity="0.05" stroke="#fbbf24" strokeWidth="0.5" strokeOpacity="0.3" />
                     <path d={face1} fill="#fbbf24" fillOpacity="0.05" stroke="#fbbf24" strokeWidth="0.5" strokeOpacity="0.3" />
                </g>
            );
        });
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
            <button onClick={() => setZoom(z => Math.max(0.1, z - 0.1))} className="text-slate-300 hover:text-white p-1 hover:bg-slate-700 rounded-full" title="Zoom Out">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
            </button>
            <span className="text-xs font-mono w-12 text-center text-cyan-400">{(zoom * 100).toFixed(0)}%</span>
            <button onClick={() => setZoom(z => Math.min(10, z + 0.1))} className="text-slate-300 hover:text-white p-1 hover:bg-slate-700 rounded-full" title="Zoom In">
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
            {renderDefs()}
            
            {/* 3D Floor Grid */}
            {renderFloorGrid()}

            {/* Bearings Underlay */}
            {renderBearings()}
            
            {/* World Axis Indicator on Floor */}
            {renderWorldAxis()}

            {showTrace && traceIsoRef.current.map((pts, i) => (
               <polyline key={`tr-${i}`} points={pts} fill="none" stroke="#22d3ee" strokeWidth="4" opacity={(i/MAX_TRACE_HISTORY)*0.3}/>
            ))}

            {/* Shaft Segments */}
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
                const selected = isSelected(originalIndex);

                return (
                    <g 
                        key={originalIndex}
                        onClick={(e) => { e.stopPropagation(); onSelectSegment(originalIndex); }}
                        className={isEditing ? "cursor-pointer hover:opacity-90" : ""}
                    >
                         <path d={pathSkin} fill={seg.color} stroke={selected ? "#22d3ee" : "none"} strokeWidth={selected ? 1 : 0} />
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

  // --- COMPOSITE LAYOUT ---
  if (viewMode === ViewType.ALL) {
      return (
        <div className="relative w-full h-full bg-slate-950 overflow-hidden">
            <div className="absolute inset-0 z-0">
                {renderIsometricView()}
            </div>
            <div className="absolute top-4 left-4 w-96 h-96 z-10 shadow-2xl shadow-black/80 rounded-lg transition-opacity hover:opacity-100 opacity-95">
                {renderRadialView(true)}
            </div>
            <div className={`absolute bottom-4 right-4 z-10 shadow-2xl shadow-black/80 rounded-lg transition-opacity hover:opacity-100 opacity-95 hidden xl:block ${isEditing ? 'w-[1000px] h-[400px]' : 'w-[800px] h-72'}`}>
                {renderHorizontalView(true)}
            </div>
        </div>
      );
  }

  return (
      <div className="w-full h-full relative bg-slate-900">
          {viewMode === ViewType.ISOMETRIC && renderIsometricView()}
          {viewMode === ViewType.RADIAL && renderRadialView()}
          {viewMode === ViewType.LONGITUDINAL && renderHorizontalView()}
      </div>
  );
};

export default RotorVisualizer;