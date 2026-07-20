import React, { useState, useEffect } from 'react';
import { getCourses, createCourse, updateCourse, deleteCourse, getLessons } from '../../lib/supabaseService';
import { Plus, Edit, Trash2, X, Search, BookOpen, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface Course {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  level: string;
  duration: string;
  instructor: string;
  thumbnail: string;
  students: number;
}

export default function CourseManagement() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [lessonCounts, setLessonCounts] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const initialForm = {
    title: '', 
    description: '', 
    price: 0, 
    category: 'Programming',
    level: 'Beginner', 
    duration: '', 
    instructor: '', 
    thumbnail: ''
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchCourses = async () => {
    try {
      const [data, allLessons] = await Promise.all([
        getCourses(),
        getLessons()
      ]);
      setCourses(data);
      
      const counts: Record<number, number> = {};
      allLessons.forEach(lesson => {
        counts[lesson.courseId] = (counts[lesson.courseId] || 0) + 1;
      });
      setLessonCounts(counts);
      
      setLoading(false);
    } catch (err) { console.error(err); setLoading(false); }
  };

  useEffect(() => { fetchCourses(); }, []);

  const handleOpenModal = (course: Course | null = null) => {
    if (course) {
      setIsEditMode(true);
      setEditingId(course.id);
      setFormData({
        title: course.title, 
        description: course.description,
        price: course.price || 0, 
        category: course.category || 'Programming',
        level: course.level || 'Beginner', 
        duration: course.duration || '',
        instructor: course.instructor || '', 
        thumbnail: course.thumbnail || ''
      });
    } else {
      setIsEditMode(false);
      setFormData(initialForm);
    }
    setIsModalOpen(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
        ...formData,
        price: Number(formData.price), 
        instructor: formData.instructor || 'Mai Sơn Việt', 
    }
    try {
      if (isEditMode) {
        await updateCourse(editingId!, payload);
      } else {
        await createCourse(payload);
      }
      toast.success(isEditMode ? 'Cập nhật thành công!' : 'Thêm khóa học thành công!', {
        style: { background: '#333', color: '#fff' }
      });
      setIsModalOpen(false);
      fetchCourses();
    } catch (err) { 
        console.error(err); 
        toast.error('Lỗi mạng hoặc kết nối server.');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa khóa học này? Hành động này không thể hoàn tác.')) {
      try {
        await deleteCourse(id);
        setCourses(courses.filter(c => c.id !== id));
        toast.success('Đã xóa khóa học', { style: { background: '#333', color: '#fff' } });
      } catch (err) { console.error(err); }
    }
  };

  const filtered = courses.filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0a0a0f]/60 backdrop-blur-xl p-6 rounded-2xl border border-white/5 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-purple-600/10 blur-[80px] rounded-full pointer-events-none group-hover:bg-purple-600/20 transition-all"></div>
        
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Quản lý khóa học</h2>
          <p className="text-sm text-slate-400 mt-1">Xem, thêm, sửa và xóa các khóa học trên hệ thống.</p>
        </div>
        
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-64 group/search">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/search:text-purple-400 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Tìm kiếm khóa học..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-black/20 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 text-white placeholder-slate-500 transition-all outline-none" 
            />
          </div>
          
          <button 
            onClick={() => handleOpenModal(null)} 
            className="shrink-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:from-purple-500 hover:to-pink-500 transition-all shadow-lg shadow-purple-500/25 active:scale-95 border border-purple-400/20"
          >
            <Plus size={18} /> <span className="hidden sm:block font-medium">Thêm mới</span>
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-[#0a0a0f]/60 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/40 border-b border-white/10">
                <th className="p-5 text-xs font-semibold text-slate-300 uppercase tracking-wider w-16">ID</th>
                <th className="p-5 text-xs font-semibold text-slate-300 uppercase tracking-wider">Khóa học</th>
                <th className="p-5 text-xs font-semibold text-slate-300 uppercase tracking-wider">Giá</th>
                <th className="p-5 text-xs font-semibold text-slate-300 uppercase tracking-wider">Học viên</th>
                <th className="p-5 text-xs font-semibold text-slate-300 uppercase tracking-wider text-center">Số bài học</th>
                <th className="p-5 text-xs font-semibold text-slate-300 uppercase tracking-wider text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="relative w-10 h-10 mb-4">
                        <div className="absolute inset-0 rounded-full border-t-2 border-purple-500 animate-spin"></div>
                      </div>
                      <span className="text-slate-400">Đang tải dữ liệu...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400">
                    <AlertCircle className="w-8 h-8 mx-auto mb-3 opacity-50" />
                    Không tìm thấy khóa học nào
                  </td>
                </tr>
              ) : (
                filtered.map(course => (
                  <tr key={course.id} className="hover:bg-white/5 transition-colors group">
                    <td className="p-5 text-slate-500 text-sm font-medium">#{course.id}</td>
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-white/10">
                          <img src={course.thumbnail || 'https://via.placeholder.com/150'} alt={course.title} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-200 group-hover:text-purple-400 transition-colors">{course.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{course.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-5 text-emerald-400 font-medium">
                      {course.price ? course.price.toLocaleString() : '0'} đ
                    </td>
                    <td className="p-5">
                      <span className="bg-white/10 text-slate-300 px-2.5 py-1 rounded-md text-xs font-medium border border-white/5">
                        {course.students || 0}
                      </span>
                    </td>
                    <td className="p-5 text-center">
                      <span className="bg-purple-500/10 text-purple-400 px-2.5 py-1 rounded-md text-xs font-medium border border-purple-500/20">
                        {lessonCounts[course.id] || 0} bài
                      </span>
                    </td>
                    <td className="p-5 flex gap-2 justify-end">
                      <button 
                        onClick={() => navigate(`/admin/courses/${course.id}/content`)} 
                        className="p-2 text-indigo-400 hover:text-white bg-indigo-500/10 hover:bg-indigo-500 border border-transparent hover:border-indigo-400 rounded-lg transition-all"
                        title="Quản lý bài học & Quiz"
                      >
                        <BookOpen size={16}/>
                      </button>
                      <button 
                        onClick={() => handleOpenModal(course)} 
                        className="p-2 text-blue-400 hover:text-white bg-blue-500/10 hover:bg-blue-500 border border-transparent hover:border-blue-400 rounded-lg transition-all"
                        title="Chỉnh sửa"
                      >
                        <Edit size={16}/>
                      </button>
                      <button 
                        onClick={() => handleDelete(course.id)} 
                        className="p-2 text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500 border border-transparent hover:border-red-400 rounded-lg transition-all"
                        title="Xóa"
                      >
                        <Trash2 size={16}/>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modern Glass Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="bg-[#0a0a0f] border border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
            
            <div className="flex justify-between items-center p-6 border-b border-white/10 bg-white/5">
              <h3 className="text-xl font-bold text-white tracking-tight">
                {isEditMode ? 'Chỉnh sửa khóa học' : 'Thêm khóa học mới'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="overflow-y-auto p-6 custom-scrollbar">
              <form id="course-form" onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Tiêu đề khóa học</label>
                  <input 
                    name="title" required placeholder="Nhập tiêu đề..." value={formData.title} onChange={handleChange} 
                    className="w-full p-3 bg-black/30 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 text-white placeholder-slate-600 transition-all outline-none" 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Mô tả chi tiết</label>
                  <textarea 
                    name="description" placeholder="Nhập mô tả khóa học..." value={formData.description} onChange={handleChange} rows={3}
                    className="w-full p-3 bg-black/30 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 text-white placeholder-slate-600 transition-all outline-none resize-none" 
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Giá (VNĐ)</label>
                    <input 
                      name="price" type="number" placeholder="Ví dụ: 500000" value={formData.price} onChange={handleChange} 
                      className="w-full p-3 bg-black/30 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 text-white placeholder-slate-600 transition-all outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Thời lượng</label>
                    <input 
                      name="duration" placeholder="Ví dụ: 10 giờ 30 phút" value={formData.duration} onChange={handleChange} 
                      className="w-full p-3 bg-black/30 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 text-white placeholder-slate-600 transition-all outline-none" 
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Danh mục</label>
                    <input 
                      name="category" placeholder="Ví dụ: Lập trình Web" value={formData.category} onChange={handleChange} 
                      className="w-full p-3 bg-black/30 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 text-white placeholder-slate-600 transition-all outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Cấp độ</label>
                    <input 
                      name="level" placeholder="Ví dụ: Cơ bản" value={formData.level} onChange={handleChange} 
                      className="w-full p-3 bg-black/30 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 text-white placeholder-slate-600 transition-all outline-none" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Giảng viên</label>
                  <input 
                    name="instructor" placeholder="Tên giảng viên..." value={formData.instructor} onChange={handleChange} 
                    className="w-full p-3 bg-black/30 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 text-white placeholder-slate-600 transition-all outline-none" 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Ảnh thu nhỏ (URL)</label>
                  <input 
                    name="thumbnail" placeholder="https://example.com/image.jpg" value={formData.thumbnail} onChange={handleChange} 
                    className="w-full p-3 bg-black/30 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 text-white placeholder-slate-600 transition-all outline-none" 
                  />
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-white/10 bg-black/20 flex justify-end gap-3 shrink-0">
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)} 
                className="px-5 py-2.5 rounded-xl font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors border border-transparent hover:border-white/10"
              >
                Hủy
              </button>
              <button 
                form="course-form"
                type="submit" 
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2.5 rounded-xl font-medium hover:from-purple-500 hover:to-pink-500 transition-all shadow-lg shadow-purple-500/25 active:scale-95 border border-purple-400/20"
              >
                {isEditMode ? 'Lưu thay đổi' : 'Tạo khóa học'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}