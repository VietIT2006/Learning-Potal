import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { verifyAndDeposit, getUserTransactions } from '../lib/supabaseService';
import { Wallet as WalletIcon, CreditCard, ArrowRight, Loader2, CheckCircle, XCircle, History } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import ParticleBackground from '../components/ParticleBackground';

export default function Wallet() {
  const { user, isAuthenticated, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [amount, setAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      getUserTransactions(user.id).then(setTransactions).catch(console.error);
    }
  }, [user]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const orderCode = searchParams.get('orderCode');
    const cancel = searchParams.get('cancel');

    if (orderCode && user) {
      if (cancel === 'true') {
        toast.error('Đã hủy giao dịch nạp tiền.');
        searchParams.delete('orderCode');
        searchParams.delete('cancel');
        searchParams.delete('status');
        setSearchParams(searchParams);
      } else {
        verifyPayment(Number(orderCode));
      }
    }
  }, [searchParams, user]);

  const verifyPayment = async (orderCode: number) => {
    try {
      setVerifying(true);
      const res = await fetch(`http://localhost:3001/api/payment-info/${orderCode}`);
      const result = await res.json();
      
      if (result.error === 0 && result.data) {
        if (result.data.status === 'PAID') {
          // Ghi nhận vào DB
          const success = await verifyAndDeposit(user!.id, orderCode, result.data.amount);
          if (success) {
            toast.success(`Nạp thành công ${new Intl.NumberFormat('vi-VN').format(result.data.amount)} VNĐ!`);
            await refreshUser();
          } else {
            toast.error('Giao dịch này đã được xử lý trước đó.');
          }
        } else {
          toast.error('Giao dịch chưa hoàn thành hoặc bị hủy.');
        }
      } else {
        toast.error('Không thể kiểm tra trạng thái giao dịch.');
      }
    } catch (error) {
      console.error(error);
      toast.error('Lỗi khi xác minh giao dịch.');
    } finally {
      setVerifying(false);
      // Xóa params khỏi URL để tránh xử lý lại khi F5
      searchParams.delete('orderCode');
      searchParams.delete('cancel');
      searchParams.delete('status');
      setSearchParams(searchParams);
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseInt(amount.replace(/\D/g, ''));
    
    if (!numAmount || numAmount < 10000) {
      toast.error('Số tiền nạp tối thiểu là 10.000 VNĐ');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('http://localhost:3001/api/create-payment-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: numAmount,
          description: `Nap tien user ${user?.id}`,
          returnUrl: window.location.href,
          cancelUrl: window.location.href
        })
      });

      const result = await res.json();
      if (result.error === 0 && result.data?.checkoutUrl) {
        window.location.href = result.data.checkoutUrl;
      } else {
        toast.error('Không thể tạo link thanh toán.');
      }
    } catch (error) {
      console.error(error);
      toast.error('Lỗi kết nối đến server thanh toán.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="relative w-full min-h-screen bg-[#0a0a0a] text-white overflow-hidden">
      <div className="gradient-bg"></div>
      <ParticleBackground />

      <div className="relative z-10 pt-32 pb-20 px-4">
        <div className="max-w-2xl mx-auto">
          
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold mb-4 tracking-tight">Ví của tôi</h1>
            <p className="text-gray-400">Quản lý số dư và nạp tiền để mua khóa học.</p>
          </div>

          {verifying && (
            <div className="bg-blue-500/10 border border-blue-500/20 text-blue-400 p-4 rounded-2xl mb-8 flex items-center justify-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin" />
              Đang xác minh giao dịch, vui lòng đợi...
            </div>
          )}

          {/* Balance Card */}
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl p-8 mb-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <WalletIcon className="w-32 h-32" />
            </div>
            <div className="relative z-10">
              <p className="text-blue-100 mb-2">Số dư khả dụng</p>
              <h2 className="text-5xl font-bold tracking-tight">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(user.balance || 0)}
              </h2>
            </div>
          </div>

          {/* Deposit Form */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <CreditCard className="text-purple-400" /> Nạp tiền vào ví
            </h3>
            
            <form onSubmit={handleDeposit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Số tiền cần nạp (Tối thiểu 10.000 VNĐ)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={amount}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setAmount(val ? new Intl.NumberFormat('vi-VN').format(Number(val)) : '');
                    }}
                    placeholder="VD: 50,000"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-blue-500 transition-colors text-xl font-bold"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">VNĐ</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {[50000, 100000, 200000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAmount(new Intl.NumberFormat('vi-VN').format(val))}
                    className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-3 transition-colors text-sm font-medium"
                  >
                    {new Intl.NumberFormat('vi-VN').format(val)}đ
                  </button>
                ))}
              </div>

              <button
                type="submit"
                disabled={loading || verifying}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-4 font-bold text-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Đang tạo link thanh toán...
                  </>
                ) : (
                  <>
                    Nạp tiền qua PayOS <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Lịch sử giao dịch */}
        <div className="mt-8 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px]"></div>
          
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <History className="text-blue-400" /> Lịch sử giao dịch
          </h3>

          {transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Chưa có giao dịch nào.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400 text-sm">
                    <th className="pb-3 font-medium">Thời gian</th>
                    <th className="pb-3 font-medium">Mô tả</th>
                    <th className="pb-3 font-medium text-right">Số tiền</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-4 text-gray-300">
                        {new Date(tx.created_at).toLocaleString('vi-VN')}
                      </td>
                      <td className="py-4 text-white">
                        {tx.description}
                        {tx.type === 'purchase' && <span className="ml-2 text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded">Mua khóa học</span>}
                        {tx.type === 'deposit' && <span className="ml-2 text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">Nạp tiền</span>}
                      </td>
                      <td className={`py-4 text-right font-bold ${tx.type === 'deposit' ? 'text-green-400' : 'text-red-400'}`}>
                        {tx.type === 'deposit' ? '+' : '-'}{new Intl.NumberFormat('vi-VN').format(tx.amount)}đ
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
