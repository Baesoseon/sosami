import React from 'react';

interface RetroButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

const RetroButton: React.FC<RetroButtonProps> = ({ onClick, children, className = '', disabled = false }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        bg-[#ff8fab] text-white px-6 py-3 rounded-lg font-bold text-lg shadow-md 
        hover:bg-[#fb6f92] 
        focus:outline-none focus:ring-2 focus:ring-[#ffc2d1] focus:ring-opacity-75 
        transition-all duration-200 ease-in-out transform hover:-translate-y-1 
        active:scale-95
        disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none disabled:text-gray-500 disabled:transform-none
        ${className}
      `}
    >
      {children}
    </button>
  );
};

export default RetroButton;