import React from 'react';

interface WaveTransitionProps {
  className?: string;
  variant?: 'default' | 'reverse';
}

export const WaveTransition: React.FC<WaveTransitionProps> = ({ 
  className = '', 
  variant = 'default' 
}) => {
  return (
    <div className={`relative w-full overflow-hidden bg-gradient-to-b from-background to-rose-light/20 ${className}`}>
      <svg
        className="w-full h-8 md:h-10"
        viewBox="0 0 1200 80"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Onda única e sutil */}
        <path
          d={variant === 'reverse' 
            ? "M0,40 C300,60 600,20 900,40 C1050,50 1150,30 1200,40 L1200,0 L0,0 Z"
            : "M0,40 C300,20 600,60 900,40 C1050,30 1150,50 1200,40 L1200,80 L0,80 Z"
          }
          fill="rgb(251 113 133)"
          fillOpacity="0.03"
        >
          <animate
            attributeName="d"
            values={variant === 'reverse'
              ? "M0,40 C300,60 600,20 900,40 C1050,50 1150,30 1200,40 L1200,0 L0,0 Z;M0,35 C300,55 600,25 900,35 C1050,45 1150,35 1200,35 L1200,0 L0,0 Z;M0,40 C300,60 600,20 900,40 C1050,50 1150,30 1200,40 L1200,0 L0,0 Z"
              : "M0,40 C300,20 600,60 900,40 C1050,30 1150,50 1200,40 L1200,80 L0,80 Z;M0,45 C300,25 600,55 900,45 C1050,35 1150,45 1200,45 L1200,80 L0,80 Z;M0,40 C300,20 600,60 900,40 C1050,30 1150,50 1200,40 L1200,80 L0,80 Z"
            }
            dur="8s"
            repeatCount="indefinite"
          />
        </path>
      </svg>
    </div>
  );
};

export default WaveTransition;