"use client";
import React, {ChangeEvent, useCallback, useEffect, useMemo, useState} from 'react';
import {Slider} from "@/components/ui/slider";
import {Button} from "@/components/ui/button";
import {Pause, Play, RefreshCw} from "lucide-react";
import {MouseDragInfo, SimulationState} from './index.types';
import {convertToCanvasCoordinates, isPointInRectangle, checkCanvasBorderIntersection, checkRectangleIntersection, drawRay, CanvasRef, Rectangle, Ray, Point} from "@/lib/canvas-utils";

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
        position: {
            x: 100,
            y: 100
        },
        width: 30,
        height: 30,
        fillColor: "#c051f4"
    }
    const [lightSource, setLightSource] = useState<Rectangle>(initialLightSourceState);
    const initialObstacleState: Rectangle = {
        position: {
            x: 400,
            y: 100
        },
        width: 70,
        height: 120,
        fillColor: "#4a4a4a"
    }
    const [obstacle, setObstacle] = useState<Rectangle>(initialObstacleState);
    const [mouseDragInfo, setMouseDragInfo] = useState<MouseDragInfo>({
        isDragging: false,
        targetType: null,
        offsetX: 0,
        offsetY: 0
    });
    const animationRef = React.useRef<number | null>(null);
    const [shadowCellSize, setShadowCellSize] = useState<number>(4) // dimensione delle celle in pixel
    const drawLightSource = useCallback((ctx: CanvasRenderingContext2D) => {
        ctx.fillStyle = lightSource.fillColor || '#d8b101';
        ctx.fillRect(lightSource.position.x, lightSource.position.y, lightSource.width, lightSource.height);
    }, [lightSource]);
    const drawObstacle = useCallback((ctx: CanvasRenderingContext2D) => {
        ctx.fillStyle = obstacle.fillColor || '#4a4a4a';
        ctx.fillRect(obstacle.position.x, obstacle.position.y, obstacle.width, obstacle.height);
    }, [obstacle]);

    /*-----------Light rays computation------------*/

    const generateRandomRay = useCallback((): Ray => {
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
    }, [lightSource.height, lightSource.position.x, lightSource.position.y, lightSource.width]);

    // Funzione per tracciare il percorso del raggio e verificare le collisioni
    const findRayCollision = useCallback((ray: Ray): Ray => {
        // Troviamo il punto di intersezione con l'ostacolo o con i bordi del canvas
        const result = {...ray};

        // Parametri per l'equazione della linea del raggio
        let t = Infinity;

        // Verifica intersezione con l'ostacolo
        const obstacleHit = checkRectangleIntersection(ray, obstacle);
        if (obstacleHit.hit && obstacleHit.t < t) {
            t = obstacleHit.t;
            result.hitObstacle = true;
        }

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
    }, [canvasObject, obstacle]);

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

        // Puliamo il canvas e ridisegniamo gli elementi base
        ctx.clearRect(0, 0, canvasObject.width, canvasObject.height);
        drawLightSource(ctx);
        drawObstacle(ctx);

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
    }, [canvasObject.width, canvasObject.height, drawLightSource, drawObstacle, drawShadow, simulationState.numRays, simulationState.showRays, generateRandomRay, findRayCollision]);

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

        ctx.clearRect(0, 0, canvasObject.width, canvasObject.height);
        drawLightSource(ctx);
        drawObstacle(ctx);
    }, [canvasObject.height, canvasObject.width, drawLightSource, drawObstacle]);

    const updateIfClickPointInObject = (point: Point) => {
        const pointX = point.x;
        const pointY = point.y;
        // Controlla se il click è avvenuto sulla sorgente di luce
        if (isPointInRectangle({x: pointX, y: pointY}, lightSource)) {
            setMouseDragInfo({
                isDragging: true,
                targetType: 'lightSource',
                offsetX: pointX - lightSource.position.x,
                offsetY: pointY - lightSource.position.y
            });
        }
        // Controlla se il click è avvenuto sull'ostacolo
        else if (isPointInRectangle({x: pointX, y: pointY}, obstacle)) {
            setMouseDragInfo({
                isDragging: true,
                targetType: 'obstacle',
                offsetX: pointX - obstacle.position.x,
                offsetY: pointY - obstacle.position.y
            });
        }
    }
    const handleObjectMove = (finalPosition: Point) => {
        // Calcola la nuova posizione dell'oggetto trascinato
        const newX = finalPosition.x - mouseDragInfo.offsetX;
        const newY = finalPosition.y - mouseDragInfo.offsetY;

        // Limita la posizione all'interno del canvas
        const limitedX = Math.max(0, Math.min(canvasObject.width - (mouseDragInfo.targetType === 'lightSource' ? lightSource.width : obstacle.width), newX));
        const limitedY = Math.max(0, Math.min(canvasObject.height - (mouseDragInfo.targetType === 'lightSource' ? lightSource.height : obstacle.height), newY));

        // Aggiorna la posizione dell'oggetto appropriato
        if (mouseDragInfo.targetType === 'lightSource') {
            setLightSource(prev => ({
                ...prev,
                position: {x: limitedX, y: limitedY}
            }));
        } else if (mouseDragInfo.targetType === 'obstacle') {
            setObstacle(prev => ({
                ...prev,
                position: {x: limitedX, y: limitedY}
            }));
        }
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
        setMouseDragInfo({
            isDragging: false,
            targetType: null,
            offsetX: 0,
            offsetY: 0
        });
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
        setMouseDragInfo({
            isDragging: false,
            targetType: null,
            offsetX: 0,
            offsetY: 0
        });
    };

    const handleRaysChange = (value: number[]) => {
        setSimulationState((prev) => ({...prev, numRays: value[0]}));
    }
    const resetSimulation = () => {
        setSimulationState(initialSimulationState);
        setLightSource(initialLightSourceState);
        setObstacle(initialObstacleState);
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
                                value={[lightSource.width]}
                                onValueChange={(value) => (setLightSource({...lightSource, width: value[0]}))}
                                className="flex-1 mx-2"
                            />
                            <span className="text-xs w-8 sm:w-12 text-right">{lightSource.width}</span>
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
                                value={[lightSource.height]}
                                onValueChange={(value) => (setLightSource({...lightSource, height: value[0]}))}
                                className="flex-1 mx-2"
                            />
                            <span className="text-xs w-8 sm:w-12 text-right">{lightSource.height}</span>
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
                                value={[obstacle.width]}
                                onValueChange={(value) => (setObstacle({...obstacle, width: value[0]}))}
                                className="flex-1 mx-2"
                            />
                            <span className="text-xs w-8 sm:w-12 text-right">{obstacle.width}</span>
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
                                value={[obstacle.height]}
                                onValueChange={(value) => (setObstacle({...obstacle, height: value[0]}))}
                                className="flex-1 mx-2"
                            />
                            <span className="text-xs w-8 sm:w-12 text-right">{obstacle.height}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MonteCarloShadowSimulation;