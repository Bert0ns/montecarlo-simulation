"use client";
import {useEffect, useMemo, useRef, useState} from "react";

const LightSimulation = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [rayCount, setRayCount] = useState(0);

    const canvasWidth = 800;
    const canvasHeight = 600;
    const source = { x: 150, y: 300 };
    const obstacles = useMemo(() => {
        return [
            { x1: 300, y1: 200, x2: 500, y2: 200 },
            { x1: 500, y1: 200, x2: 500, y2: 400 },
            { x1: 500, y1: 400, x2: 300, y2: 400 },
            { x1: 300, y1: 400, x2: 300, y2: 200 },
        ]
    }, []);

    function intersect(ray: any, segment: any) {
        const r_px = ray.x;
        const r_py = ray.y;
        const r_dx = ray.dx;
        const r_dy = ray.dy;

        const s_px = segment.x1;
        const s_py = segment.y1;
        const s_dx = segment.x2 - segment.x1;
        const s_dy = segment.y2 - segment.y1;

        const r_mag = Math.sqrt(r_dx * r_dx + r_dy * r_dy);
        const s_mag = Math.sqrt(s_dx * s_dx + s_dy * s_dy);

        if (r_dx / r_mag === s_dx / s_mag && r_dy / r_mag === s_dy / s_mag) return null;

        const T2 = (r_dx * (s_py - r_py) + r_dy * (r_px - s_px)) / (s_dx * r_dy - s_dy * r_dx);
        const T1 = (s_px + s_dx * T2 - r_px) / r_dx;

        if (T1 < 0 || T2 < 0 || T2 > 1) return null;

        return {
            x: r_px + r_dx * T1,
            y: r_py + r_dy * T1,
        };
    }

    useEffect(() => {
        const ctx = canvasRef.current?.getContext("2d");
        if (!ctx) return;

        const draw = () => {
            for (let i = 0; i < 50; i++) {
                const angle = Math.random() * 2 * Math.PI;
                const dx = Math.cos(angle);
                const dy = Math.sin(angle);

                let closest = null;
                let minDist = Infinity;

                for (const seg of obstacles) {
                    const pt = intersect({ x: source.x, y: source.y, dx, dy }, seg);
                    if (pt) {
                        const dist = (pt.x - source.x) ** 2 + (pt.y - source.y) ** 2;
                        if (dist < minDist) {
                            minDist = dist;
                            closest = pt;
                        }
                    }
                }

                const end = closest || {
                    x: source.x + dx * 1000,
                    y: source.y + dy * 1000,
                };

                ctx.beginPath();
                ctx.strokeStyle = "rgba(255,255,0,0.02)";
                ctx.moveTo(source.x, source.y);
                ctx.lineTo(end.x, end.y);
                ctx.stroke();
            }

            setRayCount((prev) => prev + 50);
            requestAnimationFrame(draw);
        };

        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        ctx.fillStyle = "gray";
        for (const seg of obstacles) {
            ctx.beginPath();
            ctx.moveTo(seg.x1, seg.y1);
            ctx.lineTo(seg.x2, seg.y2);
            ctx.stroke();
        }

        draw();
    }, [obstacles, source.x, source.y]);

    return (
        <div className="flex flex-col items-center justify-center p-4">
            <h1 className="text-2xl font-bold mb-4">Monte Carlo use case - Computing shadows</h1>
            <canvas
                ref={canvasRef}
                width={canvasWidth}
                height={canvasHeight}
                className="border border-gray-300"
            />
            <p className="mt-2 text-sm text-gray-600">Number of Rays drown: {rayCount}</p>
        </div>
    );
};

export default LightSimulation;
