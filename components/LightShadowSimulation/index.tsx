"use client";
import React, {ChangeEvent, useCallback, useEffect, useState} from 'react';
import {Slider} from "@/components/ui/slider";
import {Button} from "@/components/ui/button";
import {Pause, Play, RefreshCw} from "lucide-react";

interface SimulationState {
    isRunning: boolean;
    numRays: number;
    showRays: boolean;
}
interface Point {
    x: number;
    y: number;
}
interface Rectangle {
    position: Point;
    width: number;
    height: number;
    fillColor?: string;
}

interface MouseDragInfo {
    isDragging: boolean;
    targetType: 'lightSource' | 'obstacle' | null;
    offsetX: number;
    offsetY: number;
}

const LightShadowSimulation: React.FC = () => {
    const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
    const initialSimulationState: SimulationState = {
        numRays: 10,
        showRays: true,
        isRunning: false
    }
    const [simulationState, setSimulationState] = React.useState<SimulationState>(initialSimulationState);

    const initialLightSourceState: Rectangle = {
        position: {
            x: 100,
            y: 200
        },
        width: 10,
        height: 100,
        fillColor: "#d8b101"
    }
    const [lightSource, setLightSource] = useState<Rectangle>(initialLightSourceState);
    const initialObstacleState: Rectangle = {
        position: {
            x: 400,
            y: 100
        },
        width: 120,
        height: 70,
        fillColor: "#4a4a4a"
    }
    const [obstacle, setObstacle] = useState<Rectangle>(initialObstacleState);
    const [mouseDragInfo, setMouseDragInfo] = useState<MouseDragInfo>({
        isDragging: false,
        targetType: null,
        offsetX: 0,
        offsetY: 0
    });
    const canvasWidth = 600;
    const canvasHeight = 400;
    const maxRays = 5000;

    const drawLightSource = useCallback((ctx :CanvasRenderingContext2D) => {
        ctx.fillStyle = lightSource.fillColor || '#d8b101';
        ctx.fillRect(lightSource.position.x, lightSource.position.y, lightSource.width, lightSource.height);
    }, [lightSource]);

    const drawObstacle = useCallback((ctx :CanvasRenderingContext2D) => {
        ctx.fillStyle = obstacle.fillColor || '#4a4a4a';
        ctx.fillRect(obstacle.position.x, obstacle.position.y, obstacle.width, obstacle.height);
    }, [obstacle]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        drawLightSource(ctx);
        drawObstacle(ctx);
    }, [drawLightSource, drawObstacle]);

    const isPointInRectangle = (point: Point, rect: Rectangle): boolean => {
        return (
            point.x >= rect.position.x &&
            point.x <= rect.position.x + rect.width &&
            point.y >= rect.position.y &&
            point.y <= rect.position.y + rect.height
        );
    };
    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Controlla se il click è avvenuto sulla sorgente di luce
        if (isPointInRectangle({x: mouseX, y: mouseY}, lightSource)) {
            setMouseDragInfo({
                isDragging: true,
                targetType: 'lightSource',
                offsetX: mouseX - lightSource.position.x,
                offsetY: mouseY - lightSource.position.y
            });
        }
        // Controlla se il click è avvenuto sull'ostacolo
        else if (isPointInRectangle({x: mouseX, y: mouseY}, obstacle)) {
            setMouseDragInfo({
                isDragging: true,
                targetType: 'obstacle',
                offsetX: mouseX - obstacle.position.x,
                offsetY: mouseY - obstacle.position.y
            });
        }
    };
    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!mouseDragInfo.isDragging || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Calcola la nuova posizione dell'oggetto trascinato
        const newX = mouseX - mouseDragInfo.offsetX;
        const newY = mouseY - mouseDragInfo.offsetY;

        // Limita la posizione all'interno del canvas
        const limitedX = Math.max(0, Math.min(canvasWidth - (mouseDragInfo.targetType === 'lightSource' ? lightSource.width : obstacle.width), newX));
        const limitedY = Math.max(0, Math.min(canvasHeight - (mouseDragInfo.targetType === 'lightSource' ? lightSource.height : obstacle.height), newY));

        // Aggiorna la posizione dell'oggetto appropriato
        if (mouseDragInfo.targetType === 'lightSource') {
            setLightSource(prev => ({
                ...prev,
                position: { x: limitedX, y: limitedY }
            }));
        } else if (mouseDragInfo.targetType === 'obstacle') {
            setObstacle(prev => ({
                ...prev,
                position: { x: limitedX, y: limitedY }
            }));
        }
    };
    const handleMouseUp = () => {
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
        <div className="flex flex-col gap-4 p-4 max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold text-center">Monte Carlo Shadow Simulator</h1>
            <div className="border border-gray-300 rounded-lg p-4">
                <canvas
                    ref={canvasRef}
                    width={canvasWidth}
                    height={canvasHeight}
                    className="border border-gray-400 rounded mx-auto bg-gray-100"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2 p-4 border border-gray-300 rounded-lg">
                    <h2 className="text-lg font-semibold">Simulation Controls</h2>
                    <div className="flex items-center justify-between">
                        <label className="flex-1">Number of Rays:</label>
                        <span className="ml-2 w-12 text-right">1</span>
                        <Slider
                            min={1}
                            max={maxRays}
                            step={1}
                            value={[simulationState.numRays]}
                            onValueChange={handleRaysChange}
                            className="flex-1"
                        />
                        <span className="ml-2 w-12 text-right">{simulationState.numRays}</span>
                    </div>

                    <div className="flex gap-2 sm:gap-3 mt-4">
                        <Button variant="outline" className="flex-1 text-sm h-9 sm:h-10" onClick={resetSimulation}>
                            <RefreshCw className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4"/> Reset
                        </Button>
                        <Button className="flex-1 text-sm h-9 sm:h-10" onClick={toggleSimulation}>
                            {simulationState.isRunning ? (
                                <>
                                    <Pause className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4"/> Pause
                                </>
                            ) : (
                                <>
                                    <Play className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4"/> Start
                                </>
                            )}
                        </Button>
                    </div>

                    <div className="flex items-center mt-2">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={simulationState.showRays}
                                onChange={handleToggleRays}
                                className="mr-2"
                            />
                            Show Light Rays
                        </label>
                    </div>
                </div>
                <div className="flex flex-col gap-2 p-4 border border-gray-300 rounded-lg">
                    <h2 className="text-lg font-semibold">Objects in the scene</h2>
                    <h3>Light Source</h3>
                    <div className="flex items-center justify-between">
                        <label className="flex-1 text-sm">width:</label>
                        <span className="ml-2 w-12 text-right">1</span>
                        <Slider
                            min={1}
                            max={canvasWidth*0.7}
                            step={1}
                            value={[lightSource.width]}
                            onValueChange={(value) => (setLightSource({...lightSource, width: value[0]}))}
                            className="flex-1"
                        />
                        <span className="ml-2 w-12 text-right">{lightSource.width}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <label className="flex-1 text-sm">height:</label>
                        <span className="ml-2 w-12 text-right">1</span>
                        <Slider
                            min={1}
                            max={canvasHeight*0.7}
                            step={1}
                            value={[lightSource.height]}
                            onValueChange={(value) => (setLightSource({...lightSource, height: value[0]}))}
                            className="flex-1"
                        />
                        <span className="ml-2 w-12 text-right">{lightSource.height}</span>
                    </div>
                    <h3>Obstacle</h3>
                    <div className="flex items-center justify-between">
                        <label className="flex-1 text-sm">width:</label>
                        <span className="ml-2 w-12 text-right">1</span>
                        <Slider
                            min={1}
                            max={canvasWidth*0.7}
                            step={1}
                            value={[obstacle.width]}
                            onValueChange={(value) => (setObstacle({...obstacle, width: value[0]}))}
                            className="flex-1"
                        />
                        <span className="ml-2 w-12 text-right">{obstacle.width}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <label className="flex-1 text-sm">height:</label>
                        <span className="ml-2 w-12 text-right">1</span>
                        <Slider
                            min={1}
                            max={canvasHeight*0.7}
                            step={1}
                            value={[obstacle.height]}
                            onValueChange={(value) => (setObstacle({...obstacle, height: value[0]}))}
                            className="flex-1"
                        />
                        <span className="ml-2 w-12 text-right">{obstacle.height}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LightShadowSimulation;