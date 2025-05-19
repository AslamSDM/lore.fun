# 3D Background Implementation in Lore.Fun

This document explains how the 3D background works in Lore.Fun and how to customize or replace it.

## Overview

Lore.Fun uses Spline to create an immersive 3D background experience that remains fixed while content scrolls over it. The background includes scroll-based animations and interactive elements that respond to user interactions.

## Implementation Details

### Fixed Position Background

The 3D background is implemented as a fixed positioned element with a negative z-index, allowing content to scroll over it while the background remains in place:

```tsx
<div
  className="fixed inset-0 w-full h-full overflow-hidden"
  style={{ zIndex: -10, pointerEvents: "none" }}
>
  {/* Spline component */}
</div>
```

### Scrolling Effects

The background responds to scrolling through the `handleScroll` function in the SplineBackground component:

```tsx
const handleScroll = () => {
  if (!splineRef.current) return;

  const scrollY = window.scrollY;
  const scene = splineRef.current;

  // Update scene elements based on scroll position
  scene.setVariable("scroll", scrollY);

  // Camera movement
  const camera = scene.findObjectByName("Camera");
  if (camera) {
    camera.position.y = scrollY * -0.01;
  }

  // Object rotation and other animations
  // ...
};
```

### Gradient Overlay

To improve readability of content on top of the 3D background, a gradient overlay is applied:

```tsx
<div className="absolute inset-0 bg-gradient-to-b from-background/30 via-transparent to-background/70 pointer-events-none z-10"></div>
```

## Customizing the Background

### Replacing the Spline Scene

1. **Create a new scene in Spline**:

   - Visit [spline.design](https://spline.design/) and create an account
   - Design a new scene or modify a template
   - For best results with scroll effects, include objects named "Camera" and elements that can be animated

2. **Export and publish your scene**:

   - Click "Export" in Spline
   - Choose "Get Link" to publish your scene online
   - Copy the scene URL (format: `https://prod.spline.design/YOUR_ID/scene.splinecode`)

3. **Update the implementation**:
   - In `pages/index.tsx`, update the splineUrl prop:
   ```tsx
   <SplineBackground splineUrl="YOUR_NEW_SCENE_URL" />
   ```

### Adjusting Overlay and Effects

1. **Change the gradient overlay**:

   - Modify the gradient in `components/3d/spline-background.tsx`:

   ```tsx
   <div className="absolute inset-0 bg-gradient-to-b from-[COLOR] via-[COLOR] to-[COLOR] opacity-[VALUE] pointer-events-none"></div>
   ```

2. **Customize scroll effects**:
   - Adjust the `handleScroll` function in `components/3d/spline-background.tsx` to change how objects respond to scrolling
   - Experiment with different multipliers for more subtle or dramatic effects

## Design Considerations

When using the 3D background with content sections:

1. **Content sections should use**:

   - `backdrop-blur-md` for a frosted glass effect
   - Semi-transparent backgrounds (`bg-background/30`)
   - Border highlights (`border border-primary/20`)
   - Higher contrast text colors

2. **Performance optimization**:
   - Use low-poly models in your Spline scene
   - Implement throttling for scroll handlers
   - Consider disabling complex animations on mobile devices
   - Test performance across different devices

## Troubleshooting

- **Scene not appearing**: Check browser console for WebGL errors
- **Performance issues**: Reduce scene complexity or disable certain animations
- **Mobile compatibility**: Test on various devices and consider a mobile fallback
- **Content readability**: Adjust the gradient overlay opacity

## Additional Resources

- [Spline Documentation](https://docs.spline.design/)
- [React-Spline Package](https://www.npmjs.com/package/@splinetool/react-spline)
- [Framer Motion](https://www.framer.com/motion/) - Used for content animations
- [TailwindCSS](https://tailwindcss.com/docs/backdrop-blur) - For backdrop effects
