import { useState, useCallback, useEffect, useRef } from 'react';
import { AnalysisConfig, AnalysisResult } from '../types';

export const useAnalysis = () => {
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    // Initialize worker
    workerRef.current = new Worker(new URL('../workers/analysisWorker.ts', import.meta.url), {
      type: 'module'
    });

    workerRef.current.onmessage = (e) => {
      const { type, result, error: workerError } = e.data;
      if (type === 'ANALYSIS_COMPLETE') {
        setResults(result);
        setIsAnalyzing(false);
      } else if (type === 'ANALYSIS_ERROR') {
        setError(workerError);
        setIsAnalyzing(false);
      }
    };

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const runAnalysis = useCallback((config: AnalysisConfig) => {
    if (!workerRef.current) return;
    
    setIsAnalyzing(true);
    setError(null);
    setResults(null);
    
    workerRef.current.postMessage({
      type: 'START_ANALYSIS',
      config
    });
  }, []);

  return {
    runAnalysis,
    results,
    isAnalyzing,
    error
  };
};
