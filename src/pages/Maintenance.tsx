import React from 'react';
import { AlertTriangle, Clock, ServerCrash } from 'lucide-react';
import { Link } from 'react-router-dom';

const Maintenance = () => {
  return (
    <div className="min-h-screen bg-[#030303] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-xl w-full bg-[#0a0a0f]/80 backdrop-blur-xl rounded-3xl border border-white/10 p-8 sm:p-12 text-center relative z-10 shadow-2xl">
        <div className="flex justify-center mb-6 relative">
          <div className="absolute inset-0 bg-yellow-500/20 blur-xl rounded-full"></div>
          <div className="w-24 h-24 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl flex items-center justify-center rotate-12 relative z-10">
            <AlertTriangle className="w-12 h-12 text-yellow-500 -rotate-12" />
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">
          Hệ thống đang bảo trì
        </h1>
        
        <p className="text-slate-400 text-lg mb-8 leading-relaxed">
          LearnHub hiện đang trong quá trình nâng cấp hệ thống để mang đến trải nghiệm học tập tốt hơn. 
          Vui lòng quay lại sau ít phút. Xin lỗi vì sự bất tiện này!
        </p>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-black/30 border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
            <ServerCrash className="w-6 h-6 text-blue-400 mb-2" />
            <span className="text-sm font-medium text-slate-300">Nâng cấp Server</span>
          </div>
          <div className="bg-black/30 border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
            <Clock className="w-6 h-6 text-purple-400 mb-2" />
            <span className="text-sm font-medium text-slate-300">Sẽ sớm trở lại</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Maintenance;
