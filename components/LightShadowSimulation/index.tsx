"use client";
import React, {useState, useEffect, useRef, useCallback} from 'react';

interface LightSource {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    intensity: number;
}
interface Obstacle {
    x: number;
    y: number;
    width: number;
    height: number;
}
interface SimulationState {
    numRays: number;
    isRunning: boolean;
    showRays: boolean;
}

const LightShadowSimulation = () => {
    // Canvas dimensions
    const width = 600;
    const height = 400;
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Scene parameters that users can adjust
    const [lightSource, setLightSource] = useState<LightSource>({
        x1: 100, y1: 50,
        x2: 200, y2: 50,
        intensity: 100
    });

    const [obstacle, setObstacle] = useState<Obstacle>({
        x: 300, y: 200,
        width: 80, height: 80
    });

    const [simulationParams, setSimulationParams] = useState<SimulationState>({
        numRays: 1000,
        isRunning: false,
        showRays: true
    });

    // Simulation state
    const [illumination, setIllumination] = useState([]);
    
    // Check if a ray intersects with the obstacle
    const rayObstacleIntersection = useCallback((ray, obstacle) => {
        // Test intersection with each edge of the obstacle rect
        const edges = [
            // Top edge
            { x1: obstacle.x, y1: obstacle.y,
                x2: obstacle.x + obstacle.width, y2: obstacle.y },
            // Right edge
            { x1: obstacle.x + obstacle.width, y1: obstacle.y,
                x2: obstacle.x + obstacle.width, y2: obstacle.y + obstacle.height },
            // Bottom edge
            { x1: obstacle.x, y1: obstacle.y + obstacle.height,
                x2: obstacle.x + obstacle.width, y2: obstacle.y + obstacle.height },
            // Left edge
            { x1: obstacle.x, y1: obstacle.y,
                x2: obstacle.x, y2: obstacle.y + obstacle.height }
        ];

        let closestIntersection = null;
        let minDistance = Infinity;

        edges.forEach(edge => {
            const intersection = lineSegmentIntersection(
                ray.origin.x, ray.origin.y,
                ray.origin.x + ray.direction.x * 1000, ray.origin.y + ray.direction.y * 1000, // Extend ray
                edge.x1, edge.y1, edge.x2, edge.y2
            );

            if (intersection) {
                const distance = Math.sqrt(
                    Math.pow(intersection.x - ray.origin.x, 2) +
                    Math.pow(intersection.y - ray.origin.y, 2)
                );

                if (distance < minDistance) {
                    minDistance = distance;
                    closestIntersection = intersection;
                }
            }
        });

        return closestIntersection;
    }, []);

    // Find where a ray exits the canvas
    const rayCanvasIntersection = useCallback((ray, width, height) => {
        // Extend the ray to find where it intersects the canvas edges
        const edges = [
            { x1: 0, y1: 0, x2: width, y2: 0 }, // Top
            { x1: width, y1: 0, x2: width, y2: height }, // Right
            { x1: 0, y1: height, x2: width, y2: height }, // Bottom
            { x1: 0, y1: 0, x2: 0, y2: height } // Left
        ];

        let closestIntersection = null;
        let minDistance = Infinity;

        edges.forEach(edge => {
            const intersection = lineSegmentIntersection(
                ray.origin.x, ray.origin.y,
                ray.origin.x + ray.direction.x * 1000, ray.origin.y + ray.direction.y * 1000,
                edge.x1, edge.y1, edge.x2, edge.y2
            );

            if (intersection) {
                const distance = Math.sqrt(
                    Math.pow(intersection.x - ray.origin.x, 2) +
                    Math.pow(intersection.y - ray.origin.y, 2)
                );

                if (distance < minDistance) {
                    minDistance = distance;
                    closestIntersection = intersection;
                }
            }
        });

        return closestIntersection || { x: ray.origin.x, y: ray.origin.y };
    }, []);

    // Calculate line segment intersection (used for ray-casting)
    const lineSegmentIntersection = (x1, y1, x2, y2, x3, y3, x4, y4) => {
        // Check if two line segments intersect, and return the intersection point if they do
        const denominator = ((y4 - y3) * (x2 - x1)) - ((x4 - x3) * (y2 - y1));

        // Lines are parallel if denominator is 0
        if (denominator === 0) return null;

        const ua = (((x4 - x3) * (y1 - y3)) - ((y4 - y3) * (x1 - x3))) / denominator;
        const ub = (((x2 - x1) * (y1 - y3)) - ((y2 - y1) * (x1 - x3))) / denominator;

        // Check if intersection occurs within both line segments
        if (ua < 0 || ua > 1 || ub < 0 || ub > 1) return null;

        const x = x1 + ua * (x2 - x1);
        const y = y1 + ua * (y2 - y1);

        return { x, y };
    };

    // Accumulate illumination for cells the ray passes through
    const accumulateIllumination = (ray, illuminationArray, gridSize, gridWidth, gridHeight) => {
        // Implementation of Bresenham's line algorithm to determine which cells the ray passes through
        const x0 = Math.floor(ray.origin.x / gridSize);
        const y0 = Math.floor(ray.origin.y / gridSize);
        const x1 = Math.floor(ray.endpoint.x / gridSize);
        const y1 = Math.floor(ray.endpoint.y / gridSize);

        let dx = Math.abs(x1 - x0);
        let dy = Math.abs(y1 - y0);

        const sx = x0 < x1 ? 1 : -1;
        const sy = y0 < y1 ? 1 : -1;

        let err = dx - dy;
        let x = x0;
        let y = y0;

        while (true) {
            // If the point is within the grid, add illumination
            if (x >= 0 && x < gridWidth && y >= 0 && y < gridHeight) {
                const index = y * gridWidth + x;
                if (index >= 0 && index < illuminationArray.length) {
                    illuminationArray[index] += 1;
                }
            }

            if (x === x1 && y === y1) break;

            const e2 = 2 * err;
            if (e2 > -dy) {
                err -= dy;
                x += sx;
            }
            if (e2 < dx) {
                err += dx;
                y += sy;
            }
        }
    };

    // Draw representative light rays for visualization
    const drawLightRays = useCallback((ctx) => {
        // Draw a smaller number of rays for visualization
        const numVisualRays = Math.min(25, simulationParams.numRays);

        ctx.strokeStyle = 'rgba(255, 255, 100, 0.9)';
        ctx.lineWidth = 1;

        for (let i = 0; i < numVisualRays; i++) {
            // Sample a random point on the light segment
            const t = i / numVisualRays;
            const rayOriginX = lightSource.x1 + t * (lightSource.x2 - lightSource.x1);
            const rayOriginY = lightSource.y1 + t * (lightSource.y2 - lightSource.y1);

            // Sample rays in different directions
            for (let j = 0; j < 8; j++) {
                const angle = (j / 8) * Math.PI * 2;
                const rayDirX = Math.cos(angle);
                const rayDirY = Math.sin(angle);

                const ray = {
                    origin: { x: rayOriginX, y: rayOriginY },
                    direction: { x: rayDirX, y: rayDirY }
                };

                // Check if ray intersects the obstacle
                const intersection = rayObstacleIntersection(ray, obstacle);

                ctx.beginPath();
                ctx.moveTo(rayOriginX, rayOriginY);

                if (intersection) {
                    ctx.lineTo(intersection.x, intersection.y);
                } else {
                    // Ray doesn't hit anything, draw to edge of canvas
                    const endpoint = rayCanvasIntersection(ray, width, height);
                    ctx.lineTo(endpoint.x, endpoint.y);
                }

                ctx.stroke();
            }
        }
    }, [lightSource.x1, lightSource.x2, lightSource.y1, lightSource.y2, obstacle, rayCanvasIntersection, rayObstacleIntersection, simulationParams.numRays]);

    // Draw the scene including light, obstacle, and illumination
    const drawScene = useCallback((ctx) => {
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Draw illumination grid
        if (illumination.length > 0) {
            const gridSize = 10;
            const gridWidth = Math.ceil(width / gridSize);

            for (let y = 0; y < height / gridSize; y++) {
                for (let x = 0; x < width / gridSize; x++) {
                    const index = y * gridWidth + x;
                    if (index < illumination.length) {
                        const intensity = illumination[index];
                        if (intensity > 0) {
                            // Use a heat map color scheme
                            ctx.fillStyle = `rgba(255, 0, 100, ${intensity / 100})`;
                            ctx.fillRect(x * gridSize, y * gridSize, gridSize, gridSize);
                        }
                    }
                }
            }
        }

        // Draw obstacle
        ctx.fillStyle = 'rgba(50, 50, 50, 0.9)';
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);

        // Draw light source segment
        ctx.strokeStyle = 'rgba(255, 255, 0, 1)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(lightSource.x1, lightSource.y1);
        ctx.lineTo(lightSource.x2, lightSource.y2);
        ctx.stroke();

        // Draw light rays if enabled
        if (simulationParams.showRays && simulationParams.isRunning) {
            drawLightRays(ctx);
        }
    }, [drawLightRays, illumination, lightSource.x1, lightSource.x2, lightSource.y1, lightSource.y2, obstacle.height, obstacle.width, obstacle.x, obstacle.y, simulationParams.isRunning, simulationParams.showRays]);

    // Monte Carlo simulation function
    const runMonteCarloSimulation = useCallback(() => {
        // Clear previous results
        const newIllumination = new Array(width * height).fill(0);

        // Create grid for illumination values
        const gridSize = 10; // Pixels per grid cell
        const gridWidth = Math.ceil(width / gridSize);
        const gridHeight = Math.ceil(height / gridSize);

        // Cast rays from the light source
        for (let i = 0; i < simulationParams.numRays; i++) {
            // Sample a random point on the light segment
            const t = Math.random();
            const rayOriginX = lightSource.x1 + t * (lightSource.x2 - lightSource.x1);
            const rayOriginY = lightSource.y1 + t * (lightSource.y2 - lightSource.y1);

            // Sample a random direction (uniformly in all directions)
            const angle = Math.random() * Math.PI * 2;
            const rayDirX = Math.cos(angle);
            const rayDirY = Math.sin(angle);

            // Cast the ray
            const ray = {
                origin: { x: rayOriginX, y: rayOriginY },
                direction: { x: rayDirX, y: rayDirY },
                hit: false,
                endpoint: { x: 0, y: 0 }
            };

            // Check if ray intersects the obstacle
            const intersection = rayObstacleIntersection(ray, obstacle);

            if (intersection) {
                ray.hit = true;
                ray.endpoint = intersection;
            } else {
                // Ray doesn't hit anything, compute where it exits the canvas
                ray.endpoint = rayCanvasIntersection(ray, width, height);
            }

            // Accumulate illumination for cells the ray passes through
            if (!ray.hit) {
                accumulateIllumination(ray, newIllumination, gridSize, gridWidth, gridHeight);
            }
        }

        // Normalize illumination values
        let maxIllumination = 0;
        for (let i = 0; i < newIllumination.length; i++) {
            if (newIllumination[i] > maxIllumination) {
                maxIllumination = newIllumination[i];
            }
        }
        if (maxIllumination > 0) {
            for (let i = 0; i < newIllumination.length; i++) {
                newIllumination[i] = (newIllumination[i] / maxIllumination) * lightSource.intensity;
            }
        }

        setIllumination(newIllumination);
    }, [lightSource.intensity, lightSource.x1, lightSource.x2, lightSource.y1, lightSource.y2, obstacle, rayCanvasIntersection, rayObstacleIntersection, simulationParams.numRays]);
    
    // Event handlers for UI controls
    const handleStartSimulation = () => {
        setSimulationParams(prev => ({ ...prev, isRunning: true }));
    };

    const handleStopSimulation = () => {
        setSimulationParams(prev => ({ ...prev, isRunning: false }));
    };

    const handleRaysChange = (e) => {
        const value = parseInt(e.target.value, 10);
        setSimulationParams(prev => ({ ...prev, numRays: value }));
    };

    const handleLightIntensityChange = (e) => {
        const value = parseInt(e.target.value, 10);
        setLightSource(prev => ({ ...prev, intensity: value }));
    };

    const handleToggleRays = () => {
        setSimulationParams(prev => ({ ...prev, showRays: !prev.showRays }));
    };

    const handleObstacleSizeChange = (e) => {
        const value = parseInt(e.target.value, 10);
        setObstacle(prev => ({ ...prev, width: value, height: value }));
    };

    const handleLightSourcePositionChange = (e) => {
        const value = parseInt(e.target.value, 10);
        setLightSource(prev => ({
            ...prev,
            y1: value,
            y2: value
        }));
    };

    const handleLightSourceLengthChange = (e) => {
        const value = parseInt(e.target.value, 10);
        setLightSource(prev => ({
            ...prev,
            x1: 100,
            x2: 100 + value
        }));
    };

    // Handle drag and drop for obstacle positioning
    const handleCanvasMouseDown = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Check if mouse is inside obstacle
        if (x >= obstacle.x && x <= obstacle.x + obstacle.width &&
            y >= obstacle.y && y <= obstacle.y + obstacle.height) {

            // Start dragging
            const offsetX = x - obstacle.x;
            const offsetY = y - obstacle.y;

            const handleMouseMove = (moveEvent) => {
                const newX = moveEvent.clientX - rect.left - offsetX;
                const newY = moveEvent.clientY - rect.top - offsetY;

                // Keep obstacle within canvas bounds
                const clampedX = Math.max(0, Math.min(width - obstacle.width, newX));
                const clampedY = Math.max(0, Math.min(height - obstacle.height, newY));

                setObstacle(prev => ({
                    ...prev,
                    x: clampedX,
                    y: clampedY
                }));
            };

            const handleMouseUp = () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };

            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }
    };

    // Run simulation when parameters change
    useEffect(() => {
        if (simulationParams.isRunning) {
            runMonteCarloSimulation();
        }
    }, [simulationParams.isRunning, simulationParams.numRays, lightSource, obstacle, runMonteCarloSimulation]);

    // Draw the scene when illumination data changes
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        drawScene(ctx);
    }, [drawScene, illumination, lightSource, obstacle, simulationParams.showRays]);
    
    return (
        <div className="flex flex-col gap-4 p-4 max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold text-center">Monte Carlo Shadow Simulator</h1>

            <div className="border border-gray-300 rounded-lg p-4">
                <canvas
                    ref={canvasRef}
                    width={width}
                    height={height}
                    onMouseDown={handleCanvasMouseDown}
                    className="border border-gray-400 rounded mx-auto bg-gray-100"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2 p-4 border border-gray-300 rounded-lg">
                    <h2 className="text-lg font-semibold">Simulation Controls</h2>

                    <div className="flex items-center justify-between">
                        <label className="flex-1">Number of Rays:</label>
                        <input
                            type="range"
                            min="100"
                            max="5000"
                            step="100"
                            value={simulationParams.numRays}
                            onChange={handleRaysChange}
                            className="flex-1"
                        />
                        <span className="ml-2 w-12 text-right">{simulationParams.numRays}</span>
                    </div>

                    <div className="flex items-center justify-between">
                        <label className="flex-1">Light Intensity:</label>
                        <input
                            type="range"
                            min="10"
                            max="200"
                            value={lightSource.intensity}
                            onChange={handleLightIntensityChange}
                            className="flex-1"
                        />
                        <span className="ml-2 w-12 text-right">{lightSource.intensity}</span>
                    </div>

                    <div className="flex items-center mt-2">
                        <button
                            onClick={handleStartSimulation}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mr-2"
                        >
                            Start Simulation
                        </button>
                        <button
                            onClick={handleStopSimulation}
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                        >
                            Stop Simulation
                        </button>
                    </div>

                    <div className="flex items-center mt-2">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={simulationParams.showRays}
                                onChange={handleToggleRays}
                                className="mr-2"
                            />
                            Show Light Rays
                        </label>
                    </div>
                </div>

                <div className="flex flex-col gap-2 p-4 border border-gray-300 rounded-lg">
                    <h2 className="text-lg font-semibold">Scene Settings</h2>

                    <div className="flex items-center justify-between">
                        <label className="flex-1">Obstacle Size:</label>
                        <input
                            type="range"
                            min="20"
                            max="150"
                            value={obstacle.width}
                            onChange={handleObstacleSizeChange}
                            className="flex-1"
                        />
                        <span className="ml-2 w-12 text-right">{obstacle.width}px</span>
                    </div>

                    <div className="flex items-center justify-between">
                        <label className="flex-1">Light Source Position:</label>
                        <input
                            type="range"
                            min="30"
                            max={height - 30}
                            value={lightSource.y1}
                            onChange={handleLightSourcePositionChange}
                            className="flex-1"
                        />
                        <span className="ml-2 w-12 text-right">{lightSource.y1}px</span>
                    </div>

                    <div className="flex items-center justify-between">
                        <label className="flex-1">Light Source Length:</label>
                        <input
                            type="range"
                            min="50"
                            max="300"
                            value={lightSource.x2 - lightSource.x1}
                            onChange={handleLightSourceLengthChange}
                            className="flex-1"
                        />
                        <span className="ml-2 w-12 text-right">{lightSource.x2 - lightSource.x1}px</span>
                    </div>

                    <div className="mt-2">
                        <p className="text-sm text-gray-600">
                            Drag the obstacle to reposition it in the scene.
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-gray-100 p-4 rounded-lg">
                <h2 className="text-lg font-semibold mb-2">How It Works</h2>
                <p className="text-sm">
                    This simulator uses the Monte Carlo method to calculate shadow patterns from a light source.
                    Random rays are cast from the light segment in different directions. When a ray hits an obstacle,
                    it stops; otherwise, it contributes to the illumination of the area it passes through.
                    The more rays used, the smoother and more accurate the shadow representation becomes.
                </p>
            </div>
        </div>
    );
};

export default LightShadowSimulation;