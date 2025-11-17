import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer'; // Import Footer

function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      {/* Thêm padding top để nội dung không bị Navbar che mất */}
      <main className="flex-grow pt-16"> 
        <Outlet />
      </main>
      <Footer /> {/* Sử dụng Footer Component */}
    </div>
  );
}

export default MainLayout;