import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Home, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function PaymentResult() {
  const [searchParams] = useSearchParams();
  const { refreshUser } = useAuth();
  
  // PayOS trả về các tham số trên URL: ?code=00&id=...&status=PAID...
  const status = searchParams.get('status');
  const code = searchParams.get('code');
  const isSuccess = code === '00' && status === 'PAID';

  useEffect(() => {
    // Nếu thành công, làm mới thông tin user để cập nhật danh sách khóa học đã mua
    if (isSuccess) {
        refreshUser();
    }
  }, [isSuccess, refreshUser]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
        {isSuccess ? (
          <>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Thanh toán thành công!</h2>
            <p className="text-gray-600 mb-8">
              Cảm ơn bạn đã mua khóa học. Bạn có thể bắt đầu học ngay bây giờ.
            </p>
            <Link to="/courses" className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 transition flex items-center justify-center gap-2">
               <BookOpen className="w-5 h-5" /> Vào học ngay
            </Link>
          </>
        ) : (
          <>
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Thanh toán thất bại</h2>
            <p className="text-gray-600 mb-8">
              Giao dịch đã bị hủy hoặc xảy ra lỗi trong quá trình xử lý.
            </p>
            <Link to="/" className="w-full bg-gray-200 text-gray-800 py-3 rounded-xl font-bold hover:bg-gray-300 transition flex items-center justify-center gap-2">
               <Home className="w-5 h-5" /> Về trang chủ
            </Link>
          </>
        )}
      </div>
    </div>
  );
}