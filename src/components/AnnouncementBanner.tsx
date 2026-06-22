import React, { useState, useEffect } from 'react';
import { Megaphone, X, Info, AlertTriangle, AlertOctagon, CheckCircle2 } from 'lucide-react';
import { getGlobalAnnouncement } from '../lib/supabaseService';

export default function AnnouncementBanner() {
  const [announcement, setAnnouncement] = useState<{ content: string; isActive: boolean; level: string } | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        const data = await getGlobalAnnouncement();
        setAnnouncement(data as any);
      } catch (error) {
        console.error("Lỗi lấy thông báo hệ thống:", error);
      }
    };
    fetchAnnouncement();
  }, []);

  if (!announcement || !announcement.isActive || !isVisible) {
    return null;
  }

  const levelStyles: Record<string, { bg: string, border: string, text: string, iconColor: string, Icon: any, gradient: string }> = {
    info: {
      bg: 'from-blue-500/10 via-indigo-500/10 to-blue-500/10',
      border: 'border-blue-500/20',
      text: 'text-blue-100/90',
      iconColor: 'bg-blue-500/20 text-blue-400',
      Icon: Info,
      gradient: 'from-blue-400 to-indigo-500'
    },
    warning: {
      bg: 'from-amber-500/10 via-orange-500/10 to-amber-500/10',
      border: 'border-amber-500/20',
      text: 'text-amber-100/90',
      iconColor: 'bg-amber-500/20 text-amber-400',
      Icon: AlertTriangle,
      gradient: 'from-amber-400 to-orange-500'
    },
    error: {
      bg: 'from-red-500/10 via-rose-500/10 to-red-500/10',
      border: 'border-red-500/20',
      text: 'text-red-100/90',
      iconColor: 'bg-red-500/20 text-red-400',
      Icon: AlertOctagon,
      gradient: 'from-red-400 to-rose-500'
    },
    success: {
      bg: 'from-emerald-500/10 via-teal-500/10 to-emerald-500/10',
      border: 'border-emerald-500/20',
      text: 'text-emerald-100/90',
      iconColor: 'bg-emerald-500/20 text-emerald-400',
      Icon: CheckCircle2,
      gradient: 'from-emerald-400 to-teal-500'
    }
  };

  const style = levelStyles[announcement.level] || levelStyles['info'];
  const IconComponent = style.Icon;

  return (
    <div className="relative z-50 animate-fade-in-down w-full px-4 pt-4 pb-0 max-w-7xl mx-auto">
      <div className={`bg-gradient-to-r ${style.bg} backdrop-blur-xl border ${style.border} rounded-2xl overflow-hidden relative group`}>
        <div className={`absolute top-0 left-0 w-1 bg-gradient-to-b ${style.gradient} h-full`}></div>
        <div className="flex items-start sm:items-center p-4 pr-12 relative">
          <div className={`p-2 rounded-lg shrink-0 mr-4 group-hover:scale-110 transition-transform ${style.iconColor}`}>
            <IconComponent className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <p className={`${style.text} text-sm sm:text-base font-medium leading-relaxed`}>
              {announcement.content}
            </p>
          </div>
          <button 
            onClick={() => setIsVisible(false)}
            className={`absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-white/10 rounded-lg transition-all opacity-50 hover:opacity-100`}
            aria-label="Đóng thông báo"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
