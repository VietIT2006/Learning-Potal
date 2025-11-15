import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Container, Typography, Button, Grid, Paper, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';

function CourseDetailPage() {
  const { id } = useParams(); // Lấy id từ URL
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Lấy thông tin khóa học
        const courseRes = await axios.get(`http://localhost:3001/courses/${id}`);
        setCourse(courseRes.data);

        // Lấy các bài học thuộc khóa học đó
        const lessonsRes = await axios.get(`http://localhost:3001/lessons?courseId=${id}`);
        setLessons(lessonsRes.data);
      } catch (error) {
        console.error("Lỗi:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return <Typography>Đang tải...</Typography>;
  if (!course) return <Typography>Không tìm thấy khóa học.</Typography>;

  return (
    <Container>
      <Grid container spacing={4}>
        {/* Cột trái: Thông tin khóa học */}
        <Grid item xs={12} md={8}>
          <Typography variant="h3" component="h1" gutterBottom>
            {course.title}
          </Typography>
          <img src={course.thumbnail} alt={course.title} style={{ width: '100%', borderRadius: '8px' }} />
          <Typography variant="body1" sx={{ mt: 2 }}>
            {course.description}
          </Typography>
        </Grid>

        {/* Cột phải: Danh sách bài học */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h5" gutterBottom>Nội dung khóa học</Typography>
            <List>
              {lessons.map((lesson) => (
                <ListItem 
                  button 
                  key={lesson.id} 
                  component={Link} 
                  to={`/watch/${course.id}/lesson/${lesson.id}`}
                >
                  <ListItemIcon>
                    <PlayCircleOutlineIcon />
                  </ListItemIcon>
                  <ListItemText primary={lesson.title} />
                </ListItem>
              ))}
            </List>
            <Button variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
              Ghi danh ngay
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default CourseDetailPage;