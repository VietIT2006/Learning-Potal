import React, { useState, useEffect } from 'react';
import { Search, Filter, Wallet, BookOpen, CheckCircle, Clock } from 'lucide-react';
import { 
  getAllTransactionsForAnalytics, 
  getAllOrdersForAnalytics, 
  getAllQuizResultsForAnalytics 
} from '../../lib/supabaseService';
import toast from 'react-hot-toast';

type HistoryItem = {
  id: string;
  type: 'deposit' | 'purchase_wallet' | 'purchase_bank' | 'quiz';
  user: {
    fullname: string;
    email: string;
    username: string;
  };
  title: string;
  amountOrScore: string | number;
  date: Date;
  status: string;
  icon: any;
  colorClass: string;
};

export default function Analytics() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const [txs, orders, quizzes] = await Promise.all([
        getAllTransactionsForAnalytics(),
        getAllOrdersForAnalytics(),
        getAllQuizResultsForAnalytics()
      ]);

      const mergedList: HistoryItem[] = [];

      // 1. Transactions (Deposit & Purchase via Wallet)
      txs.forEach(tx => {
        const u = tx.users || {};
        mergedList.push({
          id: `tx-${tx.id}`,
          type: tx.type === 'deposit' ? 'deposit' : 'purchase_wallet',
          user: { fullname: u.full_name || u.fullname || 'Unknown User', email: u.email || '', username: u.username || 'unknown' },
          title: tx.description || (tx.type === 'deposit' ? 'Nạp tiền vào ví' : 'Thanh toán qua ví'),
          amountOrScore: tx.amount,
          date: new Date(tx.created_at),
          status: 'Thành công',
          icon: tx.type === 'deposit' ? Wallet : BookOpen,
          colorClass: tx.type === 'deposit' ? 'text-green-400 bg-green-500/10' : 'text-purple-400 bg-purple-500/10'
        });
      });

      // 2. Orders (Bank Purchase)
      orders.forEach(order => {
        const u = order.users || {};
        mergedList.push({
          id: `ord-${order.id}`,
          type: 'purchase_bank',
          user: { fullname: u.full_name || u.fullname || 'Unknown User', email: u.email || '', username: u.username || 'unknown' },
          title: `Mua: ${order.courses?.title || 'Khóa học'}`,
          amountOrScore: order.amount,
          date: new Date(order.created_at),
          status: order.status === 'paid' ? 'Đã thanh toán' : 'Đang chờ',
          icon: BookOpen,
          colorClass: 'text-blue-400 bg-blue-500/10'
        });
      });

      // 3. Quizzes
      quizzes.forEach(q => {
        const u = q.users || {};
        mergedList.push({
          id: `quiz-${q.id}`,
          type: 'quiz',
          user: { fullname: u.full_name || u.fullname || 'Unknown User', email: u.email || '', username: u.username || 'unknown' },
          title: `Thi: ${q.lessons?.title || 'Bài tập'} (${q.lessons?.courses?.title || ''})`,
          amountOrScore: `${q.score}/${q.total_questions}`,
          date: new Date(q.completed_at),
          status: 'Hoàn thành',
          icon: CheckCircle,
          colorClass: 'text-orange-400 bg-orange-500/10'
        });
      });

      // Sort by date descending
      mergedList.sort((a, b) => b.date.getTime() - a.date.getTime());
      
      setHistory(mergedList);
    } catch (error: any) {
      toast.error('Lỗi khi tải lịch sử: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = history.filter(item => {
    const matchSearch = 
      item.user.fullname.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchFilter = 
      filterType === 'all' || 
      (filterType === 'deposit' && item.type === 'deposit') ||
      (filterType === 'purchase' && (item.type === 'purchase_wallet' || item.type === 'purchase_bank')) ||
      (filterType === 'quiz' && item.type === 'quiz');

    return matchSearch && matchFilter;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const timeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " năm trước";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " tháng trước";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " ngày trước";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " giờ trước";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " phút trước";
    return "Vừa xong";
  };

  return (
    <div className="space-y-6 animate-fade-in relative z-10">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 rounded-3xl">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full"></div>
      </div>

      {/* Header */}
      <div className="relative z-10">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Lịch sử Hoạt động</h1>
        <p className="text-slate-400">Theo dõi toàn bộ luồng tiền, nạp rút và hoạt động học tập của người dùng.</p>
      </div>

      {/* Toolbar */}
      <div className="relative z-10 flex flex-col md:flex-row gap-4 justify-between bg-[#0a0a0f]/60 backdrop-blur-xl border border-white/5 p-4 rounded-2xl shadow-xl">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo tên, email, khóa học..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-slate-400" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl text-white px-4 py-2.5 focus:outline-none focus:border-purple-500"
          >
            <option value="all" className="bg-[#0f172a]">Tất cả hoạt động</option>
            <option value="deposit" className="bg-[#0f172a]">Nạp tiền</option>
            <option value="purchase" className="bg-[#0f172a]">Mua khóa học</option>
            <option value="quiz" className="bg-[#0f172a]">Làm bài tập</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-[#0a0a0f]/60 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden shadow-2xl relative z-10">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="p-4 text-sm font-semibold text-slate-300">Học viên</th>
                <th className="p-4 text-sm font-semibold text-slate-300">Hành động</th>
                <th className="p-4 text-sm font-semibold text-slate-300">Chi tiết</th>
                <th className="p-4 text-sm font-semibold text-slate-300">Số tiền / Điểm</th>
                <th className="p-4 text-sm font-semibold text-slate-300 text-right">Thời gian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-400">
                    <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-400">
                    Không tìm thấy lịch sử nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-800 to-slate-700 flex items-center justify-center text-white font-bold border border-white/10 shrink-0">
                          {item.user.fullname.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-200 group-hover:text-purple-400 transition-colors">
                            {item.user.fullname}
                          </p>
                          <p className="text-xs text-slate-500">{item.user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-lg ${item.colorClass}`}>
                          <item.icon className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium text-slate-300">
                          {item.type === 'deposit' && 'Nạp tiền ví'}
                          {item.type === 'purchase_wallet' && 'Thanh toán ví'}
                          {item.type === 'purchase_bank' && 'Chuyển khoản'}
                          {item.type === 'quiz' && 'Bài kiểm tra'}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-400 max-w-xs truncate" title={item.title}>
                      {item.title}
                    </td>
                    <td className="p-4">
                      {item.type === 'quiz' ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-orange-500/10 text-orange-400 border border-orange-500/20">
                          Điểm: {item.amountOrScore}
                        </span>
                      ) : (
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
                          item.type === 'deposit' 
                            ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                            : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                        }`}>
                          {item.type === 'deposit' ? '+' : '-'}{formatCurrency(Number(item.amountOrScore))}
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-sm text-slate-300">{item.date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                        <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 justify-end">
                          <Clock className="w-3 h-3" /> {timeAgo(item.date)}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
