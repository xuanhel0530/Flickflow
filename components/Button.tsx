import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'icon';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  isLoading,
  disabled,
  ...props 
}) => {
  const baseStyles = "transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed font-semibold outline-none focus:ring-4 focus:ring-indigo-500/20";
  
  const variants = {
    primary: "bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-full px-8 py-3 hover:shadow-lg hover:shadow-indigo-500/30 border border-transparent hover:-translate-y-0.5",
    secondary: "bg-white text-gray-900 border border-gray-200 rounded-full px-6 py-3 hover:bg-gray-50 shadow-sm hover:border-gray-300",
    ghost: "bg-transparent text-gray-600 hover:bg-gray-100 rounded-lg px-4 py-2",
    icon: "p-3 rounded-full hover:bg-gray-100 text-gray-700 flex items-center justify-center aspect-square"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className} ${isLoading ? 'cursor-wait' : ''}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Translating...
        </span>
      ) : children}
    </button>
  );
};