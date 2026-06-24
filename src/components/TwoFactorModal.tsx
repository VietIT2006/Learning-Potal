import React, { useState } from 'react';
import { X, ShieldCheck, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

interface TwoFactorModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  setupRequired: boolean;
  qrCodeUrl: string | null;
  onSuccess: (responseData: any) => void;
}

export function TwoFactorModal({ isOpen, onClose, email, onSuccess }: TwoFactorModalProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || code.length < 6) {
      toast.error('Vui lòng nhập mã xác nhận 6 số');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:3001/api/admin/verify-2fa', { email, code });
      if (response.data.success) {
        toast.success(response.data.message);
        onSuccess(response.data);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi xác minh 2FA');
    } finally {
      setLoading(false);
    }
  };

  const handleSendBackup = async () => {
    setSendingEmail(true);
    try {
      const res = await axios.post('http://localhost:3001/api/admin/send-backup-otp', { email });
      if (res.data.success) {
        toast.success('Đã gửi mã dự phòng đến email của bạn!', { duration: 5000 });
      }
    } catch (err) {
      toast.error('Có lỗi xảy ra khi gửi email');
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative max-w-md w-full bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl p-6 text-center overflow-hidden">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-white/5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6 flex justify-center">
          <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center">
            <ShieldCheck className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white mb-2">Xác minh bảo mật 2 lớp</h2>
        
        <p className="text-slate-300 text-sm mb-6">
          Vui lòng mở ứng dụng <strong>Google Authenticator</strong> hoặc <strong>Duo Mobile</strong> và nhập mã 6 số để tiếp tục.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 mb-4">
          <div>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Nhập mã 6 số"
              className="w-full bg-slate-800 text-white text-center text-2xl tracking-[0.5em] font-mono p-4 rounded-xl border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-500 placeholder:tracking-normal"
              maxLength={6}
            />
          </div>
          
          <button 
            type="submit"
            disabled={loading || code.length < 6}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-slate-700 disabled:text-slate-400 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Xác nhận'
            )}
          </button>
        </form>

        <div className="border-t border-slate-800 pt-4 mt-2">
          <button 
            type="button" 
            onClick={handleSendBackup}
            disabled={sendingEmail}
            className="text-sm text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-2 w-full mx-auto"
          >
            <Mail className="w-4 h-4" />
            {sendingEmail ? 'Đang gửi...' : 'Không thể lấy mã 2FA? Nhận mã qua Email'}
          </button>
        </div>
      </div>
    </div>
  );
}
