import React from 'react';

const LoadingSpinner = ({ message = 'Loading...' }) => {
  return (
    <div className="flex justify-center items-center p-4">
      <div className="flex flex-col items-center gap-2">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
        {message && (
          <div className="text-sm text-gray-600">
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner;
