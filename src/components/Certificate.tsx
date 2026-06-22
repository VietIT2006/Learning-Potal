import React from 'react';

interface CertificateProps {
  studentName: string;
  courseName: string;
  date: string;
}

const Certificate: React.FC<CertificateProps> = ({ studentName, courseName, date }) => {
  return (
    <div
      id="certificate-container"
      className="p-12 text-center relative shadow-2xl"
      style={{
        width: '800px',
        height: '600px',
        margin: '0 auto',
        backgroundColor: '#ffffff',
        color: '#1f2937', // text-gray-800
        border: '10px solid #1e3a8a', // Dark blue border
        boxSizing: 'border-box',
        backgroundImage: 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)',
      }}
    >
      <div 
        className="absolute inset-0 m-3"
        style={{ pointerEvents: 'none', border: '4px solid #eab308' /* yellow-500 */ }}
      ></div>

      <div className="mt-8">
        <h1 className="text-4xl font-extrabold tracking-widest uppercase mb-4" style={{ fontFamily: 'Georgia, serif', color: '#1e3a8a' }}>
          CHỨNG CHỈ HOÀN THÀNH
        </h1>
        <p className="text-lg italic mb-8" style={{ color: '#6b7280' /* gray-500 */ }}>
          Chứng chỉ này được trao tặng cho
        </p>

        <h2 className="text-5xl font-bold mb-8 capitalize" style={{ fontFamily: '"Brush Script MT", cursive, serif', color: '#d97706' /* amber-600 */ }}>
          {studentName}
        </h2>

        <p className="text-lg mb-4" style={{ color: '#4b5563' /* gray-600 */ }}>
          Vì đã xuất sắc hoàn thành khóa học:
        </p>
        <h3 className="text-3xl font-bold mb-12" style={{ color: '#1e3a8a' }}>
          {courseName}
        </h3>

        <div className="flex justify-between items-end mt-16 px-12">
          <div className="text-center">
            <p className="border-b-2 w-40 mb-2 pb-1 font-semibold text-lg" style={{ borderColor: '#9ca3af' /* gray-400 */ }}>{date}</p>
            <p className="text-sm font-medium uppercase" style={{ color: '#6b7280' /* gray-500 */ }}>Ngày cấp</p>
          </div>
          
          <div className="text-center">
            <p className="border-b-2 w-40 mb-2 pb-1 font-bold italic text-2xl" style={{ borderColor: '#9ca3af', fontFamily: '"Brush Script MT", cursive', color: '#1e3a8a' }}>LearnHub</p>
            <p className="text-sm font-medium uppercase" style={{ color: '#6b7280' /* gray-500 */ }}>Giám đốc trung tâm</p>
          </div>
        </div>

        {/* Decorative seal */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2">
            <div className="w-24 h-24 rounded-full flex items-center justify-center" style={{ border: '4px solid #eab308', backgroundColor: '#fef9c3' /* yellow-100 */ }}>
                <span className="font-bold text-center text-xs tracking-wider uppercase" style={{ color: '#ca8a04' /* yellow-600 */ }}>LearnHub<br/>Certified</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Certificate;
