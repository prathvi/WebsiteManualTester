const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Your Supabase credentials
const SUPABASE_URL = 'https://gsvkoklhjpkmlrvvbphj.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdzdmtva2xoanBrbWxydnZicGhqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjEzMTQ2NiwiZXhwIjoyMDcxNzA3NDY2fQ.EK2DQJ99fjf-cOSJbRNsoGnk0vGqiRm8LHMoDtXCtgw';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function runMigration() {
  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '002_add_issue_fields.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('Running migration: Adding issue fields...');
    
    // Execute the migration
    const { error } = await supabase.rpc('exec_sql', { 
      query: migrationSQL 
    }).single();

    if (error) {
      // If RPC doesn't exist, try direct execution through REST API
      console.log('Attempting alternative method...');
      
      // Split the migration into individual statements
      const statements = migrationSQL
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      for (const statement of statements) {
        console.log(`Executing: ${statement.substring(0, 50)}...`);
        
        // For ALTER TABLE statements, we need to use raw SQL execution
        const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
          },
          body: JSON.stringify({
            query: statement
          })
        });

        if (!response.ok) {
          console.log(`Note: Direct SQL execution not available via REST API`);
          console.log('Please run the following SQL in Supabase dashboard SQL editor:');
          console.log('\n' + migrationSQL);
          return;
        }
      }
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    console.log('\nPlease run the following SQL manually in your Supabase dashboard:');
    console.log('\n--- SQL Migration ---');
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '002_add_issue_fields.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    console.log(migrationSQL);
    console.log('--- End SQL Migration ---\n');
  }
}

runMigration();