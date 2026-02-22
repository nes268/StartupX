import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  hover = false 
}) => {
  return (
    <div className={`bg-[var(--bg-card)] rounded-[18px] border border-[var(--accent-muted-border)]/30 shadow-[var(--shadow-card)] ${hover ? 'hover:shadow-[var(--shadow-lg)] hover:-translate-y-0.5 transition-all duration-200' : ''} ${className}`}>
      {children}
    </div>
  );
};

export default Card;
