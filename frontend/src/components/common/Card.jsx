import React from 'react';

export const Card = ({ children, className = '', title, subtitle, action, variant = 'white' }) => {
  const variantStyles = {
    white: 'bg-white border-[#D6CEC1]',
    mint: 'bg-[#E5DED2] border-[#D6CEC1]',
    cream: 'bg-[#F5F0E8] border-[#D6CEC1]',
  };

  const selectedVariant = variantStyles[variant] || variantStyles.white;

  return (
    <div
      className={`border rounded-2xl p-5 sm:p-6 transition-all duration-200 ${selectedVariant} ${className}`}
    >
      {(title || action) && (
        <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-[#D6CEC1]/70">
          <div>
            {title && (
              <h3 className="text-base sm:text-lg font-bold text-[#233DFF] tracking-tight">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs sm:text-sm text-[#77766F] mt-0.5">{subtitle}</p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

