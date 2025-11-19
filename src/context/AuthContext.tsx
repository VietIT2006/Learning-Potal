import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

// Định nghĩa cấu trúc User khớp với Database
interface User {
  id: number;
  username: string;
  fullname: string;
  email: string;
  role: string; // Quan trọng: 'admin' hoặc 'user'
  coursesEnrolled?: number[]; // [SỬA ĐỔI] Mảng ID các khóa học đã đăng ký
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (u: string, p: string) => Promise<boolean>;
  register: (info: any) => Promise<boolean | string>;
  logout: () => void;
  refreshUser: () => void; // [THÊM] Hàm cập nhật lại data user
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // [THÊM/SỬA] Tách logic fetch user ra thành hàm riêng để tái sử dụng
  const fetchAndUpdateUser = async (storedUser: User) => {
    try {
      // GỌI API LẤY THÔNG TIN MỚI NHẤT (bao gồm coursesEnrolled)
      const res = await fetch(`http://localhost:3001/users?username=${storedUser.username}`);
      const data = await res.json();
      
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
  
  // [THÊM] Định nghĩa hàm refresh User
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
      const res = await fetch(`http://localhost:3001/users?username=${username}&password=${password}`);
      if (!res.ok) throw new Error('Lỗi kết nối');
      
      const users = await res.json();
      if (users.length > 0) {
        const loggedInUser = users[0] as User;
        setUser(loggedInUser);
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
      const res = await fetch('http://localhost:3001/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(info)
      });
      const data = await res.json();
      
      if (res.ok) {
        return true;
      } else {
        return data.message || "Đăng ký thất bại";
      }
    } catch (error) {
      console.error("Register error:", error);
      return "Lỗi kết nối server";
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
    refreshUser, // [THÊM] Export hàm refreshUser
    isAuthenticated: !!user,
    // Kiểm tra quyền Admin: Phải khớp chính xác chữ 'admin'
    isAdmin: user?.role === 'admin' 
  };

  // Chờ load xong mới hiển thị nội dung web
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