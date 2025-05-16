
export interface SimulationState {
    isRunning: boolean;
    numRays: number;
    showRays: boolean;
}

export interface MouseDragInfo {
    isDragging: boolean;
    targetType: 'lightSource' | 'obstacle' | null;
    offsetX: number;
    offsetY: number;
}

