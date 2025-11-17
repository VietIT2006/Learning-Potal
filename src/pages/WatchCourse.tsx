import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Box, Grid, Typography, List, ListItem, ListItemText, Paper } from '@mui/material';

function WatchCoursePage() {
  const { courseId, lessonId } = useParams();
  const [currentLesson, setCurrentLesson] = useState(null);
  const [allLessons, setAllLessons] = useState([]);

  useEffect(() => {
    // Lấy bài học hiện tại
    axios.get(`http://localhost:3001/lessons/${lessonId}`)
      .then(res => setCurrentLesson(res.data))
      .catch(err => console.error(err));

    // Lấy tất cả bài học của khóa
    axios.get(`http://localhost:3001/lessons?courseId=${courseId}`)
      .then(res => setAllLessons(res.data))
      .catch(err => console.error(err));
      
  }, [courseId, lessonId]);

  if (!currentLesson) return <Typography>Đang tải bài học...</Typography>;

  return (
    <Grid container spacing={2}>
      {/* Cột trái: Video Player */}
      <Grid item xs={12} md={9}>
        <Paper elevation={3}>
          {/* Mô phỏng trình phát video */}
          <Box
            sx={{
              position: 'relative',
              paddingTop: '56.25%', // Tỉ lệ 16:9
              backgroundColor: '#000',
              borderRadius: '4px',
              overflow: 'hidden'
            }}
          >
            {/* Trong thực tế, bạn sẽ dùng thẻ <video> hoặc thư viện như ReactPlayer
              <video controls src={currentLesson.videoUrl} style={{...}} />
            */}
            <Typography
              variant="h6"
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                color: 'white'
              }}
            >
              (Mô phỏng video: {currentLesson.videoUrl})
            </Typography>
          </Box>
          <Box sx={{ p: 2 }}>
            <Typography variant="h4">{currentLesson.title}</Typography>
          </Box>
        </Paper>
      </Grid>

      {/* Cột phải: Danh sách bài học */}
      <Grid item xs={12} md={3}>
        <Typography variant="h6" gutterBottom>Danh sách bài học</Typography>
        <Paper>
          <List component="nav">
            {allLessons.map(lesson => (
              <ListItem
                button
                key={lesson.id}
                component={Link}
                to={`/watch/${courseId}/lesson/${lesson.id}`}
                selected={lesson.id === parseInt(lessonId)} // Highlight bài hiện tại
              >
                <ListItemText primary={lesson.title} />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Grid>
    </Grid>
  );
}

export default WatchCoursePage;