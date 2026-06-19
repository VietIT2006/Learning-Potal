-- Create Tables for Learning Portal

-- Users Table
CREATE TABLE users (
  id BIGINT PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  full_name VARCHAR(255),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  join_date DATE,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Courses Table
CREATE TABLE courses (
  id BIGINT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  thumbnail VARCHAR(500),
  category VARCHAR(100),
  level VARCHAR(50),
  price BIGINT DEFAULT 0,
  rating DECIMAL(3,1),
  reviews BIGINT DEFAULT 0,
  students BIGINT DEFAULT 0,
  duration VARCHAR(50),
  instructor VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
);

-- User Courses (Many-to-Many)
CREATE TABLE user_courses (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id),
  course_id BIGINT NOT NULL REFERENCES courses(id),
  created_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, course_id)
);

-- Lessons Table
CREATE TABLE lessons (
  id BIGINT PRIMARY KEY,
  course_id BIGINT NOT NULL REFERENCES courses(id),
  title VARCHAR(255) NOT NULL,
  video_url VARCHAR(500),
  duration VARCHAR(50),
  "order" BIGINT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Quizzes Table (with JSONB for questions)
CREATE TABLE quizzes (
  id BIGINT PRIMARY KEY,
  lesson_id BIGINT NOT NULL REFERENCES lessons(id),
  title VARCHAR(255) NOT NULL,
  questions JSONB,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Testimonials Table
CREATE TABLE testimonials (
  id BIGINT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(255),
  avatar VARCHAR(500),
  content TEXT,
  rating BIGINT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Progresses Table
CREATE TABLE progresses (
  id BIGINT PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id),
  course_id BIGINT NOT NULL REFERENCES courses(id),
  completed_lessons BIGINT[],
  progress_percentage BIGINT DEFAULT 0,
  unique_id VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Orders Table
CREATE TABLE orders (
  id BIGINT PRIMARY KEY,
  order_code BIGINT UNIQUE,
  user_id BIGINT NOT NULL REFERENCES users(id),
  course_id BIGINT NOT NULL REFERENCES courses(id),
  amount BIGINT DEFAULT 0,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Quiz Results Table
CREATE TABLE quiz_results (
  id BIGINT PRIMARY KEY,
  unique_id VARCHAR(100),
  lesson_id BIGINT NOT NULL REFERENCES lessons(id),
  user_id BIGINT NOT NULL REFERENCES users(id),
  score BIGINT DEFAULT 0,
  total_questions BIGINT,
  answers JSONB,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Create Indexes for better query performance
CREATE INDEX idx_user_courses_user_id ON user_courses(user_id);
CREATE INDEX idx_user_courses_course_id ON user_courses(course_id);
CREATE INDEX idx_lessons_course_id ON lessons(course_id);
CREATE INDEX idx_quizzes_lesson_id ON quizzes(lesson_id);
CREATE INDEX idx_progresses_user_id ON progresses(user_id);
CREATE INDEX idx_progresses_course_id ON progresses(course_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_course_id ON orders(course_id);
CREATE INDEX idx_quiz_results_user_id ON quiz_results(user_id);
CREATE INDEX idx_quiz_results_lesson_id ON quiz_results(lesson_id);
