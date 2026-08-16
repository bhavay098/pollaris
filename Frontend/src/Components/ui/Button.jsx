import React from 'react';

const Button = React.forwardRef(({ 
  children, 
  variant = 'primary', 
  className = '', 
  isLoading = false, 
  loadingText,
  disabled, 
  type = 'button',
  ...props 
}, ref) => {
  const variantClass = variant === 'primary' ? 'btn-primary' :
                       variant === 'secondary' ? 'btn-secondary' :
                       variant === 'danger' ? 'btn-danger' :
                       variant === 'quiet' ? 'btn-quiet' : '';
                       
  return (
    <button
      ref={ref}
      type={type}
      className={`btn ${variantClass} ${className}`.trim()}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (loadingText || "Loading…") : children}
    </button>
  );
});

Button.displayName = 'Button';
export default Button;
