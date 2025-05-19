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

  // Function to handle the Spline scene load
  const onLoad = (spline: Application) => {
    splineRef.current = spline;
    setIsLoading(false);
    setLoadingProgress(100);

    // Add scroll event listener to update camera position/rotation
    window.addEventListener("scroll", handleScroll);

    // Initial positioning
    handleScroll();
  };

  // Function to handle scroll-based animation with smoother transitions
  const handleScroll = () => {
    if (!splineRef.current) return;

    const scrollY = window.scrollY;
    const scene = splineRef.current;

    try {
      // Try to set a scroll variable if it exists in your Spline scene
      scene.setVariable("scroll", scrollY);

      // Example 1: Camera movement with smoother easing
      const camera = scene.findObjectByName("Camera");
      if (camera) {
        const targetY = scrollY * -0.01;
        // Use lerping for smoother animation
        camera.position.y += (targetY - camera.position.y) * 0.05;
      }

      // Example 2: Rotate a central object with smoother animation
      const centralObject =
        scene.findObjectByName("Main") ||
        scene.findObjectByName("Scene") ||
        scene.findObjectByName("Object");
      if (centralObject) {
        const targetRotationY = scrollY * 0.001;
        const targetPositionZ = Math.sin(scrollY * 0.001) * 100;

        // Smooth rotations and movements
        centralObject.rotation.y +=
          (targetRotationY - centralObject.rotation.y) * 0.03;
        centralObject.position.z +=
          (targetPositionZ - centralObject.position.z) * 0.02;
      }

      // Example 3: Opacity change based on scroll with smoother transitions
      const fadeElements = scene.findObjectsByType("Light");
      if (fadeElements && fadeElements.length) {
        fadeElements.forEach((light: any) => {
          if (light && typeof light.intensity !== "undefined") {
            const targetIntensity = Math.max(0.5, 1 - scrollY * 0.001);
            light.intensity += (targetIntensity - light.intensity) * 0.1;
          }
        });
      }
    } catch (error) {
      // Handle errors silently as the Spline API might change
      console.error("Error adjusting Spline scene:", error);
    }
  };

  // Set up and remove scroll listener with debouncing for better performance
  useEffect(() => {
    // Simulate loading progress
    const loadingInterval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 90 && isLoading) return prev;
        return Math.min(prev + Math.random() * 10, 90);
      });
    }, 200);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearInterval(loadingInterval);
    };
  }, [isLoading]);

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
        onLoad={onLoad}
        className="transition-opacity duration-1000 ease-in-out"
      />
    </div>
  );
}
