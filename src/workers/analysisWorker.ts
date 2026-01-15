import { AnalysisConfig, AnalysisResult, CampbellPoint } from '../types';

// Mock calculation function
function calculateCampbellDiagram(config: AnalysisConfig): AnalysisResult {
  const points: CampbellPoint[] = [];
  const criticalSpeeds: number[] = [];
  const stabilityThreshold = 5000; // Mock threshold

  for (let rpm = config.startRpm; rpm <= config.endRpm; rpm += config.stepRpm) {
    // Generate 4 modes
    // Mode 1: Split (Forward/Backward)
    const baseFreq1 = 50 + (rpm / 1000) * 2; // Increases slightly
    const split1 = (rpm / 60) * 0.5; // Gyroscopic effect
    
    // Mode 2: Bending
    const baseFreq2 = 120 + (rpm / 1000) * 0.5;

    points.push({
      rpm,
      modes: [
        {
          frequency: Math.max(0, baseFreq1 - split1),
          damping: 0.05,
          whirl: 'backward'
        },
        {
          frequency: baseFreq1 + split1,
          damping: 0.04,
          whirl: 'forward'
        },
        {
          frequency: baseFreq2,
          damping: 0.02,
          whirl: 'mixed'
        },
        {
          frequency: baseFreq2 * 2.5, // Higher order
          damping: 0.01,
          whirl: 'forward'
        }
      ]
    });

    // Mock critical speed detection (intersection with synchronous line)
    // Synchronous line: freq = rpm / 60
    const syncFreq = rpm / 60;
    // Simple check: if we crossed the line recently, or are close. 
    // For mock data, just adding one if it's close enough is fine.
    if (Math.abs((baseFreq1 + split1) - syncFreq) < 2.0) {
        criticalSpeeds.push(rpm);
    }
  }

  return {
    points,
    criticalSpeeds: [...new Set(criticalSpeeds)], // Dedupe
    stabilityThreshold
  };
}

self.onmessage = (e: MessageEvent) => {
  const { type, config } = e.data;
  
  if (type === 'START_ANALYSIS') {
    try {
      const result = calculateCampbellDiagram(config);
      self.postMessage({ type: 'ANALYSIS_COMPLETE', result });
    } catch (error) {
      self.postMessage({ type: 'ANALYSIS_ERROR', error: (error as Error).message });
    }
  }
};

export {};
