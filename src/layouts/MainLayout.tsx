import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function MainLayout() {
  return (
    // THAY ĐỔI: Sử dụng bg-transparent để hiện lớp gradient-bg phía sau
    <div className="min-h-screen flex flex-col bg-transparent text-slate-200">
      <Navbar />
      {/* Nội dung chính */}
      <main className="flex-grow pt-16"> 
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default MainLayout;