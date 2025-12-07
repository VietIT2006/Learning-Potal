import React from 'react';
import { X, CreditCard, CheckCircle } from 'lucide-react';

interface Course {
  id: number;
  title: string;
  price: number;
  thumbnail?: string;
}

interface PaymentConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course;
  onConfirm: () => void;
  isProcessing: boolean;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', minimumFractionDigits: 0 }).format(amount);
};

export default function PaymentConfirmModal({ isOpen, onClose, course, onConfirm, isProcessing }: PaymentConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-up">
        
        {/* Header */}
        <div className="bg-white border-b border-gray-100 p-4 flex justify-between items-center">
          <h3 className="font-bold text-lg text-gray-900">Xác nhận thanh toán</h3>
          <button onClick={onClose} className="hover:bg-gray-100 p-2 rounded-full transition text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="flex gap-4 mb-6">
             <img 
                src={course.thumbnail || "https://via.placeholder.com/150"} 
                alt={course.title}
                className="w-24 h-24 object-cover rounded-xl shadow-sm"
             />
             <div>
                 <h4 className="font-bold text-gray-900 line-clamp-2">{course.title}</h4>
                 <p className="text-sm text-gray-500 mt-1">Học phí trọn gói</p>
                 <p className="text-xl font-bold text-purple-600 mt-2">{formatCurrency(course.price)}</p>
             </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 mb-6">
             <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-purple-600 mt-0.5" />
                <div className="text-sm text-purple-800">
                    <p className="font-semibold">Nền tảng LearnHub from MSV thanh toántoán</p>
                    <p className="opacity-90 mt-1">Chữ tín đặt lên hàng đầuđầu</p>
                </div>
             </div>
          </div>

          {/* Buttons */}
          <div className="space-y-3">
            <button 
              onClick={onConfirm}
              disabled={isProcessing}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3.5 rounded-xl font-bold hover:shadow-lg hover:scale-[1.02] transition flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                  <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Đang tạo giao dịch...
                  </span>
              ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    Thanh toán ngay
                  </>
              )}
            </button>
            <button 
              onClick={onClose}
              disabled={isProcessing}
              className="w-full text-gray-500 py-2 hover:text-gray-700 text-sm font-medium"
            >
              Hủy bỏ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}