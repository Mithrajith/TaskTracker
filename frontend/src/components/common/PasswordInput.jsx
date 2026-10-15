import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export const PasswordInput = ({
  value,
  onChange,
  leftIcon: LeftIcon,
  iconClassName = 'w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71817B]',
  className = '',
  placeholder,
  required = false,
  minLength,
  disabled = false,
  autoComplete,
  name,
  id,
  autoFocus = false,
}) => {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      {LeftIcon && <LeftIcon className={iconClassName} />}
      <input
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
        disabled={disabled}
        autoComplete={autoComplete}
        name={name}
        id={id}
        autoFocus={autoFocus}
        className={className}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        disabled={disabled}
        tabIndex={-1}
        title={visible ? 'Hide password' : 'Show password'}
        aria-label={visible ? 'Hide password' : 'Show password'}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71817B] hover:text-[#064E45] transition-colors disabled:opacity-50"
      >
        {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
};
