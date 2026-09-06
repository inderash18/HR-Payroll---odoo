import React from 'react';

export function OdooLogo({ size = 24, color = '#FFFFFF', className = '', style = {} }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: 'block', flexShrink: 0, ...style }}
    >
      <circle
        cx="50"
        cy="50"
        r="35"
        stroke={color}
        strokeWidth="22"
      />
    </svg>
  );
}

export default OdooLogo;
