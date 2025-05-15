"use client"

import React, {useCallback, useEffect, useRef, useState} from "react"
import {Button} from "@/components/ui/button"
import {Slider} from "@/components/ui/slider"
import {Pause, Play, RefreshCw} from "lucide-react"

interface Point {
    x: number
    y: number
    isInside: boolean
}

interface Circle {
    x: number
    y: number
    radius: number
}

interface SimulationState {
    points: Point[]
    totalPoints: number
    pointsInside: number
    piApproximation: number
    isRunning: boolean
    speed: number
}


const MonteCarloPiSimulation: React.FC = ({}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number | null>(null);
    const lastTimeRef = useRef<number>(0);

    const [simulationState, setSimulationState] = useState<SimulationState>({
        points: [],
        totalPoints: 0,
        pointsInside: 0,
        piApproximation: 0,
        isRunning: false,
        speed: 10
    });

    const canvasSize = 400;
    const circle: Circle = {
        x: canvasSize / 2,
        y: canvasSize / 2,
        radius: canvasSize / 2
    }

    const resetSimulation = () => {
        setSimulationState({
            points: [],
            totalPoints: 0,
            pointsInside: 0,
            piApproximation: 0,
            isRunning: false,
            speed: simulationState.speed
        });

        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
            animationRef.current = null;
        }
    }

    const toggleSimulation = () => {
        setSimulationState( (prevState ) => ({...prevState, isRunning: !prevState.isRunning}));
    }

    const animate = useCallback((timestamp: number) => {
        const addPoint = () => {
            const x: number = Math.random() * 2 - 1
            const y: number = Math.random() * 2 - 1
            const isInside: boolean = (x * x + y * y) < 1

            setSimulationState((prev: SimulationState) => {
                // Convert from [-1,1] coordinates to canvas coordinates
                const canvasX = (x + 1) * circle.radius;
                const canvasY = (y + 1) * circle.radius;

                const newPoints: Point[] = [...prev.points, {x: canvasX, y: canvasY, isInside}];

                const pointsInside: number = newPoints.filter((p) => p.isInside).length;
                let newPiApproximation: number = prev.piApproximation;
                if (newPoints.length > 0) {
                    newPiApproximation = 4 * (pointsInside / newPoints.length);
                }
                return {...prev, 
                    piApproximation: newPiApproximation, 
                    points: newPoints, 
                    totalPoints: newPoints.length, 
                    pointsInside: pointsInside
                };
            })
        }

        if (!lastTimeRef.current) lastTimeRef.current = timestamp;

        const elapsed: number = timestamp - lastTimeRef.current;
        const pointsToAdd: number = Math.floor((elapsed * simulationState.speed) / 1000);

        if (pointsToAdd > 0) {
            lastTimeRef.current = timestamp
            for (let i = 0; i < pointsToAdd; i++) {
                addPoint();
            }
        }

        animationRef.current = requestAnimationFrame(animate)
    }, [circle.radius, simulationState.speed])

    useEffect(() => {
        if (simulationState.isRunning) {
            lastTimeRef.current = 0
            animationRef.current = requestAnimationFrame(animate)
        } else if (animationRef.current) {
            cancelAnimationFrame(animationRef.current)
            animationRef.current = null
        }

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current)
            }
        }
    }, [animate, simulationState.isRunning])

    useEffect(() => {
        const canvas: HTMLCanvasElement | null = canvasRef.current;
        if (!canvas) return;
        const ctx: CanvasRenderingContext2D | null = canvas.getContext("2d");
        if (!ctx) return;

        ctx.clearRect(0, 0, canvasSize, canvasSize)

        // Draw square
        ctx.strokeStyle = "#e5e7eb";
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, canvasSize, canvasSize);

        // Draw circle
        ctx.beginPath();
        ctx.arc(circle.x, circle.y, circle.radius, 0, 2 * Math.PI);
        ctx.strokeStyle = "#d1d5db";
        ctx.stroke();

        // Draw points
        for (let i = 0; i < simulationState.points.length; i++) {
            const point = simulationState.points[i];
            ctx.beginPath();
            ctx.arc(point.x, point.y, 2, 0, 2 * Math.PI);
            ctx.fillStyle = point.isInside ? "#3b82f6" : "#ef4444";
            ctx.fill();
        }
    }, [circle.radius, circle.x, circle.y, simulationState.points])

    return (
        <div className="bg-gray-50 p-4 sm:p-6 rounded-lg shadow-sm w-auto">
            <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">Interactive Simulation</h2>

            <div className="grid lg:grid-cols-2 gap-4 sm:gap-8">
                <div className="w-full h-auto flex justify-center items-center">
                    <canvas
                        ref={canvasRef}
                        width={canvasSize}
                        height={canvasSize}
                        className="bg-white border border-gray-200 max-w-full max-h-full"
                    />
                </div>

                <div className="flex flex-col justify-between">
                    <div>
                        <div className="mb-4 sm:mb-8">
                            <h3 className="text-base sm:text-lg font-medium mb-2">Results</h3>
                            <div className="grid grid-cols-2 gap-2 sm:gap-4">
                                <div className="bg-white p-2 sm:p-4 rounded border border-gray-200">
                                    <p className="text-xs sm:text-sm text-gray-500">Total Points</p>
                                    <p className="text-lg sm:text-2xl font-mono">{simulationState.totalPoints}</p>
                                </div>
                                <div className="bg-white p-2 sm:p-4 rounded border border-gray-200">
                                    <p className="text-xs sm:text-sm text-gray-500">Points Inside</p>
                                    <p className="text-lg sm:text-2xl font-mono">{simulationState.pointsInside}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mb-4 sm:mb-8">
                            <h3 className="text-base sm:text-lg font-medium mb-2">π Approximation</h3>
                            <div className="bg-white p-2 sm:p-4 rounded border border-gray-200">
                                <p className="text-2xl sm:text-3xl font-mono text-center">
                                    {simulationState.piApproximation === 0 ? "—" : simulationState.piApproximation.toFixed(6)}
                                </p>
                                <div className="mt-2 text-center text-xs sm:text-sm text-gray-500">
                                    <p>Actual π: 3.141592653589793...</p>
                                    {simulationState.totalPoints > 0 &&
                                        <p className="mt-1">Error: {Math.abs(simulationState.piApproximation - Math.PI).toFixed(6)}</p>}
                                </div>
                            </div>
                        </div>

                        <div className="mb-4 sm:mb-6">
                            <h3 className="text-base sm:text-lg font-medium mb-2">Simulation Speed</h3>
                            <div className="flex items-center gap-2 sm:gap-4">
                                <span className="text-xs sm:text-sm">Slow</span>
                                <Slider
                                    value={[simulationState.speed]}
                                    min={1}
                                    max={2000}
                                    step={1}
                                    onValueChange={(value) => setSimulationState({...simulationState, speed: value[0]})}
                                    className="flex-1"
                                />
                                <span className="text-xs sm:text-sm">Fast</span>
                            </div>
                        </div>
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
                </div>
            </div>
        </div>
    )
}

export default MonteCarloPiSimulation;