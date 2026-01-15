import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useAnalysis } from './useAnalysis';

describe('useAnalysis', () => {
  let mockWorker: any;

  beforeEach(() => {
    mockWorker = {
      postMessage: vi.fn(),
      terminate: vi.fn(),
      onmessage: null,
    };

    // Mock the global Worker constructor using a function that returns the mock object
    // We use vi.fn() to wrap it so we can spy on calls
    vi.stubGlobal('Worker', vi.fn(function() { return mockWorker; }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should initialize worker on mount', () => {
    renderHook(() => useAnalysis());
    const callArgs = (Worker as unknown as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(callArgs[0].toString()).toContain('analysisWorker.ts');
    expect(callArgs[1]).toEqual({ type: 'module' });
  });

  it('should send START_ANALYSIS message when runAnalysis is called', () => {
    const { result } = renderHook(() => useAnalysis());
    
    act(() => {
      result.current.runAnalysis({ startRpm: 0, endRpm: 1000, stepRpm: 100 });
    });

    expect(mockWorker.postMessage).toHaveBeenCalledWith({
      type: 'START_ANALYSIS',
      config: { startRpm: 0, endRpm: 1000, stepRpm: 100 }
    });
    expect(result.current.isAnalyzing).toBe(true);
  });

  it('should update results when worker sends ANALYSIS_COMPLETE', async () => {
    const { result } = renderHook(() => useAnalysis());
    
    act(() => {
        result.current.runAnalysis({ startRpm: 0, endRpm: 1000, stepRpm: 100 });
    });

    // Simulate worker response
    const mockResult = { points: [], criticalSpeeds: [], stabilityThreshold: 5000 };
    act(() => {
      if (mockWorker.onmessage) {
        mockWorker.onmessage({ data: { type: 'ANALYSIS_COMPLETE', result: mockResult } } as MessageEvent);
      }
    });

    await waitFor(() => {
      expect(result.current.results).toEqual(mockResult);
      expect(result.current.isAnalyzing).toBe(false);
    });
  });

  it('should handle ANALYSIS_ERROR', async () => {
    const { result } = renderHook(() => useAnalysis());
    
    act(() => {
        result.current.runAnalysis({ startRpm: 0, endRpm: 1000, stepRpm: 100 });
    });

    act(() => {
      if (mockWorker.onmessage) {
        mockWorker.onmessage({ data: { type: 'ANALYSIS_ERROR', error: 'Boom' } } as MessageEvent);
      }
    });

    await waitFor(() => {
      expect(result.current.error).toBe('Boom');
      expect(result.current.isAnalyzing).toBe(false);
    });
  });
});
