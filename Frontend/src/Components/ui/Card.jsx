import React from 'react';

export function Card({ className = '', children, ...props }) {
  return (
    <section className={`panel ${className}`.trim()} {...props}>
      {children}
    </section>
  );
}

export function CardHeader({ className = '', children, rightContent, ...props }) {
  return (
    <div className={`panel-heading ${className}`.trim()} {...props}>
      <div>{children}</div>
      {rightContent && <div>{rightContent}</div>}
    </div>
  );
}

export function CardTitle({ className = '', children, as: Component = 'h2', ...props }) {
  return (
    <Component className={`panel-title ${className}`.trim()} {...props}>
      {children}
    </Component>
  );
}

export function CardEyebrow({ className = '', children, ...props }) {
  return (
    <span className={`eyebrow ${className}`.trim()} {...props}>
      {children}
    </span>
  );
}

export function CardContent({ className = '', children, ...props }) {
  // We use a simple div wrapper. The margin-top separates content from header if both exist.
  return (
    <div className={`mt-5 ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}
