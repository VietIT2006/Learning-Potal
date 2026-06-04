# Hướng Dẫn Migration db.json → Supabase

## 📋 Tổng Quan

Bạn đã hoàn thành:
- ✅ Chuẩn hóa `db.json` theo PostgreSQL/Supabase conventions
- ✅ Tạo schema SQL cho tất cả tables
- ✅ Tạo migration script để chuyển dữ liệu

Thư mục `/supabase` hiện có:
- `schema.sql` - Định nghĩa tất cả tables
- `migrate.ts` - Script migration từ JSON → Supabase
- `migrate.sh` - Bash script để chạy migration
- `.env.example` - Template biến môi trường
- `README.md` - Tài liệu chi tiết

## 🚀 Quick Start (5 phút)

### Bước 1: Tạo Supabase Project
1. Vào https://supabase.com → Sign In
2. Click "New Project"
3. Nhập tên, chọn region gần bạn
4. Chờ project khởi động

### Bước 2: Tạo Database Schema
1. Vào Supabase Dashboard → SQL Editor
2. Click "New Query"
3. Copy-paste từ `/supabase/schema.sql`
4. Click "Run"

### Bước 3: Setup Credentials
1. Vào Supabase Dashboard → Settings → API
2. Copy **Project URL** và **anon key**
3. Tạo file `.env.local` trong thư mục project:
```env
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

### Bước 4: Chạy Migration
```bash
cd supabase
npm install @supabase/supabase-js
npx ts-node migrate.ts
```

Hoặc chạy shell script:
```bash
bash supabase/migrate.sh
```

## 📊 Các Tables Được Tạo

| Table | Mục đích | Records |
|-------|---------|---------|
| users | Tài khoản người dùng | 11 |
| courses | Các khóa học | 10 |
| user_courses | Ghi danh khóa học (M:N) | 22 |
| lessons | Bài học trong khóa | 13 |
| quizzes | Bài quiz | 10 |
| testimonials | Đánh giá từ học viên | 10 |
| progresses | Tiến độ học | 22 |
| orders | Đơn hàng | 22 |
| quiz_results | Kết quả quiz | 8 |

## 💻 Cách Sử Dụng Trong React

### 1. Cài Dependencies
```bash
npm install @supabase/supabase-js
```

### 2. Sử Dụng Client
```typescript
// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
)
```

### 3. Sử Dụng Hooks
```typescript
import { useCourses, useUserCourses } from './lib/supabaseHooks'

function CoursesPage() {
  const { courses, loading } = useCourses()
  
  if (loading) return <div>Loading...</div>
  
  return (
    <div>
      {courses.map(course => (
        <div key={course.id}>{course.title}</div>
      ))}
    </div>
  )
}
```

## 🔄 Query Examples

### Lấy tất cả khóa học
```typescript
const { data } = await supabase.from('courses').select('*')
```

### Lấy khóa học của một user
```typescript
const { data } = await supabase
  .from('user_courses')
  .select('courses(*)')
  .eq('user_id', userId)
```

### Ghi danh user vào khóa học
```typescript
await supabase.from('user_courses').insert({
  user_id: userId,
  course_id: courseId
})
```

### Cập nhật progress
```typescript
await supabase.from('progresses').upsert({
  user_id: userId,
  course_id: courseId,
  completed_lessons: [1, 2, 3],
  progress_percentage: 75
})
```

## 🔐 Security Tips

1. **Không commit `.env.local`** - Thêm vào `.gitignore`
2. **Row Level Security (RLS)** - Cấu hình policies để bảo vệ dữ liệu
3. **Authentication** - Sử dụng Supabase Auth thay vì plain passwords

## 🛠️ Troubleshooting

**Q: "Relation does not exist"**
- A: Kiểm tra schema.sql đã chạy thành công

**Q: "Permission denied"**  
- A: Cấu hình RLS policies hoặc dùng service_role key

**Q: Migration bị lỗi**
- A: Kiểm tra .env.local credentials có đúng không

## 📚 Tài Liệu Thêm

- `/supabase/README.md` - Tài liệu chi tiết
- `src/lib/supabaseHooks.ts` - Ví dụ hooks sẵn dùng
- https://supabase.com/docs - Tài liệu Supabase

## ✅ Kiểm Tra Sau Migration

1. Vào Supabase Dashboard → Table Editor
2. Kiểm tra từng table có dữ liệu không
3. Chạy query test:
```sql
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM courses;
SELECT COUNT(*) FROM user_courses;
```

Xong! 🎉 Dữ liệu bạn đã lên Supabase, có thể xóa db.json và sử dụng Supabase client trong React app.
