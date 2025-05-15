"use client"

import React, {useCallback, useEffect, useMemo, useRef, useState} from "react"
import {Button} from "@/components/ui/button"
import {Slider} from "@/components/ui/slider"
import {Pause, Play, RefreshCw} from "lucide-react"

interface Circle {
    x: number
    y: number
    radius: number
}

interface SimulationState {
    totalPoints: number
    pointsInside: number
    piApproximation: number
    isRunning: boolean
    speed: number
}

const MonteCarloPiSimulation: React.FC = ({}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const bufferCanvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number | null>(null);
    const lastTimeRef = useRef<number>(0);
    const batchSizeRef = useRef<number>(50);
    const maxSpeed: number = 50000;

    const [simulationState, setSimulationState] = useState<SimulationState>({
        totalPoints: 0,
        pointsInside: 0,
        piApproximation: 0,
        isRunning: false,
        speed: 100
    });

    const piApproximationError: number = useMemo(() => {
        return Math.abs(simulationState.piApproximation - Math.PI);
    }, [simulationState.piApproximation]);

    const canvasSize = 400;
    const circle: Circle = {
        x: canvasSize / 2,
        y: canvasSize / 2,
        radius: canvasSize / 2
    }

    const drawBackgroundToBuffer = useCallback(() => {
        const bufferCanvas = bufferCanvasRef.current
        if (!bufferCanvas) return

        const ctx = bufferCanvas.getContext("2d")
        if (!ctx) return

        // Clear canvas
        ctx.clearRect(0, 0, canvasSize, canvasSize)

        // Draw square
        ctx.strokeStyle = "#e5e7eb"
        ctx.lineWidth = 2
        ctx.strokeRect(0, 0, canvasSize, canvasSize)

        // Draw circle
        ctx.beginPath()
        ctx.arc(circle.x, circle.y, circle.radius, 0, 2 * Math.PI)
        ctx.strokeStyle = "#d1d5db"
        ctx.stroke()
    }, [circle.radius, circle.x, circle.y]);

    const addPointsBatch = useCallback((batchSize: number) => {
        const bufferCanvas = bufferCanvasRef.current
        if (!bufferCanvas) return
        const ctx = bufferCanvas.getContext("2d")
        if (!ctx) return

        let newPointsInside = 0
        const pointSize = Math.max(1.5, canvasSize / 200) // Smaller points for better performance

        for (let i = 0; i < batchSize; i++) {
            const x = Math.random() * 2 - 1;
            const y = Math.random() * 2 - 1;
            const isInside = x * x + y * y < 1;

            if (isInside) {
                newPointsInside++;
            }

            // Convert from [-1,1] coordinates to canvas coordinates
            const canvasX = (x + 1) * (canvasSize / 2)
            const canvasY = (y + 1) * (canvasSize / 2)

            // Draw point directly to the buffer
            ctx.beginPath();
            ctx.arc(canvasX, canvasY, pointSize, 0, 2 * Math.PI);
            ctx.fillStyle = isInside ? "#3b82f6" : "#ef4444";
            ctx.fill();
        }

        setSimulationState((prev) => {
            const newTotalPoints = prev.totalPoints + batchSize
            const newTotalPointsInside = prev.pointsInside + newPointsInside
            const newPiApproximation = 4 * (newTotalPointsInside / newTotalPoints)

            return {
                ...prev,
                totalPoints: newTotalPoints,
                pointsInside: newTotalPointsInside,
                piApproximation: newPiApproximation,
            }
        })

        updateMainCanvas()
    }, []);

    const resetSimulation = () => {
        setSimulationState({
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

        drawBackgroundToBuffer();
        updateMainCanvas();
        batchSizeRef.current = 50;
    }

    const toggleSimulation = () => {
        setSimulationState((prevState) => ({...prevState, isRunning: !prevState.isRunning}));
    }

    // Copy buffer canvas to the main canvas
    const updateMainCanvas = () => {

        const canvas = canvasRef.current;
        const bufferCanvas = bufferCanvasRef.current;
        if (!canvas || !bufferCanvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.clearRect(0, 0, canvasSize, canvasSize);
        ctx.drawImage(bufferCanvas, 0, 0);
    }

    const animate = useCallback((timestamp: number) => {
        if (!lastTimeRef.current) lastTimeRef.current = timestamp;

        const elapsed: number = timestamp - lastTimeRef.current;

        // Adjust batch size based on performance
        // If frame time is low, increase batch size; if high, decrease it
        if (elapsed > 0) {
            resizeBatch(elapsed);
        }
        const pointsToAdd = Math.floor((elapsed * batchSizeRef.current) / 1000)

        if (pointsToAdd > 0) {
            lastTimeRef.current = timestamp
            addPointsBatch(pointsToAdd);
        }

        animationRef.current = requestAnimationFrame(animate);

        function resizeBatch(elapsed: number) {
            const fps = 1000 / elapsed;
            if (fps > 50 && simulationState.totalPoints > 1000) {
                batchSizeRef.current = Math.min(simulationState.speed, batchSizeRef.current * 1.2);
            } else if (fps < 30) {
                batchSizeRef.current = Math.max(1, batchSizeRef.current * 0.8);
            } else {
                batchSizeRef.current = simulationState.speed;
            }
        }
    }, [addPointsBatch, simulationState.speed, simulationState.totalPoints])

    //manage the animation
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

    // Initialize the buffer canvas and draw the background
    useEffect(() => {
        bufferCanvasRef.current = document.createElement("canvas")
        bufferCanvasRef.current.width = canvasSize;
        bufferCanvasRef.current.height = canvasSize;

        drawBackgroundToBuffer();
        updateMainCanvas();
        return () => {
            bufferCanvasRef.current = null
        }
    }, [canvasSize, drawBackgroundToBuffer])

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
                                        <p className="mt-1">Error: {piApproximationError.toFixed(6)}</p>}
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
                                    max={maxSpeed}
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