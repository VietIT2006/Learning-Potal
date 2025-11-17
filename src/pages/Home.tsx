import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Grid, Container, Typography } from '@mui/material';
import CourseCard from '../components/CourseCard'; // Component bạn tự tạo

function HomePage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dùng useEffect và Axios để gọi API (CLO1)
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        // Gọi đến mock API đã tạo
        const response = await axios.get('http://localhost:3001/courses');
        setCourses(response.data);
      } catch (error) {
        console.error("Lỗi khi tải khóa học:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []); // [] nghĩa là chỉ chạy 1 lần khi component mount

  if (loading) {
    return <Typography>Đang tải dữ liệu...</Typography>;
  }

  return (
    <Container>
      <Typography variant="h4" gutterBottom sx={{ mt: 3 }}>
        Danh sách khóa học
      </Typography>
      <Grid container spacing={3}>
        {courses.map(course => (
          <Grid item xs={12} sm={6} md={4} key={course.id}>
            {/* Truyền dữ liệu vào component con */}
            <CourseCard course={course} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default HomePage;