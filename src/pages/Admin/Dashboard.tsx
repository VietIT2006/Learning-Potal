import React, { useState, useEffect } from 'react';
import { getCourses, getUsers } from '../../lib/supabaseService';
import { BookOpen, Users, DollarSign, TrendingUp, ChevronDown, ArrowUpRight, Activity, Clock, Award, Star } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Course {
  id: number;
  title: string;
  price: number;
  students: number;
  rating: number;
  thumbnail: string;
}

interface Student {
  id: number;
  role: string;
  fullname: string;
  email: string;
  joinDate?: string;
}

// Mock data for the chart since we don't have historical monthly data in DB
const revenueData = [
  { name: 'T1', revenue: 12000000, students: 45 },
  { name: 'T2', revenue: 19000000, students: 52 },
  { name: 'T3', revenue: 15000000, students: 48 },
  { name: 'T4', revenue: 25000000, students: 70 },
  { name: 'T5', revenue: 22000000, students: 61 },
  { name: 'T6', revenue: 30000000, students: 85 },
  { name: 'T7', revenue: 28000000, students: 80 },
  { name: 'T8', revenue: 35000000, students: 95 },
  { name: 'T9', revenue: 32000000, students: 88 },
  { name: 'T10', revenue: 40000000, students: 110 },
  { name: 'T11', revenue: 38000000, students: 105 },
  { name: 'T12', revenue: 45000000, students: 120 },
];

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalRevenue: 0,
    avgRating: 0
  });
  const [topCourses, setTopCourses] = useState<Course[]>([]);
  const [recentUsers, setRecentUsers] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  // Format tiền tệ VNĐ
  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const courses: Course[] = await getCourses();
        const students: Student[] = await getUsers({ role: 'user' });

        const totalStudents = students.length;
        const totalCourses = courses.length;
        const totalRevenue = courses.reduce((acc, cur) => acc + ((cur.price || 0) * (cur.students || 0)), 0);
        const avgRating = courses.length > 0 
            ? courses.reduce((acc, cur) => acc + (cur.rating || 0), 0) / courses.length 
            : 0;

        const sortedCourses = [...courses]
          .sort((a, b) => (b.students || 0) - (a.students || 0))
          .slice(0, 4);

        // Get recent users
        const sortedUsers = [...students]
          .sort((a, b) => new Date(b.joinDate || '').getTime() - new Date(a.joinDate || '').getTime())
          .slice(0, 5);

        setStats({ totalCourses, totalStudents, totalRevenue, avgRating });
        setTopCourses(sortedCourses);
        setRecentUsers(sortedUsers);
      } catch (error) {
        console.error("Lỗi tải dữ liệu Dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border-t-2 border-b-2 border-purple-500 animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-l-2 border-r-2 border-blue-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
          <div className="absolute inset-4 rounded-full border-t-2 border-pink-500 animate-spin" style={{ animationDuration: '1.2s' }}></div>
        </div>
      </div>
    );
  }

  const statCards = [
    { 
      title: 'Tổng doanh thu', 
      value: formatCurrency(stats.totalRevenue), 
      icon: DollarSign, 
      color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]',
      trend: '+12.5% so với tháng trước',
      trendColor: 'text-emerald-400'
    },
    { 
      title: 'Học viên hoạt động', 
      value: stats.totalStudents, 
      icon: Users, 
      color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.2)]',
      trend: '+24 học viên mới',
      trendColor: 'text-indigo-400'
    },
    { 
      title: 'Tổng khóa học', 
      value: stats.totalCourses, 
      icon: BookOpen, 
      color: 'bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.2)]',
      trend: '+2 khóa học mới',
      trendColor: 'text-blue-400'
    },
    { 
      title: 'Đánh giá trung bình', 
      value: stats.avgRating.toFixed(1), 
      icon: Star, 
      color: 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.2)]',
      trend: 'Rất tích cực',
      trendColor: 'text-amber-400'
    },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0a0a0f]/90 backdrop-blur-xl border border-white/10 p-4 rounded-xl shadow-2xl">
          <p className="text-slate-300 font-medium mb-2 border-b border-white/10 pb-2">{label}</p>
          <div className="space-y-1">
            <p className="text-purple-400 font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
              {formatCurrency(payload[0].value)}
            </p>
            <p className="text-blue-400 font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              {payload[1].value} học viên
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const maxStudents = topCourses.length > 0 ? Math.max(...topCourses.map(c => c.students || 0)) : 1;

  return (
    <div className="space-y-6 animate-fade-in relative">
      
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 rounded-3xl">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-blue-600/10 blur-[100px] rounded-full"></div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 relative z-10">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tight">Tổng quan hệ thống</h1>
          <p className="text-slate-400 mt-1">Theo dõi hoạt động và tăng trưởng của nền tảng.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-slate-300 transition-all text-sm font-medium">
            <Clock className="w-4 h-4" /> 30 ngày qua <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
        {statCards.map((stat, idx) => (
          <div key={idx} className="bg-[#0a0a0f]/60 backdrop-blur-xl rounded-2xl p-6 border border-white/5 shadow-2xl hover:bg-[#0a0a0f]/80 hover:border-white/20 hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="flex justify-between items-start mb-6">
              <div className={`p-3.5 rounded-xl border ${stat.color} group-hover:scale-110 transition-transform duration-300 relative`}>
                <stat.icon className="w-6 h-6 relative z-10" />
                <div className={`absolute inset-0 blur-md opacity-50 rounded-xl ${stat.color.split(' ')[0]}`}></div>
              </div>
              <span className={`flex items-center text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/5 ${stat.trendColor} group-hover:bg-white/10 transition-colors`}>
                <ArrowUpRight className="w-3.5 h-3.5 mr-1" /> 
                {stat.trend.split(' ')[0]}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400 group-hover:text-slate-300 transition-colors">{stat.title}</p>
              <h3 className="text-3xl font-bold text-white mt-1.5 tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-400 transition-all">{stat.value}</h3>
              <p className="text-xs text-slate-500 mt-3">{stat.trend}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 relative z-10">
        
        {/* Main Chart Section */}
        <div className="xl:col-span-2 bg-[#0a0a0f]/60 backdrop-blur-xl rounded-2xl border border-white/5 p-6 sm:p-8 shadow-2xl relative group flex flex-col">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-400" />
                Phân tích tăng trưởng
              </h2>
              <p className="text-sm text-slate-400 mt-1">Doanh thu và lượng học viên theo từng tháng</p>
            </div>
            <div className="flex items-center gap-2 bg-black/40 p-1 rounded-xl border border-white/5">
              <button className="px-4 py-1.5 rounded-lg bg-white/10 text-white text-xs font-medium shadow-sm">Doanh thu</button>
              <button className="px-4 py-1.5 rounded-lg text-slate-400 hover:text-white text-xs font-medium transition-colors">Học viên</button>
            </div>
          </div>
          
          <div className="h-[350px] w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#64748b" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12 }} 
                  dy={10}
                />
                <YAxis 
                  yAxisId="left"
                  stroke="#64748b" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12 }} 
                  tickFormatter={(val) => `${val / 1000000}tr`}
                  dx={-10}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  stroke="#64748b" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12 }} 
                  dx={10}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '3 3' }} />
                <Area 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#a855f7" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                  activeDot={{ r: 6, fill: '#a855f7', stroke: '#fff', strokeWidth: 2 }}
                />
                <Area 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="students" 
                  stroke="#3b82f6" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorStudents)" 
                  activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex flex-col gap-8">
          {/* Top Courses Ranking */}
          <div className="bg-[#0a0a0f]/60 backdrop-blur-xl rounded-2xl border border-white/5 p-6 sm:p-8 shadow-2xl flex-1 flex flex-col">
            <h2 className="text-xl font-bold text-white tracking-tight mb-6 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              Khóa học thịnh hành
            </h2>
            <div className="space-y-5 flex-1">
              {topCourses.map((course, index) => (
                <div key={course.id} className="group cursor-pointer">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-white/5 group-hover:border-purple-500/50 transition-colors">
                      <div className="absolute top-0 left-0 bg-black/60 backdrop-blur-md text-[10px] font-bold text-white w-5 h-5 flex items-center justify-center rounded-br-lg z-20">
                        {index + 1}
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <img 
                        src={course.thumbnail || 'https://via.placeholder.com/150'} 
                        alt={course.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-slate-200 text-sm truncate group-hover:text-purple-400 transition-colors">{course.title}</h4>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-slate-400">
                          {course.students} học viên <span className="text-slate-600 px-1">•</span> <span className="text-emerald-400">{formatCurrency(course.price)}</span>
                        </p>
                        <div className="font-bold text-xs text-amber-400 flex items-center">
                          {course.rating} ★
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Progress bar for popularity */}
                  <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-1000 ease-out relative"
                      style={{ width: `${(course.students / maxStudents) * 100}%` }}
                    >
                      <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/30"></div>
                    </div>
                  </div>
                </div>
              ))}
              {topCourses.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 py-8">
                  <BookOpen className="w-8 h-8 mb-3 opacity-20" />
                  <p className="text-sm">Chưa có dữ liệu khóa học</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Users / Activities */}
          <div className="bg-[#0a0a0f]/60 backdrop-blur-xl rounded-2xl border border-white/5 p-6 sm:p-8 shadow-2xl flex-1 flex flex-col">
            <h2 className="text-xl font-bold text-white tracking-tight mb-6 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              Học viên mới tham gia
            </h2>
            <div className="space-y-4 flex-1">
              {recentUsers.map((user, idx) => (
                <div key={user.id} className="flex items-center gap-4 group">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold shrink-0 shadow-[0_0_10px_rgba(59,130,246,0.1)]">
                      {(user.fullname || 'U').charAt(0).toUpperCase()}
                    </div>
                    {idx === 0 && <span className="absolute -top-1 -right-1 flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span></span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate">{user.fullname || 'Học viên ẩn danh'}</p>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                  </div>
                  <div className="text-xs text-slate-400 bg-white/5 px-2 py-1 rounded-md">
                    {user.joinDate ? new Date(user.joinDate).toLocaleDateString('vi-VN') : 'Mới'}
                  </div>
                </div>
              ))}
              {recentUsers.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 py-8">
                  <p className="text-sm">Chưa có học viên nào</p>
                </div>
              )}
            </div>
            <button className="w-full mt-4 py-2.5 text-sm text-blue-400 font-medium hover:text-white bg-blue-500/10 hover:bg-blue-500/20 rounded-xl transition-all duration-300 border border-blue-500/20">
              Quản lý học viên
            </button>
          </div>
        </div>
        
      </div>
    </div>
  );
}