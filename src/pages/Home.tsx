import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Grid, Container, Typography } from '@mui/material';
import CourseCard from '../components/CourseCard';

// Định nghĩa kiểu Course
interface Course {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
}

function HomePage() {
  const [courses, setCourses] = useState<Course[]>([]); // Sửa ở đây
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get('http://localhost:3001/courses');
        setCourses(response.data);
      } catch (error) {
        console.error("Lỗi khi tải khóa học:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

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
            <CourseCard course={course} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default HomePage;