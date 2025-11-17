import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';

function Navbar() {
  // Logic (nếu có) để hiển thị nút Đăng nhập/Đăng xuất

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          <Button component={Link} to="/" color="inherit">
            Learning Portal
          </Button>
        </Typography>
        <Button component={Link} to="/admin" color="inherit">
          Admin
        </Button>
        <Button component={Link} to="/login" color="inherit">
          Đăng nhập
        </Button>
        {/* Thêm logic để hiển thị tên user hoặc nút Đăng xuất ở đây */}
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;