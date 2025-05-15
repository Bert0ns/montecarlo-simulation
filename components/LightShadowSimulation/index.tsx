"use client";
import React, {ChangeEvent} from 'react';
import {Slider} from "@/components/ui/slider";
import {Button} from "@/components/ui/button";
import {Pause, Play, RefreshCw} from "lucide-react";

interface SimulationState {
    isRunning: boolean;
    numRays: number;
    showRays: boolean;
}

const LightShadowSimulation: React.FC = () => {
    const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
    const canvasWidth = 600;
    const canvasHeight = 400;
    const maxRays = 5000;
    const initialSimulationState: SimulationState = {
        numRays: 10,
        showRays: true,
        isRunning: false
    }
    const [simulationState, setSimulationState] = React.useState<SimulationState>(initialSimulationState);





    const handleRaysChange = (value: number[]) => {
        setSimulationState((prev) => ({...prev, numRays: value[0]}));
    }
    function resetSimulation() {
        setSimulationState(initialSimulationState);
    }
    function toggleSimulation() {
        setSimulationState((prev) => ({...prev, isRunning: !prev.isRunning}));
    }
    function handleToggleRays(event: ChangeEvent<HTMLInputElement>): void {
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
            </div>
        </div>
    );
};

export default LightShadowSimulation;