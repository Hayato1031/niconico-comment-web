"use client";

import { useEffect, useRef } from "react";
import { getConsumer } from "@/lib/cable";

interface Comment {
  text: string;
  color: string;
}

const TRACK_COUNT = 12;
const SPEED = 300; // px/s

export default function DisplayPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackFreeAt = useRef<number[]>(new Array(TRACK_COUNT).fill(0));

  function getTrack(): number {
    let best = 0;
    for (let i = 1; i < TRACK_COUNT; i++) {
      if (trackFreeAt.current[i] < trackFreeAt.current[best]) best = i;
    }
    return best;
  }

  function spawnComment({ text, color }: Comment) {
    const container = containerRef.current;
    if (!container) return;

    const el = document.createElement("div");
    el.textContent = text;
    el.style.cssText = `
      position: absolute;
      white-space: nowrap;
      font-size: 32px;
      font-weight: bold;
      color: ${color};
      text-shadow: 1px 1px 0 #000, -1px 1px 0 #000, 1px -1px 0 #000, -1px -1px 0 #000;
      pointer-events: none;
      will-change: transform;
      visibility: hidden;
      left: 100vw;
    `;
    container.appendChild(el);

    requestAnimationFrame(() => {
      const W = window.innerWidth;
      const H = window.innerHeight;
      const commentW = el.offsetWidth;
      const distance = W + commentW;
      const duration = distance / SPEED;

      const trackIndex = getTrack();
      const trackH = Math.floor(H / TRACK_COUNT);
      const topPx = trackIndex * trackH + (trackH - el.offsetHeight) / 2;

      trackFreeAt.current[trackIndex] = Date.now() + (commentW / SPEED) * 1000 + 100;

      el.style.top = `${topPx}px`;
      el.style.left = `${W}px`;
      el.style.visibility = "visible";
      el.style.transition = `transform ${duration.toFixed(2)}s linear`;
      el.style.transform = `translateX(-${distance}px)`;

      el.addEventListener("transitionend", () => el.remove());
    });
  }

  useEffect(() => {
    const subscription = getConsumer().subscriptions.create("CommentChannel", {
      received(data: Comment) {
        spawnComment(data);
      },
    });

    return () => { subscription.unsubscribe(); };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        inset: 0,
        background: "#000",
        overflow: "hidden",
      }}
    />
  );
}
