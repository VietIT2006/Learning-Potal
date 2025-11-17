import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BookOpen, Users, DollarSign, TrendingUp, ChevronDown, ArrowUpRight } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalRevenue: 0,
    avgRating: 0
  });
  const [topCourses, setTopCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Format tiền tệ VNĐ
  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 1. Lấy dữ liệu khóa học
        const coursesRes = await axios.get('http://localhost:3001/courses');
        const courses = coursesRes.data;

        // 2. Lấy dữ liệu học viên
        const usersRes = await axios.get('http://localhost:3001/users?role=user');
        const students = usersRes.data;

        // 3. Tính toán
        const totalStudents = students.length; // Đếm số học viên thực tế
        
        // Doanh thu = Giá * Số học viên (giả định trường students trong courses là số lượt mua)
        const totalRevenue = courses.reduce((acc: number, cur: any) => acc + ((cur.price || 0) * (cur.students || 0)), 0);
        
        // Đánh giá trung bình
        const avgRating = courses.length > 0 
            ? courses.reduce((acc: number, cur: any) => acc + (cur.rating || 0), 0) / courses.length 
            : 0;

        // Lấy top 4 khóa học đông học viên nhất
        const sortedCourses = [...courses].sort((a: any, b: any) => b.students - a.students).slice(0, 4);

        setStats({
          totalCourses: courses.length,
          totalStudents: totalStudents,
          totalRevenue: totalRevenue,
          avgRating: avgRating
        });
        setTopCourses(sortedCourses);

      } catch (error) {
        console.error("Lỗi tải dữ liệu Dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="flex h-64 items-center justify-center text-gray-500">Đang tải dữ liệu thống kê...</div>;

  const statCards = [
    { 
      title: 'Tổng doanh thu', 
      value: formatCurrency(stats.totalRevenue), 
      icon: DollarSign, 
      color: 'bg-green-100 text-green-600',
      trend: '+12% so với tháng trước' 
    },
    { 
      title: 'Học viên hoạt động', 
      value: stats.totalStudents, 
      icon: Users, 
      color: 'bg-purple-100 text-purple-600',
      trend: '+5 học viên mới'
    },
    { 
      title: 'Tổng khóa học', 
      value: stats.totalCourses, 
      icon: BookOpen, 
      color: 'bg-blue-100 text-blue-600',
      trend: '2 khóa học mới'
    },
    { 
      title: 'Đánh giá trung bình', 
      value: stats.avgRating.toFixed(1), 
      icon: TrendingUp, 
      color: 'bg-orange-100 text-orange-600',
      trend: 'Rất tích cực'
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* 1. Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className="flex items-center text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                <ArrowUpRight className="w-3 h-3 mr-1" /> 
                Tăng trưởng
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.title}</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</h3>
              <p className="text-xs text-gray-400 mt-2">{stat.trend}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 2. Revenue Chart (Giả lập UI) */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Biểu đồ doanh thu</h2>
              <p className="text-sm text-gray-500">Thống kê theo năm 2024</p>
            </div>
            <button className="p-2 hover:bg-gray-50 rounded-lg text-gray-400">
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>
          <div className="h-64 flex items-end justify-between gap-3 px-2">
            {[45, 50, 60, 40, 70, 55, 80, 90, 65, 85, 75, 95].map((h, i) => (
              <div key={i} className="w-full bg-purple-50 rounded-t-lg relative group cursor-pointer h-full flex flex-col justify-end">
                <div 
                  className="w-full bg-gradient-to-t from-purple-600 to-pink-500 rounded-t-lg transition-all duration-500 hover:opacity-90" 
                  style={{height: `${h}%`}}
                ></div>
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  {h}M
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-xs text-gray-400 uppercase font-medium">
            <span>T1</span><span>T2</span><span>T3</span><span>T4</span><span>T5</span><span>T6</span>
            <span>T7</span><span>T8</span><span>T9</span><span>T10</span><span>T11</span><span>T12</span>
          </div>
        </div>

        {/* 3. Top Courses List */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Khóa học tiêu biểu</h2>
          <div className="space-y-5">
            {topCourses.map((course) => (
              <div key={course.id} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition border border-transparent hover:border-gray-100 group cursor-pointer">
                <img 
                  src={course.thumbnail} 
                  alt={course.title} 
                  className="w-12 h-12 rounded-lg object-cover shadow-sm"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 text-sm truncate group-hover:text-purple-700 transition">{course.title}</h4>
                  <p className="text-xs text-gray-500">{course.students} học viên • {formatCurrency(course.price)}</p>
                </div>
                <div className="font-bold text-sm text-gray-900">
                  {course.rating} <span className="text-yellow-400">★</span>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-2 text-sm text-purple-600 font-medium hover:bg-purple-50 rounded-lg transition">
            Xem tất cả báo cáo
          </button>
        </div>
      </div>
    </div>
  );
}