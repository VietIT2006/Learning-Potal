import React, { useState, useEffect } from 'react';
import { Moon, Sun, Bell, User, Save, Megaphone, Mail, Search, CheckSquare, Square, X, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { getGlobalAnnouncement, saveGlobalAnnouncement, getUsers } from '../../lib/supabaseService';
import type { User as UserType } from '../../lib/supabaseService';

export default function SettingsPage() {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
        (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const [notifications, setNotifications] = useState(true);

  // Email Notification state
  const [allStudents, setAllStudents] = useState<UserType[]>([]);
  const [searchEmailQuery, setSearchEmailQuery] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [emailLevel, setEmailLevel] = useState('info');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailContent, setEmailContent] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const data = await getUsers({ role: 'user' });
        setAllStudents(data);
      } catch (error) {
        console.error("Lỗi lấy danh sách học viên:", error);
      }
    };
    fetchStudents();
  }, []);

  // Global Announcement state
  const [announcementContent, setAnnouncementContent] = useState('');
  const [announcementActive, setAnnouncementActive] = useState(false);
  const [announcementLevel, setAnnouncementLevel] = useState('info');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        const data = await getGlobalAnnouncement();
        if (data) {
          setAnnouncementContent(data.content);
          setAnnouncementActive(data.isActive);
          setAnnouncementLevel(data.level || 'info');
        }
      } catch (error) {
        console.error("Lỗi lấy thông báo hệ thống:", error);
      }
    };
    fetchAnnouncement();
  }, []);

  const handleSaveSettings = async () => {
    try {
      setIsSaving(true);
      await saveGlobalAnnouncement(announcementContent, announcementActive, announcementLevel);
      toast.success('Lưu cài đặt thành công!', { style: { background: '#333', color: '#fff' } });
    } catch (error) {
      console.error(error);
      toast.error('Có lỗi khi lưu cài đặt!', { style: { background: '#333', color: '#fff' } });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendEmail = async () => {
    if (selectedStudents.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 học viên!');
      return;
    }
    if (!emailSubject.trim() || !emailContent.trim()) {
      toast.error('Vui lòng nhập đầy đủ tiêu đề và nội dung!');
      return;
    }
    
    setIsSendingEmail(true);
    // Simulate sending email
    const promise = new Promise((resolve) => setTimeout(resolve, 2000));
    toast.promise(promise, {
      loading: `Đang gửi email cho ${selectedStudents.length} học viên...`,
      success: 'Gửi email thành công!',
      error: 'Lỗi khi gửi email.',
    }, { style: { background: '#333', color: '#fff' }});

    await promise;
    setIsSendingEmail(false);
    setSelectedStudents([]);
    setEmailSubject('');
    setEmailContent('');
    setSearchEmailQuery('');
  };

  const levelOptions = [
    { value: 'info', label: 'Thông tin', color: 'bg-blue-500' },
    { value: 'warning', label: 'Cảnh báo', color: 'bg-amber-500' },
    { value: 'error', label: 'Khẩn cấp', color: 'bg-red-500' },
    { value: 'success', label: 'Thành công', color: 'bg-emerald-500' },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in relative pb-10">
      <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-purple-600/10 blur-[100px] rounded-full pointer-events-none"></div>
      
      <h2 className="text-2xl font-bold text-white tracking-tight relative z-10">Cài đặt hệ thống</h2>
      
      {/* --- Section 1: Giao diện (Dark Mode) --- */}
      <div className="bg-[#0a0a0f]/60 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/5 p-8 transition-all duration-300 relative z-10 group hover:border-white/10">
        <div className="flex items-center gap-5 mb-8 border-b border-white/5 pb-6">
            <div className="p-3.5 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl text-purple-400 border border-purple-500/20 group-hover:scale-110 transition-transform">
                {darkMode ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
            </div>
            <div>
                <h3 className="text-lg font-semibold text-white tracking-tight">Giao diện</h3>
                <p className="text-sm text-slate-400 mt-1">Tùy chỉnh giao diện sáng/tối cho hệ thống.</p>
            </div>
        </div>

        <div className="flex items-center justify-between py-3 px-2">
            <span className="text-slate-300 font-medium">Chế độ tối (Dark Mode)</span>
            
            <button 
                onClick={() => setDarkMode(!darkMode)}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:ring-offset-2 focus:ring-offset-[#0a0a0f] ${darkMode ? 'bg-purple-600' : 'bg-white/20'}`}
            >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${darkMode ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
        </div>
      </div>

      {/* --- Section 2: Thông báo qua Email --- */}
      <div className="bg-[#0a0a0f]/60 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/5 p-8 transition-all duration-300 relative z-10 group hover:border-white/10">
        <div className="flex items-center gap-5 mb-8 border-b border-white/5 pb-6">
            <div className="p-3.5 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-xl text-blue-400 border border-blue-500/20 group-hover:scale-110 transition-transform">
                <Mail className="w-6 h-6" />
            </div>
            <div>
                <h3 className="text-lg font-semibold text-white tracking-tight">Gửi Email thông báo</h3>
                <p className="text-sm text-slate-400 mt-1">Chọn học viên và gửi thông báo trực tiếp qua Email.</p>
            </div>
        </div>

        <div className="space-y-6">
          {/* Select Students */}
          <div>
            <div className="flex items-center justify-between mb-2 px-2">
              <label className="block text-sm font-medium text-slate-300">Học viên nhận ({selectedStudents.length} đã chọn)</label>
              <button 
                onClick={() => setSelectedStudents(selectedStudents.length === allStudents.length ? [] : allStudents.map(s => s.id))}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                {selectedStudents.length === allStudents.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
              </button>
            </div>
            <div className="bg-black/20 border border-white/10 rounded-xl p-4">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="Tìm kiếm học viên..." 
                  value={searchEmailQuery}
                  onChange={e => setSearchEmailQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/5 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors"
                />
              </div>
              
              <div className="max-h-48 overflow-y-auto space-y-1 custom-scrollbar pr-2">
                {allStudents.filter(s => (s.fullname || '').toLowerCase().includes(searchEmailQuery.toLowerCase()) || (s.email || '').toLowerCase().includes(searchEmailQuery.toLowerCase())).map(student => {
                  const isSelected = selectedStudents.includes(student.id);
                  return (
                    <div 
                      key={student.id} 
                      onClick={() => {
                        if (isSelected) setSelectedStudents(prev => prev.filter(id => id !== student.id));
                        else setSelectedStudents(prev => [...prev, student.id]);
                      }}
                      className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg cursor-pointer transition-colors"
                    >
                      <div className="text-blue-400">
                        {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-slate-500" />}
                      </div>
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-xs font-bold shrink-0">
                        {(student.fullname || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-200 truncate">{student.fullname || 'Học viên'}</p>
                        <p className="text-xs text-slate-500 truncate">{student.email || 'No email'}</p>
                      </div>
                    </div>
                  );
                })}
                {allStudents.length > 0 && allStudents.filter(s => (s.fullname || '').toLowerCase().includes(searchEmailQuery.toLowerCase()) || (s.email || '').toLowerCase().includes(searchEmailQuery.toLowerCase())).length === 0 && (
                  <p className="text-center text-slate-500 text-sm py-4">Không tìm thấy học viên</p>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3 px-2">Cấp độ (Loại Email)</label>
            <div className="flex flex-wrap gap-3 px-2">
              {levelOptions.map((opt) => (
                <button
                  key={`email-${opt.value}`}
                  onClick={() => setEmailLevel(opt.value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
                    emailLevel === opt.value 
                      ? 'bg-white/10 border-white/20 text-white' 
                      : 'bg-black/20 border-transparent text-slate-400 hover:bg-white/5'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${opt.color}`}></span>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2 px-2">Tiêu đề Email</label>
            <input
              type="text"
              className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white placeholder-slate-600 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
              placeholder="Nhập tiêu đề..."
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2 px-2">Nội dung Email</label>
            <textarea
              className="w-full bg-black/30 border border-white/10 rounded-xl p-4 text-white placeholder-slate-600 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all resize-none h-32"
              placeholder="Nhập nội dung email..."
              value={emailContent}
              onChange={(e) => setEmailContent(e.target.value)}
            />
          </div>

          <div className="flex justify-end px-2 pt-2">
            <button 
              onClick={handleSendEmail}
              disabled={isSendingEmail}
              className={`flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2.5 rounded-xl hover:from-blue-500 hover:to-indigo-500 transition-all shadow-lg shadow-blue-500/25 font-medium border border-blue-400/20 ${isSendingEmail ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}`}
            >
                <Send className="w-4 h-4" /> 
                {isSendingEmail ? 'Đang gửi...' : 'Gửi Email'}
            </button>
          </div>
        </div>
      </div>

      {/* --- Section 3: Thông báo toàn hệ thống --- */}
      <div className="bg-[#0a0a0f]/60 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/5 p-8 transition-all duration-300 relative z-10 group hover:border-white/10">
        <div className="flex items-center gap-5 mb-8 border-b border-white/5 pb-6">
            <div className="p-3.5 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-xl text-amber-400 border border-amber-500/20 group-hover:scale-110 transition-transform">
                <Megaphone className="w-6 h-6" />
            </div>
            <div>
                <h3 className="text-lg font-semibold text-white tracking-tight">Thông báo toàn trang</h3>
                <p className="text-sm text-slate-400 mt-1">Thông báo này sẽ xuất hiện trên cùng của trang chủ cho tất cả học viên.</p>
            </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between py-3 px-2 bg-white/5 rounded-xl border border-white/5">
              <span className="text-slate-300 font-medium px-4">Kích hoạt thông báo</span>
              <button 
                  onClick={() => setAnnouncementActive(!announcementActive)}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:ring-offset-2 focus:ring-offset-[#0a0a0f] mr-4 ${announcementActive ? 'bg-amber-500' : 'bg-white/20'}`}
              >
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${announcementActive ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3 px-2">Cấp độ thông báo</label>
            <div className="flex flex-wrap gap-3 px-2">
              {levelOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setAnnouncementLevel(opt.value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
                    announcementLevel === opt.value 
                      ? 'bg-white/10 border-white/20 text-white' 
                      : 'bg-black/20 border-transparent text-slate-400 hover:bg-white/5'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${opt.color}`}></span>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2 px-2">Nội dung thông báo</label>
            <textarea
              className="w-full bg-black/30 border border-white/10 rounded-xl p-4 text-white placeholder-slate-600 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all resize-none h-32"
              placeholder="Nhập nội dung thông báo muốn hiển thị..."
              value={announcementContent}
              onChange={(e) => setAnnouncementContent(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4 relative z-10">
          <button 
            onClick={handleSaveSettings}
            disabled={isSaving}
            className={`flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-xl hover:from-purple-500 hover:to-pink-500 transition-all shadow-lg shadow-purple-500/25 font-medium border border-purple-400/20 ${isSaving ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}`}
          >
              <Save className="w-5 h-5" /> 
              {isSaving ? 'Đang lưu...' : 'Lưu tất cả thay đổi'}
          </button>
      </div>

    </div>
  );
}