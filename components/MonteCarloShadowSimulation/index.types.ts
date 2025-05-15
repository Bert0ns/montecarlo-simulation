export interface SimulationState {
    isRunning: boolean;
    numRays: number;
    showRays: boolean;
}

export interface Point {
    x: number;
    y: number;
}

export interface Rectangle {
    position: Point;
    width: number;
    height: number;
    fillColor?: string;
}

export interface MouseDragInfo {
    isDragging: boolean;
    targetType: 'lightSource' | 'obstacle' | null;
    offsetX: number;
    offsetY: number;
}

export interface Ray {
    origin: Point;
    direction: Point;
    hitObstacle: boolean;
    endpoint: Point | null;
}