'use client';

import { useEffect, useRef } from 'react';
import styles from './ScoreRing.module.css';

export default function ScoreRing({ score = 0, size = 160 }) {
  const circleRef = useRef(null);
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.min(100, Math.max(0, score));

  const scoreColor =
    clampedScore >= 75 ? 'var(--success)' :
    clampedScore >= 50 ? 'var(--warning)' :
    'var(--danger)';

  useEffect(() => {
    if (!circleRef.current) return;
    const offset = circumference - (clampedScore / 100) * circumference;
    // Animate from full offset (empty) to target offset
    circleRef.current.style.strokeDashoffset = circumference;
    circleRef.current.style.transition = 'none';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        circleRef.current.style.transition = 'stroke-dashoffset 1.4s cubic-bezier(0.4, 0, 0.2, 1)';
        circleRef.current.style.strokeDashoffset = offset;
      });
    });
  }, [score, circumference]);

  return (
    <div className={styles.wrapper} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={styles.svg}>
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="10"
        />
        {/* Animated score arc */}
        <circle
          ref={circleRef}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={scoreColor}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ filter: `drop-shadow(0 0 8px ${scoreColor})` }}
        />
      </svg>
      <div className={styles.center}>
        <span className={styles.score} style={{ color: scoreColor }}>{Math.round(clampedScore)}%</span>
        <span className={styles.label}>Match</span>
      </div>
    </div>
  );
}
