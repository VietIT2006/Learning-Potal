import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Search, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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

  // 1. Lấy danh sách khóa học
  const fetchCourses = async () => {
    try {
      // SỬA URL THÀNH /api
      const res = await fetch('/api/courses');
      const data = await res.json();
      setCourses(data);
      setLoading(false);
    } catch (err) { console.error(err); setLoading(false); }
  };

  useEffect(() => { fetchCourses(); }, []);

  // 2. Mở Modal
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

  // 4. Submit Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
        ...formData,
        price: Number(formData.price), 
        instructor: formData.instructor || 'Mai Sơn Việt', 
    }

    try {
      // SỬA URL THÀNH /api
      const url = isEditMode 
        ? `/api/courses/${editingId}` 
        : '/api/courses';
      
      const method = isEditMode ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert(isEditMode ? 'Cập nhật thành công!' : 'Thêm khóa học thành công!');
        setIsModalOpen(false);
        fetchCourses();
      } else {
         const errorData = await res.json();
         alert(`Lỗi khi lưu: ${errorData.details || errorData.error || 'Lỗi không xác định'}`);
      }
    } catch (err) { 
        console.error(err); 
        alert('Lỗi mạng hoặc kết nối server.');
    }
  };

  // 5. Xóa Khóa học
  const handleDelete = async (id: number) => {
    if (window.confirm('Xóa khóa học này?')) {
      try {
        // SỬA URL THÀNH /api
        await fetch(`/api/courses/${id}`, { method: 'DELETE' });
        setCourses(courses.filter(c => c.id !== id));
      } catch (err) { console.error(err); }
    }
  };

  const filtered = courses.filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Quản lý khóa học</h2>
        <button onClick={() => handleOpenModal(null)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700">
          <Plus size={20} /> Thêm mới
        </button>
      </div>

      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input type="text" placeholder="Tìm kiếm..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4">ID</th><th className="p-4">Khóa học</th><th className="p-4">Giá</th><th className="p-4">Học viên</th><th className="p-4">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={5} className="p-4 text-center">Đang tải...</td></tr> : filtered.map(course => (
              <tr key={course.id} className="hover:bg-gray-50 border-b">
                <td className="p-4 text-gray-500">#{course.id}</td>
                <td className="p-4 font-medium">{course.title}</td>
                <td className="p-4 text-green-600">{course.price ? course.price.toLocaleString() : '0'} đ</td>
                <td className="p-4">{course.students || 0}</td>
                <td className="p-4 flex gap-2">
                  <button 
                    onClick={() => navigate(`/admin/courses/${course.id}/content`)} 
                    className="p-2 text-purple-600 hover:bg-purple-50 rounded"
                    title="Quản lý bài học & Quiz"
                  >
                    <BookOpen size={18}/>
                  </button>
                  <button onClick={() => handleOpenModal(course)} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Edit size={18}/></button>
                  <button onClick={() => handleDelete(course.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 size={18}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl m-4 overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-bold">{isEditMode ? 'Chỉnh sửa khóa học' : 'Thêm khóa học'}</h3>
              <button onClick={() => setIsModalOpen(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <input name="title" required placeholder="Tiêu đề" value={formData.title} onChange={handleChange} className="w-full p-2 border rounded" />
              <textarea name="description" placeholder="Mô tả" value={formData.description} onChange={handleChange} className="w-full p-2 border rounded" />
              <div className="grid grid-cols-2 gap-4">
                <input name="price" type="text" placeholder="Giá" value={String(formData.price)} onChange={handleChange} className="w-full p-2 border rounded" />
                <input name="duration" placeholder="Thời lượng" value={formData.duration} onChange={handleChange} className="w-full p-2 border rounded" />
              </div>
              <input name="instructor" placeholder="Tên Giảng viên" value={formData.instructor} onChange={handleChange} className="w-full p-2 border rounded" />
              <input name="thumbnail" placeholder="Link ảnh thumbnail" value={formData.thumbnail} onChange={handleChange} className="w-full p-2 border rounded" />
              <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Lưu</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}