
export interface SimulationState {
    isRunning: boolean;
    numRays: number;
    showRays: boolean;
}

export interface MouseDragInfo {
    isDragging: boolean;
    targetId: string | null;
    offsetX: number;
    offsetY: number;
}

