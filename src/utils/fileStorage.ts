import { SimulationData } from '../types';

export const exportSimulation = (data: SimulationData, filename = 'rotor-simulation.json') => {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const importSimulation = (file: File): Promise<SimulationData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = event.target?.result as string;
        const data = JSON.parse(json) as SimulationData;
        // Basic validation: check for required fields
        if (!data.shaftSegments || !data.modes) {
            reject(new Error('Invalid simulation file format'));
            return;
        }
        resolve(data);
      } catch (e) {
        reject(new Error('Failed to parse JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};
