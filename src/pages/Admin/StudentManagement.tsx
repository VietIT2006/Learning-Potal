import React, { useState, useEffect } from 'react';
import { Search, Download, Plus, Mail, Phone, Calendar, Edit, Trash2, X, User, Lock } from 'lucide-react';

interface Student {
  id: number;
  fullname: string;
  username: string;
  email: string;
  phone?: string;
  joinDate?: string;
  status?: 'active' | 'inactive';
  coursesEnrolled?: number;
  role: string;
  password?: string; // Dùng khi tạo mới
}

export default function StudentManagement() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // State cho Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Form data mặc định
  const initialFormState = {
    fullname: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    status: 'active' as 'active' | 'inactive'
  };
  const [formData, setFormData] = useState(initialFormState);
  const [editingId, setEditingId] = useState<number | null>(null);

  // 1. Lấy danh sách học viên
  const fetchStudents = async () => {
    try {
      const res = await fetch('http://localhost:3001/users?role=user');
      const data = await res.json();
      setStudents(data);
      setLoading(false);
    } catch (error) {
      console.error("Lỗi tải học viên:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // 2. Xử lý mở Modal
  const handleOpenModal = (student: Student | null = null) => {
    if (student) {
      // Chế độ sửa
      setFormData({
        fullname: student.fullname,
        username: student.username,
        email: student.email,
        phone: student.phone || '',
        password: student.password || '',
        status: student.status || 'active'
      });
      setEditingId(student.id);
      setIsEditMode(true);
    } else {
      // Chế độ thêm mới
      setFormData(initialFormState);
      setIsEditMode(false);
    }
    setIsModalOpen(true);
  };

  // 3. Xử lý Submit Form (Thêm hoặc Sửa)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = isEditMode 
        ? `http://localhost:3001/users/${editingId}` 
        : 'http://localhost:3001/users';
      
      const method = isEditMode ? 'PUT' : 'POST';

      const body = {
        ...formData,
        role: 'user', // Luôn set role là user
        joinDate: isEditMode ? undefined : new Date().toISOString().split('T')[0], // Ngày hiện tại nếu tạo mới
        coursesEnrolled: isEditMode ? undefined : 0
      };

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        alert(isEditMode ? 'Cập nhật thành công!' : 'Thêm học viên thành công!');
        setIsModalOpen(false);
        fetchStudents();
      } else {
        alert('Có lỗi xảy ra!');
      }
    } catch (error) {
      console.error("Lỗi submit:", error);
    }
  };

  // 4. Xóa học viên
  const handleDelete = async (id: number) => {
    if (window.confirm('Bạn có chắc muốn xóa học viên này? Hành động này không thể hoàn tác.')) {
      try {
        await fetch(`http://localhost:3001/users/${id}`, { method: 'DELETE' });
        setStudents(students.filter(s => s.id !== id));
      } catch (error) {
        alert('Có lỗi xảy ra khi xóa!');
      }
    }
  };

  const filteredStudents = students.filter(s => 
    s.fullname.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Toolbar */}
      <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm học viên..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition text-sm font-medium"
            onClick={() => handleOpenModal(null)}
          >
            <Plus className="w-4 h-4" /> Thêm học viên
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50/50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">Học viên</th>
              <th className="px-6 py-4">Liên hệ</th>
              <th className="px-6 py-4">Ngày tham gia</th>
              <th className="px-6 py-4">Trạng thái</th>
              <th className="px-6 py-4 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredStudents.map((student) => (
              <tr key={student.id} className="hover:bg-gray-50/50 transition group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-sm">
                      {student.fullname.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{student.fullname}</p>
                      <p className="text-xs text-gray-500">@{student.username}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-3 h-3" /> {student.email}
                    </div>
                    {student.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-3 h-3" /> {student.phone}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    {student.joinDate || 'N/A'}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    student.status === 'inactive' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {student.status === 'inactive' ? 'Bị khóa' : 'Hoạt động'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleOpenModal(student)}
                      className="p-2 hover:bg-gray-100 rounded-lg text-blue-600 hover:text-blue-700"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(student.id)}
                      className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- MODAL FORM --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b bg-gray-50">
              <h3 className="text-lg font-bold text-gray-900">
                {isEditMode ? 'Chỉnh sửa thông tin' : 'Thêm học viên mới'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                   <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                   <input required type="text" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                      value={formData.fullname} onChange={e => setFormData({...formData, fullname: e.target.value})} />
                </div>

                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Tên đăng nhập</label>
                   <div className="relative">
                     <User className="absolute left-2 top-2.5 w-4 h-4 text-gray-400" />
                     <input required type="text" className="w-full pl-8 p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                        value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
                   </div>
                </div>

                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
                   <div className="relative">
                     <Lock className="absolute left-2 top-2.5 w-4 h-4 text-gray-400" />
                     <input required={!isEditMode} type="text" className="w-full pl-8 p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                        value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} 
                        placeholder={isEditMode ? "Giữ nguyên nếu không đổi" : ""} />
                   </div>
                </div>

                <div className="col-span-2">
                   <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                   <input required type="email" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                      value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>

                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                   <input type="text" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                      value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>

                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                   <select className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                      value={formData.status} 
                      onChange={(e) => setFormData({...formData, status: e.target.value as 'active' | 'inactive'})}>
                      <option value="active">Hoạt động</option>
                      <option value="inactive">Bị khóa</option>
                   </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t mt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Hủy</button>
                <button type="submit" className="px-4 py-2 text-white bg-purple-600 rounded-lg hover:bg-purple-700 font-medium">
                  {isEditMode ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}