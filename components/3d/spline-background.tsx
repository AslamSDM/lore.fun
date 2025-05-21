"use client";

import { useRef, useEffect, useState } from "react";
import Spline from "@splinetool/react-spline";
import { Application } from "@splinetool/runtime";

interface SplineBackgroundProps {
  splineUrl?: string;
  className?: string;
}

export default function SplineBackground({
  splineUrl = "https://prod.spline.design/kLz0GUSm0Jnn5bbz/scene.splinecode", // default scene URL
  className = "",
}: SplineBackgroundProps) {
  const splineRef = useRef<Application | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // When loading is complete
  useEffect(() => {
    if (!isLoading) {
      setLoadingProgress(100);
    }
  }, [isLoading]);

  return (
    <div
      ref={wrapperRef}
      className={`fixed inset-0 w-full h-full overflow-hidden ${className}`}
      style={{ zIndex: -10, pointerEvents: "none" }}
    >
      {/* Enhanced gradient overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-transparent to-background/70 pointer-events-none z-10"></div>

      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background z-20">
          <div className="w-64 h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300 ease-out"
              style={{ width: `${loadingProgress}%` }}
            ></div>
          </div>
          <div className="mt-4 text-sm text-primary-foreground">
            Loading 3D environment... {Math.round(loadingProgress)}%
          </div>
        </div>
      )}

      <Spline
        scene={splineUrl}
        className="transition-opacity duration-1000 ease-in-out"
      />
    </div>
  );
}
