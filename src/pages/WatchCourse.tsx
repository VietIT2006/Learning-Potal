import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Box, Grid, Typography, List, ListItem, ListItemText, Paper } from '@mui/material';

// Định nghĩa kiểu
interface Lesson {
  id: number;
  courseId: number;
  title: string;
  videoUrl: string;
}

function WatchCoursePage() {
  const { courseId, lessonId } = useParams();
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null); // Sửa ở đây
  const [allLessons, setAllLessons] = useState<Lesson[]>([]); // Sửa ở đây

  useEffect(() => {
    axios.get(`http://localhost:3001/lessons/${lessonId}`)
      .then(res => setCurrentLesson(res.data))
      .catch(err => console.error(err));
    axios.get(`http://localhost:3001/lessons?courseId=${courseId}`)
      .then(res => setAllLessons(res.data))
      .catch(err => console.error(err));
  }, [courseId, lessonId]);

  if (!currentLesson) return <Typography>Đang tải bài học...</Typography>;

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={9}>
        <Paper elevation={3}>
          <Box
            sx={{
              position: 'relative',
              paddingTop: '56.25%',
              backgroundColor: '#000',
              borderRadius: '4px',
              overflow: 'hidden'
            }}
          >
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
                selected={lesson.id === parseInt(lessonId!)} // Sửa ở đây
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