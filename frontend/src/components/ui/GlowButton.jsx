import React from "react";

/**
 * GlowButton — Animated button with glow shadow.
 * Variants: "primary" | "glass" | "danger" | "ghost"
 */
export default function GlowButton({
  children,
  variant = "primary",
  loading = false,
  disabled = false,
  className = "",
  ...props
}) {
  const classes = {
    primary: "btn-glow",
    glass: "btn-glass",
    danger: "btn-danger",
    ghost: "btn-ghost",
  };
  return (
    <button
      className={`${classes[variant] || classes.primary} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <span
            style={{
              width: "1rem",
              height: "1rem",
              border: "2px solid rgba(255,255,255,0.3)",
              borderTopColor: "#fff",
              borderRadius: "50%",
              animation: "spin 0.6s linear infinite",
            }}
          />
          Working...
        </>
      ) : (
        children
      )}
    </button>
  );
}
