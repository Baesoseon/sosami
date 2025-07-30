import React from 'react';

interface LoadingIndicatorProps {
  message: string;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center text-white p-8">
      <div className="text-2xl md:text-3xl text-[#fb6f92]">
        {message}
      </div>
      <div className="w-16 h-16 mt-8">
         <div className="w-full h-full border-4 border-dashed rounded-full animate-spin border-[#fb6f92]"></div>
      </div>
    </div>
  );
};

export default LoadingIndicator;