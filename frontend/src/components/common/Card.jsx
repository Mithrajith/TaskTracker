import React from 'react';

export const Card = ({ children, className = '', title, subtitle, action, variant = 'white' }) => {
  const variantStyles = {
    white: 'bg-white border-[#DDE8DF]',
    mint: 'bg-[#EAF7EF] border-[#DDE8DF]',
    cream: 'bg-[#FAF8F0] border-[#DDE8DF]',
    peach: 'bg-[#FFF5EE] border-[#FFA77E]/40',
  };

  const selectedVariant = variantStyles[variant] || variantStyles.white;

  return (
    <div
      className={`border rounded-2xl p-5 sm:p-6 transition-all duration-200 shadow-sm ${selectedVariant} ${className}`}
    >
      {(title || action) && (
        <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-[#DDE8DF]">
          <div>
            {title && (
              <h3 className="text-base sm:text-lg font-bold text-[#064E45] tracking-tight">
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

