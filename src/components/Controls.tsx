import React from 'react';
import { ModeShape, ViewType } from '../types';

interface ControlsProps {
  modes: ModeShape[];
  activeModeIndex: number;
  onSelectMode: (index: number) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  isPlaying: boolean;
  onTogglePlay: () => void;
  viewMode: ViewType;
  onViewChange: (mode: ViewType) => void;
  showTrace: boolean;
  onToggleTrace: () => void;
  amplitudeScale: number;
  onAmplitudeChange: (val: number) => void;
  damping: number;
  onDampingChange: (val: number) => void;
  
  isEditing: boolean;
  onToggleEdit: () => void;
  onShowReport: () => void;
  onToggleTutorial: () => void;
  
  machineType: 'hydrogen' | 'nuclear';
  setMachineType: (t: 'hydrogen' | 'nuclear') => void;
  gridFreq: 50 | 60;
  setGridFreq: (f: 50 | 60) => void;
  operatingRpm: number;

  gameMode: boolean;
  setGameMode: (v: boolean) => void;
  systemHealth: { status: 'safe' | 'warning' | 'danger', message: string, estimatedMils: number };
  gameLives: number;
  isDirty: boolean;
  onSave: () => void;
  onLoad: (file: File) => void;
}

const Controls: React.FC<ControlsProps> = ({ 
  modes, 
  activeModeIndex, 
  onSelectMode, 
  onGenerate, 
  isGenerating,
  isPlaying, 
  onTogglePlay,
  viewMode, 
  onViewChange,
  showTrace,
  onToggleTrace,
  amplitudeScale, 
  onAmplitudeChange, 
  damping, 
  onDampingChange,
  gameMode,
  setGameMode,
  systemHealth,
  gameLives,
  isDirty,
}) => {
  return (
    <div className="w-full bg-surface/50 border-b border-border p-2 flex flex-col xl:flex-row items-center justify-between gap-3 shadow-sm select-none backdrop-blur-sm z-20">
      <style>{`
        .range-sm::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: white;
            cursor: pointer;
            box-shadow: 0 0 2px rgba(0,0,0,0.5);
        }
        .range-sm::-moz-range-thumb {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: white;
            cursor: pointer;
            border: none;
            box-shadow: 0 0 2px rgba(0,0,0,0.5);
        }
      `}</style>

      {/* CENTER GROUP: Game Status or Sliders */}
      <div className="flex items-center gap-4 flex-wrap justify-start flex-1">
        
        {/* Game Mode Status Panel */}
        {gameMode ? (
            <div className="flex items-center gap-4" title="Game Mode Status: Tune the rotor to prevent trips!">
                {/* LIVES COUNTER */}
                <div className="flex flex-col items-center px-2">
                    <span className="text-[9px] text-text-muted uppercase tracking-widest font-bold">Runs Left</span>
                    <div className="flex gap-1 mt-1">
                        {Array.from({length: 5}).map((_, i) => (
                            <div key={i} className={`w-3 h-3 rounded-full border ${i < gameLives ? 'bg-primary border-primary-hover shadow-[0_0_8px_rgba(6,182,212,0.5)]' : 'bg-surface border-border'}`}></div>
                        ))}
                    </div>
                </div>

                <div className={`flex items-center gap-4 px-4 py-1 rounded border-2 ${
                    systemHealth.status === 'safe' ? 'bg-success/10 border-success/30' :
                    systemHealth.status === 'warning' ? 'bg-warning/10 border-warning/30' : 'bg-danger/10 border-danger/30 animate-pulse'
                }`}>
                    <div className="flex flex-col items-center">
                        <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest">System Status</span>
                        <span className={`text-sm font-black ${
                            systemHealth.status === 'safe' ? 'text-success' :
                            systemHealth.status === 'warning' ? 'text-warning' : 'text-danger'
                        }`}>
                            {systemHealth.message}
                        </span>
                    </div>
                    <div className="h-8 w-px bg-border mx-2"></div>
                    <div className="flex flex-col text-[10px] font-mono">
                        <div className={`flex justify-between w-24 ${systemHealth.estimatedMils > 8 ? 'text-danger font-bold' : 'text-text-secondary'}`}>
                            <span>VIB:</span>
                            <span>{systemHealth.estimatedMils.toFixed(1)} mils</span>
                        </div>
                        <div className="w-24 h-1.5 bg-surface rounded-full mt-1 overflow-hidden" title="Vibration Amplitude Gauge. Green < 5, Yellow 5-8, Red > 8.">
                            <div className={`h-full ${
                                systemHealth.estimatedMils < 5 ? 'bg-success' : 
                                systemHealth.estimatedMils < 8 ? 'bg-warning' : 'bg-danger'
                            }`} style={{ width: `${Math.min(100, (systemHealth.estimatedMils / 10) * 100)}%` }}></div>
                        </div>
                        <div className="flex justify-between text-[8px] text-text-muted mt-0.5">
                            <span>0</span><span>5</span><span>8 (TRIP)</span>
                        </div>
                    </div>
                </div>
            </div>
        ) : (
            <>
                <div className="flex bg-panel p-0.5 rounded-md border border-border shrink-0">
                    {[ViewType.ISOMETRIC, ViewType.RADIAL, ViewType.LONGITUDINAL, ViewType.ALL].map((v) => (
                        <button
                            key={v}
                            onClick={() => onViewChange(v)}
                            title={`Switch to ${v} View`}
                            className={`px-2 py-1 rounded text-[9px] font-bold tracking-wider transition-all ${
                                viewMode === v
                                ? 'bg-surface text-text-primary shadow-sm'
                                : 'text-text-muted hover:text-text-primary hover:bg-surface/50'
                            }`}
                        >
                            {v === ViewType.ALL ? 'COMPOSITE' : v.toUpperCase().substring(0, 4)}
                        </button>
                    ))}
                </div>

                {/* MODE SELECTOR */}
                <select 
                    value={activeModeIndex} 
                    onChange={(e) => onSelectMode(Number(e.target.value))}
                    title="Select a Critical Speed or Operating Mode to visualize its shape."
                    className="bg-panel text-primary border border-border rounded text-xs font-mono font-bold px-2 py-1 max-w-[120px] focus:ring-1 focus:ring-primary cursor-pointer"
                >
                    {modes.map((m, i) => (
                        <option key={m.order} value={i}>
                            #{m.order} - {m.rpm.toFixed(0)} RPM
                        </option>
                    ))}
                </select>

                {/* Sliders Group */}
                <div className="flex gap-4 border-l border-border pl-4">
                    <div className="flex flex-col w-20 gap-1" title="Deflection Scale: Adjusts the visual magnification of the shaft bending. Set to 1.0x for standard view.">
                        <div className="flex justify-between text-[9px] text-text-muted font-mono">
                            <span>DEFL</span>
                            <span className="text-primary">{amplitudeScale.toFixed(2)}x</span>
                        </div>
                        <input 
                            type="range" min="0.1" max="1.0" step="0.05" 
                            value={amplitudeScale} onChange={(e) => onAmplitudeChange(parseFloat(e.target.value))}
                            className="w-full h-1 bg-border rounded-lg appearance-none cursor-pointer accent-primary range-sm"
                        />
                    </div>
                    <div className="flex flex-col w-20 gap-1" title="System Damping: Adjusts the damping ratio (zeta). Higher values reduce vibration amplitude at critical speeds.">
                        <div className="flex justify-between text-[9px] text-text-muted font-mono">
                            <span>DAMP</span>
                            <span className="text-accent">{damping.toFixed(2)}</span>
                        </div>
                        <input 
                            type="range" min="0.0" max="1.0" step="0.05" 
                            value={damping} onChange={(e) => onDampingChange(parseFloat(e.target.value))}
                            className="w-full h-1 bg-border rounded-lg appearance-none cursor-pointer accent-accent range-sm"
                        />
                    </div>
                </div>
            </>
        )}
      </div>

      {/* RIGHT GROUP: Remaining Viewport Actions */}
      <div className="flex items-center gap-2 border-l border-border pl-3">
        
        <button
            onClick={onToggleTrace}
            title="Toggle Trace: Visualize the motion path of the shaft centerline."
            className={`px-3 py-1.5 rounded text-[10px] font-bold border transition-all ${
                showTrace 
                ? 'bg-primary/10 text-primary border-primary/30' 
                : 'bg-panel text-text-muted border-border hover:text-text-primary'
            }`}
        >
            TRACE
        </button>

        <button
            onClick={() => setGameMode(!gameMode)}
            title={gameMode ? "Exit Game Mode" : "Enter Game Mode: Tune the rotor to avoid critical speeds within 5 tries."}
            className={`flex items-center gap-1 px-3 py-1.5 rounded text-[10px] font-bold border transition-all ${
                gameMode 
                ? 'bg-accent/20 border-accent/50 text-accent shadow-[0_0_15px_rgba(245,158,11,0.2)]' 
                : 'bg-panel border-border text-text-muted hover:text-accent hover:border-accent/30'
            }`}
        >
            {gameMode ? 'TUNING' : 'GAME'}
        </button>

        <button
            onClick={onGenerate}
            disabled={isGenerating || (gameMode && gameLives <= 0)}
            title="Run Simulation: Generates new rotor data using AI. Consumes 1 'Life' in Game Mode."
            className={`px-3 py-1.5 rounded text-[10px] font-bold border transition-all flex items-center gap-1 ${
                (gameMode && gameLives <= 0) ? 'bg-panel text-text-muted border-border cursor-not-allowed' :
                isDirty 
                ? 'bg-warning/80 text-black border-warning animate-pulse' 
                : 'bg-panel text-primary border-primary/30 hover:bg-surface'
            }`}
        >
            {isGenerating ? '...' : isDirty ? 'CALC' : 'RUN'}
        </button>

        <button 
           onClick={onTogglePlay}
           title={isPlaying ? "Pause Animation" : "Resume Animation"}
           className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${
             isPlaying 
               ? 'bg-accent/10 border-accent/30 text-accent hover:bg-accent/20' 
               : 'bg-success/10 border-success/30 text-success hover:bg-success/20'
           }`}
        >
           {isPlaying ? (
             <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg>
           ) : (
             <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
           )}
        </button>
      </div>
    </div>
  );
};

export default Controls;
