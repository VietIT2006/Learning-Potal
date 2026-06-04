import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { loginUser, getUsers, registerUser } from '../lib/supabaseService';

// Định nghĩa cấu trúc User khớp với Database
interface User {
  id: number;
  username: string;
  fullname: string;
  email: string;
  role: string; // Quan trọng: 'admin' hoặc 'user'
  coursesEnrolled?: number[]; // Mảng ID các khóa học đã đăng ký
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (u: string, p: string) => Promise<boolean>;
  register: (info: any) => Promise<boolean | string>;
  logout: () => void;
  refreshUser: () => void; // Hàm cập nhật lại data user
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Tách logic fetch user ra thành hàm riêng để tái sử dụng
  const fetchAndUpdateUser = async (storedUser: User) => {
    try {
      const data = await getUsers({ username: storedUser.username });
      
      if (data.length > 0) {
        const freshUser = data[0] as User;
        setUser(freshUser);
        localStorage.setItem('user', JSON.stringify(freshUser));
        return freshUser;
      }
    } catch (err) {
      console.warn("Không thể đồng bộ dữ liệu mới.");
    }
    return storedUser;
  };
  
  // Định nghĩa hàm refresh User
  const refreshUser = () => {
      const stored = localStorage.getItem('user');
      if (stored) {
          try {
              const parsedUser = JSON.parse(stored) as User;
              // Chạy async function để cập nhật
              fetchAndUpdateUser(parsedUser); 
          } catch (error) {
              console.error("Lỗi parse user", error);
          }
      }
  };

  // 1. Khởi tạo: Lấy thông tin từ bộ nhớ & Cập nhật mới nhất từ Server
  useEffect(() => {
    const initAuth = async () => {
      const stored = localStorage.getItem('user');
      if (stored) {
        try {
          const parsedUser = JSON.parse(stored) as User; 
          setUser(parsedUser); 
          
          // Cập nhật dữ liệu từ Server
          await fetchAndUpdateUser(parsedUser);
          
        } catch (error) {
          console.error("Lỗi parse user", error);
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // 2. Hàm Đăng nhập
  const login = async (username: string, password: string) => {
    try {
      const loggedInUser = await loginUser(username, password);
      if (loggedInUser) {
        setUser(loggedInUser as User);
        localStorage.setItem('user', JSON.stringify(loggedInUser));
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  // 3. Hàm Đăng ký
  const register = async (info: any) => {
    try {
      const data = await registerUser(info);
      if (data && data.user) {
        return true;
      } else {
        return data.message || "Đăng ký thất bại";
      }
    } catch (error: any) {
      console.error("Register error:", error);
      return error.message || "Lỗi kết nối server";
    }
  };

  // 4. Hàm Đăng xuất
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    window.location.href = '/login'; 
  };

  // Giá trị Context
  const value: AuthContextType = { 
    user,
    login,
    register,
    logout,
    refreshUser,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin' 
  };

  if (loading) return null; 

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};