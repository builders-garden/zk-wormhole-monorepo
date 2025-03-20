"use client";

import { useEffect, useRef } from "react";

interface SpotlightConfig {
  radius?: number;
  brightness?: number;
  color?: string;
  smoothing?: number;
}

const useSpotlightEffect = (config: SpotlightConfig) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mousePosition = useRef({ x: 0, y: 0 });
  const currentPosition = useRef({ x: 0, y: 0 });
  const rafId = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    // Initial size
    updateCanvasSize();

    // Handle mouse move
    const onMouseMove = (e: MouseEvent) => {
      mousePosition.current = {
        x: e.clientX,
        y: e.clientY,
      };
    };

    // Animation function
    const render = () => {
      // Smooth transition to target position
      currentPosition.current.x +=
        (mousePosition.current.x - currentPosition.current.x) *
        (config.smoothing || 0.1);
      currentPosition.current.y +=
        (mousePosition.current.y - currentPosition.current.y) *
        (config.smoothing || 0.1);

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Create gradient
      const gradient = ctx.createRadialGradient(
        currentPosition.current.x,
        currentPosition.current.y,
        0,
        currentPosition.current.x,
        currentPosition.current.y,
        config.radius || 200
      );

      // Set gradient colors
      gradient.addColorStop(
        0,
        `${config.color}${Math.round((config.brightness || 0.15) * 255)
          .toString(16)
          .padStart(2, "0")}`
      );
      gradient.addColorStop(1, `${config.color}00`);

      // Draw spotlight
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Request next frame
      rafId.current = requestAnimationFrame(render);
    };

    // Start animation
    render();

    // Add event listeners
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("resize", updateCanvasSize);

    // Cleanup
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", updateCanvasSize);
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, [config]);

  return canvasRef;
};

export default useSpotlightEffect;
