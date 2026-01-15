import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'icon' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  children, 
  ...props 
}) => {
  const base = "inline-flex items-center justify-center rounded transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-primary text-primary-foreground hover:bg-primary-hover font-medium shadow-sm",
    ghost: "bg-transparent hover:bg-surface text-text-primary",
    icon: "bg-transparent hover:bg-surface text-text-primary p-1",
    danger: "bg-danger text-white hover:bg-danger/90"
  };

  const sizes = {
    sm: "h-7 px-2 text-xs",
    md: "h-9 px-4 text-sm",
    lg: "h-11 px-8 text-base"
  };

  // Icon variant overrides size to be square
  const sizeClass = variant === 'icon' ? (
    size === 'sm' ? 'h-7 w-7' : size === 'lg' ? 'h-11 w-11' : 'h-9 w-9'
  ) : sizes[size];

  return (
    <button 
      className={`${base} ${variants[variant]} ${sizeClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
