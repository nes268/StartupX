import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--bg-surface)]';
  
  const variants = {
    primary: 'bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white focus:ring-[var(--accent)] hover:shadow-lg hover:shadow-[var(--accent)]/20',
    secondary: 'bg-[var(--text-muted)] hover:bg-[var(--text)] text-white focus:ring-[var(--text-muted)]',
    outline: 'border border-[var(--border)] hover:bg-[var(--bg-muted)] text-[var(--text)] focus:ring-[var(--border)]',
    ghost: 'hover:bg-[var(--bg-muted)] text-[var(--text)] focus:ring-[var(--border)]',
    danger: 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-500',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;

  return (
    <button
      className={classes}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </button>
  );
};

export default Button;
