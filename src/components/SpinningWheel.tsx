import React from 'react';
import clsx from 'clsx';

interface SpinningWheelProps {
  names: string[];
  isSpinning: boolean;
  timeRemaining: number;
  spinDuration: number;
}

export const SpinningWheel: React.FC<SpinningWheelProps> = ({
  names,
  isSpinning,
  timeRemaining,
  spinDuration,
}) => {
  if (!isSpinning) return null;

  const wheelSize = 300;
  const centerX = wheelSize / 2;
  const centerY = wheelSize / 2;
  const radius = 120;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="relative">
        {/* Countdown Timer */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="text-6xl font-bold text-white drop-shadow-lg">
            {timeRemaining}
          </div>
          <div className="text-center text-white text-lg font-semibold">
            seconds
          </div>
        </div>

        {/* Spinning Wheel */}
        <svg
          width={wheelSize}
          height={wheelSize}
          className={clsx(
            'transition-all duration-1000',
            isSpinning && 'animate-spin'
          )}
          style={{
            animationDuration: `${spinDuration}s`,
            animationTimingFunction: 'ease-out',
          }}
        >
          <circle
            cx={centerX}
            cy={centerY}
            r={radius}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="3"
            className="opacity-50"
          />
          
          {names.map((name, index) => {
            const angle = (index / names.length) * 2 * Math.PI - Math.PI / 2;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            const textAngle = angle + Math.PI / 2;
            
            return (
              <g key={index}>
                <line
                  x1={centerX}
                  y1={centerY}
                  x2={x}
                  y2={y}
                  stroke="#3b82f6"
                  strokeWidth="1"
                  className="opacity-30"
                />
                <text
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-xs font-medium fill-blue-700"
                  transform={`rotate(${(textAngle * 180) / Math.PI} ${x} ${y})`}
                >
                  {name.length > 8 ? name.substring(0, 8) + '...' : name}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Center Circle */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-blue-600 rounded-full border-4 border-white shadow-lg" />
      </div>
    </div>
  );
}; 