
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string; // Tailwind text color class e.g. text-blue-500
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', color = 'text-blue-600' }) => {
  let dimension = 'w-8 h-8';
  if (size === 'sm') dimension = 'w-5 h-5';
  if (size === 'lg') dimension = 'w-12 h-12';

  return (
    <div className={`animate-spin rounded-full border-t-2 border-b-2 border-transparent ${dimension} ${color}`} style={{borderTopColor: 'currentColor', borderBottomColor: 'currentColor', borderLeftColor: 'transparent', borderRightColor: 'transparent'}}></div>
  );
};

export default LoadingSpinner;
