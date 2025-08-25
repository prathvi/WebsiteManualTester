const https = require('https');

const SUPABASE_URL = 'https://gsvkoklhjpkmlrvvbphj.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdzdmtva2xoanBrbWxydnZicGhqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjEzMTQ2NiwiZXhwIjoyMDcxNzA3NDY2fQ.EK2DQJ99fjf-cOSJbRNsoGnk0vGqiRm8LHMoDtXCtgw';

// Split SQL into individual statements
const sqlStatements = [
  `CREATE TABLE IF NOT EXISTS websites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    base_url TEXT NOT NULL,
    sitemap_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
  )`,
  
  `CREATE TABLE IF NOT EXISTS pages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    website_id UUID NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    title VARCHAR(255),
    parent_id UUID REFERENCES pages(id) ON DELETE CASCADE,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  )`,
  
  `CREATE TABLE IF NOT EXISTS test_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
    test_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('ok', 'not-ok', 'pending')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  )`,
  
  `CREATE TABLE IF NOT EXISTS issues (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(20) CHECK (priority IN ('low', 'medium', 'high')),
    status VARCHAR(20) CHECK (status IN ('open', 'resolved', 'closed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  )`,
  
  `CREATE INDEX IF NOT EXISTS idx_pages_website_id ON pages(website_id)`,
  `CREATE INDEX IF NOT EXISTS idx_test_results_page_id ON test_results(page_id)`,
  `CREATE INDEX IF NOT EXISTS idx_issues_page_id ON issues(page_id)`,
  `CREATE INDEX IF NOT EXISTS idx_websites_deleted_at ON websites(deleted_at)`,
  
  `ALTER TABLE websites ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE pages ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE test_results ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE issues ENABLE ROW LEVEL SECURITY`,
  
  `DROP POLICY IF EXISTS "Allow all operations on websites" ON websites`,
  `DROP POLICY IF EXISTS "Allow all operations on pages" ON pages`,
  `DROP POLICY IF EXISTS "Allow all operations on test_results" ON test_results`,
  `DROP POLICY IF EXISTS "Allow all operations on issues" ON issues`,
  
  `CREATE POLICY "Allow all operations on websites" ON websites FOR ALL USING (true)`,
  `CREATE POLICY "Allow all operations on pages" ON pages FOR ALL USING (true)`,
  `CREATE POLICY "Allow all operations on test_results" ON test_results FOR ALL USING (true)`,
  `CREATE POLICY "Allow all operations on issues" ON issues FOR ALL USING (true)`
];

async function executeSQL(sql) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query: sql });
    
    const options = {
      hostname: 'gsvkoklhjpkmlrvvbphj.supabase.co',
      port: 443,
      path: '/rest/v1/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Prefer': 'return=minimal'
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ success: true, data: responseData });
        } else {
          resolve({ success: false, error: responseData, status: res.statusCode });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

async function testTableExists(tableName) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'gsvkoklhjpkmlrvvbphj.supabase.co',
      port: 443,
      path: `/rest/v1/${tableName}?select=count&limit=1`,
      method: 'GET',
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`
      }
    };

    const req = https.request(options, (res) => {
      if (res.statusCode === 200) {
        resolve(true);
      } else if (res.statusCode === 404 || res.statusCode === 406) {
        resolve(false);
      } else {
        resolve(false);
      }
    });

    req.on('error', () => resolve(false));
    req.end();
  });
}

async function main() {
  console.log('🚀 Starting database setup...\n');
  
  // Test if tables already exist
  console.log('Checking existing tables...');
  const websitesExist = await testTableExists('websites');
  
  if (websitesExist) {
    console.log('✅ Tables already exist! Your database is ready.\n');
    console.log('You can now refresh your application and start using it.');
    return;
  }
  
  console.log('Tables do not exist. Creating them now...\n');
  console.log('⚠️  NOTE: The Supabase REST API doesn\'t support DDL operations directly.');
  console.log('You need to create the tables manually:\n');
  
  console.log('1. Open Supabase SQL Editor:');
  console.log('   https://supabase.com/dashboard/project/gsvkoklhjpkmlrvvbphj/sql\n');
  
  console.log('2. Copy and paste this SQL:\n');
  console.log('================================ COPY FROM HERE ================================\n');
  
  // Print the full SQL
  const fullSQL = `-- Create websites table
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

-- Enable Row Level Security
ALTER TABLE websites ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow all operations on websites" ON websites FOR ALL USING (true);
CREATE POLICY "Allow all operations on pages" ON pages FOR ALL USING (true);
CREATE POLICY "Allow all operations on test_results" ON test_results FOR ALL USING (true);
CREATE POLICY "Allow all operations on issues" ON issues FOR ALL USING (true);`;
  
  console.log(fullSQL);
  console.log('\n================================ COPY TO HERE ================================\n');
  
  console.log('3. Click "Run" to execute the SQL\n');
  console.log('4. Refresh your application\n');
}

main().catch(console.error);