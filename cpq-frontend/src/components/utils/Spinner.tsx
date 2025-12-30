import React from 'react';

type SpinnerProps = {
  size?: 'small' | 'medium' | 'large';
  color?: string;
};

const Spinner: React.FC<SpinnerProps> = ({ 
  size = 'medium', 
  color = 'blue-500' 
}) => {
  const sizeClasses = {
    small: 'h-8 w-8',
    medium: 'h-16 w-16',
    large: 'h-24 w-24'
  };

  return (
    <div className="flex justify-center items-center h-64">
      <div 
        className={`animate-spin rounded-full border-t-2 border-b-2 border-${color} ${sizeClasses[size]}`}
        role="status"
        aria-label="Loading"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
};

export default Spinner;