"use client";

import { useCallback, useEffect, useState } from "react";

type Breakpoint = "sm" | "md" | "lg" | "xl";

const breakpointMap: Record<Breakpoint, number> = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
};

export function useScreenSize() {
  const [size, setSize] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const updateSize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateSize();
    window.addEventListener("resize", updateSize);

    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const lessThan = useCallback(
    (breakpoint: Breakpoint) => size.width < breakpointMap[breakpoint],
    [size.width]
  );

  return {
    ...size,
    lessThan,
  };
}
