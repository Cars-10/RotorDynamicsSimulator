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
  isEditing, 
  onToggleEdit,
  onShowReport,
  onToggleTutorial,
  machineType,
  setMachineType,
  gridFreq,
  setGridFreq,
  operatingRpm,
  gameMode,
  setGameMode,
  systemHealth,
  gameLives,
  isDirty,
  onSave,
  onLoad
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          onLoad(e.target.files[0]);
      }
      if (e.target) e.target.value = '';
  };

  return (
    <div className="w-full bg-slate-900 border-b border-slate-700 p-2 flex flex-col xl:flex-row items-center justify-between gap-3 sticky top-0 z-20 shadow-xl select-none">
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

      {/* LEFT GROUP: Branding Only */}
      <div className="flex items-center gap-3">
         <div className="flex items-center gap-2" title="Hydrogen Cooled Generator Rotor Dynamics Simulator">
             <span className="text-red-600 font-black text-3xl italic transform -rotate-12 drop-shadow-lg" style={{ fontFamily: 'Impact, sans-serif' }}>NOT!</span>
             <div className="w-10 h-10 rounded-full bg-[#00529B] flex items-center justify-center shadow-lg shadow-blue-500/20 relative overflow-hidden shrink-0">
                 <svg viewBox="0 0 100 100" className="w-full h-full p-[2px]">
                    <path d="M15 25 L35 75 L50 35 L65 75 L85 25" fill="none" stroke="white" strokeWidth="6" strokeLinecap="square" strokeLinejoin="miter" />
                    <circle cx="15" cy="25" r="5" fill="white" />
                    <circle cx="50" cy="35" r="5" fill="white" />
                    <circle cx="85" cy="25" r="5" fill="white" />
                    <rect x="25" y="82" width="50" height="6" fill="white" rx="2" />
                 </svg>
             </div>
         </div>

         <div className="hidden sm:block leading-tight pl-2 border-l border-slate-700">
            <h1 className="text-white font-bold text-base tracking-tight">RotorDynamics <span className="text-cyan-400 font-light">Sim</span></h1>
            <span className="text-[10px] text-slate-400">Hydrogen Cooled Generator</span>
         </div>
      </div>

      {/* CENTER GROUP: Game Status or Sliders */}
      <div className="flex items-center gap-4 flex-wrap justify-center flex-1">
        
        {/* Game Mode Status Panel */}
        {gameMode ? (
            <div className="flex items-center gap-4" title="Game Mode Status: Tune the rotor to prevent trips!">
                {/* LIVES COUNTER */}
                <div className="flex flex-col items-center px-2">
                    <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Runs Left</span>
                    <div className="flex gap-1 mt-1">
                        {Array.from({length: 5}).map((_, i) => (
                            <div key={i} className={`w-3 h-3 rounded-full border ${i < gameLives ? 'bg-cyan-500 border-cyan-400 shadow-[0_0_8px_cyan]' : 'bg-slate-800 border-slate-700'}`}></div>
                        ))}
                    </div>
                </div>

                <div className={`flex items-center gap-4 px-4 py-1 rounded border-2 ${
                    systemHealth.status === 'safe' ? 'bg-green-900/30 border-green-500/50' :
                    systemHealth.status === 'warning' ? 'bg-amber-900/30 border-amber-500/50' : 'bg-red-900/30 border-red-500/50 animate-pulse'
                }`}>
                    <div className="flex flex-col items-center">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">System Status</span>
                        <span className={`text-sm font-black ${
                            systemHealth.status === 'safe' ? 'text-green-400' :
                            systemHealth.status === 'warning' ? 'text-amber-400' : 'text-red-500'
                        }`}>
                            {systemHealth.message}
                        </span>
                    </div>
                    <div className="h-8 w-px bg-slate-700 mx-2"></div>
                    <div className="flex flex-col text-[10px] font-mono">
                        <div className={`flex justify-between w-24 ${systemHealth.estimatedMils > 8 ? 'text-red-400 font-bold' : 'text-slate-300'}`}>
                            <span>VIB:</span>
                            <span>{systemHealth.estimatedMils.toFixed(1)} mils</span>
                        </div>
                        <div className="w-24 h-1.5 bg-slate-800 rounded-full mt-1 overflow-hidden" title="Vibration Amplitude Gauge. Green < 5, Yellow 5-8, Red > 8.">
                            <div className={`h-full ${
                                systemHealth.estimatedMils < 5 ? 'bg-green-500' : 
                                systemHealth.estimatedMils < 8 ? 'bg-amber-500' : 'bg-red-600'
                            }`} style={{ width: `${Math.min(100, (systemHealth.estimatedMils / 10) * 100)}%` }}></div>
                        </div>
                        <div className="flex justify-between text-[8px] text-slate-500 mt-0.5">
                            <span>0</span><span>5</span><span>8 (TRIP)</span>
                        </div>
                    </div>
                </div>
            </div>
        ) : (
            <>
                <div className="flex bg-slate-800 p-0.5 rounded-md border border-slate-700 shrink-0">
                    {[ViewType.ISOMETRIC, ViewType.RADIAL, ViewType.LONGITUDINAL, ViewType.ALL].map((v) => (
                        <button
                            key={v}
                            onClick={() => onViewChange(v)}
                            title={`Switch to ${v} View`}
                            className={`px-2 py-1 rounded text-[9px] font-bold tracking-wider transition-all ${
                                viewMode === v
                                ? 'bg-slate-600 text-white shadow-sm'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
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
                    className="bg-slate-800 text-cyan-400 border border-slate-600 rounded text-xs font-mono font-bold px-2 py-1 max-w-[120px] focus:ring-1 focus:ring-cyan-500 cursor-pointer"
                >
                    {modes.map((m, i) => (
                        <option key={m.order} value={i}>
                            #{m.order} - {m.rpm.toFixed(0)} RPM
                        </option>
                    ))}
                </select>

                {/* Sliders Group */}
                <div className="flex gap-4 border-l border-slate-700 pl-4">
                    <div className="flex flex-col w-20 gap-1" title="Deflection Scale: Adjusts the visual magnification of the shaft bending. Set to 1.0x for standard view.">
                        <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                            <span>DEFL</span>
                            <span className="text-cyan-400">{amplitudeScale.toFixed(2)}x</span>
                        </div>
                        <input 
                            type="range" min="0.1" max="1.0" step="0.05" 
                            value={amplitudeScale} onChange={(e) => onAmplitudeChange(parseFloat(e.target.value))}
                            className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400 range-sm"
                        />
                    </div>
                    <div className="flex flex-col w-20 gap-1" title="System Damping: Adjusts the damping ratio (zeta). Higher values reduce vibration amplitude at critical speeds.">
                        <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                            <span>DAMP</span>
                            <span className="text-amber-400">{damping.toFixed(2)}</span>
                        </div>
                        <input 
                            type="range" min="0.0" max="1.0" step="0.05" 
                            value={damping} onChange={(e) => onDampingChange(parseFloat(e.target.value))}
                            className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500 range-sm"
                        />
                    </div>
                </div>
            </>
        )}
      </div>

      {/* RIGHT GROUP: Actions & Machine Config */}
      <div className="flex items-center gap-3 border-l border-slate-700 pl-3">
        
        {/* Machine Configuration Selectors */}
        <div className="flex flex-col gap-1 mr-2">
            <select 
                value={machineType} 
                onChange={(e) => setMachineType(e.target.value as 'hydrogen' | 'nuclear')}
                title="Select Machine Type: 'Hydrogen' uses a long 2-pole rotor. 'Nuclear' uses a massive 4-pole rotor."
                className="bg-slate-800 border-none rounded px-2 py-0.5 text-[10px] text-slate-300 focus:ring-1 focus:ring-cyan-500 cursor-pointer hover:bg-slate-700"
            >
                <option value="hydrogen">H2 Cooled (2-Pole)</option>
                <option value="nuclear">Nuclear (4-Pole)</option>
            </select>
            <select 
                value={gridFreq} 
                onChange={(e) => setGridFreq(parseInt(e.target.value) as 50 | 60)}
                title="Select Grid Frequency: Determines the synchronous operating speed (e.g., 60Hz = 3600 RPM for 2-pole)."
                className="bg-slate-800 border-none rounded px-2 py-0.5 text-[10px] text-slate-300 focus:ring-1 focus:ring-cyan-500 cursor-pointer hover:bg-slate-700"
            >
                <option value="60">60 Hz Operation</option>
                <option value="50">50 Hz Operation</option>
            </select>
        </div>
        
        {/* ACTION BUTTONS */}
        <button
            onClick={onToggleTrace}
            title="Toggle Trace: Visualize the motion path of the shaft centerline."
            className={`px-3 py-1.5 rounded text-[10px] font-bold border transition-all ${
                showTrace 
                ? 'bg-purple-900/30 text-purple-400 border-purple-500/50' 
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
            }`}
        >
            TRACE
        </button>

        <button
            onClick={() => setGameMode(!gameMode)}
            title={gameMode ? "Exit Game Mode" : "Enter Game Mode: Tune the rotor to avoid critical speeds within 5 tries."}
            className={`flex items-center gap-1 px-3 py-1.5 rounded text-[10px] font-bold border transition-all ${
                gameMode 
                ? 'bg-purple-600 border-purple-400 text-white shadow-[0_0_15px_rgba(147,51,234,0.5)]' 
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-purple-400 hover:border-purple-500/50'
            }`}
        >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 11h4M8 9v4"/><path d="M15 12h.01"/><path d="M18 10h.01"/><rect x="2" y="6" width="20" height="12" rx="2"/></svg>
            {gameMode ? 'TUNING' : 'GAME'}
        </button>

        <div className="flex flex-col items-end px-2 border-r border-slate-700 mr-2 pr-4" title="Target Operating Speed based on selection">
            <span className="text-[8px] text-slate-500 uppercase">Operating</span>
            <span className="text-[10px] font-mono font-bold text-white">{operatingRpm} RPM</span>
        </div>

        <button
            onClick={onSave}
            title="Save Simulation: Download current state as JSON."
            className="px-3 py-1.5 rounded text-[10px] font-bold border border-slate-700 bg-slate-800 text-slate-400 hover:text-white"
        >
            SAVE
        </button>

        <button
            onClick={() => fileInputRef.current?.click()}
            title="Load Simulation: Import JSON state."
            className="px-3 py-1.5 rounded text-[10px] font-bold border border-slate-700 bg-slate-800 text-slate-400 hover:text-white"
        >
            LOAD
        </button>
        <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept=".json" 
            style={{ display: 'none' }} 
        />
        
        <button
            onClick={onGenerate}
            disabled={isGenerating || (gameMode && gameLives <= 0)}
            title="Run Simulation: Generates new rotor data using AI. Consumes 1 'Life' in Game Mode."
            className={`px-3 py-1.5 rounded text-[10px] font-bold border transition-all flex items-center gap-1 ${
                (gameMode && gameLives <= 0) ? 'bg-slate-800 text-slate-600 border-slate-700 cursor-not-allowed' :
                isDirty 
                ? 'bg-yellow-500 text-black border-yellow-400 animate-pulse shadow-[0_0_10px_#eab308]' 
                : 'bg-slate-800 text-cyan-400 border-cyan-500/50 hover:bg-slate-700'
            }`}
        >
            {isGenerating ? '...' : isDirty ? 'CALC' : 'RUN'}
        </button>

        <button
            onClick={onToggleEdit}
            title="Toggle Editor: Open the sidebar to modify shaft diameters and mass properties."
            className={`px-3 py-1.5 rounded text-[10px] font-bold transition-all flex items-center gap-1 ${
                isEditing 
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' 
                : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'
            }`}
        >
            EDIT
        </button>

        <button
            onClick={onShowReport}
            title="Analysis Report: View Critical Speeds, Q-Factors, and Bode Plot."
            className="p-1.5 bg-slate-800 text-slate-400 border border-slate-700 rounded hover:text-white hover:bg-slate-700"
        >
             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
        </button>

        <button 
           onClick={onTogglePlay}
           title={isPlaying ? "Pause Animation" : "Resume Animation"}
           className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${
             isPlaying 
               ? 'bg-amber-500/10 border-amber-500/50 text-amber-500 hover:bg-amber-500/20' 
               : 'bg-green-500/10 border-green-500/50 text-green-500 hover:bg-green-500/20'
           }`}
        >
           {isPlaying ? (
             <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg>
           ) : (
             <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
           )}
        </button>

        {/* TUTORIAL BUTTON (BIGGER) */}
        <button 
            onClick={onToggleTutorial} 
            className="ml-2 w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-cyan-500/30 hover:border-cyan-400 flex items-center justify-center shadow-lg transition-all hover:scale-105" 
            title="Tutorial & Simulation Guide: Learn about Rotor Dynamics and how to use this app."
        >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        </button>

      </div>
    </div>
  );
};

export default Controls;