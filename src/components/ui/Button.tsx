'use client';

import { forwardRef, ButtonHTMLAttributes } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'xl' | 'icon';
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'default', size = 'default', loading, children, disabled, ...props }, ref) => {
    
    const baseClasses = `
      inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium 
      transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary
      focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 
      active:scale-95 touch-target
    `;

    const variants = {
      default: `bg-primary text-primary-foreground shadow hover:bg-primary/90
                border border-primary/20 hover:border-primary/30`,
      destructive: `bg-destructive/10 text-destructive border border-destructive/30 
                    hover:bg-destructive/20 hover:border-destructive/50`,
      outline: `border border-border bg-background/10 backdrop-blur-sm hover:bg-accent 
                hover:text-accent-foreground hover:border-border/60`,
      secondary: `bg-secondary/80 text-secondary-foreground hover:bg-secondary/90 
                  border border-secondary/30 hover:border-secondary/50`,
      ghost: `hover:bg-accent hover:text-accent-foreground`,
      link: `text-primary underline-offset-4 hover:underline`,
    };

    const sizes = {
      default: 'h-9 px-4 py-2',
      sm: 'h-8 rounded-md px-3 text-xs',
      lg: 'h-10 rounded-md px-8',
      xl: 'h-12 rounded-lg px-10 text-base',
      icon: 'h-9 w-9',
    };

    const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`.trim();

    return (
      <button
        className={classes}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="mr-2 h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };