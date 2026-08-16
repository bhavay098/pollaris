import React, { useId } from 'react';

const Input = React.forwardRef(({ 
  label, 
  id,
  type = 'text', 
  className = '', 
  helpText,
  ...props 
}, ref) => {
  const generatedId = useId();
  const inputId = id || generatedId;

  return (
    <div className="field">
      {label && <label htmlFor={inputId}>{label}</label>}
      <input
        ref={ref}
        id={inputId}
        type={type}
        className={className}
        {...props}
      />
      {helpText && <span className="muted" style={{ fontSize: '11px', marginTop: '-4px' }}>{helpText}</span>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
