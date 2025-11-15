import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container, Typography, Button, Paper, Box,
  Radio, RadioGroup, FormControlLabel, FormControl, FormLabel,
  CircularProgress, Alert
} from '@mui/material';

function QuizPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // Lưu { questionId: answerIndex }
  const [score, setScore] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // 1. Tải dữ liệu Quiz từ mock API
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`http://localhost:3001/quizzes/${quizId}`);
        setQuizData(res.data);
      } catch (err) {
        setError("Không thể tải được bài quiz. Vui lòng thử lại.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [quizId]);

  // 2. Xử lý khi người dùng chọn đáp án
  const handleAnswerChange = (event) => {
    const currentQuestionId = quizData.questions[currentQuestionIndex].id;
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestionId]: parseInt(event.target.value), // Lưu index của đáp án
    });
  };

  // 3. Xử lý khi nhấn nút "Tiếp theo" hoặc "Nộp bài"
  const handleNextOrSubmit = () => {
    const isLastQuestion = currentQuestionIndex === quizData.questions.length - 1;

    if (isLastQuestion) {
      // Nộp bài và chấm điểm
      let finalScore = 0;
      quizData.questions.forEach(q => {
        if (selectedAnswers[q.id] === q.correctAnswerIndex) {
          finalScore++;
        }
      });
      setScore(finalScore);
      setIsSubmitted(true);
    } else {
      // Chuyển sang câu tiếp theo
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    }
  };

  // --- Render Trạng thái ---

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!quizData || !quizData.questions) {
    return <Alert severity="warning">Không tìm thấy dữ liệu cho bài quiz này.</Alert>;
  }

  // --- Render Kết quả (Sau khi nộp bài) ---
  if (isSubmitted) {
    return (
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4, mt: 5, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>
            Hoàn thành!
          </Typography>
          <Typography variant="h5">
            Kết quả của bạn: {score} / {quizData.questions.length}
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate(-1)} // Quay lại trang trước
            sx={{ mt: 3 }}
          >
            Quay lại
          </Button>
        </Paper>
      </Container>
    );
  }

  // --- Render Câu hỏi Quiz ---
  const currentQuestion = quizData.questions[currentQuestionIndex];
  const currentAnswer = selectedAnswers[currentQuestion.id];

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 5 }}>
        <Typography variant="h4" gutterBottom>
          {quizData.title}
        </Typography>
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Câu {currentQuestionIndex + 1}/{quizData.questions.length}: {currentQuestion.questionText}
          </Typography>
          
          {/* Danh sách các lựa chọn đáp án */}
          <FormControl component="fieldset" fullWidth>
            <RadioGroup
              value={currentAnswer !== undefined ? currentAnswer.toString() : ''}
              onChange={handleAnswerChange}
            >
              {currentQuestion.options.map((option, index) => (
                <FormControlLabel
                  key={index}
                  value={index.toString()} // Giá trị của Radio là index
                  control={<Radio />}
                  label={option}
                  sx={{ mb: 1 }}
                />
              ))}
            </RadioGroup>
          </FormControl>
          
          {/* Nút điều hướng */}
          <Box sx={{ mt: 3, textAlign: 'right' }}>
            <Button
              variant="contained"
              onClick={handleNextOrSubmit}
              disabled={currentAnswer === undefined} // Vô hiệu hóa nếu chưa chọn
            >
              {currentQuestionIndex === quizData.questions.length - 1
                ? 'Nộp bài'
                : 'Câu tiếp theo'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}

export default QuizPage;