import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = 'Đang tải dữ liệu...' }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] w-full text-blue-400">
      <Loader2 className="w-12 h-12 animate-spin mb-4" />
      <p className="text-lg font-medium animate-pulse">{message}</p>
    </div>
  );
};

export const FullScreenLoader: React.FC<LoadingSpinnerProps> = ({ message = 'Đang tải...' }) => {
  return (
    <div className="flex flex-col h-screen w-full items-center justify-center bg-[#0a0a0a] text-white">
      {/* Nền đồng bộ */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-[#0a0a0a] to-[#0a0a0a] pointer-events-none"></div>
      
      <div className="relative z-10 flex flex-col items-center">
        <Loader2 className="w-16 h-16 text-blue-500 animate-spin mb-6 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
        <p className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 animate-pulse">
          {message}
        </p>
      </div>
    </div>
  );
};
