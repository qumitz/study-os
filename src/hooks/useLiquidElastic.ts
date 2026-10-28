import { useState, useRef, useCallback, useEffect } from 'react';

export interface LiquidElasticOptions {
  maxTilt?: number;      // Maximum tilt in degrees (default: 5)
  squishScale?: number;  // Squish scale on hold (default: 0.97)
  disabled?: boolean;
}

export function useLiquidElastic<T extends HTMLElement = HTMLDivElement>(options?: LiquidElasticOptions) {
  const ref = useRef<T | null>(null);
  const startPos = useRef<{ x: number; y: number } | null>(null);
  const isPointerDown = useRef<boolean>(false);

  const maxTilt = options?.maxTilt ?? 5;
  const squishScale = options?.squishScale ?? 0.97;
  const disabled = options?.disabled ?? false;

  const [isPressed, setIsPressed] = useState<boolean>(false);
  const [tilt, setTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [scale, setScale] = useState<number>(1);
  const [pointerPos, setPointerPos] = useState<{ x: number; y: number }>({ x: 50, y: 50 });

  // Handle pointer down (press / hold)
  const handlePointerDown = useCallback((e: React.PointerEvent<T>) => {
    if (disabled || e.button !== 0) return;
    const el = ref.current;
    if (!el) return;

    isPointerDown.current = true;
    startPos.current = { x: e.clientX, y: e.clientY };

    const rect = el.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    const normX = Math.max(-1, Math.min(1, (px / rect.width) * 2 - 1));
    const normY = Math.max(-1, Math.min(1, (py / rect.height) * 2 - 1));

    setTilt({
      x: -normY * maxTilt,
      y: normX * maxTilt
    });
    setScale(squishScale);
    setPointerPos({ x: px, y: py });
    setIsPressed(true);
  }, [disabled, maxTilt, squishScale]);

  // Handle pointer move (finger tracking)
  const handlePointerMove = useCallback((e: React.PointerEvent<T>) => {
    if (!isPointerDown.current || !startPos.current) return;
    const el = ref.current;
    if (!el) return;

    // Detect user trying to scroll on mobile touch device
    const dist = Math.hypot(e.clientX - startPos.current.x, e.clientY - startPos.current.y);
    if (e.pointerType === 'touch' && dist > 14) {
      // Abort elastic press so normal mobile scrolling operates cleanly
      handleRelease();
      return;
    }

    const rect = el.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    const normX = Math.max(-1, Math.min(1, (px / rect.width) * 2 - 1));
    const normY = Math.max(-1, Math.min(1, (py / rect.height) * 2 - 1));

    setTilt({
      x: -normY * maxTilt,
      y: normX * maxTilt
    });
    setPointerPos({ x: px, y: py });
  }, [maxTilt]);

  // Handle release / cancel / leave
  const handleRelease = useCallback(() => {
    isPointerDown.current = false;
    startPos.current = null;
    setIsPressed(false);
    setTilt({ x: 0, y: 0 });
    setScale(1);
  }, []);

  const style: React.CSSProperties = {
    transform: `perspective(600px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(${scale}, ${scale}, 1)`,
    transition: isPressed ? 'transform 0.08s ease-out' : 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
    '--pointer-x': `${pointerPos.x}px`,
    '--pointer-y': `${pointerPos.y}px`,
    '--tilt-x': `${tilt.x}deg`,
    '--tilt-y': `${tilt.y}deg`,
    '--scale': scale
  } as React.CSSProperties;

  return {
    ref,
    isPressed,
    style,
    bind: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handleRelease,
      onPointerCancel: handleRelease,
      onPointerLeave: handleRelease,
    }
  };
}
