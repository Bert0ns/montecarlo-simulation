import React from "react";
import { Point, Ray, Rectangle} from "./scene-objects";

export interface CanvasRef {
    width: number,
    height: number,
    canvasRef: React.RefObject<HTMLCanvasElement | null>,
}

export const convertToCanvasCoordinates = (point: Point, canvasObject:  CanvasRef): Point => {
    const canvasRef: React.RefObject<HTMLCanvasElement | null>  = canvasObject.canvasRef;
    if (!canvasRef.current) return point;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const { scaleX, scaleY } = getCanvasScaleFactor(canvasObject);

    return {
        x: (point.x - rect.left) * scaleX,
        y: (point.y - rect.top) * scaleY
    };
}

const getCanvasScaleFactor = (canvasObject:  CanvasRef) => {
    const canvasRef: React.RefObject<HTMLCanvasElement | null>  = canvasObject.canvasRef;
    if (!canvasRef.current) return { scaleX: 1, scaleY: 1 };

    const canvas = canvasRef.current;
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;

    return {
        scaleX: canvasObject.width / displayWidth,
        scaleY: canvasObject.height / displayHeight
    };
}

export const isPointInRectangle = (point: Point, rect: Rectangle): boolean => {
    return (
        point.x >= rect.position.x &&
        point.x <= rect.position.x + rect.width &&
        point.y >= rect.position.y &&
        point.y <= rect.position.y + rect.height
    );
};

/*----------RAY utils------------*/

const rayHitColor = 'rgba(255, 0, 0, 0.15)';
const rayMissColor = 'rgba(255, 255, 0, 0.15)';

// Funzione per verificare l'intersezione con i bordi del canvas
export const checkCanvasBorderIntersection = (ray: Ray, canvasObject: CanvasRef) => {
    let hit = false;
    let tMin = Infinity;

    const canvasWidth = canvasObject.width;
    const canvasHeight = canvasObject.height;
    const {origin, direction} = ray;

    // Bordo destro
    if (direction.x > 0) {
        const t = (canvasWidth - origin.x) / direction.x;
        if (t > 0 && t < tMin) {
            tMin = t;
            hit = true;
        }
    }
    // Bordo sinistro
    if (direction.x < 0) {
        const t = -origin.x / direction.x;
        if (t > 0 && t < tMin) {
            tMin = t;
            hit = true;
        }
    }
    // Bordo inferiore
    if (direction.y > 0) {
        const t = (canvasHeight - origin.y) / direction.y;
        if (t > 0 && t < tMin) {
            tMin = t;
            hit = true;
        }
    }
    // Bordo superiore
    if (direction.y < 0) {
        const t = -origin.y / direction.y;
        if (t > 0 && t < tMin) {
            tMin = t;
            hit = true;
        }
    }

    return {hit, t: tMin};
};

// Funzione per verificare l'intersezione con un rettangolo
export const checkRectangleIntersection = (ray: Ray, object: Rectangle) => {
    const {origin, direction} = ray;
    const {position: rectPos, width: rectWidth, height: rectHeight} = object;
    let hit = false;
    let tMin = Infinity;

    // Verifica intersezione con i quattro lati del rettangolo
    // Lato sinistro
    if (direction.x > 0) {
        const t = (rectPos.x - origin.x) / direction.x;
        if (t > 0) {
            const y = origin.y + t * direction.y;
            if (y >= rectPos.y && y <= rectPos.y + rectHeight && t < tMin) {
                tMin = t;
                hit = true;
            }
        }
    }
    // Lato destro
    if (direction.x < 0) {
        const t = (rectPos.x + rectWidth - origin.x) / direction.x;
        if (t > 0) {
            const y = origin.y + t * direction.y;
            if (y >= rectPos.y && y <= rectPos.y + rectHeight && t < tMin) {
                tMin = t;
                hit = true;
            }
        }
    }
    // Lato superiore
    if (direction.y > 0) {
        const t = (rectPos.y - origin.y) / direction.y;
        if (t > 0) {
            const x = origin.x + t * direction.x;
            if (x >= rectPos.x && x <= rectPos.x + rectWidth && t < tMin) {
                tMin = t;
                hit = true;
            }
        }
    }
    // Lato inferiore
    if (direction.y < 0) {
        const t = (rectPos.y + rectHeight - origin.y) / direction.y;
        if (t > 0) {
            const x = origin.x + t * direction.x;
            if (x >= rectPos.x && x <= rectPos.x + rectWidth && t < tMin) {
                tMin = t;
                hit = true;
            }
        }
    }

    return {hit, t: tMin};
}

// Funzione per disegnare un raggio
export const drawRay = (ctx: CanvasRenderingContext2D, ray: Ray) => {
    if (!ray.endpoint) return;
    ctx.beginPath();
    ctx.moveTo(ray.origin.x, ray.origin.y);
    ctx.lineTo(ray.endpoint.x, ray.endpoint.y);
    ctx.strokeStyle = ray.hitObstacle ? rayHitColor : rayMissColor;
    ctx.stroke();
};
