import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container, Typography, Button, Paper, Box,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Modal, TextField, IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

// Style cho Modal (cửa sổ pop-up)
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

function CourseManagement() {
  const [courses, setCourses] = useState([]);
  const [open, setOpen] = useState(false); // Trạng thái mở/đóng Modal
  const [currentCourse, setCurrentCourse] = useState({ title: '', description: '', thumbnail: '' });
  const [isEditMode, setIsEditMode] = useState(false);

  // 1. READ: Tải danh sách khóa học
  const fetchCourses = async () => {
    const res = await axios.get('http://localhost:3001/courses');
    setCourses(res.data);
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // 2. Mở Modal
  const handleOpen = (course = null) => {
    if (course) {
      // Chế độ Edit
      setCurrentCourse(course);
      setIsEditMode(true);
    } else {
      // Chế độ Add
      setCurrentCourse({ title: '', description: '', thumbnail: '' });
      setIsEditMode(false);
    }
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  // 3. Xử lý Submit (Create & Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        // UPDATE (PUT)
        await axios.put(`http://localhost:3001/courses/${currentCourse.id}`, currentCourse);
      } else {
        // CREATE (POST)
        await axios.post('http://localhost:3001/courses', { ...currentCourse, id: Date.now() }); // Dùng Date.now() để tạo id giả
      }
      fetchCourses(); // Tải lại dữ liệu
      handleClose(); // Đóng modal
    } catch (error) {
      console.error("Lỗi khi submit:", error);
    }
  };

  // 4. DELETE
  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa?")) {
      try {
        await axios.delete(`http://localhost:3001/courses/${id}`);
        fetchCourses(); // Tải lại dữ liệu
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

      {/* Bảng hiển thị dữ liệu */}
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

      {/* Modal cho Add/Edit */}
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