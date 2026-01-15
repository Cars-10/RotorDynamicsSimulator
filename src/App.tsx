import React, { useState, useCallback, useMemo } from 'react';
import { ViewType } from './types';
import RotorVisualizer from './components/RotorVisualizer';
import Controls from './components/Controls';
import ShaftEditor from './components/ShaftEditor';
import AnalysisTable from './components/AnalysisTable';
import Tutorial from './components/Tutorial';
import BearingAnalyst from './components/BearingAnalyst';
import { useSimulation } from './hooks/useSimulation';

const App: React.FC = () => {
  const {
    data,
    activeModeIndex,
    setActiveModeIndex,
    isGenerating,
    error,
    setError,
    isDirty,
    generate: generateSimulation,
    updateSegmentWithPhysics
  } = useSimulation();

  // Start in Composite View (ALL) as requested
  const [viewMode, setViewMode] = useState<ViewType>(ViewType.ALL);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showTrace, setShowTrace] = useState(false);
  const [amplitudeScale, setAmplitudeScale] = useState(1.0);
  const [damping, setDamping] = useState(0.05);
  
  // Machine Config
  const [machineType, setMachineType] = useState<'hydrogen' | 'nuclear'>('hydrogen');
  const [gridFreq, setGridFreq] = useState<50 | 60>(60);

  // Calculate Operating RPM
  // Hydrogen (Fossil) = 2 Pole usually (3600/3000)
  // Nuclear = 4 Pole usually (1800/1500)
  const operatingRpm = machineType === 'hydrogen' 
    ? (gridFreq === 60 ? 3600 : 3000)
    : (gridFreq === 60 ? 1800 : 1500);

  // Editor & Report & Tutorial State
  const [isEditing, setIsEditing] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  
  // Game State
  const [gameMode, setGameMode] = useState(false);
  const [gameLives, setGameLives] = useState(5);
  
  // Selection Sync State (Multi-select)
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());

  // --- GAME LOGIC / HEALTH CHECK ---
  const systemHealth = useMemo(() => {
    // 1. Check for Critical Speeds in Exclusion Zones (+/- 10%)
    const exclusionMin = operatingRpm * 0.9;
    const exclusionMax = operatingRpm * 1.1;
    const exclusion2Min = (operatingRpm * 2) * 0.9;
    const exclusion2Max = (operatingRpm * 2) * 1.1;

    const criticals = data.modes.filter(m => {
        return (m.rpm > exclusionMin && m.rpm < exclusionMax) || 
               (m.rpm > exclusion2Min && m.rpm < exclusion2Max);
    });

    // 2. Check Vibration Amplitude (Simulated Mils)
    const activeMode = data.modes[activeModeIndex];
    const maxDisp = Math.max(...activeMode.displacements.map(Math.abs));
    const dampingFactor = (1 - damping);
    const estimatedMils = maxDisp * amplitudeScale * 5 * dampingFactor;

    let status: 'safe' | 'warning' | 'danger' = 'safe';
    let message = "SYSTEM TUNED";

    if (estimatedMils > 8) {
        status = 'danger';
        message = "HIGH VIBRATION TRIP (>8 MILS)";
    } else if (criticals.length > 0) {
        status = 'danger';
        message = `CRITICAL RESONANCE (${criticals[0].rpm.toFixed(0)} RPM)`;
    } else if (estimatedMils > 5) {
        status = 'warning';
        message = "VIBRATION ALERT (>5 MILS)";
    }

    return { status, message, estimatedMils, conflicts: criticals.length };
  }, [data.modes, activeModeIndex, amplitudeScale, damping, operatingRpm]);


  const handleGenerate = useCallback(async () => {
    if (gameMode && gameLives <= 0) return;

    const success = await generateSimulation();
      
    if (success && gameMode) {
        setGameLives(prev => Math.max(0, prev - 1));
    }
  }, [gameMode, gameLives, generateSimulation]);

  const toggleEdit = () => {
      setIsEditing(!isEditing);
      if (!isEditing) setSelectedIndices(new Set());
  };

  const handleSelectSegment = (index: number, multiSelect: boolean = false) => {
      setSelectedIndices(prev => {
          const newSet = new Set(multiSelect ? prev : []);
          if (newSet.has(index)) {
              newSet.delete(index);
          } else {
              newSet.add(index);
          }
          // Always keep at least the clicked one if it wasn't there
          if (!multiSelect || newSet.size === 0) {
              return new Set([index]);
          }
          return newSet;
      });
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-200 font-sans overflow-hidden">
      <Controls 
        modes={data.modes}
        activeModeIndex={activeModeIndex}
        onSelectMode={setActiveModeIndex}
        onGenerate={handleGenerate}
        isGenerating={isGenerating}
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying(!isPlaying)}
        viewMode={viewMode}
        onViewChange={setViewMode}
        showTrace={showTrace}
        onToggleTrace={() => setShowTrace(!showTrace)}
        amplitudeScale={amplitudeScale}
        onAmplitudeChange={setAmplitudeScale}
        damping={damping}
        onDampingChange={setDamping}
        isEditing={isEditing}
        onToggleEdit={toggleEdit}
        onShowReport={() => setShowReport(!showReport)}
        onToggleTutorial={() => setShowTutorial(true)}
        machineType={machineType}
        setMachineType={setMachineType}
        gridFreq={gridFreq}
        setGridFreq={setGridFreq}
        operatingRpm={operatingRpm}
        gameMode={gameMode}
        setGameMode={setGameMode}
        systemHealth={systemHealth}
        gameLives={gameLives}
        isDirty={isDirty}
      />

      {/* Main Layout: Sidebar (if editing) + Visualizer Area */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Editor Sidebar */}
        {isEditing && (
             <div className="w-64 h-full shrink-0 animate-in slide-in-from-left-10 duration-200">
                <ShaftEditor 
                    segments={data.shaftSegments} 
                    onUpdateSegment={updateSegmentWithPhysics} 
                    onClose={() => setIsEditing(false)}
                    selectedIndices={selectedIndices}
                    onSelectSegment={handleSelectSegment}
                />
             </div>
        )}

        <div className="flex-1 relative overflow-hidden">
            {error && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-500/90 text-white px-6 py-3 rounded shadow-xl z-50 flex items-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    {error}
                    <button onClick={() => setError(null)} className="ml-4 opacity-70 hover:opacity-100">✕</button>
                </div>
            )}
            
            {showTutorial && <Tutorial onClose={() => setShowTutorial(false)} />}

            {showReport && (
                <AnalysisTable 
                  modes={data.modes} 
                  onClose={() => setShowReport(false)} 
                  operatingRpm={operatingRpm}
                />
            )}
            
            <RotorVisualizer 
                data={data}
                activeModeIndex={activeModeIndex}
                isPlaying={isPlaying}
                viewMode={viewMode}
                showTrace={showTrace}
                amplitudeScale={amplitudeScale}
                damping={damping}
                isEditing={isEditing}
                onUpdateSegment={updateSegmentWithPhysics}
                selectedSegmentIndex={Array.from(selectedIndices)[0] ?? null} // Backward compat if needed, but we used selectedIndices now in Visualizer below
                selectedIndices={selectedIndices}
                onSelectSegment={(idx) => handleSelectSegment(idx, false)} // Simple select in visualizer
                systemHealth={systemHealth}
                gameMode={gameMode}
            />

            {/* Bearing Polar Plots Overlay (Always active for analysis) */}
            <BearingAnalyst 
                bearings={data.rotors.filter(r => r.type === 'bearing')} 
                activeMode={data.modes[activeModeIndex]} 
                segments={data.shaftSegments}
                amplitudeScale={amplitudeScale}
                damping={damping}
            />
        </div>
      </div>
    </div>
  );
};

export default App;