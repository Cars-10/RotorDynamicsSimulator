import React, { useEffect, useState, useRef } from 'react';
import { ModeShape, RotorComponent, ShaftSegment } from '../types';

interface BearingAnalystProps {
    bearings: RotorComponent[];
    activeMode: ModeShape;
    segments: ShaftSegment[];
    amplitudeScale: number;
    damping: number;
}

const BearingAnalyst: React.FC<BearingAnalystProps> = ({ bearings, activeMode, segments, amplitudeScale, damping }) => {
    const [phase, setPhase] = useState(0);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const waveformRef = useRef<{x: number[], y: number[]}>({x: [], y: []});

    // Sync phase loop for local animation
    useEffect(() => {
        let raf: number;
        const loop = () => {
            setPhase(p => (p + 0.1) % (2 * Math.PI)); // Faster for smooth scope
            raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(raf);
    }, []);

    // Reset waveform on mode change
    useEffect(() => {
        waveformRef.current = {x: [], y: []};
    }, [activeMode]);

    // Helper to get displacement magnitude at bearing position
    const getDispMils = (pos: number) => {
        const idx = Math.floor(pos * (segments.length - 1));
        const normalized = activeMode.displacements[idx] || 0;
        const dampingFactor = (1 - damping);
        return Math.abs(normalized * amplitudeScale * 5 * dampingFactor);
    };

    // Render the Expanded Scope View (Large Modal)
    const renderScope = (b: RotorComponent) => {
        const mils = getDispMils(b.position);
        
        // Visualize ellipse
        const scale = 30; // Scale for plot pixels per mil
        const ampX = mils * scale;
        const ampY = mils * scale * 0.8; 
        
        const vx = ampX * Math.sin(phase);
        const vy = ampY * Math.cos(phase); // 90 deg phase shift for orbit

        // Update History for Waveforms
        if (waveformRef.current.x.length > 100) {
            waveformRef.current.x.shift();
            waveformRef.current.y.shift();
        }
        waveformRef.current.x.push(vx);
        waveformRef.current.y.push(vy);

        const wavePointsX = waveformRef.current.x.map((val, i) => `${i * 3},${100 - val/2}`).join(' ');
        const wavePointsY = waveformRef.current.y.map((val, i) => `${i * 3},${100 - val/2}`).join(' ');

        return (
            <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-6 w-full max-w-6xl relative">
                    <button 
                        onClick={() => setExpandedId(null)}
                        className="absolute top-4 right-4 text-slate-400 hover:text-white"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                    </button>

                    <h3 className="text-xl font-bold text-white mb-1">{b.name} Vibration Scope</h3>
                    <div className="flex gap-4 items-center mb-6">
                        <p className="text-sm text-slate-400 font-mono">
                            PHASE: {(phase * 57.29).toFixed(0)}°
                        </p>
                        <div className={`px-2 py-0.5 rounded text-xs font-bold ${
                             mils > 8 ? 'bg-red-500/20 text-red-500' :
                             mils > 5 ? 'bg-amber-500/20 text-amber-500' : 'bg-green-500/20 text-green-500'
                        }`}>
                             AMPLITUDE: {mils.toFixed(2)} MILS
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                        {/* LEFT: ORBIT PLOT (X vs Y) */}
                        <div className="bg-slate-950 rounded-lg border border-slate-800 aspect-square relative flex items-center justify-center overflow-hidden">
                             {/* Grid */}
                             <div className="absolute inset-0 opacity-20" 
                                  style={{ backgroundImage: 'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                             </div>
                             <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#475569" strokeWidth="1" />
                             <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#475569" strokeWidth="1" />
                             
                             {/* Limits Circles (5 mil / 8 mil) */}
                             <circle cx="0" cy="0" r={5 * scale} fill="none" stroke="#eab308" strokeDasharray="4 4" opacity="0.5" />
                             <circle cx="0" cy="0" r={8 * scale} fill="none" stroke="#ef4444" strokeDasharray="4 4" opacity="0.5" />

                             <svg className="absolute inset-0 w-full h-full" viewBox="-200 -200 400 400">
                                 <ellipse cx="0" cy="0" rx={ampX} ry={ampY} fill="none" stroke="#22d3ee" strokeWidth="2" />
                                 <line x1="0" y1="0" x2={vx} y2={-vy} stroke="#22d3ee" strokeWidth="1" opacity="0.5" />
                                 <circle cx={vx} cy={-vy} r="4" fill="#22d3ee" />
                             </svg>
                        </div>

                        
                    </div>
                </div>
            </div>
        );
    };

    // Helper for mini sparkline plots on side overlay
    const renderMiniWave = (isX: boolean, amp: number) => {
        // Just a simple sine wave path
        const pts = [];
        for(let i=0; i<30; i++) {
            const t = i/3;
            const v = Math.sin(t + phase + (isX ? 0 : 1.57)); 
            pts.push(`${i*3},${15 - v * amp}`);
        }
        return (
            <svg width="100%" height="100%" viewBox="0 0 90 30" preserveAspectRatio="none" className="opacity-80">
                <polyline points={pts.join(' ')} fill="none" stroke={isX ? "#ef4444" : "#22c55e"} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
            </svg>
        )
    };

    return (
        <>
            {/* Overlay Container - Right Side */}
            <div className="absolute top-16 right-2 flex flex-col items-end gap-2 z-20 pointer-events-none max-h-[85vh] overflow-y-auto pr-1">
                {bearings.map((b) => {
                    const mils = getDispMils(b.position);
                    const r = mils * 3; // Reduced visual scale for mini plot
                    
                    const vx = r * Math.sin(phase);
                    const vy = r * 0.8 * Math.cos(phase);

                    // Tolerance Colors
                    const statusColor = mils > 8 ? 'text-red-500' : mils > 5 ? 'text-amber-500' : 'text-slate-500';
                    const ringColor = mils > 8 ? 'border-red-500' : mils > 5 ? 'border-amber-500' : 'border-slate-800';

                    return (
                        <div key={b.id} className="group relative pointer-events-auto flex items-center justify-end">
                            
                            {/* Slide-out Drawer (Slides out to the LEFT) - Miniaturized */}
                            <div className="absolute right-[105%] flex flex-col gap-0.5 bg-slate-900/95 border border-slate-700 rounded p-0.5 shadow-lg opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 pointer-events-none w-12">
                                <div className="text-[6px] text-slate-500 font-bold uppercase text-center leading-none mb-0.5">X/Y</div>
                                <div className="bg-slate-950 h-4 rounded border border-slate-800 flex items-center justify-center overflow-hidden">
                                     {renderMiniWave(true, Math.min(10, mils))}
                                </div>
                                <div className="bg-slate-950 h-4 rounded border border-slate-800 flex items-center justify-center overflow-hidden">
                                     {renderMiniWave(false, Math.min(10, mils*0.9))}
                                </div>
                            </div>

                            {/* Main Mini-Widget */}
                            <div 
                                onClick={() => setExpandedId(b.id)}
                                className={`relative bg-slate-900/90 backdrop-blur border ${ringColor} rounded-lg p-1.5 shadow-xl cursor-pointer hover:border-cyan-500 hover:bg-slate-800 transition-all w-20`}
                            >
                                <div className="text-[8px] font-bold text-amber-400 mb-1 flex justify-center truncate">
                                    <span>{b.name}</span>
                                </div>
                                <div className="relative w-full aspect-square bg-slate-950 rounded-full border border-slate-800 flex items-center justify-center overflow-hidden">
                                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)', backgroundSize: '6px 6px' }}></div>
                                    <div className="absolute w-full h-[1px] bg-slate-700/50"></div>
                                    <div className="absolute h-full w-[1px] bg-slate-700/50"></div>
                                    
                                    {/* 5 and 8 mil Limits */}
                                    <div className="absolute w-[50%] h-[50%] rounded-full border border-yellow-500/20 border-dashed"></div>
                                    <div className="absolute w-[80%] h-[80%] rounded-full border border-red-500/20 border-dashed"></div>
                                    
                                    {/* Vector */}
                                    <div 
                                        className="absolute w-1 h-1 bg-cyan-400 rounded-full shadow-[0_0_4px_cyan]"
                                        style={{ transform: `translate(${vx}px, ${vy}px)` }}
                                    ></div>
                                </div>
                                <div className={`text-[8px] text-center font-mono mt-0.5 ${statusColor}`}>
                                    {mils.toFixed(1)}
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Modal */}
            {expandedId && (
                renderScope(bearings.find(b => b.id === expandedId)!)
            )}
        </>
    );
};

export default BearingAnalyst;