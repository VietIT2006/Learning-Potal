import React, { useState, useEffect } from 'react';
import { Moon, Sun, Bell, User, Save, Megaphone, Mail, Search, CheckSquare, Square, X, Send, ShieldCheck, QrCode } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { getGlobalAnnouncement, saveGlobalAnnouncement, getUsers } from '../../lib/supabaseService';
import type { User as UserType } from '../../lib/supabaseService';
import { useAuth } from '../../context/AuthContext';

export default function SettingsPage() {
  const { user } = useAuth();
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

  // 2FA state
  const [is2FASetupModalOpen, setIs2FASetupModalOpen] = useState(false);
  const [qrUrl, setQrUrl] = useState('');
  const [tempSecret, setTempSecret] = useState('');
  const [twoFaCode, setTwoFaCode] = useState('');
  const [isVerifying2FA, setIsVerifying2FA] = useState(false);
  const [isDisabling2FA, setIsDisabling2FA] = useState(false);
  
  // Update internal status based on context
  const [is2FAEnabled, setIs2FAEnabled] = useState(user?.is2FAEnabled || false);

  useEffect(() => {
    if (user) {
      setIs2FAEnabled(user.is2FAEnabled || false);
    }
  }, [user]);

  const handleStart2FASetup = async () => {
    if (is2FAEnabled) {
      toast.error('2FA đã được bật!');
      return;
    }
    try {
      const res = await axios.post('http://localhost:3001/api/admin/setup-2fa', { email: user?.email });
      if (res.data.success) {
        setQrUrl(res.data.qrCodeUrl);
        setTempSecret(res.data.secret);
        setIs2FASetupModalOpen(true);
      }
    } catch (err) {
      toast.error('Không thể lấy mã QR');
    }
  };

  const handleConfirm2FA = async () => {
    if (twoFaCode.length < 6) {
      toast.error('Vui lòng nhập đủ 6 số');
      return;
    }
    setIsVerifying2FA(true);
    try {
      const res = await axios.post('http://localhost:3001/api/admin/confirm-2fa', { 
        email: user?.email, 
        secret: tempSecret, 
        code: twoFaCode 
      });
      if (res.data.success) {
        toast.success('Bật 2FA thành công!');
        setIs2FAEnabled(true);
        if (user) user.is2FAEnabled = true;
        setIs2FASetupModalOpen(false);
        setTwoFaCode('');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Mã xác nhận sai');
    } finally {
      setIsVerifying2FA(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn tắt xác minh 2 bước không? Tài khoản của bạn sẽ kém an toàn hơn.')) {
      return;
    }
    
    setIsDisabling2FA(true);
    try {
      const res = await axios.post('http://localhost:3001/api/admin/disable-2fa', { email: user?.email });
      if (res.data.success) {
        toast.success('Đã tắt xác minh 2 bước!');
        setIs2FAEnabled(false);
        if (user) user.is2FAEnabled = false;
      }
    } catch (err: any) {
      toast.error('Lỗi khi tắt 2FA');
    } finally {
      setIsDisabling2FA(false);
    }
  };

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

      <div className="flex justify-end pt-4 relative z-10 mb-8">
          <button 
            onClick={handleSaveSettings}
            disabled={isSaving}
            className={`flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-xl hover:from-purple-500 hover:to-pink-500 transition-all shadow-lg shadow-purple-500/25 font-medium border border-purple-400/20 ${isSaving ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}`}
          >
              <Save className="w-5 h-5" /> 
              {isSaving ? 'Đang lưu...' : 'Lưu tất cả thay đổi'}
          </button>
      </div>

      {/* --- Section 4: Security (2FA) --- */}
      <div className="bg-[#0a0a0f]/60 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/5 p-8 transition-all duration-300 relative z-10 group hover:border-white/10">
        <div className="flex items-center gap-5 mb-8 border-b border-white/5 pb-6">
            <div className="p-3.5 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl text-emerald-400 border border-green-500/20 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
                <h3 className="text-lg font-semibold text-white tracking-tight">Bảo mật (Xác minh 2 bước)</h3>
                <p className="text-sm text-slate-400 mt-1">Sử dụng Google Authenticator để tăng cường bảo mật cho tài khoản Admin.</p>
            </div>
        </div>

        <div className="flex items-center justify-between py-3 px-2">
            <div>
              <span className="text-slate-300 font-medium block">Trạng thái: {is2FAEnabled ? <span className="text-emerald-400">Đã bật</span> : <span className="text-slate-500">Chưa bật</span>}</span>
              <p className="text-xs text-slate-500 mt-1">Khi bật tính năng này, bạn sẽ cần nhập mã 6 số mỗi khi đăng nhập.</p>
            </div>
            
            {!is2FAEnabled ? (
              <button 
                onClick={handleStart2FASetup}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl transition-colors text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/25 border border-emerald-400/20"
              >
                <QrCode className="w-4 h-4" /> Bật 2FA
              </button>
            ) : (
              <button 
                onClick={handleDisable2FA}
                disabled={isDisabling2FA}
                className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-medium rounded-xl transition-colors text-sm flex items-center gap-2 border border-red-500/20"
              >
                {isDisabling2FA ? 'Đang tắt...' : 'Tắt 2FA'}
              </button>
            )}
        </div>
      </div>

      {/* Modal Setup 2FA */}
      {is2FASetupModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl p-6 text-center max-w-sm w-full relative">
            <button 
              onClick={() => setIs2FASetupModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white bg-white/5 rounded-full p-1 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold text-white mb-2 mt-4">Cài đặt mã 2FA</h3>
            <p className="text-sm text-slate-400 mb-6">Sử dụng ứng dụng Authenticator để quét mã QR dưới đây:</p>
            
            <div className="flex justify-center mb-6 bg-white p-2 rounded-xl w-fit mx-auto border-4 border-slate-800">
              <img src={qrUrl} alt="QR Code" className="w-48 h-48" />
            </div>
            
            <div className="mb-6">
              <input
                type="text"
                value={twoFaCode}
                onChange={(e) => setTwoFaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Nhập mã 6 số"
                className="w-full bg-slate-800 text-white text-center text-2xl tracking-[0.5em] font-mono p-4 rounded-xl border border-slate-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-500 placeholder:tracking-normal"
                maxLength={6}
              />
            </div>
            
            <button 
              onClick={handleConfirm2FA}
              disabled={isVerifying2FA || twoFaCode.length < 6}
              className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-700 disabled:text-slate-400 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/25"
            >
              {isVerifying2FA ? 'Đang xác nhận...' : 'Hoàn tất cài đặt'}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}