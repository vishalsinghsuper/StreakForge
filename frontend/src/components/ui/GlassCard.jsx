import React from "react";

/**
 * GlassCard — Reusable glassmorphism card component.
 * Variants: "default" | "elevated" | "glow"
 */
export default function GlassCard({
  children,
  variant = "default",
  className = "",
  style = {},
  ...props
}) {
  const classes = {
    default: "glass",
    elevated: "glass-elevated",
    glow: "glass-glow",
  };
  return (
    <div
      className={`${classes[variant] || classes.default} ${className}`}
      style={style}
      {...props}
    >
      {children}
    </div>
  );
}
