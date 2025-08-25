# Database Setup Instructions

The application requires database tables to be created in Supabase. Follow these steps:

## Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `supabase/migrations/001_create_websites_table.sql`
4. Click "Run" to execute the SQL

## Option 2: Using Supabase CLI (Local Development)

1. Start Supabase locally:
```bash
npx supabase start
```

2. Apply the migration:
```bash
npx supabase db reset
```

Or if you want to apply just this migration:
```bash
npx supabase migration up
```

## Option 3: Direct Database Connection

If you have a direct database connection string, you can use psql:
```bash
psql "your-database-connection-string" < supabase/migrations/001_create_websites_table.sql
```

## Verify Tables Were Created

After running the migration, verify the tables exist:
1. Go to Supabase Dashboard > Table Editor
2. You should see these tables:
   - `websites`
   - `pages`
   - `test_results`
   - `issues`

## Environment Variables

Make sure your `.env.local` file has the correct Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Troubleshooting

If you still see the error "Could not find the table 'public.websites'":
1. Check that you're connected to the correct Supabase project
2. Verify the tables exist in the database
3. Check that Row Level Security (RLS) policies allow access
4. Try refreshing the schema cache in Supabase Dashboard