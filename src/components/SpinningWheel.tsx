import React from 'react';
import clsx from 'clsx';

interface SpinningWheelProps {
  isSpinning: boolean;
  timeRemaining: number;
  spinDuration: number;
}

export const SpinningWheel: React.FC<SpinningWheelProps> = ({
  isSpinning,
  timeRemaining,
  spinDuration,
}) => {
  if (!isSpinning) return null;

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

        {/* Simple Spinning Circle */}
        <div
          className={clsx(
            'w-64 h-64 border-8 border-blue-600 border-t-transparent rounded-full',
            isSpinning && 'animate-spin'
          )}
          style={{
            animationDuration: `${spinDuration}s`,
            animationTimingFunction: 'ease-out',
          }}
        />

        {/* Center Circle */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-blue-600 rounded-full border-4 border-white shadow-lg" />
      </div>
    </div>
  );
}; 