import { ModeShape } from '../types';

export const getDisplacementAt = (index: number, activeMode: ModeShape | undefined, totalSegments: number) => {
    if (!activeMode) return 0;
    if (activeMode.displacements.length === totalSegments) {
        return activeMode.displacements[index] || 0;
    }
    const ratio = index / (totalSegments - 1);
    const dIndex = ratio * (activeMode.displacements.length - 1);
    const i = Math.floor(dIndex);
    const j = Math.ceil(dIndex);
    const w = dIndex - i;
    const valI = activeMode.displacements[i] || 0;
    const valJ = activeMode.displacements[j] || 0;
    return valI + (valJ - valI) * w;
};
