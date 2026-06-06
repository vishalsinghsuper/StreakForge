import React from "react";

/**
 * ProgressBar — Animated gradient progress bar with glow and shimmer.
 */
export default function ProgressBar({ completed, total }) {
  const percent = total ? Math.round((completed / total) * 100) : 0;
  return (
    <div className="progress-bar">
      <div className="progress-bar__fill" style={{ width: `${percent}%` }} />
      <span className="progress-bar__label">
        {completed}/{total} Completed
      </span>
    </div>
  );
}
