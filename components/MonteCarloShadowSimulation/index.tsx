"use client";
import React, {ChangeEvent, useCallback, useEffect, useMemo, useState} from 'react';
import {Slider} from "@/components/ui/slider";
import {Button} from "@/components/ui/button";
import {Pause, Play, RefreshCw} from "lucide-react";
import {MouseDragInfo, SimulationState} from './index.types';
import {
    CanvasObjectType,
    CanvasRef,
    checkCanvasBorderIntersection,
    checkRectangleIntersection,
    convertToCanvasCoordinates,
    drawRay,
    isPointInRectangle,
    Point,
    Ray,
    Rectangle,
    SceneObject
} from "@/lib/canvas-utils";

//TODO: check the functions that draws the shadows, it is not working as expected

//TODO: if multiple obstacles are present, the drag and drop features work only on 1


const MonteCarloShadowSimulation: React.FC = () => {
    const maxRays = 10000;
    const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
    const canvasObject: CanvasRef = useMemo<CanvasRef>(() => ({
        width: 1000,
        height: 350,
        canvasRef: canvasRef,
    }), []);

    const initialSimulationState: SimulationState = {
        numRays: 600,
        showRays: true,
        isRunning: false
    }
    const [simulationState, setSimulationState] = React.useState<SimulationState>(initialSimulationState);

    const initialLightSourceState: Rectangle = {
        type: CanvasObjectType.RECTANGLE,
        id: "lightSource-0",
        position: {
            x: 100,
            y: 100
        },
        width: 30,
        height: 30,
        fillColor: "#c051f4"
    }
    const initialObstacleState: Rectangle = {
        type: CanvasObjectType.RECTANGLE,
        id: "obstacle-0",
        position: {
            x: 400,
            y: 100
        },
        width: 70,
        height: 120,
        fillColor: "#4a4a4a"
    }
    const [sceneObjects , setSceneObjects] = useState<SceneObject[]>([initialLightSourceState, initialObstacleState, initialObstacleState]);

    const initialMouseDragInfoState: MouseDragInfo = {
        isDragging: false,
        targetId: null,
        offsetX: 0,
        offsetY: 0
    }
    const [mouseDragInfo, setMouseDragInfo] = useState<MouseDragInfo>(initialMouseDragInfoState);

    const animationRef = React.useRef<number | null>(null);
    const [shadowCellSize, setShadowCellSize] = useState<number>(4) // dimensione delle celle in pixel
    
    const drawRectangleObject = useCallback((ctx: CanvasRenderingContext2D, object: Rectangle) => {
        ctx.fillStyle = object.fillColor || '#ff0000';
        ctx.fillRect(object.position.x, object.position.y, object.width, object.height);
    }, []);

    const initializeCanvasDrawings = useCallback((ctx: CanvasRenderingContext2D) => {
        ctx.clearRect(0, 0, canvasObject.width, canvasObject.height);
        sceneObjects.forEach(obj => {
            if(obj.type === CanvasObjectType.RECTANGLE) {
                drawRectangleObject(ctx, obj as Rectangle)
            }
            else {
                throw new Error('Unsupported object type');
            }
        });
    }, [canvasObject.height, canvasObject.width, drawRectangleObject, sceneObjects]);

    /*-----------Light rays computation------------*/

    const generateRandomRay = useCallback((): Ray => {
        const lightSourceObject = sceneObjects.find(obj => obj.id === 'lightSource-0');
        if (!lightSourceObject) {
            throw new Error('Light source not found');
        }
        const lightSource = lightSourceObject as Rectangle;
        
        // Scegli un punto casuale sulla sorgente luminosa
        const originX = lightSource.position.x + (Math.random() > 0.5 ? lightSource.width : 0);
        const originY = lightSource.position.y + Math.random() * lightSource.height;

        // Calcola una direzione casuale
        const angle = (Math.random() - 0.5) * Math.PI * 2;

        return {
            origin: {x: originX, y: originY},
            direction: {
                x: Math.cos(angle),
                y: Math.sin(angle)
            },
            hitObstacle: false,
            endpoint: null
        };
    }, [sceneObjects]);

    // Funzione per tracciare il percorso del raggio e verificare le collisioni
    const findRayCollision = useCallback((ray: Ray): Ray => {
        // Troviamo il punto di intersezione con l'ostacolo o con i bordi del canvas
        const result = {...ray};

        // Parametri per l'equazione della linea del raggio
        let t = Infinity;

        // Verifica intersezione con l'ostacolo
        sceneObjects.filter(obj => obj.id.startsWith("obstacle")).forEach(obstacle => {
            if(obstacle.type === CanvasObjectType.RECTANGLE) {
                const obstacleHit = checkRectangleIntersection(ray,  obstacle as Rectangle);
                if (obstacleHit.hit && obstacleHit.t < t) {
                    t = obstacleHit.t;
                    result.hitObstacle = true;
                }
            }
            else {
                throw new Error('Unsupported object type');
            }
        });
        
        // Verifica intersezione con i bordi del canvas
        const borderHit = checkCanvasBorderIntersection(ray, canvasObject);
        if (borderHit.hit && borderHit.t < t) {
            t = borderHit.t;
        }

        // Calcola il punto finale del raggio
        result.endpoint = {
            x: ray.origin.x + ray.direction.x * t,
            y: ray.origin.y + ray.direction.y * t
        };

        return result;
    }, [canvasObject, sceneObjects]);

    // Funzione per disegnare l'ombra usando un approccio a densità
    const drawShadow = useCallback((ctx: CanvasRenderingContext2D, rays: Ray[]) => {
        // Creiamo una matrice di celle per calcolare la densità dell'ombra
        const gridWidth = Math.ceil(canvasObject.width / shadowCellSize);
        const gridHeight = Math.ceil(canvasObject.height / shadowCellSize);
        const shadowGrid = Array(gridWidth * gridHeight).fill(0);

        // Per ogni raggio che colpisce l'ostacolo, tracciamo una "scia" di ombra
        for (const ray of rays) {
            if (ray.hitObstacle && ray.endpoint) {
                // Calcoliamo la direzione estesa del raggio
                const dx = ray.endpoint.x - ray.origin.x;
                const dy = ray.endpoint.y - ray.origin.y;
                const length = Math.sqrt(dx * dx + dy * dy);

                // Direzione Normalizzata
                const nx = dx / length;
                const ny = dy / length;

                // Aggiungiamo punti lungo la direzione del raggio dopo l'ostacolo
                let currentX = ray.endpoint.x;
                let currentY = ray.endpoint.y;

                // Tracciamo punti fino al bordo del canvas
                while (currentX >= 0 && currentX < canvasObject.width && currentY >= 0 && currentY < canvasObject.height) {
                    const gridX = Math.floor(currentX / shadowCellSize);
                    const gridY = Math.floor(currentY / shadowCellSize);

                    if (gridX >= 0 && gridX < gridWidth && gridY >= 0 && gridY < gridHeight) {
                        const index = gridY * gridWidth + gridX;
                        shadowGrid[index] += 1;
                    }

                    currentX += nx * shadowCellSize / 2;
                    currentY += ny * shadowCellSize / 2;
                }
            }
        }

        // Disegna l'ombra basata sulla densità dei punti
        for (let y = 0; y < gridHeight; y++) {
            for (let x = 0; x < gridWidth; x++) {
                const index = y * gridWidth + x;
                if (shadowGrid[index] > 0) {
                    // Calcola l'intensità dell'ombra in base al numero di raggi
                    const alpha = Math.min(0.7, shadowGrid[index] / (simulationState.numRays / 50));
                    ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
                    ctx.fillRect(x * shadowCellSize, y * shadowCellSize, shadowCellSize, shadowCellSize);
                }
            }
        }
    }, [canvasObject.height, canvasObject.width, shadowCellSize, simulationState.numRays]);

    // MAIN
    const simulateLightRays = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        initializeCanvasDrawings(ctx);

        const rays: Ray[] = [];
        for (let i = 0; i < simulationState.numRays; i++) {
            const ray: Ray = generateRandomRay();
            const hitResult: Ray = findRayCollision(ray);
            rays.push(hitResult);

            if (simulationState.showRays) {
                drawRay(ctx, hitResult);
            }
        }

        // Calcoliamo e disegniamo l'ombra
        drawShadow(ctx, rays);
    }, [initializeCanvasDrawings, drawShadow, simulationState.numRays, simulationState.showRays, generateRandomRay, findRayCollision]);

    //Animation useEffect
    useEffect(() => {
        if (!simulationState.isRunning) return;

        const animate = () => {
            simulateLightRays();
            animationRef.current = requestAnimationFrame(animate);
        };

        animationRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [simulationState.isRunning, simulateLightRays]);

    /*-----------end Light rays computation------------*/
    
    // draw objects on startup
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        initializeCanvasDrawings(ctx);
    }, [initializeCanvasDrawings]);

    const updateIfClickPointInObject = (point: Point) => {
        sceneObjects.forEach((obj) => {
            if(obj.type === CanvasObjectType.RECTANGLE && isPointInRectangle(point, obj as Rectangle)) {
                setMouseDragInfo({
                    isDragging: true,
                    targetId: obj.id,
                    offsetX: point.x - obj.position.x,
                    offsetY: point.y - obj.position.y
                });
            }
        });
    }
    const handleObjectMove = (finalPosition: Point) => {
        // Calcola la nuova posizione dell'oggetto trascinato
        const newX = finalPosition.x - mouseDragInfo.offsetX;
        const newY = finalPosition.y - mouseDragInfo.offsetY;

        const targetedObjectIndex = sceneObjects.findIndex((obj) => obj.id === mouseDragInfo.targetId);
        if (targetedObjectIndex < 0) return;
        if (sceneObjects[targetedObjectIndex].type !== CanvasObjectType.RECTANGLE) {
            throw new Error('Unsupported object type');
        }
        const target :Rectangle = sceneObjects[targetedObjectIndex] as Rectangle;

        // Limita la posizione all'interno del canvas
        const limitedX = Math.max(0, Math.min(canvasObject.width - target.width, newX));
        const limitedY = Math.max(0, Math.min(canvasObject.height - target.height, newY));

        setSceneObjects((prev) => {
            const newObjects = [...prev];
            newObjects[targetedObjectIndex] = {
                ...newObjects[targetedObjectIndex],
                position: {x: limitedX, y: limitedY}
            }
            return newObjects;
        });
    }

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!canvasRef.current) return;
        const click: Point = convertToCanvasCoordinates({x: e.clientX, y: e.clientY}, canvasObject);
        updateIfClickPointInObject(click);
    };
    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!mouseDragInfo.isDragging || !canvasRef.current) return;
        const click: Point = convertToCanvasCoordinates({x: e.clientX, y: e.clientY}, canvasObject);
        handleObjectMove(click);
    };
    const handleMouseUp = () => {
        setMouseDragInfo(initialMouseDragInfoState);
    };

    const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
        e.preventDefault(); // Previene lo scrolling durante il drag
        if (!canvasRef.current || e.touches.length === 0) return;
        const touch = e.touches[0];
        const touchPoint: Point = convertToCanvasCoordinates({x: touch.clientX, y: touch.clientY}, canvasObject);
        updateIfClickPointInObject(touchPoint);
    };
    const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
        e.preventDefault();
        if (!mouseDragInfo.isDragging || !canvasRef.current || e.touches.length === 0) return;
        const touch = e.touches[0];
        const touchPoint: Point = convertToCanvasCoordinates({x: touch.clientX, y: touch.clientY}, canvasObject);
        handleObjectMove(touchPoint);
    };
    const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
        e.preventDefault();
        setMouseDragInfo(initialMouseDragInfoState);
    };

    const handleRaysChange = (value: number[]) => {
        setSimulationState((prev) => ({...prev, numRays: value[0]}));
    }
    const resetSimulation = () => {
        setSimulationState(initialSimulationState);
        setSceneObjects([initialLightSourceState, initialObstacleState, initialObstacleState]);
        setShadowCellSize(4);
    }
    const toggleSimulation = () => {
        setSimulationState((prev) => ({...prev, isRunning: !prev.isRunning}));
    }
    const handleToggleRays = (event: ChangeEvent<HTMLInputElement>) => {
        setSimulationState((prev) => ({...prev, showRays: event.target.checked}));
    }

    return (
        <div className="flex flex-col gap-2 sm:gap-4 p-2 sm:p-4 max-w-full mx-auto">
            <h1 className="text-xl sm:text-2xl font-bold text-center">Monte Carlo Shadow Simulator</h1>

            <div className="border border-gray-300 rounded-lg p-2 sm:pl-10 sm:pr-10 md:pl-14 md:pr-14 w-full flex justify-center items-center">
                <canvas
                    ref={canvasRef}
                    width={canvasObject.width}
                    height={canvasObject.height}
                    className="border border-gray-400 rounded mx-auto bg-gray-100 max-w-full max-h-full touch-none"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}

                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                <div className="flex flex-col gap-2 p-3 sm:p-4 border border-gray-300 rounded-lg">
                    <h2 className="text-base sm:text-lg font-semibold">Simulation Controls</h2>

                    <div className="flex gap-1 sm:gap-3 mt-2 sm:mt-4">
                        <Button variant="outline" className="flex-1 text-xs sm:text-sm h-8 sm:h-10" onClick={resetSimulation}>
                            <RefreshCw className="mr-1 h-3 w-3 sm:h-4 sm:w-4"/> Reset
                        </Button>
                        <Button className="flex-1 text-xs sm:text-sm h-8 sm:h-10" onClick={toggleSimulation}>
                            {simulationState.isRunning ? (
                                <>
                                    <Pause className="mr-1 h-3 w-3 sm:h-4 sm:w-4"/> Pause
                                </>
                            ) : (
                                <>
                                    <Play className="mr-1 h-3 w-3 sm:h-4 sm:w-4"/> Start
                                </>
                            )}
                        </Button>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-2">
                        <label className="text-sm mb-1 sm:mb-0 sm:flex-1">Number of Rays:</label>
                        <div className="flex items-center w-full sm:w-auto sm:flex-1">
                            <span className="text-xs sm:text-sm w-6 sm:w-12 text-right">1</span>
                            <Slider
                                min={1}
                                max={maxRays}
                                step={1}
                                value={[simulationState.numRays]}
                                onValueChange={handleRaysChange}
                                className="flex-1 mx-2"
                            />
                            <span className="text-xs sm:text-sm w-8 sm:w-12 text-right">{simulationState.numRays}</span>
                        </div>
                    </div>

                    <div className="flex items-center mt-2">
                        <label className="flex items-center text-sm">
                            <input
                                type="checkbox"
                                checked={simulationState.showRays}
                                onChange={handleToggleRays}
                                className="mr-2"
                            />
                            Show Light Rays
                        </label>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-2">
                        <label className="text-sm mb-1 sm:mb-0 sm:flex-1">Shadow Cell Size:</label>
                        <div className="flex items-center w-full sm:w-auto sm:flex-1">
                            <span className="text-xs sm:text-sm w-6 sm:w-12 text-right">1</span>
                            <Slider
                                min={1}
                                max={20}
                                step={1}
                                value={[shadowCellSize]}
                                onValueChange={(value) => setShadowCellSize(value[0])}
                                className="flex-1 mx-2"
                            />
                            <span className="text-xs sm:text-sm w-8 sm:w-12 text-right">{shadowCellSize}</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-2 p-3 sm:p-4 border border-gray-300 rounded-lg">
                    <h2 className="text-base sm:text-lg font-semibold">Objects in the scene</h2>
                    <p className="text-sm font-light text-gray-600">
                        Drag the light source and the obstacle to change their position.
                    </p>

                    <h3 className="text-sm mt-1 font-semibold">Light Source</h3>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                        <label className="text-xs sm:text-sm mb-1 sm:mb-0 sm:flex-1">width:</label>
                        <div className="flex items-center w-full sm:w-auto sm:flex-1">
                            <span className="text-xs w-6 sm:w-12 text-right">1</span>
                            <Slider
                                min={1}
                                max={canvasObject.width * 0.7}
                                step={1}
                                value={[(sceneObjects[0] as Rectangle).width]}
                                onValueChange={(value) => (setSceneObjects((prev) => {
                                    const newObjects = [...prev];
                                    const rect : Rectangle= {
                                        ...(newObjects[0] as Rectangle),
                                        width: value[0]
                                    }
                                    newObjects[0] = rect as SceneObject;
                                    return newObjects;
                                }))}
                                className="flex-1 mx-2"
                            />
                            <span className="text-xs w-8 sm:w-12 text-right">{(sceneObjects[0] as Rectangle).width}</span>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                        <label className="text-xs sm:text-sm mb-1 sm:mb-0 sm:flex-1">height:</label>
                        <div className="flex items-center w-full sm:w-auto sm:flex-1">
                            <span className="text-xs w-6 sm:w-12 text-right">1</span>
                            <Slider
                                min={1}
                                max={canvasObject.height * 0.7}
                                step={1}
                                value={[(sceneObjects[0] as Rectangle).height]}
                                onValueChange={(value) => (setSceneObjects((prev) => {
                                    const newObjects = [...prev];
                                    const rect : Rectangle= {
                                        ...(newObjects[0] as Rectangle),
                                        height: value[0]
                                    }
                                    newObjects[0] = rect as SceneObject;
                                    return newObjects;
                                }))}
                                className="flex-1 mx-2"
                            />
                            <span className="text-xs w-8 sm:w-12 text-right">{(sceneObjects[0] as Rectangle).height}</span>
                        </div>
                    </div>

                    <h3 className="text-sm mt-1 font-semibold">Obstacle</h3>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                        <label className="text-xs sm:text-sm mb-1 sm:mb-0 sm:flex-1">width:</label>
                        <div className="flex items-center w-full sm:w-auto sm:flex-1">
                            <span className="text-xs w-6 sm:w-12 text-right">1</span>
                            <Slider
                                min={1}
                                max={canvasObject.width * 0.7}
                                step={1}
                                value={[(sceneObjects[1] as Rectangle).width]}
                                onValueChange={(value) => (setSceneObjects((prev) => {
                                    const newObjects = [...prev];
                                    const rect : Rectangle= {
                                        ...(newObjects[1] as Rectangle),
                                        width: value[0]
                                    }
                                    newObjects[1] = rect as SceneObject;
                                    return newObjects;
                                }))}
                                className="flex-1 mx-2"
                            />
                            <span className="text-xs w-8 sm:w-12 text-right">{(sceneObjects[1] as Rectangle).width}</span>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                        <label className="text-xs sm:text-sm mb-1 sm:mb-0 sm:flex-1">height:</label>
                        <div className="flex items-center w-full sm:w-auto sm:flex-1">
                            <span className="text-xs w-6 sm:w-12 text-right">1</span>
                            <Slider
                                min={1}
                                max={canvasObject.height * 0.7}
                                step={1}
                                value={[(sceneObjects[1] as Rectangle).height]}
                                onValueChange={(value) => (setSceneObjects((prev) => {
                                    const newObjects = [...prev];
                                    const rect : Rectangle= {
                                        ...(newObjects[1] as Rectangle),
                                        height: value[0]
                                    }
                                    newObjects[1] = rect as SceneObject;
                                    return newObjects;
                                }))}
                                className="flex-1 mx-2"
                            />
                            <span className="text-xs w-8 sm:w-12 text-right">{(sceneObjects[1] as Rectangle).height}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MonteCarloShadowSimulation;