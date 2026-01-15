import React, { useRef } from 'react';
import { ModeShape, ViewType } from '../types';
import { Save, Upload, FileText, HelpCircle, PenTool, Activity } from 'lucide-react';
import { Button } from './ui/Button';

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
  
  appMode: 'design' | 'analysis';
  setAppMode: (mode: 'design' | 'analysis') => void;

  renderMode: 'line' | '3d';
  setRenderMode: (mode: 'line' | '3d') => void;
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
  onLoad,
  appMode,
  setAppMode,
  renderMode,
  setRenderMode
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        onLoad(e.target.files[0]);
    }
    if (e.target) e.target.value = '';
  };

  return (
    <div className="w-full bg-panel/90 border-b border-border p-2 flex flex-col xl:flex-row items-center justify-between gap-4 shadow-md select-none backdrop-blur-md sticky top-0 z-50">
      <style>{`
        .range-sm::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #06b6d4;
            cursor: pointer;
            box-shadow: 0 0 2px rgba(0,0,0,0.5);
        }
        .range-sm::-moz-range-thumb {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #06b6d4;
            cursor: pointer;
            border: none;
            box-shadow: 0 0 2px rgba(0,0,0,0.5);
        }
      `}</style>

      {/* 1. LEFT GROUP: Branding */}
      <div className="flex items-center gap-3 shrink-0 mr-4">
         <div className="flex items-center gap-2" title="Hydrogen Cooled Generator Rotor Dynamics Simulator">
             <span className="text-red-600 font-black text-2xl italic transform -rotate-12 drop-shadow-lg" style={{ fontFamily: 'Impact, sans-serif' }}>NOT!</span>
             <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/20 relative overflow-hidden shrink-0">
                 <svg viewBox="0 0 100 100" className="w-full h-full p-[2px]">
                    <path d="M15 25 L35 75 L50 35 L65 75 L85 25" fill="none" stroke="black" strokeWidth="6" strokeLinecap="square" strokeLinejoin="miter" />
                    <circle cx="15" cy="25" r="5" fill="black" />
                    <circle cx="50" cy="35" r="5" fill="black" />
                    <circle cx="85" cy="25" r="5" fill="black" />
                    <rect x="25" y="82" width="50" height="6" fill="black" rx="2" />
                 </svg>
             </div>
         </div>

         <div className="hidden sm:block leading-tight pl-2 border-l border-border/50">
            <h1 className="text-text-primary font-bold text-sm tracking-tight">RotorDynamics <span className="text-primary font-light">Sim</span></h1>
            <span className="text-[10px] text-text-secondary block">Hydrogen Cooled Generator</span>
         </div>
      </div>

      {/* 1.5. APP MODE TOGGLE */}
      <div className="flex bg-surface p-0.5 rounded-md border border-border shrink-0 mr-2">
            <button
                onClick={() => setAppMode('design')}
                className={`px-3 py-1 rounded text-[10px] font-bold tracking-wider transition-all ${
                    appMode === 'design'
                    ? 'bg-panel text-primary shadow-sm ring-1 ring-border'
                    : 'text-text-muted hover:text-text-primary hover:bg-panel/50'
                }`}
            >
                DESIGN
            </button>
            <button
                onClick={() => setAppMode('analysis')}
                className={`px-3 py-1 rounded text-[10px] font-bold tracking-wider transition-all ${
                    appMode === 'analysis'
                    ? 'bg-panel text-accent shadow-sm ring-1 ring-border'
                    : 'text-text-muted hover:text-text-primary hover:bg-panel/50'
                }`}
            >
                ANALYSIS
            </button>
      </div>

      {/* 2. CENTER-LEFT: View Toggles */}
      <div className="flex bg-surface p-0.5 rounded-md border border-border shrink-0 gap-2">
            <div className="flex gap-0.5">
                {[ViewType.ISOMETRIC, ViewType.RADIAL, ViewType.LONGITUDINAL, ViewType.ALL].map((v) => (
                    <button
                        key={v}
                        onClick={() => onViewChange(v)}
                        title={`Switch to ${v} View`}
                        className={`px-3 py-1 rounded text-[10px] font-bold tracking-wider transition-all ${
                            viewMode === v
                            ? 'bg-panel text-primary shadow-sm ring-1 ring-border'
                            : 'text-text-muted hover:text-text-primary hover:bg-panel/50'
                        }`}
                    >
                        {v === ViewType.ALL ? 'COMPOSITE' : v.toUpperCase().substring(0, 4)}
                    </button>
                ))}
            </div>
            
            <div className="w-px bg-border my-1"></div>

            <div className="flex gap-0.5">
                <button
                    onClick={() => setRenderMode('line')}
                    className={`px-3 py-1 rounded text-[10px] font-bold tracking-wider transition-all ${
                        renderMode === 'line'
                        ? 'bg-panel text-primary shadow-sm ring-1 ring-border'
                        : 'text-text-muted hover:text-text-primary hover:bg-panel/50'
                    }`}
                >
                    LINE
                </button>
                <button
                    onClick={() => setRenderMode('3d')}
                    className={`px-3 py-1 rounded text-[10px] font-bold tracking-wider transition-all ${
                        renderMode === '3d'
                        ? 'bg-panel text-primary shadow-sm ring-1 ring-border'
                        : 'text-text-muted hover:text-text-primary hover:bg-panel/50'
                    }`}
                >
                    3D
                </button>
            </div>
      </div>

      {/* 3. CENTER: Mode Selector */}
      <select 
            value={activeModeIndex} 
            onChange={(e) => onSelectMode(Number(e.target.value))}
            title="Select a Critical Speed or Operating Mode."
            className="bg-surface text-primary border border-border rounded text-xs font-mono font-bold px-3 py-1.5 min-w-[140px] focus:ring-1 focus:ring-primary cursor-pointer hover:bg-surface/80"
      >
            {modes.map((m, i) => (
                <option key={m.order} value={i}>
                    #{m.order} - {m.rpm.toFixed(0)} RPM
                </option>
            ))}
      </select>

      {/* 4. CENTER-RIGHT: Sliders */}
      <div className="flex gap-4 border-l border-border pl-4 mr-auto">
            <div className="flex items-center gap-2" title="Deflection Scale">
                <span className="text-[9px] text-text-muted font-mono font-bold">DEFL</span>
                <input 
                    type="range" min="0.1" max="1.0" step="0.05" 
                    value={amplitudeScale} onChange={(e) => onAmplitudeChange(parseFloat(e.target.value))}
                    className="w-16 h-1 bg-border rounded-lg appearance-none cursor-pointer accent-primary range-sm"
                />
                <span className="text-[9px] text-primary font-mono w-8">{amplitudeScale.toFixed(2)}x</span>
            </div>
            <div className="flex items-center gap-2" title="System Damping">
                <span className="text-[9px] text-text-muted font-mono font-bold">DAMP</span>
                <input 
                    type="range" min="0.0" max="1.0" step="0.05" 
                    value={damping} onChange={(e) => onDampingChange(parseFloat(e.target.value))}
                    className="w-16 h-1 bg-border rounded-lg appearance-none cursor-pointer accent-accent range-sm"
                />
                <span className="text-[9px] text-accent font-mono w-8">{damping.toFixed(2)}</span>
            </div>
      </div>

      {/* 5. RIGHT GROUP: Machine Config & Actions */}
      <div className="flex items-center gap-2 shrink-0">
        
        {/* Machine Config */}
        <div className="flex flex-col gap-0.5 mr-2 items-end">
            <select 
                value={machineType} 
                onChange={(e) => setMachineType(e.target.value as 'hydrogen' | 'nuclear')}
                className="bg-transparent border-none rounded px-0 py-0 text-[10px] text-text-secondary focus:ring-0 cursor-pointer hover:text-text-primary text-right font-medium"
            >
                <option value="hydrogen">H2 Cooled (2-Pole)</option>
                <option value="nuclear">Nuclear (4-Pole)</option>
            </select>
             <select 
                value={gridFreq}
                onChange={(e) => setGridFreq(parseInt(e.target.value) as any)}
                className="bg-transparent border-none rounded px-0 py-0 text-[10px] text-text-muted focus:ring-0 cursor-pointer hover:text-text-primary text-right"
            >
                <option value="60">60 Hz Operation</option>
                <option value="50">50 Hz Operation</option>
            </select>
        </div>

        <button
            onClick={onToggleTrace}
            className={`px-3 py-1.5 rounded text-[10px] font-bold border transition-all ${
                showTrace 
                ? 'bg-primary/10 text-primary border-primary/30' 
                : 'bg-surface text-text-muted border-border hover:text-text-primary'
            }`}
        >
            TRACE
        </button>

        <button
            onClick={() => setGameMode(!gameMode)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded text-[10px] font-bold border transition-all ${
                gameMode 
                ? 'bg-accent/20 border-accent/50 text-accent' 
                : 'bg-surface border-border text-text-muted hover:text-accent hover:border-accent/30'
            }`}
        >
            {gameMode ? 'TUNING' : 'GAME'}
        </button>

        <div className="flex flex-col items-end px-2 border-r border-border/50 mr-1">
             <span className="text-[8px] text-text-muted uppercase tracking-wider">Operating</span>
             <span className="text-[10px] font-mono font-bold text-text-primary">{operatingRpm} RPM</span>
        </div>

        <button
            onClick={onGenerate}
            disabled={isGenerating || (gameMode && gameLives <= 0)}
            className={`px-4 py-1.5 rounded text-[10px] font-bold border transition-all flex items-center gap-1 shadow-sm ${
                (gameMode && gameLives <= 0) ? 'bg-surface text-text-muted border-border cursor-not-allowed' :
                isDirty 
                ? 'bg-warning text-black border-warning animate-pulse' 
                : 'bg-primary text-primary-foreground border-primary hover:bg-primary-hover'
            }`}
        >
            {isGenerating ? '...' : isDirty ? 'CALC' : 'RUN'}
        </button>

        <button
            onClick={onToggleEdit}
            className={`px-3 py-1.5 rounded text-[10px] font-bold transition-all border ${
                isEditing 
                ? 'bg-surface text-primary border-primary' 
                : 'bg-surface text-text-muted border-border hover:text-text-primary'
            }`}
        >
            EDIT
        </button>

        {/* Icons Group */}
        <div className="flex items-center gap-1 ml-2">
            <Button variant="ghost" size="sm" onClick={onSave} title="Save" className="h-8 w-8 p-0">
                <Save className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()} title="Load" className="h-8 w-8 p-0">
                <Upload className="h-4 w-4" />
            </Button>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" style={{ display: 'none' }} />
            
            <Button 
                variant={onShowReport ? 'primary' : 'ghost'} 
                size="sm" 
                onClick={onShowReport} 
                title="Report"
                className="h-8 w-8 p-0"
            >
                <FileText className="h-4 w-4" />
            </Button>

            <button 
            onClick={onTogglePlay}
            className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all mx-1 ${
                isPlaying 
                ? 'bg-accent text-black border-accent hover:bg-accent-hover' 
                : 'bg-success text-white border-success hover:bg-success/80'
            }`}
            >
            {isPlaying ? (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg>
            ) : (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
            )}
            </button>
            
            <Button variant="ghost" size="sm" onClick={onToggleTutorial} title="Help" className="h-8 w-8 p-0">
                <HelpCircle className="h-4 w-4" />
            </Button>
        </div>
      </div>
    </div>
  );
};

export default Controls;
