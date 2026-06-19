import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';

// Định nghĩa kiểu dữ liệu User dựa trên cấu trúc bảng users của bạn
interface User {
  id: number;
  username: string;
  fullname: string;
  email: string;
  role: string;
  phone?: string;
  joinDate?: string;
  coursesEnrolled?: number[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, username: string, fullname: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  sendOtpToEmail: (email: string, otp: string) => Promise<boolean>;
  resetPassword: (email: string, newPassword: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);

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
          fullname: data.full_name || data.username, 
          email: data.email,
          role: data.role || 'user',
          coursesEnrolled,
        };
        setUser(userData);
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
        toast.error('Đăng nhập thất bại: Email hoặc mật khẩu không đúng!');
        return false;
      }

      await fetchUserProfile(email);
      localStorage.setItem('currentUser', JSON.stringify({ email }));
      return true;
    } catch (error) {
      console.error(error);
      toast.error('Đăng nhập thất bại: Có lỗi xảy ra.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, username: string, fullname: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Kiểm tra email tồn tại
      const { data: existingUser } = await supabase.from('users').select('id').eq('email', email).maybeSingle();
      if (existingUser) {
        toast.error('Email này đã được sử dụng!');
        return false;
      }

      const newId = Date.now();
      const { error: dbError } = await supabase
        .from('users')
        .insert([
          { 
            id: newId,
            email: email, 
            password: password, 
            username: username,
            full_name: fullname,
            role: 'user',
            status: 'active',
            join_date: new Date().toISOString().split('T')[0]
          }
        ]);

      if (dbError) {
        toast.error('Đăng ký thất bại: ' + dbError.message);
        return false;
      }

      toast.success('Đăng ký thành công! Bạn có thể đăng nhập ngay.');
      return true;
    } catch (error) {
      console.error(error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  const sendOtpToEmail = async (email: string, otp: string): Promise<boolean> => {
    try {
      setLoading(true);
      const { data: userRecord, error } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      if (error || !userRecord) {
        toast.error('Email không tồn tại trong hệ thống!');
        return false;
      }

      // Gọi API mailer.js để gửi OTP
      const response = await fetch('http://localhost:3001/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();
      if (!data.success) {
        toast.error('Có lỗi khi gửi email OTP. Vui lòng thử lại.');
        return false;
      }

      return true;
    } catch (error) {
      console.error(error);
      toast.error('Không thể kết nối đến máy chủ gửi email.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string, newPassword: string): Promise<boolean> => {
    try {
      setLoading(true);
      const { error: updateError } = await supabase
        .from('users')
        .update({ password: newPassword })
        .eq('email', email);

      if (updateError) {
        toast.error('Có lỗi xảy ra khi cập nhật mật khẩu.');
        return false;
      }

      toast.success('Đổi mật khẩu thành công! Vui lòng đăng nhập lại.');
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

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, isAdmin, login, register, logout, refreshUser, sendOtpToEmail, resetPassword }}>
      {!initialLoad && children}
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