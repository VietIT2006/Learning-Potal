import React from 'react';

interface CertificateProps {
  studentName: string;
  courseName: string;
  date: string;
  isTop1?: boolean;
}

const Certificate: React.FC<CertificateProps> = ({ studentName, courseName, date, isTop1 }) => {
  return (
    <div
      id="certificate-container"
      className="p-12 text-center relative"
      style={{
        width: '800px',
        height: '600px',
        margin: '0 auto',
        backgroundColor: '#ffffff',
        color: '#1f2937',
        border: isTop1 ? '12px solid #ca8a04' : '10px solid #1e3a8a',
        boxSizing: 'border-box',
        backgroundImage: isTop1 ? 'linear-gradient(135deg, #fef9c3 0%, #fef08a 100%)' : 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }}
    >
      <div 
        className="absolute inset-0 m-3"
        style={{ pointerEvents: 'none', border: isTop1 ? '4px dashed #ca8a04' : '4px solid #eab308' }}
      ></div>

      <div className="mt-8">
        <h1 className="text-4xl font-extrabold tracking-widest uppercase mb-4" style={{ fontFamily: 'Georgia, serif', color: isTop1 ? '#854d0e' : '#1e3a8a' }}>
          CHỨNG CHỈ HOÀN THÀNH {isTop1 && 'VIP'}
        </h1>
        <p className="text-lg italic mb-8" style={{ color: isTop1 ? '#a16207' : '#6b7280' }}>
          Chứng chỉ này được trao tặng cho
        </p>

        <h2 className="text-5xl font-bold mb-8 capitalize" style={{ fontFamily: '"Brush Script MT", cursive, serif', color: '#d97706' /* amber-600 */ }}>
          {studentName}
        </h2>

        <p className="text-lg mb-4" style={{ color: isTop1 ? '#a16207' : '#4b5563' }}>
          Vì đã xuất sắc hoàn thành khóa học:
        </p>
        <h3 className="text-3xl font-bold mb-12" style={{ color: isTop1 ? '#854d0e' : '#1e3a8a' }}>
          {courseName}
        </h3>

        <div className="flex justify-between items-end mt-16 px-12">
          <div className="text-center">
            <p className="w-40 mb-2 pb-1 font-semibold text-lg" style={{ borderBottom: '2px solid', borderColor: isTop1 ? '#ca8a04' : '#9ca3af' }}>{date}</p>
            <p className="text-sm font-medium uppercase" style={{ color: isTop1 ? '#a16207' : '#6b7280' }}>Ngày cấp</p>
          </div>
          
          <div className="text-center">
            <p className="w-40 mb-2 pb-1 font-bold italic text-2xl" style={{ borderBottom: '2px solid', borderColor: isTop1 ? '#ca8a04' : '#9ca3af', fontFamily: '"Brush Script MT", cursive', color: isTop1 ? '#854d0e' : '#1e3a8a' }}>LearnHub</p>
            <p className="text-sm font-medium uppercase" style={{ color: isTop1 ? '#a16207' : '#6b7280' }}>Giám đốc trung tâm</p>
          </div>
        </div>

        {/* Decorative seal */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2">
            <div className="w-24 h-24 rounded-full flex items-center justify-center" 
                 style={{ 
                   border: isTop1 ? '4px solid #854d0e' : '4px solid #eab308', 
                   backgroundColor: isTop1 ? '#facc15' : '#fef9c3',
                   boxShadow: isTop1 ? '0 0 20px rgba(202,138,4,0.5)' : 'none'
                 }}>
                <span className={`font-bold text-center tracking-wider uppercase ${isTop1 ? 'text-sm' : 'text-xs'}`}
                      style={{ color: isTop1 ? '#713f12' : '#ca8a04' }}>
                  {isTop1 ? <>TOP 1<br/>VIP</> : <>LearnHub<br/>Certified</>}
                </span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Certificate;
