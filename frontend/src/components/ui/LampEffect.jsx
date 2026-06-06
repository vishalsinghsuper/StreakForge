import React from "react";

/**
 * LampEffect — Ambient background lighting overlay.
 * Renders animated gradient orbs that create the signature
 * "lamp" atmospheric lighting effect.
 */
export default function LampEffect() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      {/* Primary purple lamp beam — top left */}
      <div
        style={{
          position: "absolute",
          top: "-20%",
          left: "10%",
          width: "50vw",
          height: "50vh",
          background:
            "radial-gradient(ellipse, rgba(139, 92, 246, 0.12) 0%, transparent 70%)",
          filter: "blur(40px)",
          animation: "float 15s ease-in-out infinite",
        }}
      />
      {/* Secondary orange glow — bottom right */}
      <div
        style={{
          position: "absolute",
          bottom: "-10%",
          right: "5%",
          width: "40vw",
          height: "40vh",
          background:
            "radial-gradient(ellipse, rgba(249, 115, 22, 0.08) 0%, transparent 70%)",
          filter: "blur(50px)",
          animation: "float 18s ease-in-out infinite reverse",
        }}
      />
      {/* Cyan accent — center */}
      <div
        style={{
          position: "absolute",
          top: "40%",
          left: "50%",
          width: "30vw",
          height: "30vh",
          transform: "translate(-50%, -50%)",
          background:
            "radial-gradient(ellipse, rgba(6, 182, 212, 0.05) 0%, transparent 70%)",
          filter: "blur(60px)",
          animation: "float 22s ease-in-out infinite",
          animationDelay: "-5s",
        }}
      />
    </div>
  );
}
