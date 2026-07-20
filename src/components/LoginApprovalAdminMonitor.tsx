import React, { useEffect, useState } from 'react';
import api from '../api';
import { ShieldAlert, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginApprovalAdminMonitor() {
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);

  useEffect(() => {
    const fetchPendingLogins = async () => {
      try {
        const res = await api.get('/admin/pending-logins');
        if (res.data.success) {
          setPendingRequests(res.data.requests);
        }
      } catch (e) {
        // Ignore network errors during polling
      }
    };

    const interval = setInterval(fetchPendingLogins, 3000);
    fetchPendingLogins();
    return () => clearInterval(interval);
  }, []);

  const handleAction = async (requestId: string, action: 'approve' | 'reject') => {
    try {
      const res = await api.post('/admin/approve-login', { requestId, action });
      if (res.data.success) {
        toast.success(action === 'approve' ? 'Đã chấp nhận đăng nhập' : 'Đã từ chối đăng nhập');
        setPendingRequests(prev => prev.filter(r => r.id !== requestId));
      }
    } catch (e) {
      toast.error('Có lỗi xảy ra');
    }
  };

  if (pendingRequests.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-4 max-h-[80vh] overflow-y-auto w-96">
      {pendingRequests.map(req => (
        <div key={req.id} className="bg-slate-900 border border-slate-700 shadow-2xl shadow-indigo-500/10 rounded-2xl p-5 relative overflow-hidden animate-in fade-in slide-in-from-bottom-5">
          <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
          
          <div className="flex items-start gap-4">
            <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="text-white font-bold mb-1">Yêu cầu đăng nhập mới</h4>
              <p className="text-sm text-slate-300 mb-2 truncate">Tài khoản: <span className="text-white font-medium">{req.email}</span></p>
              
              <div className="bg-slate-800/50 rounded-lg p-3 text-xs text-slate-400 space-y-1.5 mb-4">
                <p><span className="text-slate-500">IP:</span> {req.ip}</p>
                <p><span className="text-slate-500">Vị trí:</span> {req.location}</p>
                <p className="truncate"><span className="text-slate-500">Thiết bị:</span> {req.device}</p>
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => handleAction(req.id, 'approve')}
                  className="flex-1 flex justify-center items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 rounded-xl transition-colors text-sm"
                >
                  <CheckCircle className="w-4 h-4" /> Duyệt
                </button>
                <button 
                  onClick={() => handleAction(req.id, 'reject')}
                  className="flex-1 flex justify-center items-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-semibold py-2 rounded-xl border border-red-500/20 transition-colors text-sm"
                >
                  <XCircle className="w-4 h-4" /> Từ chối
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
