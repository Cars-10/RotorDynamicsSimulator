import React from 'react';
import { useAnalysis } from '../../hooks/useAnalysis';
import { CampbellDiagram } from './CampbellDiagram';
import { StabilityMap } from './StabilityMap';

export const AnalysisDashboard: React.FC = () => {
  const { runAnalysis, results, isAnalyzing, error } = useAnalysis();

  const handleRunAnalysis = () => {
    runAnalysis({
      startRpm: 0,
      endRpm: 10000,
      stepRpm: 100
    });
  };

  return (
    <div className="flex flex-col gap-6 p-6 h-full overflow-y-auto bg-zinc-950">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-zinc-100">Analysis Dashboard</h2>
        <button
          onClick={handleRunAnalysis}
          disabled={isAnalyzing}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          {isAnalyzing ? 'Analyzing...' : 'Run Analysis'}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-900/50 border border-red-800 text-red-200 rounded">
          Error: {error}
        </div>
      )}

      {results ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full">
          <CampbellDiagram data={results} width={800} height={500} />
          <StabilityMap data={results} width={800} height={500} />
        </div>
      ) : (
        <div className="flex items-center justify-center h-96 border-2 border-dashed border-zinc-800 rounded-lg text-zinc-500">
          <div className="text-center">
            <p className="mb-2">No analysis data available</p>
            <p className="text-sm">Run a full analysis to generate Campbell Diagrams</p>
          </div>
        </div>
      )}
    </div>
  );
};
