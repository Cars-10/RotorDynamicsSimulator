import { useState, MouseEvent, WheelEvent } from 'react';

export const useZoomPan = (initialZoom = 1.0) => {
    const [zoom, setZoom] = useState(initialZoom);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    const handleWheel = (e: WheelEvent) => {
        if (e.ctrlKey || e.metaKey) return; // Allow browser zoom if needed, or prevent. Usually prevent in canvas.
        // e.preventDefault(); // React synthetic events might not support this reliably in all contexts, but good to try
        const scaleFactor = 0.1;
        const newZoom = Math.max(0.1, Math.min(10, zoom + (e.deltaY < 0 ? scaleFactor : -scaleFactor)));
        setZoom(newZoom);
    };

    const startDrag = (e: MouseEvent) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX, y: e.clientY });
    };

    const updateDrag = (e: MouseEvent) => {
        if (!isDragging) return;
        const dx = e.clientX - dragStart.x;
        const dy = e.clientY - dragStart.y;
        setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
        setDragStart({ x: e.clientX, y: e.clientY });
    };

    const endDrag = () => {
        setIsDragging(false);
    };
    
    const reset = () => {
        setZoom(initialZoom);
        setPan({x:0, y:0});
    };

    return { zoom, pan, isDragging, handleWheel, startDrag, updateDrag, endDrag, reset, setZoom, setPan };
};
