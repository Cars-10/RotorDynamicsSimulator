import React, { useState } from 'react';
import { ModeShape } from '../types';

interface AnalysisTableProps {
  modes: ModeShape[];
  onClose: () => void;
  operatingRpm: number;
}

const AnalysisTable: React.FC<AnalysisTableProps> = ({ modes, onClose, operatingRpm }) => {
  const [activeTab, setActiveTab] = useState<'table' | 'plot'>('table');

  const renderBodePlot = () => {
    // Generate Response Curve Data
    const maxModeRpm = modes.length > 0 ? Math.max(...modes.map(m => m.rpm)) : 0;
    const maxRpm = Math.max(operatingRpm * 2.5, maxModeRpm * 1.2);
    const points = [];
    const step = maxRpm / 300;

    for (let rpm = 0; rpm <= maxRpm; rpm += step) {
        let totalAmp = 0;
        
        // At 0 RPM, unbalance force is 0, so amplitude must be 0.
        if (rpm === 0) {
            points.push({ rpm: 0, amp: 0 });
            continue;
        }

        modes.forEach(mode => {
            const ratio = rpm / mode.rpm; // r = w / wn
            const dampingRatio = 1 / (2 * mode.qFactor);
            
            // Unbalance Response Factor: r^2 / sqrt((1-r^2)^2 + (2*zeta*r)^2)
            // This ensures amplitude starts at 0 and goes to 1 (normalized) at high speed (mass center)
            const numer = ratio * ratio;
            const denom = Math.sqrt( Math.pow(1 - ratio*ratio, 2) + Math.pow(2 * dampingRatio * ratio, 2) );
            const af = numer / denom;

            // Weight lower modes slightly higher for visualization hierarchy
            totalAmp += af * (1.0 / Math.sqrt(mode.order)); 
        });
        points.push({ rpm, amp: totalAmp });
    }

    // Normalizing for Plot
    const maxAmp = Math.max(...points.map(p => p.amp)) || 1;
    const width = 450;
    const height = 250;
    const padding = 30;
    
    const scaleX = (width - padding * 2) / maxRpm;
    const scaleY = (height - padding * 2) / (maxAmp * 1.1);

    const pathD = points.map((p, i) => 
        `${i === 0 ? 'M' : 'L'} ${padding + p.rpm * scaleX} ${height - padding - p.amp * scaleY}`
    ).join(' ');

    // Exclusion Zones (Stay Away lines)
    // +/- 10% of Operating Speed (1X) and 2X
    const zone1Start = operatingRpm * 0.9;
    const zone1End = operatingRpm * 1.1;
    const zone2Start = (operatingRpm * 2) * 0.9;
    const zone2End = (operatingRpm * 2) * 1.1;

    const renderZone = (start: number, end: number, label: string) => {
        const x1 = padding + start * scaleX;
        const x2 = padding + end * scaleX;
        return (
            <g>
                <rect x={x1} y={padding} width={x2-x1} height={height - 2*padding} fill="#ef4444" opacity="0.15" />
                <line x1={x1} y1={padding} x2={x1} y2={height - padding} stroke="#ef4444" strokeWidth="1" strokeDasharray="2 2" opacity="0.5" />
                <line x1={x2} y1={padding} x2={x2} y2={height - padding} stroke="#ef4444" strokeWidth="1" strokeDasharray="2 2" opacity="0.5" />
                <text x={(x1+x2)/2} y={padding + 10} fill="#ef4444" fontSize="9" textAnchor="middle" opacity="0.8">{label}</text>
            </g>
        )
    };

    return (
        <div className="bg-slate-950 p-4 rounded border border-slate-800 relative">
             <div className="text-center text-xs font-bold text-slate-400 mb-2">BODE PLOT: AMPLITUDE vs RPM</div>
             <svg width={width} height={height} className="overflow-visible">
                 {/* Grid */}
                 <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#475569" strokeWidth="2" />
                 <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#475569" strokeWidth="2" />
                 
                 {/* Exclusion Zones */}
                 {renderZone(zone1Start, zone1End, "1X STAY AWAY")}
                 {renderZone(zone2Start, zone2End, "2X STAY AWAY")}

                 {/* Curve */}
                 <path d={pathD} fill="none" stroke="#22d3ee" strokeWidth="2" />

                 {/* Peaks / Critical Speeds */}
                 {modes.map(mode => {
                     const x = padding + mode.rpm * scaleX;
                     return (
                         <g key={mode.order}>
                             <line x1={x} y1={padding} x2={x} y2={height - padding} stroke="#fbbf24" strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />
                             <text x={x} y={height - padding + 15} textAnchor="middle" fill="#fbbf24" fontSize="9" fontWeight="bold">
                                 {mode.rpm.toFixed(0)}
                             </text>
                             <text x={x} y={padding - 5} textAnchor="middle" fill="#fbbf24" fontSize="9">
                                 Q={mode.qFactor}
                             </text>
                         </g>
                     )
                 })}
             </svg>
             <div className="flex justify-between px-8 text-[10px] text-slate-500 mt-1">
                 <span>0 RPM</span>
                 <span>SPEED (RPM)</span>
                 <span>{maxRpm.toFixed(0)} RPM</span>
             </div>
             <div className="text-[10px] text-slate-500 mt-2 text-center">
                 Red Zones indicate +/- 10% exclusion range from operating speed ({operatingRpm} RPM) and harmonics.
                 Curve represents unbalance response.
             </div>
        </div>
    );
  };

  return (
    <div className="absolute top-16 right-4 z-50 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-lg shadow-2xl p-4 w-[500px] max-w-[90vw] animate-in slide-in-from-top-4 duration-300 flex flex-col max-h-[80vh]">
      <div className="flex justify-between items-center mb-4 shrink-0">
        <h3 className="text-white font-bold text-lg flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18"/><path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/></svg>
            Critical Speed Analysis
        </h3>
        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>

      <div className="flex gap-2 mb-4 shrink-0">
          <button 
            onClick={() => setActiveTab('table')}
            className={`flex-1 py-1 rounded text-xs font-bold transition-colors ${activeTab === 'table' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' : 'bg-slate-800 text-slate-500 border border-slate-700 hover:text-slate-300'}`}
          >
              DATA TABLE
          </button>
          <button 
            onClick={() => setActiveTab('plot')}
            className={`flex-1 py-1 rounded text-xs font-bold transition-colors ${activeTab === 'plot' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' : 'bg-slate-800 text-slate-500 border border-slate-700 hover:text-slate-300'}`}
          >
              RESPONSE PLOT
          </button>
      </div>

      <div className="overflow-y-auto custom-scrollbar flex-1 min-h-[300px]">
      {activeTab === 'table' ? (
      <>
        <div className="overflow-hidden rounded border border-slate-700">
            <table className="w-full text-sm text-left">
            <thead className="bg-slate-800 text-slate-300 text-xs uppercase">
                <tr>
                <th className="px-3 py-2">Mode</th>
                <th className="px-3 py-2 text-right">RPM</th>
                <th className="px-3 py-2 text-right">Freq (Hz)</th>
                <th className="px-3 py-2 text-right">Q Factor</th>
                <th className="px-3 py-2 text-right text-cyan-400">Damping (ζ)</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
                {modes.map((mode) => {
                // Calculate Damping Ratio: ζ = 1 / (2 * Q)
                const dampingRatio = 1 / (2 * mode.qFactor);
                const freq = mode.rpm / 60;

                return (
                <tr key={mode.order} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-3 py-2 text-cyan-400 font-bold font-mono">#{mode.order}</td>
                    <td className="px-3 py-2 text-right font-mono text-slate-200">{mode.rpm.toFixed(0)}</td>
                    <td className="px-3 py-2 text-right font-mono">{freq.toFixed(1)}</td>
                    <td className="px-3 py-2 text-right font-mono">{mode.qFactor.toFixed(1)}</td>
                    <td className="px-3 py-2 text-right font-mono text-cyan-400 bg-cyan-900/10">
                        {dampingRatio.toFixed(3)}
                    </td>
                </tr>
                )})}
            </tbody>
            </table>
        </div>
        
        <div className="mt-3 grid grid-cols-2 gap-4 text-[10px] text-slate-500 bg-slate-950/50 p-2 rounded border border-slate-800">
            <div>
                <strong className="text-slate-400">Damping Ratio (ζ)</strong>
                <div className="font-mono mt-1">ζ = 1 / (2 * Q)</div>
                <p className="mt-1">Fraction of critical damping. Typically 0.02 - 0.10 for large rotors.</p>
            </div>
            <div>
                <strong className="text-slate-400">Exclusion Zones</strong>
                <div className="font-mono mt-1">±10% @ 1X, 2X</div>
                <p className="mt-1">Operating range should avoid resonant peaks.</p>
            </div>
        </div>
      </>
      ) : (
          renderBodePlot()
      )}
      </div>
    </div>
  );
};

export default AnalysisTable;