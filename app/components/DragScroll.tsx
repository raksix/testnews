"use client";
import { useEffect, useRef, type ReactNode } from "react";

// Horizontal scroll row that works with mouse drag + wheel on desktop,
// while keeping native touch scroll on mobile.
export default function DragScroll({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef({ down: false, startX: 0, startScroll: 0, moved: false });

  // Wheel → horizontal scroll (non-passive so preventDefault works)
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onWheel = (e: globalThis.WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        el.scrollLeft += e.deltaY;
        e.preventDefault();
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  return (
    <div
      ref={ref}
      onMouseDown={(e) => {
        const el = ref.current;
        if (!el) return;
        drag.current = { down: true, startX: e.pageX, startScroll: el.scrollLeft, moved: false };
      }}
      onMouseMove={(e) => {
        const el = ref.current;
        if (!el || !drag.current.down) return;
        const dx = e.pageX - drag.current.startX;
        if (Math.abs(dx) > 4) drag.current.moved = true;
        el.scrollLeft = drag.current.startScroll - dx;
      }}
      onMouseUp={() => (drag.current.down = false)}
      onMouseLeave={() => (drag.current.down = false)}
      onClick={(e) => {
        // Suppress click on links when the user dragged instead of clicked
        if (drag.current.moved) {
          e.preventDefault();
          e.stopPropagation();
          drag.current.moved = false;
        }
      }}
      className={`${className} cursor-grab active:cursor-grabbing`}
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      {children}
    </div>
  );
}
