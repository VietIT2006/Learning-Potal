import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load .env file
dotenv.config();

// Supabase configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env file');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Read db.json
const dbPath = path.join(process.cwd(), 'db.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

async function migrateData() {
  try {
    console.log('🚀 Starting migration to Supabase...\n');

    // 1. Migrate Users
    console.log('📥 Migrating users...');
    if (db.users && db.users.length > 0) {
      const { error: userError } = await supabase
        .from('users')
        .insert(db.users);
      if (userError) throw new Error(`Users migration failed: ${userError.message}`);
      console.log(`✅ Migrated ${db.users.length} users\n`);
    }

    // 2. Migrate Courses
    console.log('📥 Migrating courses...');
    if (db.courses && db.courses.length > 0) {
      const { error: courseError } = await supabase
        .from('courses')
        .insert(db.courses);
      if (courseError) throw new Error(`Courses migration failed: ${courseError.message}`);
      console.log(`✅ Migrated ${db.courses.length} courses\n`);
    }

    // 3. Migrate User Courses
    console.log('📥 Migrating user enrollments...');
    if (db.user_courses && db.user_courses.length > 0) {
      const { error: userCourseError } = await supabase
        .from('user_courses')
        .insert(db.user_courses);
      if (userCourseError) throw new Error(`User courses migration failed: ${userCourseError.message}`);
      console.log(`✅ Migrated ${db.user_courses.length} enrollments\n`);
    }

    // 4. Migrate Lessons
    console.log('📥 Migrating lessons...');
    if (db.lessons && db.lessons.length > 0) {
      const { error: lessonError } = await supabase
        .from('lessons')
        .insert(db.lessons);
      if (lessonError) throw new Error(`Lessons migration failed: ${lessonError.message}`);
      console.log(`✅ Migrated ${db.lessons.length} lessons\n`);
    }

    // 5. Migrate Quizzes
    console.log('📥 Migrating quizzes...');
    if (db.quizzes && db.quizzes.length > 0) {
      const { error: quizError } = await supabase
        .from('quizzes')
        .insert(db.quizzes);
      if (quizError) throw new Error(`Quizzes migration failed: ${quizError.message}`);
      console.log(`✅ Migrated ${db.quizzes.length} quizzes\n`);
    }

    // 6. Migrate Testimonials
    console.log('📥 Migrating testimonials...');
    if (db.testimonials && db.testimonials.length > 0) {
      const { error: testimonialError } = await supabase
        .from('testimonials')
        .insert(db.testimonials);
      if (testimonialError) throw new Error(`Testimonials migration failed: ${testimonialError.message}`);
      console.log(`✅ Migrated ${db.testimonials.length} testimonials\n`);
    }

    // 7. Migrate Progresses
    console.log('📥 Migrating progress records...');
    if (db.progresses && db.progresses.length > 0) {
      const { error: progressError } = await supabase
        .from('progresses')
        .insert(db.progresses);
      if (progressError) throw new Error(`Progresses migration failed: ${progressError.message}`);
      console.log(`✅ Migrated ${db.progresses.length} progress records\n`);
    }

    // 8. Migrate Orders
    console.log('📥 Migrating orders...');
    if (db.orders && db.orders.length > 0) {
      const { error: orderError } = await supabase
        .from('orders')
        .insert(db.orders);
      if (orderError) throw new Error(`Orders migration failed: ${orderError.message}`);
      console.log(`✅ Migrated ${db.orders.length} orders\n`);
    }

    // 9. Migrate Quiz Results
    console.log('📥 Migrating quiz results...');
    if (db.quiz_results && db.quiz_results.length > 0) {
      const { error: quizResultError } = await supabase
        .from('quiz_results')
        .insert(db.quiz_results);
      if (quizResultError) throw new Error(`Quiz results migration failed: ${quizResultError.message}`);
      console.log(`✅ Migrated ${db.quiz_results.length} quiz results\n`);
    }

    console.log('✨ Migration completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`  - Users: ${db.users?.length || 0}`);
    console.log(`  - Courses: ${db.courses?.length || 0}`);
    console.log(`  - Enrollments: ${db.user_courses?.length || 0}`);
    console.log(`  - Lessons: ${db.lessons?.length || 0}`);
    console.log(`  - Quizzes: ${db.quizzes?.length || 0}`);
    console.log(`  - Testimonials: ${db.testimonials?.length || 0}`);
    console.log(`  - Progress Records: ${db.progresses?.length || 0}`);
    console.log(`  - Orders: ${db.orders?.length || 0}`);
    console.log(`  - Quiz Results: ${db.quiz_results?.length || 0}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('❌ Migration failed:', message);
    process.exit(1);
  }
}

// Run migration
migrateData();
