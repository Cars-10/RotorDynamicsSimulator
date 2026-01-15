import React, { useState, useCallback, useMemo, useRef } from 'react';
import { ViewType } from './types';
import RotorVisualizer from './components/RotorVisualizer';
import TopBar from './components/TopBar';
import ShaftEditor from './components/ShaftEditor';
import AnalysisTable from './components/AnalysisTable';
import Tutorial from './components/Tutorial';
import BearingAnalyst from './components/BearingAnalyst';
import { useSimulation } from './hooks/useSimulation';
import { exportSimulation, importSimulation } from './utils/fileStorage';
import { MainLayout } from './components/layout/MainLayout';
import { Sidebar } from './components/layout/Sidebar';
import { ComponentPropertiesEditor } from './components/editors/ComponentPropertiesEditor';
import { Button } from './components/ui/Button';
import { Save, Upload, FileText, HelpCircle, PenTool, Activity } from 'lucide-react';
import { AnalysisDashboard } from './components/analysis/AnalysisDashboard';

const App: React.FC = () => {
  console.log("RotorDynamics UI v5.0 Loaded - Deep Blue Theme");
  const {
    data,
    setData,
    activeModeIndex,
    setActiveModeIndex,
    isGenerating,
    error,
    setError,
    isDirty,
    generate: generateSimulation,
    updateSegmentWithPhysics,
    updateRotorComponent
  } = useSimulation();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [appMode, setAppMode] = useState<'design' | 'analysis'>('design');
  const [renderMode, setRenderMode] = useState<'line' | '3d'>('3d');

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
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);

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

  const handleSave = () => {
    exportSimulation(data);
  };

  const handleLoad = async (file: File) => {
    try {
      const loadedData = await importSimulation(file);
      setData(loadedData);
      setActiveModeIndex(0);
      setError(null);
    } catch (e) {
      console.error(e);
      setError("Failed to load simulation file.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        handleLoad(e.target.files[0]);
    }
    if (e.target) e.target.value = '';
  };

  const toggleEdit = () => {
      if (isEditing) {
          setIsEditing(false);
          setSelectedIndices(new Set());
          setSelectedComponentId(null);
      } else {
          setIsEditing(true);
      }
  };

  const handleSelectComponent = (id: string | null) => {
      if (id) {
          setSelectedComponentId(id);
          setSelectedIndices(new Set());
          setIsEditing(true);
      } else {
          setSelectedComponentId(null);
      }
  };

  const handleSelectSegment = (index: number, multiSelect: boolean = false) => {
      setSelectedComponentId(null);
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

  const selectedComponent = useMemo(() => 
    data.rotors.find(r => r.id === selectedComponentId), 
    [data.rotors, selectedComponentId]
  );

  return (
    <MainLayout
      header={
          <TopBar 
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
            onSave={handleSave}
            onLoad={handleLoad}
            appMode={appMode}
            setAppMode={setAppMode}
            renderMode={renderMode}
            setRenderMode={setRenderMode}
          />
      }
      showSidebar={isEditing}
      sidebar={
          <Sidebar 
            title={selectedComponent ? "Component Properties" : "Shaft Editor"} 
            onClose={toggleEdit}
          >
              {selectedComponent ? (
                  <ComponentPropertiesEditor
                      component={selectedComponent}
                      onUpdate={(updates) => updateRotorComponent(selectedComponent.id, updates)}
                      onClose={() => handleSelectComponent(null)}
                  />
              ) : (
                  <ShaftEditor 
                      segments={data.shaftSegments} 
                      onUpdateSegment={updateSegmentWithPhysics} 
                      onClose={toggleEdit}
                      selectedIndices={selectedIndices}
                      onSelectSegment={handleSelectSegment}
                  />
              )}
          </Sidebar>
      }
    >
      <div className="flex-1 relative h-full">
            {error && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-danger/90 text-white px-6 py-3 rounded shadow-xl z-50 flex items-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    {error}
                    <button onClick={() => setError(null)} className="ml-4 opacity-70 hover:opacity-100">✕</button>
                </div>
            )}
            
            {appMode === 'analysis' ? (
                <AnalysisDashboard />
            ) : (
                <>
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
                        selectedSegmentIndex={Array.from(selectedIndices)[0] ?? null}
                        selectedIndices={selectedIndices}
                        onSelectSegment={(idx) => handleSelectSegment(idx, false)}
                        onSelectComponent={handleSelectComponent}
                        systemHealth={systemHealth}
                        gameMode={gameMode}
                        renderMode={renderMode}
                    />

                    <BearingAnalyst 
                        bearings={data.rotors.filter(r => r.type === 'bearing')} 
                        activeMode={data.modes[activeModeIndex]} 
                        segments={data.shaftSegments}
                        amplitudeScale={amplitudeScale}
                        damping={damping}
                    />
                </>
            )}
      </div>
    </MainLayout>
  );
};

export default App;