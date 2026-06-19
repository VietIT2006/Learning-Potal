import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateUserProfile, getUserEnrolledCourses } from '../lib/supabaseService';
import { User, Mail, Phone, Calendar, BookOpen, Edit2, Check, X, PlayCircle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import ParticleBackground from '../components/ParticleBackground';

function Profile() {
  const { user, refreshUser } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [fullname, setFullname] = useState('');
  const [phone, setPhone] = useState('');
  
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFullname(user.fullname || '');
      setPhone(user.phone || '');
      fetchEnrolledCourses(user.id);
    }
  }, [user]);

  const fetchEnrolledCourses = async (userId: number) => {
    try {
      setLoading(true);
      const courses = await getUserEnrolledCourses(userId);
      setEnrolledCourses(courses);
    } catch (error) {
      console.error("Lỗi lấy danh sách khóa học:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!fullname.trim()) {
      toast.error('Họ tên không được để trống!');
      return;
    }

    try {
      setSaving(true);
      await updateUserProfile(user!.id, { full_name: fullname, phone: phone });
      await refreshUser();
      setIsEditing(false);
      toast.success('Cập nhật hồ sơ thành công!');
    } catch (error) {
      console.error("Lỗi cập nhật hồ sơ:", error);
      toast.error('Có lỗi xảy ra khi cập nhật hồ sơ.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFullname(user?.fullname || '');
    setPhone(user?.phone || '');
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617]">
        <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative bg-[#020617] text-white overflow-hidden">
      <div className="gradient-bg"></div>
      <ParticleBackground />
      
      <div className="relative z-10 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white tracking-tight">Hồ sơ cá nhân</h1>
          <p className="text-slate-400 mt-2">Quản lý thông tin cá nhân và tiến trình học tập của bạn</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Thông tin cá nhân (Left Column) */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-[#0f172a]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-sky-500/20"></div>
              
              <div className="flex flex-col items-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-sky-400 to-indigo-500 rounded-full flex items-center justify-center text-4xl font-black text-white shadow-lg shadow-sky-900/50 mb-4 ring-4 ring-[#0f172a]">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <h2 className="text-xl font-bold text-white">{user.fullname}</h2>
                <span className="text-sm font-medium text-sky-400 bg-sky-500/10 px-3 py-1 rounded-full mt-2 capitalize">
                  {user.role}
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <h3 className="font-semibold text-white">Thông tin chi tiết</h3>
                  {!isEditing && (
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="text-sky-400 hover:text-sky-300 text-sm font-medium flex items-center gap-1 transition"
                    >
                      <Edit2 className="w-4 h-4" /> Sửa
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1 block">Tên đăng nhập</label>
                    <div className="flex items-center gap-3 text-slate-300 bg-white/5 p-3 rounded-xl">
                      <User className="w-5 h-5 text-slate-500" />
                      <span className="font-medium">{user.username}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1 block">Email</label>
                    <div className="flex items-center gap-3 text-slate-300 bg-white/5 p-3 rounded-xl">
                      <Mail className="w-5 h-5 text-slate-500" />
                      <span className="font-medium">{user.email}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1 block">Họ và tên</label>
                    {isEditing ? (
                      <input 
                        type="text" 
                        value={fullname}
                        onChange={(e) => setFullname(e.target.value)}
                        className="w-full bg-[#1e293b] border border-sky-500/50 text-white p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/50 font-medium"
                      />
                    ) : (
                      <div className="flex items-center gap-3 text-slate-300 bg-white/5 p-3 rounded-xl">
                        <User className="w-5 h-5 text-slate-500" />
                        <span className="font-medium">{user.fullname}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1 block">Số điện thoại</label>
                    {isEditing ? (
                      <input 
                        type="text" 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-[#1e293b] border border-sky-500/50 text-white p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/50 font-medium"
                        placeholder="Chưa cập nhật"
                      />
                    ) : (
                      <div className="flex items-center gap-3 text-slate-300 bg-white/5 p-3 rounded-xl">
                        <Phone className="w-5 h-5 text-slate-500" />
                        <span className="font-medium">{user.phone || <span className="text-slate-500 italic">Chưa cập nhật</span>}</span>
                      </div>
                    )}
                  </div>

                  {user.joinDate && (
                    <div>
                      <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1 block">Ngày tham gia</label>
                      <div className="flex items-center gap-3 text-slate-300 bg-white/5 p-3 rounded-xl">
                        <Calendar className="w-5 h-5 text-slate-500" />
                        <span className="font-medium">{new Date(user.joinDate).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>
                  )}
                </div>

                {isEditing && (
                  <div className="flex gap-3 pt-4 border-t border-white/5">
                    <button 
                      onClick={handleCancel}
                      className="flex-1 bg-white/5 hover:bg-white/10 text-white py-2.5 rounded-xl font-medium transition"
                    >
                      Hủy
                    </button>
                    <button 
                      onClick={handleSave}
                      disabled={saving}
                      className="flex-1 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-700 text-white py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition shadow-lg shadow-sky-900/20"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      Lưu lại
                    </button>
                  </div>
                )}

              </div>
            </div>
          </div>

          {/* Khóa học của tôi (Right Column) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#0f172a]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-6 sm:p-8 shadow-2xl relative min-h-[500px]">
              
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <BookOpen className="w-6 h-6 text-sky-400" />
                    Khóa học của tôi
                  </h2>
                  <p className="text-slate-400 mt-1 text-sm">Tiếp tục hành trình học tập của bạn</p>
                </div>
                <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                  <span className="text-sky-400 font-black text-xl">{enrolledCourses.length}</span>
                  <span className="text-slate-400 text-sm ml-2 font-medium">Khóa học</span>
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
                </div>
              ) : enrolledCourses.length === 0 ? (
                <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/5 border-dashed">
                  <BookOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-slate-300 mb-2">Chưa có khóa học nào</h3>
                  <p className="text-slate-400 mb-6 max-w-sm mx-auto">Bạn chưa ghi danh vào bất kỳ khóa học nào. Hãy khám phá các khóa học thú vị và bắt đầu ngay hôm nay!</p>
                  <Link 
                    to="/courses"
                    className="inline-block bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-sky-900/30"
                  >
                    Khám phá khóa học
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {enrolledCourses.map((enrollment, index) => {
                    const course = enrollment.course;
                    if (!course) return null;
                    return (
                      <div key={index} className="group bg-[#1e293b]/50 border border-white/5 rounded-2xl overflow-hidden hover:bg-[#1e293b] transition-all hover:border-sky-500/30 hover:shadow-xl hover:shadow-sky-900/10 flex flex-col">
                        <div className="h-40 relative overflow-hidden">
                          <img 
                            src={course.thumbnail || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085'} 
                            alt={course.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#1e293b] to-transparent"></div>
                          <div className="absolute bottom-4 left-4 right-4">
                            <span className="text-xs font-bold text-sky-300 bg-sky-900/60 px-2.5 py-1 rounded-lg backdrop-blur-md uppercase tracking-wider">
                              {course.level || 'Cơ bản'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="p-5 flex-1 flex flex-col">
                          <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-sky-400 transition-colors">
                            {course.title}
                          </h3>
                          
                          <div className="mt-auto pt-4 space-y-3">
                            <div className="flex justify-between text-sm font-medium">
                              <span className="text-slate-400">Tiến độ</span>
                              <span className="text-sky-400">{Math.round(enrollment.progress)}%</span>
                            </div>
                            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                              <div 
                                className="bg-sky-500 h-2 rounded-full transition-all duration-1000 ease-out" 
                                style={{ width: `${enrollment.progress}%` }}
                              ></div>
                            </div>
                            
                            <Link 
                              to={`/watch/${course.id}/lesson/first`}
                              className="mt-4 w-full bg-white/5 hover:bg-sky-500 text-white hover:text-white py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-all border border-white/10 hover:border-sky-500"
                            >
                              <PlayCircle className="w-5 h-5" />
                              {enrollment.progress === 0 ? 'Bắt đầu học' : 'Tiếp tục học'}
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
