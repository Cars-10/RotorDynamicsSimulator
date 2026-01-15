import { describe, it, expect, vi, afterEach } from 'vitest';
import { exportSimulation, importSimulation } from './fileStorage';
import { SimulationData } from '../types';

describe('fileStorage', () => {
  const mockData = { shaftSegments: [], modes: [] } as unknown as SimulationData;

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('exportSimulation creates a download link', () => {
    // Mock URL.createObjectURL
    const createObjectURL = vi.fn(() => 'blob:url');
    global.URL.createObjectURL = createObjectURL;
    global.URL.revokeObjectURL = vi.fn();
    
    const link = document.createElement('a');
    vi.spyOn(link, 'click');
    
    const createElement = vi.spyOn(document, 'createElement').mockReturnValue(link);
    const appendChild = vi.spyOn(document.body, 'appendChild');
    const removeChild = vi.spyOn(document.body, 'removeChild');

    exportSimulation(mockData);

    expect(createObjectURL).toHaveBeenCalled();
    expect(createElement).toHaveBeenCalledWith('a');
    expect(link.download).toBe('rotor-simulation.json');
    expect(appendChild).toHaveBeenCalledWith(link);
    expect(link.click).toHaveBeenCalled();
    expect(removeChild).toHaveBeenCalledWith(link);
  });

  it('importSimulation reads JSON file', async () => {
     const file = new File([JSON.stringify(mockData)], 'test.json', { type: 'application/json' });
     const result = await importSimulation(file);
     expect(result).toEqual(mockData);
  });
});
