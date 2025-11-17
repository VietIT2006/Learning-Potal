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
// ... (phần còn lại giữ nguyên)
}