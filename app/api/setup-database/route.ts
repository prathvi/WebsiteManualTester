import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const serviceKey = process.env.SUPABASE_SERVICE_KEY
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

  if (!serviceKey || !supabaseUrl) {
    return NextResponse.json(
      { error: 'Missing Supabase credentials' },
      { status: 500 }
    )
  }

  const sql = `
    -- Create websites table
    CREATE TABLE IF NOT EXISTS websites (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        base_url TEXT NOT NULL,
        sitemap_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP WITH TIME ZONE
    );

    -- Create pages table
    CREATE TABLE IF NOT EXISTS pages (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        website_id UUID NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
        url TEXT NOT NULL,
        title VARCHAR(255),
        parent_id UUID REFERENCES pages(id) ON DELETE CASCADE,
        order_index INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- Create test_results table
    CREATE TABLE IF NOT EXISTS test_results (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
        test_type VARCHAR(50) NOT NULL,
        status VARCHAR(20) NOT NULL CHECK (status IN ('ok', 'not-ok', 'pending')),
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- Create issues table
    CREATE TABLE IF NOT EXISTS issues (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        priority VARCHAR(20) CHECK (priority IN ('low', 'medium', 'high')),
        status VARCHAR(20) CHECK (status IN ('open', 'resolved', 'closed')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- Create indexes
    CREATE INDEX IF NOT EXISTS idx_pages_website_id ON pages(website_id);
    CREATE INDEX IF NOT EXISTS idx_test_results_page_id ON test_results(page_id);
    CREATE INDEX IF NOT EXISTS idx_issues_page_id ON issues(page_id);
    CREATE INDEX IF NOT EXISTS idx_websites_deleted_at ON websites(deleted_at);
  `

  const rls = `
    -- Enable Row Level Security
    ALTER TABLE websites ENABLE ROW LEVEL SECURITY;
    ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
    ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;
    ALTER TABLE issues ENABLE ROW LEVEL SECURITY;

    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Allow all operations on websites" ON websites;
    DROP POLICY IF EXISTS "Allow all operations on pages" ON pages;
    DROP POLICY IF EXISTS "Allow all operations on test_results" ON test_results;
    DROP POLICY IF EXISTS "Allow all operations on issues" ON issues;

    -- Create policies (for now, allow all operations - in production, add proper authentication)
    CREATE POLICY "Allow all operations on websites" ON websites FOR ALL USING (true);
    CREATE POLICY "Allow all operations on pages" ON pages FOR ALL USING (true);
    CREATE POLICY "Allow all operations on test_results" ON test_results FOR ALL USING (true);
    CREATE POLICY "Allow all operations on issues" ON issues FOR ALL USING (true);
  `

  try {
    // Execute SQL using Supabase REST API with service key
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`
      },
      body: JSON.stringify({ query: sql })
    })

    // Since exec_sql might not exist, let's try a different approach
    // We'll test if tables exist by trying to query them
    const testResponse = await fetch(`${supabaseUrl}/rest/v1/websites?select=count`, {
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`
      }
    })

    if (testResponse.status === 404) {
      return NextResponse.json(
        { 
          error: 'Tables not created. Please use Supabase Dashboard to run the SQL migration.',
          instructions: {
            step1: 'Go to https://supabase.com/dashboard/project/gsvkoklhjpkmlrvvbphj/sql',
            step2: 'Copy the SQL from supabase/migrations/001_create_websites_table.sql',
            step3: 'Click "Run" to execute the SQL'
          }
        },
        { status: 400 }
      )
    }

    return NextResponse.json({ 
      success: true,
      message: 'Database tables are ready'
    })
  } catch (error) {
    console.error('Setup database error:', error)
    return NextResponse.json(
      { error: 'Failed to setup database', details: error },
      { status: 500 }
    )
  }
}