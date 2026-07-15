import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';
import { getTopDepositors } from '../lib/supabaseService';
import { Crown, X } from 'lucide-react';
import axios from 'axios';
import { TwoFactorModal } from '../components/TwoFactorModal';
import confetti from 'canvas-confetti';

// Định nghĩa kiểu dữ liệu User dựa trên cấu trúc bảng users của bạn
export interface Top1ModalProps {
  onClose: () => void;
  userFullname: string;
}

// 🎺 Web Audio API: Fanfare Sound
const playFanfare = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const playNote = (freq: number, startTime: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);
      
      gain.gain.setValueAtTime(0, ctx.currentTime + startTime);
      gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + startTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + startTime + duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + startTime);
      osc.stop(ctx.currentTime + startTime + duration);
    };

    // Simple fanfare notes (C4, E4, G4, C5)
    playNote(261.63, 0, 0.2); // C4
    playNote(329.63, 0.2, 0.2); // E4
    playNote(392.00, 0.4, 0.2); // G4
    playNote(523.25, 0.6, 0.6); // C5
  } catch (err) {
    console.error("Audio playback failed", err);
  }
};

const Top1Modal: React.FC<Top1ModalProps> = ({ onClose, userFullname }) => {
  useEffect(() => {
    // 🎆 Fireworks effect
    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl relative overflow-hidden">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X size={24} />
        </button>
        <div className="text-yellow-500 mb-4 animate-bounce">
          <Crown size={64} className="mx-auto" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Chúc mừng!</h2>
        <p className="text-gray-600 mb-6">
          <span className="font-bold text-yellow-600">{userFullname}</span> hiện đang là Top 1 Đóng góp của chúng tôi!
        </p>
      </div>
    </div>
  );
};

export interface User {
  id: number;
  username: string;
  email: string;
  fullname: string;
  role: string;
  status?: string;
  join_date?: string;
  joinDate?: string;
  phone?: string;
  balance?: number;
  avatarUrl?: string;
  coursesEnrolledCount?: number;
  coursesEnrolled?: number[]; // Array of course IDs user has enrolled in
  isTop1?: boolean;
  password?: string;
  is2FAEnabled?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSupport: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: Partial<User>) => Promise<boolean>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  sendOtpToEmail: (email: string) => Promise<boolean>;
  resetPassword: (password: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [showTop1Modal, setShowTop1Modal] = useState(false);
  
  // 2FA State
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [twoFactorData, setTwoFactorData] = useState<{ email: string, setupRequired: boolean, qrCodeUrl: string | null } | null>(null);

  // Login Approval State
  const [pendingLoginRequestId, setPendingLoginRequestId] = useState<string | null>(() => {
    return localStorage.getItem('pendingLoginRequestId');
  });

  // Sync to localStorage
  useEffect(() => {
    if (pendingLoginRequestId) {
      localStorage.setItem('pendingLoginRequestId', pendingLoginRequestId);
    } else {
      localStorage.removeItem('pendingLoginRequestId');
    }
  }, [pendingLoginRequestId]);

  // Polling for Login Approval
  useEffect(() => {
    let interval: any;
    if (pendingLoginRequestId) {
      interval = setInterval(async () => {
        try {
          const res = await axios.get(`http://localhost:3001/api/auth/check-login-status?requestId=${pendingLoginRequestId}`);
          if (res.data.status === 'approved') {
            setPendingLoginRequestId(null);
            localStorage.setItem('adminToken', res.data.token);
            await fetchUserProfile(res.data.user.email);
            toast.success(`Đăng nhập thành công! Chào mừng ${res.data.user.fullname || res.data.user.username}`);
            setTimeout(() => {
              window.location.href = (res.data.user.role === 'admin' || res.data.user.role === 'support') ? '/admin' : '/';
            }, 500);
          } else if (res.data.status === 'rejected') {
            setPendingLoginRequestId(null);
            toast.error('Đăng nhập của bạn đã bị TỪ CHỐI bởi Admin!');
          } else if (res.data.status === 'not_found') {
            // Yêu cầu không tồn tại hoặc đã hết hạn/xóa
            setPendingLoginRequestId(null);
          }
        } catch (e) {
          // ignore network errors
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [pendingLoginRequestId]);

  // Load TikTok embed script khi modal mở (nếu cần thiết)
  useEffect(() => {
    if (showTop1Modal) {
      const script = document.createElement('script');
      script.src = "https://www.tiktok.com/embed.js";
      script.async = true;
      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
      };
    }
  }, [showTop1Modal]);

  // Hàm lấy thông tin chi tiết user từ bảng 'users' (public)
  const fetchUserProfile = async (email: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error) throw error;
      
      if (data) {
        // Lấy danh sách khóa học đã đăng ký
        const { data: enrollments } = await supabase
          .from('user_courses')
          .select('course_id')
          .eq('user_id', data.id);

        const coursesEnrolled = (enrollments || []).map((e: any) => e.course_id);

        const userData = {
          id: data.id,
          username: data.username,
          fullname: data.full_name || data.fullname || data.username, 
          email: data.email,
          role: data.role || 'user',
          phone: data.phone,
          joinDate: data.join_date || data.joinDate,
          balance: data.balance || 0,
          coursesEnrolled,
          avatarUrl: data.avatar_url || data.avatarUrl,
          is2FAEnabled: !!data.two_factor_secret,
        };

        // Kiểm tra Top 1
        try {
          const topDeps = await getTopDepositors(1);
          if (topDeps.length > 0 && String(topDeps[0].userId) === String(data.id)) {
            (userData as any).isTop1 = true;
            
            // Hiện thông báo chúc mừng nếu chưa hiện trong session này
            if (!sessionStorage.getItem('congratulatedTop1')) {
              playFanfare(); // Phát nhạc
              setShowTop1Modal(true);
            }
          } else {
            (userData as any).isTop1 = false;
          }
        } catch (e) {
          console.error("Lỗi lấy Top 1:", e);
        }

        setUser(userData as User);
        localStorage.setItem('currentUser', JSON.stringify(userData));
      }
    } catch (error) {
      console.error('Lỗi khi lấy thông tin user profile:', error);
      setUser(null);
      localStorage.removeItem('currentUser');
    }
  };

  // refreshUser: Gọi lại fetchUserProfile để cập nhật thông tin user (sau khi enroll, etc.)
  const refreshUser = async () => {
    if (user?.email) {
      await fetchUserProfile(user.email);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          await fetchUserProfile(parsedUser.email);
        }
      } catch (error) {
        console.error("Lỗi khởi tạo Auth:", error);
      } finally {
        setLoading(false);
        setInitialLoad(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);

      // Gọi API phân luồng kiểm tra admin/support
      try {
        const response = await axios.post('http://localhost:3001/api/admin/login', { email, password });
        if (response.data.success && response.data.require2FA) {
          setTwoFactorData({
            email: response.data.email,
            setupRequired: false,
            qrCodeUrl: null
          });
          setShow2FAModal(true);
          return false; // Chưa đăng nhập xong, chờ 2FA
        } else if (response.data.success && response.data.pendingApproval) {
          setPendingLoginRequestId(response.data.requestId);
          toast.success(response.data.message || 'Đang gửi yêu cầu phê duyệt...');
          return false;
        }
      } catch (err: any) {
        // Nếu lỗi 403 (không phải admin/support) -> rớt xuống login user bình thường
        // Nếu lỗi 401 (sai pass) -> báo lỗi luôn
        if (err.response?.status === 401) {
          toast.error('Email hoặc mật khẩu không đúng!');
          return false;
        }
      }

      // Login cho user bình thường qua backend API để tạo Pending Request
      const res = await axios.post('http://localhost:3001/api/user/login-request', { email, password });
      if (res.data && res.data.success && res.data.pendingApproval) {
        setPendingLoginRequestId(res.data.requestId);
        toast.success('Vui lòng kiểm tra Email của bạn để XÁC NHẬN đăng nhập!');
        return false;
      }
      
      return false;
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        toast.error(error.response?.data?.message || 'Lỗi đăng nhập');
      } else {
        toast.error('Lỗi kết nối đến máy chủ.');
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handle2FASuccess = async (responseData: any) => {
    setShow2FAModal(false);
    setTwoFactorData(null);
    if (responseData.pendingApproval) {
       setPendingLoginRequestId(responseData.requestId);
       toast.success(responseData.message || 'Đang gửi yêu cầu phê duyệt...');
    }
  };

  const register = async (data: Partial<User>): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Kiểm tra trùng email
      const { data: existingEmail } = await supabase
        .from('users')
        .select('id')
        .eq('email', data.email)
        .maybeSingle();
        
      if (existingEmail) {
         toast.error('Email này đã được sử dụng!');
         return false;
      }

      // Lấy ID cao nhất để auto increment thủ công do db.json migrate
      const { data: maxIdData } = await supabase
        .from('users')
        .select('id')
        .order('id', { ascending: false })
        .limit(1);
        
      const nextId = maxIdData && maxIdData.length > 0 ? maxIdData[0].id + 1 : 1;

      const newUser = {
        id: nextId,
        username: data.username || data.email?.split('@')[0],
        email: data.email,
        password: data.password, // Trong thực tế phải hash password!
        full_name: data.fullname || 'Người dùng mới',
        role: 'user',
        status: 'active',
        join_date: new Date().toISOString().split('T')[0]
      };

      const { error } = await supabase.from('users').insert([newUser]);
      
      if (error) throw error;
      
      toast.success('Đăng ký thành công! Bạn có thể đăng nhập ngay.');
      return true;
    } catch (error: any) {
      console.error(error);
      toast.error(`Đăng ký thất bại: ${error.message}`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('adminToken');
    sessionStorage.removeItem('congratulatedTop1');
    toast.success('Đăng xuất thành công!');
  };

  const sendOtpToEmail = async (email: string): Promise<boolean> => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .maybeSingle();
        
      if (error || !data) {
        toast.error('Email không tồn tại trong hệ thống!');
        return false;
      }
      
      console.log(`Đã gửi OTP "123456" đến email ${email}`);
      return true;
    } catch (error) {
      console.error(error);
      toast.error('Lỗi kết nối.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (password: string): Promise<boolean> => {
    try {
      setLoading(true);
      console.log(`Đổi mật khẩu mới: ${password}`);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';
  const isSupport = user?.role === 'support';

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, isAdmin, isSupport, login, register, logout, refreshUser, sendOtpToEmail, resetPassword }}>
      {!initialLoad && children}

      {showTop1Modal && user && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative max-w-md w-full bg-gradient-to-b from-[#0f172a] to-slate-900 rounded-[2rem] border-2 border-yellow-400/50 shadow-[0_0_100px_rgba(250,204,21,0.3)] p-8 text-center animate-in zoom-in-95 duration-500 overflow-hidden">
            
            {/* Nút đóng */}
            <button 
              onClick={() => {
                setShowTop1Modal(false);
                sessionStorage.setItem('congratulatedTop1', 'true');
              }}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-white/5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors z-20"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Hiệu ứng ánh sáng nền */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-yellow-500/20 rounded-full blur-[80px] pointer-events-none"></div>

            <div className="relative z-10 flex flex-col items-center">
              {/* Avatar với Vương miện */}
              <div className="relative mb-6 animate-bounce-small">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full flex items-center justify-center border-4 border-[#0f172a] shadow-[0_0_20px_rgba(250,204,21,0.6)] z-20 pointer-events-none">
                  <Crown className="w-6 h-6 text-[#0f172a]" />
                </div>
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Avatar" className="w-24 h-24 rounded-full object-cover shadow-[0_0_30px_rgba(250,204,21,0.6)] border-4 border-yellow-400" />
                ) : (
                  <div className="w-24 h-24 bg-gradient-to-br from-sky-400 to-indigo-500 rounded-full flex items-center justify-center text-4xl font-black text-white shadow-[0_0_30px_rgba(250,204,21,0.6)] border-4 border-yellow-400">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500 mb-2 uppercase tracking-wide">
                Vinh Danh Đại Gia
              </h2>
              
              <p className="text-slate-300 text-base leading-relaxed mb-6">
                Chào mừng <span className="font-bold text-white text-lg">{user.fullname}</span>! Bạn đang là <strong className="text-yellow-400 font-bold text-lg">Top 1 Server</strong> với số tiền nạp cao nhất. Sự ủng hộ của bạn là niềm vinh hạnh lớn nhất của LearnHub!
              </p>

              {/* GIF Chú chó ngậm hoa */}
              <div className="mb-8 w-full rounded-2xl overflow-hidden border-2 border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.1)] relative group h-48 bg-slate-800">
                <img 
                  src="/congartion.gif" 
                  alt="Dog holding flower" 
                  className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent opacity-80 pointer-events-none"></div>
              </div>

              <button 
                onClick={() => {
                  setShowTop1Modal(false);
                  sessionStorage.setItem('congratulatedTop1', 'true');
                }}
                className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-[#0f172a] font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(250,204,21,0.4)] hover:shadow-[0_0_30px_rgba(250,204,21,0.6)] transition-all transform hover:-translate-y-1"
              >
                Tiếp tục trải nghiệm
              </button>
            </div>
          </div>
        </div>
      )}

      {twoFactorData && (
        <TwoFactorModal
          isOpen={show2FAModal}
          onClose={() => { setShow2FAModal(false); setTwoFactorData(null); }}
          email={twoFactorData.email}
          setupRequired={twoFactorData.setupRequired}
          qrCodeUrl={twoFactorData.qrCodeUrl}
          onSuccess={handle2FASuccess}
        />
      )}

      {pendingLoginRequestId && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 rounded-3xl border border-slate-700/50 shadow-2xl p-10 text-center max-w-md w-full relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-purple-500/10"></div>
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-20 h-20 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-8 shadow-[0_0_30px_rgba(59,130,246,0.3)]"></div>
              <h3 className="text-2xl font-bold text-white mb-3">Đang chờ xác nhận</h3>
              <p className="text-slate-400 leading-relaxed">Hệ thống đã gửi một email chứa liên kết đăng nhập đến địa chỉ của bạn. Vui lòng kiểm tra hộp thư đến và bấm CHẤP NHẬN để tiếp tục...</p>
            </div>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth phải được sử dụng bên trong AuthProvider');
  }
  return context;
}