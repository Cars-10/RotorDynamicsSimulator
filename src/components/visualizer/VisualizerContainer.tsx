import React, { useEffect, useRef, useState } from 'react';
import { SimulationData, ViewType, ShaftSegment } from '../../types';
import { IsometricView } from './views/IsometricView';
import { RadialView } from './views/RadialView';
import { LongitudinalView } from './views/LongitudinalView';
import { SvgDefs } from './SvgDefs';

interface VisualizerContainerProps {
  data: SimulationData;
  activeModeIndex: number;
  isPlaying: boolean;
  viewMode: ViewType;
  showTrace: boolean;
  amplitudeScale: number;
  damping: number;
  isEditing: boolean;
  onUpdateSegment: (index: number, updates: Partial<ShaftSegment>) => void;
  selectedIndices: Set<number>;
  onSelectSegment: (index: number) => void;
  onSelectComponent?: (id: string | null) => void;
  systemHealth: { status: 'safe' | 'warning' | 'danger', message: string, estimatedMils: number };
  gameMode: boolean;
  renderMode?: 'line' | '3d';
  
  // Legacy props shim
  selectedSegmentIndex?: number | null; 
}

export const VisualizerContainer: React.FC<VisualizerContainerProps> = (props) => {
    const [phase, setPhase] = useState(0);
    const requestRef = useRef<number>();

    const animate = () => {
        if (props.isPlaying) {
          setPhase((prev) => (prev + 0.05) % (2 * Math.PI));
        }
        requestRef.current = requestAnimationFrame(animate);
    };

    useEffect(() => {
        requestRef.current = requestAnimationFrame(animate);
        return () => {
          if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [props.isPlaying]);

    // Common props for views
    const viewProps = { ...props, phase, isTripped: props.gameMode && props.systemHealth.status === 'danger' };

    if (props.viewMode === ViewType.ALL) {
        return (
            <div className="relative w-full h-full bg-canvas overflow-hidden bg-[image:radial-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px]">
                <svg width="0" height="0" className="absolute"><SvgDefs /></svg>
                <div className="absolute inset-0 z-0">
                    <IsometricView {...viewProps} renderMode={props.renderMode} />
                </div>
                <div className="absolute top-4 left-4 w-96 h-96 z-10 shadow-2xl shadow-black/80 rounded-lg transition-opacity hover:opacity-100 opacity-95">
                    <RadialView {...viewProps} isOverlay />
                </div>
                <div className={`absolute bottom-4 right-4 z-10 shadow-2xl shadow-black/80 rounded-lg transition-opacity hover:opacity-100 opacity-95 hidden xl:block ${props.isEditing ? 'w-[1000px] h-[400px]' : 'w-[800px] h-72'}`}>
                    <LongitudinalView {...viewProps} isOverlay />
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full relative bg-canvas bg-[image:radial-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px]">
            <svg width="0" height="0" className="absolute"><SvgDefs /></svg>
            {props.viewMode === ViewType.ISOMETRIC && <IsometricView {...viewProps} renderMode={props.renderMode} />}
            {props.viewMode === ViewType.RADIAL && <RadialView {...viewProps} />}
            {props.viewMode === ViewType.LONGITUDINAL && <LongitudinalView {...viewProps} />}
        </div>
    );
};
