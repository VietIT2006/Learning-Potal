import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// 1. Định nghĩa kiểu dữ liệu cho User
interface User {
  id: number;
  username: string;
  role: 'user' | 'admin';
  // Thêm các trường khác nếu có, ví dụ: email, name...
}

// 2. Định nghĩa kiểu cho giá trị của Context
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

// 3. Tạo Context với kiểu đã định nghĩa
// Cung cấp giá trị mặc định (hoặc undefined)
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 4. Định nghĩa kiểu cho Props của Provider
interface AuthProviderProps {
  children: ReactNode;
}

// 5. Tạo Provider Component với Props đã định nghĩa
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser) as User);
    }
    setLoading(false);
  }, []);

  // 6. Định nghĩa kiểu cho tham số của hàm login
  const login = async (username: string, password: string) => {
    try {
      const response = await axios.get(
        `http://localhost:3001/users?username=${username}&password=${password}`
      );

      if (response.data.length > 0) {
        const loggedInUser = response.data[0] as User;
        setUser(loggedInUser);
        localStorage.setItem('user', JSON.stringify(loggedInUser));
        
        if (loggedInUser.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } else {
        alert('Sai tên đăng nhập hoặc mật khẩu');
      }
    } catch (error) {
      console.error('Lỗi đăng nhập:', error);
      alert('Đã xảy ra lỗi');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    navigate('/login');
  };

  // 7. Giá trị value phải khớp với kiểu AuthContextType
  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    login,
    logout,
  };

  if (loading) {
    return null;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 8. Tạo custom hook với kiểu trả về chính xác
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};