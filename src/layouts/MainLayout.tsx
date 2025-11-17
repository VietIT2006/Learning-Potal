import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      {/* Thêm padding top để nội dung không bị Navbar che mất */}
      <main className="flex-grow pt-16"> 
        <Outlet />
      </main>
      
      {/* Thêm Footer đơn giản */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4">
        <div className="max-w-7xl mx-auto text-center text-sm">
          <p>&copy; 2024 LearnHub. Nền tảng học tập trực tuyến hàng đầu.</p>
        </div>
      </footer>
    </div>
  );
}

export default MainLayout;