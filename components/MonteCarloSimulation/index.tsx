"use client"

import React, { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { RefreshCw, Pause, Play } from "lucide-react"

interface Point {
    x: number
    y: number
    isInside: boolean
}

const MonteCarloSimulation: React.FC = ({}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [points, setPoints] = useState<Point[]>([])
    const [piApproximation, setPiApproximation] = useState<number>(0)
    const [isRunning, setIsRunning] = useState<boolean>(false)
    const [speed, setSpeed] = useState<number>(10)
    const animationRef = useRef<number | null>(null)
    const lastTimeRef = useRef<number>(0)

    const canvasSize = 400
    const radius = canvasSize / 2

    const resetSimulation = () => {
        setPoints([])
        setPiApproximation(0)
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current)
            animationRef.current = null
        }
        setIsRunning(false)
    }

    const toggleSimulation = () => {
        setIsRunning((prev) => !prev)
    }

    const addPoint = () => {
        // Generate random point in square with coordinates from -1 to 1
        const x = Math.random() * 2 - 1
        const y = Math.random() * 2 - 1

        // Check if point is inside circle (x^2 + y^2 <= 1)
        const isInside = x * x + y * y <= 1

        setPoints((prevPoints) => [...prevPoints, { x, y, isInside }])

        // Update pi approximation
        const newPoints = [...points, { x, y, isInside }]
        const pointsInside = newPoints.filter((p) => p.isInside).length
        const totalPoints = newPoints.length

        if (totalPoints > 0) {
            setPiApproximation(4 * (pointsInside / totalPoints))
        }
    }

    const animate = (timestamp: number) => {
        if (!lastTimeRef.current) lastTimeRef.current = timestamp

        const elapsed = timestamp - lastTimeRef.current
        const pointsToAdd = Math.floor((elapsed * speed) / 1000)

        if (pointsToAdd > 0) {
            lastTimeRef.current = timestamp
            for (let i = 0; i < pointsToAdd; i++) {
                addPoint()
            }
        }

        animationRef.current = requestAnimationFrame(animate)
    }

    useEffect(() => {
        if (isRunning) {
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
    }, [isRunning, speed])

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext("2d")
        if (!ctx) return

        // Clear canvas
        ctx.clearRect(0, 0, canvasSize, canvasSize)

        // Draw square
        ctx.strokeStyle = "#e5e7eb"
        ctx.lineWidth = 2
        ctx.strokeRect(0, 0, canvasSize, canvasSize)

        // Draw circle
        ctx.beginPath()
        ctx.arc(radius, radius, radius, 0, 2 * Math.PI)
        ctx.strokeStyle = "#d1d5db"
        ctx.stroke()

        // Draw points
        points.forEach((point) => {
            ctx.beginPath()
            // Convert from [-1,1] coordinates to canvas coordinates
            const canvasX = (point.x + 1) * radius
            const canvasY = (point.y + 1) * radius

            ctx.arc(canvasX, canvasY, 2, 0, 2 * Math.PI)
            ctx.fillStyle = point.isInside ? "#3b82f6" : "#ef4444"
            ctx.fill()
        })
    }, [points])

    return (
        <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
            <h2 className="text-2xl font-semibold mb-6">Interactive Simulation</h2>

            <div className="grid md:grid-cols-2 gap-8">
                <div>
                    <canvas
                        ref={canvasRef}
                        width={canvasSize}
                        height={canvasSize}
                        className="bg-white border border-gray-200 mx-auto"
                    />
                </div>

                <div className="flex flex-col justify-between">
                    <div>
                        <div className="mb-8">
                            <h3 className="text-lg font-medium mb-2">Results</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white p-4 rounded border border-gray-200">
                                    <p className="text-sm text-gray-500">Total Points</p>
                                    <p className="text-2xl font-mono">{points.length}</p>
                                </div>
                                <div className="bg-white p-4 rounded border border-gray-200">
                                    <p className="text-sm text-gray-500">Points Inside</p>
                                    <p className="text-2xl font-mono">{points.filter((p) => p.isInside).length}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mb-8">
                            <h3 className="text-lg font-medium mb-2">π Approximation</h3>
                            <div className="bg-white p-4 rounded border border-gray-200">
                                <p className="text-3xl font-mono text-center">
                                    {piApproximation === 0 ? "—" : piApproximation.toFixed(6)}
                                </p>
                                <div className="mt-2 text-center text-sm text-gray-500">
                                    <p>Actual π: 3.141592653589793...</p>
                                    {points.length > 0 && <p className="mt-1">Error: {Math.abs(piApproximation - Math.PI).toFixed(6)}</p>}
                                </div>
                            </div>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-lg font-medium mb-2">Simulation Speed</h3>
                            <div className="flex items-center gap-4">
                                <span className="text-sm">Slow</span>
                                <Slider
                                    value={[speed]}
                                    min={1}
                                    max={100}
                                    step={1}
                                    onValueChange={(value) => setSpeed(value[0])}
                                    className="flex-1"
                                />
                                <span className="text-sm">Fast</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 mt-4">
                        <Button variant="outline" className="flex-1" onClick={resetSimulation}>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Reset
                        </Button>
                        <Button className="flex-1" onClick={toggleSimulation}>
                            {isRunning ? (
                                <>
                                    <Pause className="mr-2 h-4 w-4" />
                                    Pause
                                </>
                            ) : (
                                <>
                                    <Play className="mr-2 h-4 w-4" />
                                    Start
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MonteCarloSimulation;