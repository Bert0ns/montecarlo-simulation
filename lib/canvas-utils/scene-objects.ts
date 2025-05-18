export interface Ray {
    origin: Point;
    direction: Point;
    hitObstacle: boolean;
    endpoint: Point | null;
}

export enum CanvasObjectType {
    RECTANGLE = "rectangle",
    CIRCLE = "circle",
}

export interface Point {
    x: number;
    y: number;
}

export interface SceneObject {
    position: Point;
    type: CanvasObjectType;
    id: string;
    name: string;
}

export class Rectangle implements SceneObject {
    id: string;
    position: Point;
    type: CanvasObjectType.RECTANGLE = CanvasObjectType.RECTANGLE;
    name : string;
    width: number;
    height: number;
    fillColor?: string;
    static count = 0;

    constructor(rectangle: Rectangle);
    constructor(position: Point, name: string, width: number, height: number, fillColor?: string);
    constructor(positionOrRectangle: Point | Rectangle, name?: string, width?: number, height?: number, fillColor?: string) {
        if (typeof positionOrRectangle === 'object' && 'type' in positionOrRectangle && positionOrRectangle.type === CanvasObjectType.RECTANGLE) {
            const rect = positionOrRectangle as Rectangle;
            this.position = { x: rect.position.x, y: rect.position.y };
            this.name = rect.name;
            this.width = rect.width;
            this.height = rect.height;
            this.fillColor = rect.fillColor;
        } else {
            this.position = positionOrRectangle as Point;
            this.name = name!;
            this.width = width!;
            this.height = height!;
            this.fillColor = fillColor;
        }

        Rectangle.count++;
        this.id = this.generateId()
    }

    generateId() {
        return `${this.name}-${Rectangle.count}`;
    }
}
