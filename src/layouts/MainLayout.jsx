import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar'; // Bạn tự tạo component Navbar đơn giản
import { Container } from '@mui/material';

function MainLayout() {
  return (
    <>
      <Navbar />
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Outlet /> {/* Đây là nơi nội dung của page con (Home, Detail...) được render */}
      </Container>
    </>
  );
}
export default MainLayout;