import React from 'react';
import { Card, CardContent, CardMedia, Typography, Button, CardActions } from '@mui/material';
import { Link } from 'react-router-dom';

// Định nghĩa kiểu cho 1 khóa học
interface Course {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
}

// Định nghĩa kiểu cho props
interface CourseCardProps {
  course: Course;
}

function CourseCard({ course }: CourseCardProps) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardMedia
        component="img"
        height="140"
        image={course.thumbnail} // Lấy ảnh từ API
        alt={course.title}
      />
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          {course.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {course.description}
        </Typography>
      </CardContent>
      <CardActions>
        <Button 
          size="small" 
          component={Link} // Biến Button thành thẻ Link
          to={`/course/${course.id}`} // Điều hướng đến trang chi tiết
        >
          Xem chi tiết
        </Button>
      </CardActions>
    </Card>
  );
}

export default CourseCard;