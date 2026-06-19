#!/bin/bash

# Quick Migration Script
# Chạy migration từ db.json sang Supabase

echo "🚀 Learning Portal - Supabase Migration"
echo "========================================\n"

# 1. Check if .env.local exists
if [ ! -f .env.local ]; then
  echo "❌ .env.local file not found!"
  echo "📝 Please create .env.local with your Supabase credentials:"
  echo ""
  echo "SUPABASE_URL=https://your-project-id.supabase.co"
  echo "SUPABASE_KEY=your-anon-key"
  echo ""
  exit 1
fi

# 2. Check if dependencies are installed
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install @supabase/supabase-js
fi

# 3. Run migration
echo "🔄 Starting data migration..."
echo ""

# Load environment variables
export $(cat .env.local | xargs)

# Run the migration script
npx ts-node supabase/migrate.ts

echo ""
echo "✅ Migration script execution completed!"
echo ""
echo "Next steps:"
echo "1. Check your Supabase Dashboard > Table Editor"
echo "2. Verify all tables have been populated"
echo "3. Update your React app to use Supabase client"
echo ""
echo "For more details, see: supabase/README.md"
