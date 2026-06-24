import { supabase } from './supabaseClient'

// ============================================================
// Helper: snake_case → camelCase conversion
// ============================================================
function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
}

function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
}

function mapKeys<T>(obj: any, mapper: (key: string) => string): T {
  if (obj === null || obj === undefined) return obj
  if (Array.isArray(obj)) return obj.map(item => mapKeys(item, mapper)) as any
  if (typeof obj !== 'object') return obj
  const result: any = {}
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const newKey = mapper(key)
      result[newKey] = obj[key]
    }
  }
  return result
}

function fromDb<T>(data: any): T {
  return mapKeys<T>(data, toCamelCase)
}

function toDb(data: any): any {
  return mapKeys(data, toSnakeCase)
}

// ============================================================
// USERS
// ============================================================
export interface User {
  id: number
  username: string
  password?: string
  role: string
  fullname: string
  email: string
  phone: string
  joinDate: string
  status: 'active' | 'inactive' | string
  balance?: number
  coursesEnrolledCount: number
  coursesEnrolled: number[]
  avatarUrl?: string
}

export async function getUsers(filters?: { username?: string; password?: string; role?: string }): Promise<User[]> {
  let query = supabase.from('users').select('*, user_courses(course_id)')
  if (filters?.username) query = query.eq('username', filters.username)
  if (filters?.password) query = query.eq('password', filters.password)
  if (filters?.role) query = query.eq('role', filters.role)

  const { data, error } = await query
  if (error) throw error

  const users = (data || []).map(row => {
    const userDb = { ...row }
    const coursesEnrolled = (userDb.user_courses || []).map((e: any) => e.course_id)
    delete userDb.user_courses

    const user = fromDb<User>(userDb)
    user.coursesEnrolled = coursesEnrolled
    return user
  })

  return users
}

export async function getUserById(id: number): Promise<User | null> {
  const users = await getUsers()
  return users.find(u => u.id === id) || null
}

export async function loginUser(username: string, password: string): Promise<User | null> {
  const users = await getUsers({ username, password })
  return users.length > 0 ? users[0] : null
}

export async function registerUser(info: {
  username: string
  password: string
  fullname: string
  email: string
  phone?: string
}): Promise<{ message: string; user?: { username: string; id: number } }> {
  // Check existing
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .or(`username.eq.${info.username},email.eq.${info.email}`)
    .limit(1)

  if (existing && existing.length > 0) {
    throw new Error('Tên đăng nhập hoặc Email đã tồn tại')
  }

  const newId = Math.floor(Math.random() * 2000000000)
  const { error } = await supabase.from('users').insert({
    id: newId,
    username: info.username,
    password: info.password,
    fullname: info.fullname,
    email: info.email,
    phone: info.phone || null,
    role: 'user',
    status: 'active',
    join_date: new Date().toISOString().split('T')[0],
    courses_enrolled_count: 0,
  })

  if (error) throw error
  return { message: 'Đăng ký thành công', user: { username: info.username, id: newId } }
}

export async function deleteUser(id: number): Promise<void> {
  const { error } = await supabase.from('users').delete().eq('id', id)
  if (error) throw error
}

export async function updateUserProfile(id: number, updates: { full_name?: string, phone?: string, avatar_url?: string }): Promise<void> {
  const { error } = await supabase.from('users').update(updates).eq('id', id);
  if (error) throw error;
}

// ============================================================
// COURSES
// ============================================================
export interface Course {
  id: number
  title: string
  description: string
  thumbnail: string
  category: string
  level: string
  price: number
  rating: number
  reviews: number
  students: number
  duration: string
  instructor: string
  createdAt: string
}

export async function getCourses(): Promise<Course[]> {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .order('id', { ascending: true })
  if (error) throw error
  return fromDb<Course[]>(data || [])
}

export async function getCourseById(id: number): Promise<Course | null> {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return fromDb<Course>(data)
}

export async function createCourse(courseData: Partial<Course>): Promise<void> {
  const id = Math.floor(Math.random() * 2000000000)
  const dbData = toDb({ ...courseData, id })
  const { error } = await supabase.from('courses').insert(dbData)
  if (error) throw error
}

export async function updateCourse(id: number, courseData: Partial<Course>): Promise<void> {
  const dbData = toDb(courseData)
  delete dbData.id // Don't update id
  const { error } = await supabase.from('courses').update(dbData).eq('id', id)
  if (error) throw error
}

export async function deleteCourse(id: number): Promise<void> {
  const { error } = await supabase.from('courses').delete().eq('id', id)
  if (error) throw error
}

// ============================================================
// LESSONS
// ============================================================
export interface Lesson {
  id: number
  courseId: number
  title: string
  videoUrl: string
  duration: string
  lessonOrder: number
}

export async function getLessons(courseId?: number): Promise<Lesson[]> {
  let query = supabase.from('lessons').select('*')
  if (courseId) query = query.eq('course_id', courseId)
  query = query.order('order', { ascending: true })

  const { data, error } = await query
  if (error) throw error
  return (data || []).map(d => {
      const mapped = fromDb<any>(d)
      mapped.lessonOrder = d.order
      return mapped as Lesson
  })
}

export async function getLessonById(id: number): Promise<Lesson | null> {
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return fromDb<Lesson>(data)
}

export async function createLesson(lessonData: { courseId: number; title: string; videoUrl?: string; duration?: string }): Promise<void> {
  // Get max id
  const { data: allLessons } = await supabase.from('lessons').select('id').order('id', { ascending: false }).limit(1)
  const maxId = allLessons && allLessons.length > 0 ? allLessons[0].id : 0
  const newId = maxId + 1

  // Get lesson order
  const { data: courseLessons } = await supabase
    .from('lessons')
    .select('order')
    .eq('course_id', lessonData.courseId)
    .order('order', { ascending: false })
    .limit(1)
  const nextOrder = courseLessons && courseLessons.length > 0 ? courseLessons[0].order + 1 : 1

  const { error } = await supabase.from('lessons').insert({
    id: newId,
    course_id: lessonData.courseId,
    title: lessonData.title,
    video_url: lessonData.videoUrl || null,
    duration: lessonData.duration || null,
    order: nextOrder,
  })
  if (error) throw error
}

export async function deleteLesson(id: number): Promise<void> {
  const { error } = await supabase.from('lessons').delete().eq('id', id)
  if (error) throw error
}

// ============================================================
// QUIZZES (with questions & options from separate tables)
// ============================================================
export interface QuizQuestion {
  id: string
  questionText: string
  options: string[]
  correctAnswerIndex: number
}

export interface Quiz {
  id: number
  lessonId: number
  title: string
  questions: QuizQuestion[]
}

export async function getQuizzes(lessonId?: number): Promise<Quiz[]> {
  let query = supabase.from('quizzes').select('*, quiz_questions(*, quiz_options(*))')
  if (lessonId) query = query.eq('lesson_id', lessonId)

  const { data, error } = await query
  if (error) throw error
  if (!data || data.length === 0) return []

  const quizzes: Quiz[] = data.map((quizData: any) => {
    const sortedQuestions = (quizData.quiz_questions || []).sort((a: any, b: any) => a.id - b.id)
    const questions = sortedQuestions.map((q: any) => {
      const sortedOptions = (q.quiz_options || []).sort((a: any, b: any) => a.option_index - b.option_index)
      return {
        id: q.question_code,
        questionText: q.question_text,
        options: sortedOptions.map((o: any) => o.option_text),
        correctAnswerIndex: q.correct_answer_index,
      }
    })

    return {
      id: quizData.id,
      lessonId: quizData.lesson_id,
      title: quizData.title,
      questions,
    }
  })
  return quizzes
}

export async function getQuizById(id: number): Promise<Quiz | null> {
  const { data, error } = await supabase
    .from('quizzes')
    .select('*, quiz_questions(*, quiz_options(*))')
    .eq('id', id)
    .single()
  if (error) return null
  if (!data) return null

  const sortedQuestions = (data.quiz_questions || []).sort((a: any, b: any) => a.id - b.id)
  const questions = sortedQuestions.map((q: any) => {
    const sortedOptions = (q.quiz_options || []).sort((a: any, b: any) => a.option_index - b.option_index)
    return {
      id: q.question_code,
      questionText: q.question_text,
      options: sortedOptions.map((o: any) => o.option_text),
      correctAnswerIndex: q.correct_answer_index,
    }
  })

  return {
    id: data.id,
    lessonId: data.lesson_id,
    title: data.title,
    questions,
  }
}

export async function createQuiz(quizData: Quiz): Promise<void> {
  // Insert quiz
  const { error: quizError } = await supabase.from('quizzes').insert({
    id: quizData.id,
    lesson_id: quizData.lessonId,
    title: quizData.title,
  })
  if (quizError) throw quizError

  // Insert questions and options
  for (const q of quizData.questions) {
    const { data: insertedQ, error: qError } = await supabase
      .from('quiz_questions')
      .insert({
        quiz_id: quizData.id,
        question_code: q.id,
        question_text: q.questionText,
        correct_answer_index: q.correctAnswerIndex,
      })
      .select('id')
      .single()
    if (qError) throw qError

    if (q.options && q.options.length > 0) {
      const optionsToInsert = q.options.map((text, index) => ({
        question_id: insertedQ.id,
        option_index: index,
        option_text: text,
      }))
      const { error: oError } = await supabase.from('quiz_options').insert(optionsToInsert)
      if (oError) throw oError
    }
  }
}

export async function updateQuiz(id: number, quizData: Quiz): Promise<void> {
  // Update quiz title
  const { error: quizError } = await supabase
    .from('quizzes')
    .update({ title: quizData.title, lesson_id: quizData.lessonId })
    .eq('id', id)
  if (quizError) throw quizError

  // Delete old questions (cascade will delete options too)
  await supabase.from('quiz_questions').delete().eq('quiz_id', id)

  // Re-insert questions and options
  for (const q of quizData.questions) {
    const { data: insertedQ, error: qError } = await supabase
      .from('quiz_questions')
      .insert({
        quiz_id: id,
        question_code: q.id,
        question_text: q.questionText,
        correct_answer_index: q.correctAnswerIndex,
      })
      .select('id')
      .single()
    if (qError) throw qError

    if (q.options && q.options.length > 0) {
      const optionsToInsert = q.options.map((text, index) => ({
        question_id: insertedQ.id,
        option_index: index,
        option_text: text,
      }))
      const { error: oError } = await supabase.from('quiz_options').insert(optionsToInsert)
      if (oError) throw oError
    }
  }
}

export interface QuizSubmission {
  userId: number
  quizId: number
  lessonId: number
  userAnswers: { questionId: string; selectedAnswerIndex: number }[]
}

export interface QuizResult {
  passed: boolean
  score: number
  message: string
  progressPercentage: number | null
  totalLessons: number | null
  courseId?: number
}

export async function submitQuiz(submission: QuizSubmission): Promise<QuizResult> {
  // Get the quiz with correct answers
  const quiz = await getQuizById(submission.quizId)
  if (!quiz) throw new Error('Quiz not found')

  // Grade the quiz
  let correctCount = 0
  const totalQuestions = quiz.questions.length

  for (const answer of submission.userAnswers) {
    const question = quiz.questions.find(q => q.id === answer.questionId)
    if (question && question.correctAnswerIndex === answer.selectedAnswerIndex) {
      correctCount++
    }
  }

  const passed = correctCount >= Math.ceil(totalQuestions * 0.6) // Pass at 60%
  const score = correctCount

  // Get lesson to find courseId
  const lesson = await getLessonById(submission.lessonId)
  const courseId = lesson?.courseId

  // If passed, mark lesson as complete and save result
  let progressPercentage: number | null = null
  let totalLessons: number | null = null

  if (passed && courseId) {
    const progress = await completeLesson(submission.userId, courseId, submission.lessonId)
    progressPercentage = progress?.progressPercentage ?? null

    const lessons = await getLessons(courseId)
    totalLessons = lessons.length
  }

  // Save quiz result
  const resultId = Math.floor(Math.random() * 2000000000)
  await supabase.from('quiz_results').insert({
    id: resultId,
    unique_id: `${submission.lessonId}-${submission.userId}`,
    lesson_id: submission.lessonId,
    user_id: submission.userId,
    score: correctCount,
    total_questions: totalQuestions,
    completed_at: new Date().toISOString(),
  })

  // Save individual answers
  const answersToInsert = submission.userAnswers.map((a, idx) => ({
    quiz_result_id: resultId,
    question_index: idx,
    selected_option_index: a.selectedAnswerIndex,
  }))
  if (answersToInsert.length > 0) {
    await supabase.from('quiz_result_answers').insert(answersToInsert)
  }

  return {
    passed,
    score: correctCount,
    message: passed
      ? `Chúc mừng! Bạn đã đạt ${correctCount}/${totalQuestions} câu đúng.`
      : `Bạn đạt ${correctCount}/${totalQuestions} câu đúng. Cần đạt ${Math.ceil(totalQuestions * 0.6)} câu để qua.`,
    progressPercentage,
    totalLessons,
    courseId,
  }
}

// ============================================================
// ENROLLMENT
// ============================================================
export async function enrollUser(userId: number, courseId: number): Promise<void> {
  // Check if already enrolled
  const { data: existing } = await supabase
    .from('user_courses')
    .select('user_id')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .limit(1)

  if (existing && existing.length > 0) return // Already enrolled

  // Add to user_courses
  const { error } = await supabase
    .from('user_courses')
    .insert({ user_id: userId, course_id: courseId })
  if (error) throw error

  // Update courses_enrolled_count
  try {
    await supabase.rpc('increment_enrolled_count', { user_id_param: userId });
  } catch (err) {
    // Fallback: manual update if RPC doesn't exist
    const { data } = await supabase
      .from('users')
      .select('courses_enrolled_count')
      .eq('id', userId)
      .single();
    const newCount = (data?.courses_enrolled_count || 0) + 1;
    await supabase.from('users').update({ courses_enrolled_count: newCount }).eq('id', userId);
  }

  // Create initial progress record
  const progressId = Math.floor(Math.random() * 2000000000); // Prevent INT overflow
  await supabase.from('progresses').insert({
    id: progressId,
    user_id: userId,
    course_id: courseId,
    progress_percentage: 0,
    unique_id: `${userId}-${courseId}`,
  })
}

export async function getUserEnrolledCourses(userId: number): Promise<any[]> {
  const { data, error } = await supabase
    .from('user_courses')
    .select(`
      progress_percentage,
      course_id,
      courses (
        id,
        title,
        thumbnail,
        description,
        level,
        students
      )
    `)
    .eq('user_id', userId);

  if (error) throw error;
  
  // Format data
  return (data || []).map((item: any) => ({
    progress: item.progress_percentage || 0,
    course: item.courses
  }));
}

// ============================================================
// PROGRESS
// ============================================================
export interface Progress {
  completedLessons: number[]
  progressPercentage: number
}

export async function getProgress(userId: number, courseId: number): Promise<Progress> {
  const { data: progressData } = await supabase
    .from('progresses')
    .select('*')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .single()

  if (!progressData) return { completedLessons: [], progressPercentage: 0 }

  // Get completed lessons
  const { data: completedData } = await supabase
    .from('progress_completed_lessons')
    .select('lesson_id')
    .eq('progress_id', progressData.id)

  return {
    completedLessons: (completedData || []).map((c: any) => c.lesson_id),
    progressPercentage: progressData.progress_percentage || 0,
  }
}

export async function completeLesson(userId: number, courseId: number, lessonId: number): Promise<Progress | null> {
  // Get or create progress
  let { data: progressData } = await supabase
    .from('progresses')
    .select('*')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .single()

  if (!progressData) {
    const newId = Math.floor(Math.random() * 2000000000)
    const { data: newProgress, error } = await supabase
      .from('progresses')
      .insert({
        id: newId,
        user_id: userId,
        course_id: courseId,
        progress_percentage: 0,
        unique_id: `${userId}-${courseId}`,
      })
      .select()
      .single()
    if (error) throw error
    progressData = newProgress
  }

  // Check if lesson already completed
  const { data: existing } = await supabase
    .from('progress_completed_lessons')
    .select('lesson_id')
    .eq('progress_id', progressData.id)
    .eq('lesson_id', lessonId)
    .limit(1)

  if (!existing || existing.length === 0) {
    // Add completed lesson
    await supabase.from('progress_completed_lessons').insert({
      progress_id: progressData.id,
      lesson_id: lessonId,
    })
  }

  // Get all completed lessons count
  const { data: allCompleted } = await supabase
    .from('progress_completed_lessons')
    .select('lesson_id')
    .eq('progress_id', progressData.id)

  // Get total lessons in course
  const { data: totalLessonsData } = await supabase
    .from('lessons')
    .select('id')
    .eq('course_id', courseId)

  const completedCount = allCompleted?.length || 0
  const totalCount = totalLessonsData?.length || 0
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  // Update progress percentage in progresses table
  await supabase
    .from('progresses')
    .update({ progress_percentage: percentage })
    .eq('id', progressData.id)

  // Also update progress percentage in user_courses table
  await supabase
    .from('user_courses')
    .update({ progress_percentage: percentage })
    .eq('user_id', userId)
    .eq('course_id', courseId)

  return {
    completedLessons: (allCompleted || []).map((c: any) => c.lesson_id),
    progressPercentage: percentage,
  }
}

// ============================================================
// TESTIMONIALS
// ============================================================
export interface Testimonial {
  id: number
  name: string
  role: string
  avatar: string
  content: string
  rating: number
}

export async function getTestimonials(): Promise<Testimonial[]> {
  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .order('id', { ascending: true })
  if (error) throw error
  return fromDb<Testimonial[]>(data || [])
}

export async function createTestimonial(testimonialData: Partial<Testimonial>): Promise<void> {
  const { error } = await supabase.from('testimonials').insert({
    id: testimonialData.id || Math.floor(Math.random() * 2000000000),
    name: testimonialData.name,
    role: testimonialData.role,
    avatar: testimonialData.avatar,
    content: testimonialData.content,
    rating: testimonialData.rating,
  })
  if (error) throw error
}

// ============================================================
// GLOBAL ANNOUNCEMENTS (Stored in Testimonials)
// ============================================================
export async function getGlobalAnnouncement(): Promise<{ content: string, isActive: boolean, level: string } | null> {
  const { data, error } = await supabase
    .from('testimonials')
    .select('content, rating, name')
    .eq('role', 'GLOBAL_ANNOUNCEMENT')
    .limit(1)
    .single();

  if (error || !data) return null;
  return { 
    content: data.content, 
    isActive: data.rating === 1,
    level: data.name || 'info' // Use 'name' to store the level
  };
}

export async function saveGlobalAnnouncement(content: string, isActive: boolean, level: string = 'info'): Promise<void> {
  const { data: existing } = await supabase
    .from('testimonials')
    .select('id')
    .eq('role', 'GLOBAL_ANNOUNCEMENT')
    .limit(1)
    .single();

  if (existing) {
    const { error } = await supabase
      .from('testimonials')
      .update({ content, rating: isActive ? 1 : 0, name: level })
      .eq('id', existing.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from('testimonials').insert({
      id: Math.floor(Math.random() * 2000000000),
      name: level,
      role: 'GLOBAL_ANNOUNCEMENT',
      avatar: '',
      content,
      rating: isActive ? 1 : 0,
    });
    if (error) throw error;
  }
}

// ============================================================
// WALLET AND TRANSACTIONS
// ============================================================

export async function getUserTransactions(userId: number): Promise<any[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function verifyAndDeposit(userId: number, orderCode: number, amount: number): Promise<boolean> {
  // Check if transaction already exists
  const { data: existingTx } = await supabase
    .from('transactions')
    .select('id')
    .like('description', `%Mã GD: ${orderCode}%`)
    .limit(1);

  if (existingTx && existingTx.length > 0) {
    return false; // Already deposited
  }

  // Record transaction
  const { error: txError } = await supabase.from('transactions').insert({
    user_id: userId,
    amount: amount,
    type: 'deposit',
    description: `Nạp tiền qua PayOS (Mã GD: ${orderCode})`
  });

  if (txError) throw txError;

  // Update user balance
  const { data: user } = await supabase.from('users').select('balance').eq('id', userId).single();
  const currentBalance = user?.balance || 0;
  
  const { error: updateError } = await supabase.from('users').update({ balance: currentBalance + amount }).eq('id', userId);
  if (updateError) throw updateError;
  
  return true;
}

export async function adminDeposit(userId: number, amount: number, description: string = 'Admin cộng tiền'): Promise<boolean> {
  // 1. Get current balance
  const { data: user } = await supabase.from('users').select('balance').eq('id', userId).single();
  const currentBalance = user?.balance || 0;

  // 2. Add transaction
  const { error: txError } = await supabase.from('transactions').insert({
    user_id: userId,
    amount: amount,
    type: 'deposit',
    description: description
  });
  if (txError) throw txError;

  // 3. Update balance
  const { error: updateError } = await supabase.from('users').update({ balance: currentBalance + amount }).eq('id', userId);
  if (updateError) throw updateError;

  return true;
}

export async function purchaseCourseWithBalance(userId: number, courseId: number, price: number): Promise<boolean> {
  // 1. Check balance
  const { data: user } = await supabase.from('users').select('balance').eq('id', userId).single();
  const currentBalance = user?.balance || 0;

  if (currentBalance < price) {
    throw new Error('Số dư không đủ. Vui lòng nạp thêm tiền!');
  }

  // 2. Deduct balance
  const { error: updateError } = await supabase.from('users').update({ balance: currentBalance - price }).eq('id', userId);
  if (updateError) throw updateError;

  try {
    // 3. Record transaction
    const { error: txError } = await supabase.from('transactions').insert({
      user_id: userId,
      amount: price,
      type: 'purchase',
      description: `Mua khóa học ID ${courseId}`
    });
    if (txError) throw txError;

    // 4. Enroll user
    await enrollUser(userId, courseId);
  } catch (err) {
    // Rollback balance if anything fails
    await supabase.from('users').update({ balance: currentBalance }).eq('id', userId);
    throw err;
  }

  return true;
}

// ============================================================
// ANALYTICS (HISTORY)
// ============================================================

export async function getAllTransactionsForAnalytics(): Promise<any[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*, users(*)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getAllOrdersForAnalytics(): Promise<any[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*, users(*), courses(title)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getAllQuizResultsForAnalytics(): Promise<any[]> {
  const { data, error } = await supabase
    .from('quiz_results')
    .select('*, users(*), lessons(title, courses(title))')
    .order('completed_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getTopDepositors(limit: number = 3): Promise<any[]> {
  // Get all deposits
  const { data, error } = await supabase
    .from('transactions')
    .select('user_id, amount, users(*)')
    .eq('type', 'deposit');

  if (error) throw error;

  // Aggregate by user
  const userMap = new Map();
  data?.forEach(tx => {
    const uid = tx.user_id;
    if (!userMap.has(uid)) {
      const uArray: any = tx.users || {};
      const u: any = Array.isArray(uArray) ? uArray[0] : uArray;
      userMap.set(uid, {
        userId: uid,
        fullname: u?.full_name || u?.fullname || 'Học viên ẩn danh',
        avatarUrl: u?.avatar_url || u?.avatarUrl,
        totalDeposit: 0
      });
    }
    userMap.get(uid).totalDeposit += Number(tx.amount || 0);
  });

  // Sort and limit
  const sorted = Array.from(userMap.values()).sort((a, b) => b.totalDeposit - a.totalDeposit);
  return sorted.slice(0, limit);
}

export async function uploadAvatar(userId: number, file: File): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}_${Date.now()}.${fileExt}`;
  
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(fileName, file, { upsert: true });

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage
    .from('avatars')
    .getPublicUrl(fileName);

  return data.publicUrl;
}
