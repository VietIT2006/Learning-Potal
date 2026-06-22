import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';
import { getTopDepositors } from '../lib/supabaseService';
import { Crown, X } from 'lucide-react';

// Định nghĩa kiểu dữ liệu User dựa trên cấu trúc bảng users của bạn
export interface User {
  id: number;
  username: string;
  email: string;
  fullname: string;
  role: string;
  status: string;
  join_date: string;
  avatarUrl?: string;
  coursesEnrolledCount?: number;
  coursesEnrolled?: number[]; // Array of course IDs user has enrolled in
  isTop1?: boolean;
  password?: string;
  balance?: number;
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
        };

        // Kiểm tra Top 1
        try {
          const topDeps = await getTopDepositors(1);
          if (topDeps.length > 0 && String(topDeps[0].userId) === String(data.id)) {
            (userData as any).isTop1 = true;
            
            // Hiện thông báo chúc mừng nếu chưa hiện trong session này
            if (!sessionStorage.getItem('congratulatedTop1')) {
              setShowTop1Modal(true);
              sessionStorage.setItem('congratulatedTop1', 'true');
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
      // Thay vì dùng supabase.auth, ta check trực tiếp trong bảng users (phù hợp với data migrate)
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('password', password)
        .single();

      if (error || !data) {
        toast.error('Email hoặc mật khẩu không đúng!');
        return false;
      }

      if (data.status === 'inactive') {
        toast.error('Tài khoản của bạn đã bị khóa!');
        return false;
      }

      await fetchUserProfile(email);
      toast.success(`Đăng nhập thành công! Chào mừng ${data.fullname || data.username}`);
      return true;
    } catch (error) {
      console.error(error);
      toast.error('Lỗi kết nối đến máy chủ.');
      return false;
    } finally {
      setLoading(false);
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
              onClick={() => setShowTop1Modal(false)}
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
                onClick={() => setShowTop1Modal(false)}
                className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-[#0f172a] font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(250,204,21,0.4)] hover:shadow-[0_0_30px_rgba(250,204,21,0.6)] transition-all transform hover:-translate-y-1"
              >
                Tiếp tục trải nghiệm
              </button>
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