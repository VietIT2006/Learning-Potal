# Supabase Migration Guide

Guide để migrate data từ `db.json` sang Supabase.

## Prerequisites

1. Một tài khoản Supabase (đăng ký tại https://supabase.com)
2. Node.js >= 16
3. npm hoặc yarn

## Setup Steps

### 1. Tạo Supabase Project

1. Đăng nhập vào [Supabase Dashboard](https://app.supabase.com)
2. Tạo project mới
3. Chờ project khởi động (2-3 phút)
4. Lấy thông tin kết nối từ Settings > API

### 2. Chuẩn bị Database Schema

**Option A: Sử dụng SQL Editor (Recommended)**

1. Vào Supabase Dashboard > SQL Editor
2. Tạo query mới
3. Copy-paste toàn bộ nội dung từ `schema.sql`
4. Nhấn "Run"

**Option B: Sử dụng Migrations**

```bash
# Copy schema.sql vào thư mục migrations
cp supabase/schema.sql supabase/migrations/001_init_schema.sql
```

### 3. Cài đặt Dependencies

```bash
npm install @supabase/supabase-js dotenv
```

### 4. Cấu hình Environment Variables

Tạo file `.env.local` trong thư mục project:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-anon-or-service-role-key
```

Lấy các giá trị này từ:
- **SUPABASE_URL**: Supabase Dashboard > Settings > API > Project URL
- **SUPABASE_KEY**: Supabase Dashboard > Settings > API > Project API keys
  - Sử dụng `anon` key cho public access
  - Sử dụng `service_role` key cho admin operations (với constraints)

### 5. Chạy Migration

```bash
# Compile TypeScript (nếu cần)
npx tsc supabase/migrate.ts

# Chạy migration
node supabase/migrate.js

# Hoặc sử dụng ts-node nếu đã cài đặt
npx ts-node supabase/migrate.ts
```

### 6. Xác Minh Data

Kiểm tra data đã được migrate thành công:

```bash
# Vào Supabase Dashboard > Table Editor
# Kiểm tra từng table:
# - users
# - courses
# - user_courses
# - lessons
# - quizzes
# - testimonials
# - progresses
# - orders
# - quiz_results
```

## Cách kết nối ứng dụng React với Supabase

```typescript
// supabaseClient.ts
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
```

```typescript
// Hook để lấy courses
import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

export function useCourses() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCourses = async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
      
      if (error) console.error(error)
      else setCourses(data)
      
      setLoading(false)
    }

    fetchCourses()
  }, [])

  return { courses, loading }
}
```

## Các Queries Thường Dùng

### Lấy khóa học của một user

```typescript
const { data } = await supabase
  .from('user_courses')
  .select('course_id')
  .eq('user_id', userId)
```

### Lấy progress của user

```typescript
const { data } = await supabase
  .from('progresses')
  .select('*')
  .eq('user_id', userId)
```

### Lấy bài tập của một khóa học

```typescript
const { data } = await supabase
  .from('lessons')
  .select('*')
  .eq('course_id', courseId)
  .order('order', { ascending: true })
```

### Thêm enrollment mới

```typescript
const { data, error } = await supabase
  .from('user_courses')
  .insert([
    { user_id: userId, course_id: courseId }
  ])
```

## Troubleshooting

### "Relation does not exist"
- Kiểm tra schema.sql đã được chạy thành công
- Đảm bảo các tên table khớp với code

### "Permission denied"
- Kiểm tra RLS (Row Level Security) policy
- Vào Supabase Dashboard > Authentication > Policies
- Cấu hình phù hợp cho ứng dụng

### "Foreign key constraint violation"
- Đảm bảo các referenced records tồn tại
- Kiểm tra trình tự insert: users trước, rồi courses, rồi user_courses

## Security Notes

- Không commit `.env.local` vào git
- Sử dụng `service_role` key chỉ cho admin operations
- Cấu hình RLS policies để bảo vệ dữ liệu nhạy cảm
- Sử dụng Supabase Auth cho authentication
