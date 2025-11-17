import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Search } from 'lucide-react';

// Định nghĩa kiểu dữ liệu cho Course
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
  rating: number;
}

const CourseManagement = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // State cho Modal thêm mới
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // State lưu dữ liệu form
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 0,
    category: 'Programming',
    level: 'Beginner',
    duration: '',
    instructor: '',
    thumbnail: ''
  });

  // 1. Lấy danh sách khóa học từ API
  const fetchCourses = async () => {
    try {
      const response = await fetch('http://localhost:3001/courses');
      const data = await response.json();
      setCourses(data);
      setLoading(false);
    } catch (error) {
      console.error("Lỗi khi tải khóa học:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // 2. Xử lý thay đổi input trong form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' ? Number(value) : value
    }));
  };

  // 3. Gửi dữ liệu lên Server (Thêm mới)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3001/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          rating: 0,    // Giá trị mặc định
          students: 0,  // Giá trị mặc định
          reviews: 0
        }),
      });

      if (response.ok) {
        alert('Thêm khóa học thành công!');
        setIsModalOpen(false); // Đóng modal
        fetchCourses(); // Tải lại danh sách
        // Reset form
        setFormData({
          title: '', description: '', price: 0, category: 'Programming',
          level: 'Beginner', duration: '', instructor: '', thumbnail: ''
        });
      } else {
        alert('Có lỗi xảy ra!');
      }
    } catch (error) {
      console.error("Lỗi kết nối:", error);
    }
  };

  // 4. Xóa khóa học
  const handleDelete = async (id: number) => {
    if (window.confirm('Bạn có chắc muốn xóa khóa học này?')) {
      try {
        await fetch(`http://localhost:3001/courses/${id}`, { method: 'DELETE' });
        setCourses(courses.filter(course => course.id !== id));
      } catch (error) {
        console.error("Lỗi khi xóa:", error);
      }
    }
  };

  // Lọc khóa học theo tìm kiếm
  const filteredCourses = courses.filter(course => 
    course.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header & Thanh công cụ */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Quản lý khóa học</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus size={20} />
          Thêm khóa học mới
        </button>
      </div>

      {/* Thanh tìm kiếm */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Tìm kiếm khóa học..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Bảng danh sách */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-4 font-semibold text-gray-600">ID</th>
              <th className="p-4 font-semibold text-gray-600">Khóa học</th>
              <th className="p-4 font-semibold text-gray-600">Giá</th>
              <th className="p-4 font-semibold text-gray-600">Học viên</th>
              <th className="p-4 font-semibold text-gray-600">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={5} className="p-4 text-center">Đang tải...</td></tr>
            ) : (
              filteredCourses.map((course) => (
                <tr key={course.id} className="hover:bg-gray-50">
                  <td className="p-4 text-gray-500">#{course.id}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img src={course.thumbnail || 'https://via.placeholder.com/50'} alt="" className="w-10 h-10 rounded object-cover" />
                      <div>
                        <p className="font-medium text-gray-800">{course.title}</p>
                        <p className="text-sm text-gray-500">{course.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-green-600 font-medium">
                    {course.price === 0 ? 'Miễn phí' : `${course.price.toLocaleString()} đ`}
                  </td>
                  <td className="p-4 text-gray-600">{course.students}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(course.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* --- MODAL FORM (Giao diện giống trong ảnh của bạn) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl m-4 overflow-hidden">
            
            {/* Header Modal */}
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-bold text-gray-800">Thêm khóa học mới</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            {/* Body Modal */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề khóa học</label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Ví dụ: ReactJS Từ Cơ Bản Đến Nâng Cao"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả ngắn</label>
                <textarea
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Mô tả nội dung khóa học..."
                />
              </div>

              {/* 2 Cột: Giá & Danh mục */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giá (VNĐ)</label>
                  <input
                    type="number"
                    name="price"
                    min="0"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="Programming">Lập trình</option>
                    <option value="Design">Thiết kế</option>
                    <option value="Business">Kinh doanh</option>
                    <option value="Marketing">Marketing</option>
                  </select>
                </div>
              </div>

              {/* 2 Cột: Trình độ & Thời lượng */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trình độ</label>
                  <select
                    name="level"
                    value={formData.level}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="Beginner">Cơ bản</option>
                    <option value="Intermediate">Trung bình</option>
                    <option value="Advanced">Nâng cao</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Thời lượng</label>
                  <input
                    type="text"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    placeholder="VD: 10 giờ 30 phút"
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* 2 Cột: Giảng viên & Ảnh */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giảng viên</label>
                  <input
                    type="text"
                    name="instructor"
                    value={formData.instructor}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL Ảnh bìa (Thumbnail)</label>
                  <input
                    type="text"
                    name="thumbnail"
                    value={formData.thumbnail}
                    onChange={handleInputChange}
                    placeholder="https://..."
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
              
              {/* Preview ảnh nếu có link */}
              {formData.thumbnail && (
                <div className="mt-2">
                   <p className="text-xs text-gray-500 mb-1">Xem trước ảnh:</p>
                   <img src={formData.thumbnail} alt="Preview" className="h-20 w-auto rounded border" />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 font-medium"
                >
                  Thêm khóa học
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseManagement;