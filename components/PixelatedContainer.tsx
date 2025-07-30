import React from 'react';

interface PixelatedContainerProps {
  children: React.ReactNode;
  className?: string;
}

const PixelatedContainer: React.FC<PixelatedContainerProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-white text-slate-700 rounded-2xl p-6 md:p-8 shadow-lg border border-gray-100 ${className}`}>
      {children}
    </div>
  );
};

export default PixelatedContainer;