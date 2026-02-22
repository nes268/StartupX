import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ 
  current, 
  total, 
  className = '' 
}) => {
  const percentage = (current / total) * 100;

  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-[var(--text-muted)]">Progress</span>
        <span className="text-sm text-[var(--accent)] font-medium">{Math.round(percentage)}%</span>
      </div>
      <div className="w-full bg-[var(--bg-muted)] rounded-full h-2.5">
        <div 
          className="bg-[var(--accent)] h-2.5 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex justify-between mt-2">
        <span className="text-xs text-[var(--text-subtle)]">Step {current} of {total}</span>
      </div>
    </div>
  );
};

export default ProgressBar;
