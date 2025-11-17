import React, { useState, useEffect, FormEvent } from 'react'; // Sửa ở đây
import axios from 'axios';
import {
  Container, Typography, Button, Paper, Box,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Modal, TextField, IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

// Định nghĩa kiểu
interface Course {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
}
type CourseForm = Omit<Course, 'id'> & { id?: number };

function CourseManagement() {
  const [courses, setCourses] = useState<Course[]>([]); // Sửa ở đây
  const [open, setOpen] = useState(false);
  const [currentCourse, setCurrentCourse] = useState<CourseForm>({ title: '', description: '', thumbnail: '' }); // Sửa ở đây
  const [isEditMode, setIsEditMode] = useState(false);

  const fetchCourses = async () => {
    const res = await axios.get('http://localhost:3001/courses');
    setCourses(res.data);
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // Sửa ở đây
  const handleOpen = (course: Course | null = null) => {
    if (course) {
      setCurrentCourse(course);
      setIsEditMode(true);
    } else {
      setCurrentCourse({ title: '', description: '', thumbnail: '' });
      setIsEditMode(false);
    }
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  // Sửa ở đây
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        await axios.put(`http://localhost:3001/courses/${currentCourse.id}`, currentCourse);
      } else {
        await axios.post('http://localhost:3001/courses', { ...currentCourse, id: Date.now() });
      }
      fetchCourses();
      handleClose();
    } catch (error) {
      console.error("Lỗi khi submit:", error);
    }
  };

  // Sửa ở đây
  const handleDelete = async (id: number) => {
    if (window.confirm("Bạn có chắc muốn xóa?")) {
      try {
        await axios.delete(`http://localhost:3001/courses/${id}`);
        fetchCourses();
      } catch (error) {
        console.error("Lỗi khi xóa:", error);
      }
    }
  };

  return (
    <Container>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Quản lý Khóa học</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Thêm Khóa học
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tiêu đề</TableCell>
              <TableCell>Mô tả</TableCell>
              <TableCell align="right">Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {courses.map((course) => (
              <TableRow key={course.id}>
                <TableCell>{course.title}</TableCell>
                <TableCell>{course.description.substring(0, 50)}...</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleOpen(course)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(course.id)}>
                    <DeleteIcon color="error" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Modal open={open} onClose={handleClose}>
        <Box sx={modalStyle} component="form" onSubmit={handleSubmit}>
          <Typography variant="h6" gutterBottom>
            {isEditMode ? 'Chỉnh sửa' : 'Thêm mới'} Khóa học
          </Typography>
          <TextField
            label="Tiêu đề"
            fullWidth
            required
            margin="normal"
            value={currentCourse.title}
            onChange={(e) => setCurrentCourse({ ...currentCourse, title: e.target.value })}
          />
          <TextField
            label="Mô tả"
            fullWidth
            margin="normal"
            value={currentCourse.description}
            onChange={(e) => setCurrentCourse({ ...currentCourse, description: e.target.value })}
          />
          <TextField
            label="Link ảnh bìa"
            fullWidth
            margin="normal"
            value={currentCourse.thumbnail}
            onChange={(e) => setCurrentCourse({ ...currentCourse, thumbnail: e.target.value })}
          />
          <Button type="submit" variant="contained" sx={{ mt: 2 }}>
            Lưu
          </Button>
        </Box>
      </Modal>
    </Container>
  );
}

export default CourseManagement;