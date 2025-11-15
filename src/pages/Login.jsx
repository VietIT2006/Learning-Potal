import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Container, Box, TextField, Button, Typography, Paper } from '@mui/material';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    login(username, password);
  };

  return (
    <Container maxWidth="xs">
      <Paper elevation={3} sx={{ mt: 8, p: 4 }}>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          <Typography variant="h4" component="h1" gutterBottom>
            Đăng nhập
          </Typography>
          <TextField
            label="Tên đăng nhập"
            variant="outlined"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            label="Mật khẩu"
            type="password"
            variant="outlined"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit" variant="contained" size="large">
            Đăng nhập
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default LoginPage;