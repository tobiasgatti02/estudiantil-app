import React from 'react';

type InputProps = {
  className?: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export const Input = React.forwardRef(({ className, placeholder, type, value, onChange, ...props }: InputProps, ref: React.Ref<HTMLInputElement>) => {
  return (
    <input
      type={type}
      className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      ref={ref}
      {...props}
    />
  );
});

Input.displayName = 'Input';

type ButtonProps = {
  className?: string;
  variant?: string;
  size?: string;
  children: React.ReactNode;
  onClick?: () => Promise<void>; // Add onClick prop here
};

export const Button = React.forwardRef(
  ({ className, variant = 'default', size = 'default', children, onClick, ...props }: ButtonProps, ref: React.Ref<HTMLButtonElement>) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';
    
    const variants: { [key: string]: string } = {
      default: 'bg-primary text-primary-foreground hover:bg-primary/90',
      outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
    };

    const sizes: { [key: string]: string } = {
      default: 'h-10 px-4 py-2',
      sm: 'h-9 rounded-md px-3',
      lg: 'h-11 rounded-md px-8',
    };

    const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

    return (
      <button
        className={classes}
        onClick={onClick}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';