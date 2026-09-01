"use client";

import { useRef } from "react";

export function useDragScroll({ snap = false }: { snap?: boolean } = {}) {
  const state = useRef({ down: false, moved: false, startX: 0, startLeft: 0 });

  const onPointerDown = (e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType !== "mouse") return;
    state.current = {
      down: true,
      moved: false,
      startX: e.clientX,
      startLeft: e.currentTarget.scrollLeft,
    };
    if (snap) e.currentTarget.style.scrollSnapType = "none";
  };

  const onPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (!state.current.down) return;
    const dx = e.clientX - state.current.startX;
    if (Math.abs(dx) > 5) state.current.moved = true;
    e.currentTarget.scrollLeft = state.current.startLeft - dx;
  };

  const settle = (e: React.PointerEvent<HTMLElement>) => {
    if (!state.current.down) return;
    state.current.down = false;
    if (!snap) return;
    const el = e.currentTarget;
    const startIndex = Math.round(state.current.startLeft / el.clientWidth);
    const delta = el.scrollLeft - state.current.startLeft;
    const last = Math.round(el.scrollWidth / el.clientWidth) - 1;
    const target = Math.min(
      last,
      Math.max(
        0,
        Math.abs(delta) > 40 ? startIndex + Math.sign(delta) : startIndex,
      ),
    );
    el.style.scrollSnapType = "";
    el.scrollTo({ left: target * el.clientWidth, behavior: "smooth" });
  };

  const onClickCapture = (e: React.MouseEvent<HTMLElement>) => {
    if (!state.current.moved) return;
    e.preventDefault();
    e.stopPropagation();
  };

  const dragged = () => state.current.moved;

  return {
    dragged,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: settle,
      onPointerLeave: settle,
      onPointerCancel: settle,
      onClickCapture,
      onDragStart: (e: React.DragEvent<HTMLElement>) => e.preventDefault(),
    },
  };
}
