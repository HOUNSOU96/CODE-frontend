// CountdownCircle.tsx
import React, { useEffect, useRef, useState } from "react";

type CountdownCircleProps = {
  duration: number;
  size?: number;
  strokeWidth?: number;
  playEndSound?: boolean;
  onComplete?: () => void;
};

const CountdownCircle: React.FC<CountdownCircleProps> = ({
  duration,
  size = 80,
  playEndSound = true,
  onComplete,
}) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const radius = size / 2 - 5;
  const circumference = 2 * Math.PI * radius;
  const progress = (timeLeft / duration) * circumference;

  const soundRef = useRef<HTMLAudioElement | null>(null);
  const hasTriggeredRef = useRef(false);
  const warningThreshold = Math.floor(duration / 4);

  useEffect(() => {
    if (playEndSound) {
      soundRef.current = new Audio("/sounds/click.mp3");
    }
  }, [playEndSound]);

  useEffect(() => {
    setTimeLeft(duration);
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [duration]);

  useEffect(() => {
    if (timeLeft === 0 && !hasTriggeredRef.current) {
      hasTriggeredRef.current = true;
      if (playEndSound && soundRef.current) {
        soundRef.current.play().catch((e) =>
          console.warn("Erreur de lecture du son : ", e)
        );
      }
      onComplete?.();
    }

    if (timeLeft > 0) {
      hasTriggeredRef.current = false;
    }
  }, [timeLeft, playEndSound, onComplete]);

  const getColor = () => {
    if (timeLeft > warningThreshold) return "#00FF00";
    if (timeLeft > 10) return "#FFFF00";
    return "#FF0000";
  };

  const formatTime = (t: number) => {
    const min = Math.floor(t / 60);
    const sec = t % 60;
    return min > 0 ? `${min}m ${sec}s` : `${sec}s`;
  };

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size}>
        <circle
          r={radius}
          cx={size / 2}
          cy={size / 2}
          stroke="#e5e7eb"
          strokeWidth="6"
          fill="none"
        />
        <circle
          r={radius}
          cx={size / 2}
          cy={size / 2}
          stroke={getColor()}
          strokeWidth="6"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{
            transition: "stroke-dashoffset 1s linear, stroke 0.3s ease",
          }}
        />
        <text
          x="50%"
          y="50%"
          dominantBaseline="middle"
          textAnchor="middle"
          fontSize="16"
          fontWeight="bold"
          fill={getColor()}
        >
          {formatTime(timeLeft)}
        </text>
      </svg>
    </div>
  );
};

export default CountdownCircle;
