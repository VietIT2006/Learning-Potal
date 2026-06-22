import React, { useState, useEffect } from 'react';
import { getUsers, deleteUser, adminDeposit } from '../../lib/supabaseService';
import { Search, Mail, Phone, Calendar, Trash2, Users, Send, X, Wallet, PlusCircle } from 'lucide-react';
import toast from 'react-hot-toast';

import type { User } from '../../lib/supabaseService';

export default function StudentManagement() {
  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Email states
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailContent, setEmailContent] = useState('');
  const [emailLevel, setEmailLevel] = useState('info');
  const [isSending, setIsSending] = useState(false);

  // Deposit states
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [studentForDeposit, setStudentForDeposit] = useState<User | null>(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [isDepositing, setIsDepositing] = useState(false);

  const fetchStudents = async () => {
    try {
      const data = await getUsers({ role: 'user' });
      setStudents(data);
      setLoading(false);
    } catch (error) {
      console.error("Lỗi tải học viên:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm('Bạn có chắc muốn xóa học viên này?')) {
      try {
        await deleteUser(id);
        await fetchStudents();
        toast.success('Xóa học viên thành công!', { style: { background: '#333', color: '#fff' } });
      } catch (error) {
        console.error(error);
        toast.error('Có lỗi xảy ra khi xóa!');
      }
    }
  };

  const handleSendEmail = async () => {
    if (!emailSubject.trim() || !emailContent.trim()) {
      toast.error('Vui lòng nhập đầy đủ tiêu đề và nội dung!');
      return;
    }
    
    setIsSending(true);

    const emailList = students
      .filter(s => selectedStudents.includes(s.id))
      .map(s => s.email)
      .filter(email => email); // Only users with an email
    
    if (emailList.length === 0) {
      toast.error('Các học viên được chọn không có địa chỉ email!');
      setIsSending(false);
      return;
    }

    const sendPromise = fetch('http://localhost:3001/api/send-admin-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        emails: emailList,
        subject: emailSubject,
        content: emailContent,
        level: emailLevel
      })
    }).then(async (res) => {
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Lỗi gửi thư');
      }
      return data;
    });

    toast.promise(sendPromise, {
      loading: `Đang gửi email cho ${emailList.length} học viên...`,
      success: 'Gửi email thành công!',
      error: 'Có lỗi xảy ra khi gửi email!',
    }, { style: { background: '#333', color: '#fff' }});

    try {
      await sendPromise;
      setIsEmailModalOpen(false);
      setEmailSubject('');
      setEmailContent('');
      setSelectedStudents([]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSending(false);
    }
  };

  const handleDeposit = async () => {
    if (!studentForDeposit || !depositAmount) return;
    
    const amount = parseInt(depositAmount.replace(/\D/g, ''), 10);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Số tiền không hợp lệ!');
      return;
    }

    setIsDepositing(true);
    try {
      await adminDeposit(studentForDeposit.id, amount, `Admin cộng tiền`);
      const displayName = (studentForDeposit as any).full_name || studentForDeposit.fullname || studentForDeposit.username || 'học viên';
      toast.success(`Đã cộng ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)} cho ${displayName}`);
      setIsDepositModalOpen(false);
      setDepositAmount('');
      setStudentForDeposit(null);
      // Optional: Refresh student list if balance is displayed (currently not displayed in table, but good practice)
      fetchStudents();
    } catch (error: any) {
      toast.error('Lỗi khi cộng tiền: ' + error.message);
    } finally {
      setIsDepositing(false);
    }
  };

  const filteredStudents = students.filter(s => 
    (s.fullname || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSelectAll = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map(s => s.id));
    }
  };

  const toggleSelectStudent = (id: number) => {
    if (selectedStudents.includes(id)) {
      setSelectedStudents(prev => prev.filter(studentId => studentId !== id));
    } else {
      setSelectedStudents(prev => [...prev, id]);
    }
  };

  const levelOptions = [
    { value: 'info', label: 'Thông tin', color: 'bg-blue-500' },
    { value: 'warning', label: 'Cảnh báo', color: 'bg-amber-500' },
    { value: 'error', label: 'Khẩn cấp', color: 'bg-red-500' },
    { value: 'success', label: 'Thành công', color: 'bg-emerald-500' },
  ];

  return (
    <div className="space-y-6 animate-fade-in relative">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0a0a0f]/60 backdrop-blur-xl p-6 rounded-2xl border border-white/5 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-blue-600/10 blur-[80px] rounded-full pointer-events-none group-hover:bg-blue-600/20 transition-all"></div>
        
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Quản lý học viên</h2>
          <p className="text-sm text-slate-400 mt-1">Danh sách học viên và thông tin liên hệ.</p>
        </div>
        
        <div className="flex items-center gap-4 w-full sm:w-auto">
          {selectedStudents.length > 0 && (
            <button 
              onClick={() => setIsEmailModalOpen(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2.5 rounded-xl hover:from-blue-500 hover:to-indigo-500 transition-all shadow-lg shadow-blue-500/25 font-medium border border-blue-400/20 active:scale-95"
            >
              <Mail className="w-4 h-4" /> 
              Gửi Email ({selectedStudents.length})
            </button>
          )}

          <div className="relative w-full sm:w-72 group/search">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/search:text-blue-400 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Tìm kiếm theo tên, email..." 
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-black/20 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-white placeholder-slate-500 transition-all outline-none" 
            />
          </div>
        </div>
      </div>

      <div className="bg-[#0a0a0f]/60 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/40 border-b border-white/10">
                <th className="p-5 w-12 text-center">
                  <input 
                    type="checkbox" 
                    checked={filteredStudents.length > 0 && selectedStudents.length === filteredStudents.length}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-white/20 bg-black/50 checked:bg-blue-500 focus:ring-blue-500/50 cursor-pointer accent-blue-500"
                  />
                </th>
                <th className="p-5 text-xs font-semibold text-slate-300 uppercase tracking-wider">Học viên</th>
                <th className="p-5 text-xs font-semibold text-slate-300 uppercase tracking-wider">Liên hệ</th>
                <th className="p-5 text-xs font-semibold text-slate-300 uppercase tracking-wider">Số dư ví</th>
                <th className="p-5 text-xs font-semibold text-slate-300 uppercase tracking-wider">Ngày tham gia</th>
                <th className="p-5 text-xs font-semibold text-slate-300 uppercase tracking-wider">Trạng thái</th>
                <th className="p-5 text-xs font-semibold text-slate-300 uppercase tracking-wider text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                 <tr>
                 <td colSpan={6} className="p-12 text-center">
                   <div className="flex flex-col items-center justify-center">
                     <div className="relative w-10 h-10 mb-4">
                       <div className="absolute inset-0 rounded-full border-t-2 border-blue-500 animate-spin"></div>
                     </div>
                     <span className="text-slate-400">Đang tải dữ liệu...</span>
                   </div>
                 </td>
               </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-3 opacity-50" />
                    Không tìm thấy học viên nào
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className={`hover:bg-white/5 transition-colors group ${selectedStudents.includes(student.id) ? 'bg-blue-500/5' : ''}`}>
                    <td className="p-5 text-center">
                      <input 
                        type="checkbox" 
                        checked={selectedStudents.includes(student.id)}
                        onChange={() => toggleSelectStudent(student.id)}
                        className="w-4 h-4 rounded border-white/20 bg-black/50 checked:bg-blue-500 focus:ring-blue-500/50 cursor-pointer accent-blue-500"
                      />
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold shrink-0">
                          {(student.fullname || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-200 group-hover:text-blue-400 transition-colors">{student.fullname || 'Học viên'}</p>
                          <p className="text-xs text-slate-500 mt-0.5">@{student.username || 'unknown'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <Mail className="w-3.5 h-3.5 text-slate-500" /> {student.email}
                        </div>
                        {student.phone && (
                          <div className="flex items-center gap-2 text-sm text-slate-400">
                            <Phone className="w-3.5 h-3.5 text-slate-500" /> {student.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-2">
                        <Wallet className="w-4 h-4 text-green-400" />
                        <span className="font-semibold text-green-400">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(student.balance || 0)}
                        </span>
                      </div>
                    </td>
                    <td className="p-5 text-sm text-slate-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        {student.joinDate || 'N/A'}
                      </div>
                    </td>
                    <td className="p-5">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${
                        student.status === 'inactive' 
                          ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      }`}>
                        {student.status === 'inactive' ? 'Bị khóa' : 'Hoạt động'}
                      </span>
                    </td>
                    <td className="p-5 text-right">
                      <div className="flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity gap-2">
                        <button 
                          onClick={() => {
                            setSelectedStudents([student.id]);
                            setIsEmailModalOpen(true);
                          }}
                          className="p-2 text-blue-400 hover:text-white bg-blue-500/10 hover:bg-blue-500 border border-transparent hover:border-blue-400 rounded-lg transition-all"
                          title="Gửi Email"
                        >
                          <Mail size={16} />
                        </button>
                        <button 
                          onClick={() => {
                            setStudentForDeposit(student);
                            setIsDepositModalOpen(true);
                          }}
                          className="p-2 text-green-400 hover:text-white bg-green-500/10 hover:bg-green-500 border border-transparent hover:border-green-400 rounded-lg transition-all"
                          title="Cộng tiền vào ví"
                        >
                          <Wallet size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(student.id)} 
                          className="p-2 text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500 border border-transparent hover:border-red-400 rounded-lg transition-all"
                          title="Xóa học viên"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Email Modal */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsEmailModalOpen(false)}></div>
          <div className="relative w-full max-w-2xl bg-[#0a0a0f] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-fade-in-down">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
            
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
                  <Mail className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">Soạn Email</h3>
              </div>
              <button 
                onClick={() => setIsEmailModalOpen(false)}
                className="text-slate-500 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Người nhận</label>
                <div className="bg-white/5 border border-white/5 rounded-xl p-3 text-sm text-slate-400 flex items-center justify-between">
                  <span>Bạn đang gửi email cho <b>{selectedStudents.length}</b> học viên</span>
                  <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-md">Mass Email</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">Cấp độ thông báo</label>
                <div className="flex flex-wrap gap-2">
                  {levelOptions.map((opt) => (
                    <button
                      key={`modal-${opt.value}`}
                      onClick={() => setEmailLevel(opt.value)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm transition-all ${
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
                <label className="block text-sm font-medium text-slate-300 mb-2">Tiêu đề</label>
                <input
                  type="text"
                  className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white placeholder-slate-600 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
                  placeholder="Nhập tiêu đề email..."
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Nội dung</label>
                <textarea
                  className="w-full bg-black/30 border border-white/10 rounded-xl p-4 text-white placeholder-slate-600 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all resize-none h-40 custom-scrollbar"
                  placeholder="Nhập nội dung chi tiết..."
                  value={emailContent}
                  onChange={(e) => setEmailContent(e.target.value)}
                />
              </div>
            </div>

            <div className="p-6 border-t border-white/5 bg-black/20 flex justify-end gap-3">
              <button 
                onClick={() => setIsEmailModalOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5 hover:text-white transition-all font-medium"
              >
                Hủy
              </button>
              <button 
                onClick={handleSendEmail}
                disabled={isSending}
                className={`flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2.5 rounded-xl hover:from-blue-500 hover:to-indigo-500 transition-all shadow-lg shadow-blue-500/25 font-medium border border-blue-400/20 ${isSending ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}`}
              >
                  <Send className="w-4 h-4" /> 
                  {isSending ? 'Đang gửi...' : 'Gửi Email'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deposit Modal */}
      {isDepositModalOpen && studentForDeposit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsDepositModalOpen(false)}></div>
          <div className="relative w-full max-w-md bg-[#0a0a0f] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-fade-in-down">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-500"></div>
            
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 text-green-400 rounded-lg">
                  <Wallet className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">Cộng tiền</h3>
              </div>
              <button onClick={() => setIsDepositModalOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="bg-white/5 border border-white/5 rounded-xl p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 flex items-center justify-center text-green-400 font-bold shrink-0 text-xl">
                  {((studentForDeposit as any).full_name || studentForDeposit.fullname || studentForDeposit.username || 'U').charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-white">{((studentForDeposit as any).full_name || studentForDeposit.fullname || studentForDeposit.username || 'Học viên')}</p>
                  <p className="text-sm text-slate-400">{studentForDeposit.email || `@${studentForDeposit.username}`}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Số tiền cần cộng (VNĐ)</label>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full bg-black/30 border border-white/10 rounded-xl p-3 pl-10 text-white placeholder-slate-600 focus:ring-2 focus:ring-green-500/50 focus:border-green-500 outline-none transition-all font-mono text-lg"
                    placeholder="VD: 500000"
                    value={depositAmount}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setDepositAmount(val ? parseInt(val, 10).toLocaleString('vi-VN') : '');
                    }}
                  />
                  <PlusCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500/50" />
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-white/5 bg-black/20 flex justify-end gap-3">
              <button 
                onClick={() => setIsDepositModalOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5 hover:text-white transition-all font-medium"
              >
                Hủy
              </button>
              <button 
                onClick={handleDeposit}
                disabled={isDepositing || !depositAmount}
                className={`flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-2.5 rounded-xl hover:from-green-500 hover:to-emerald-500 transition-all shadow-lg shadow-green-500/25 font-medium border border-green-400/20 ${isDepositing || !depositAmount ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}`}
              >
                <Wallet className="w-4 h-4" /> 
                {isDepositing ? 'Đang xử lý...' : 'Xác nhận cộng'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}