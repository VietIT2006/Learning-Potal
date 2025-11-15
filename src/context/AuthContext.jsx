import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// 1. Tạo Context
const AuthContext = createContext();

// 2. Tạo Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Thêm loading state
  const navigate = useNavigate();

  // 3. Kiểm tra localStorage khi app khởi động
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // 4. Hàm Login
  const login = async (username, password) => {
    try {
      // Gọi mock API để kiểm tra user
      const response = await axios.get(
        `http://localhost:3001/users?username=${username}&password=${password}`
      );

      if (response.data.length > 0) {
        const loggedInUser = response.data[0];
        // Lưu vào state và localStorage
        setUser(loggedInUser);
        localStorage.setItem('user', JSON.stringify(loggedInUser));
        
        // Phân luồng sau khi đăng nhập
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

  // 5. Hàm Logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    navigate('/login');
  };

  // 6. Cung cấp state và hàm cho các component con
  const value = {
    user,
    isAuthenticated: !!user, // True nếu user tồn tại
    isAdmin: user?.role === 'admin',
    login,
    logout,
  };

  // Không render gì cho đến khi check xong localStorage
  if (loading) {
    return null; // Hoặc một component loading toàn trang
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 7. Tạo custom hook để dễ sử dụng
export const useAuth = () => {
  return useContext(AuthContext);
};