const { createClient } = require('@supabase/supabase-js');

// Your Supabase credentials
const SUPABASE_URL = 'https://gsvkoklhjpkmlrvvbphj.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdzdmtva2xoanBrbWxydnZicGhqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjEzMTQ2NiwiZXhwIjoyMDcxNzA3NDY2fQ.EK2DQJ99fjf-cOSJbRNsoGnk0vGqiRm8LHMoDtXCtgw';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function checkSchema() {
  try {
    console.log('Testing issues table with new fields...');
    
    // Try to insert a test issue with all fields
    const testIssue = {
      page_id: '00000000-0000-0000-0000-000000000000', // Test UUID
      title: 'Test Issue',
      description: 'Test Description',
      section: 'Test Section',
      suggested_fix: 'Test Fix',
      test_type: 'visual-1',
      priority: 'medium',
      status: 'open'
    };

    const { data, error } = await supabase
      .from('issues')
      .insert(testIssue)
      .select();

    if (error) {
      if (error.message.includes('column') && (error.message.includes('section') || error.message.includes('suggested_fix') || error.message.includes('test_type'))) {
        console.log('\n❌ The new columns are not yet added to the issues table.');
        console.log('\nPlease go to your Supabase dashboard and run this SQL:');
        console.log('\n--- SQL to Run ---');
        console.log(`ALTER TABLE issues 
ADD COLUMN IF NOT EXISTS section VARCHAR(255),
ADD COLUMN IF NOT EXISTS suggested_fix TEXT,
ADD COLUMN IF NOT EXISTS test_type VARCHAR(50);`);
        console.log('--- End SQL ---\n');
        console.log('Dashboard URL: https://app.supabase.com/project/gsvkoklhjpkmlrvvbphj/editor');
      } else if (error.code === '23503') {
        // Foreign key violation - this is expected for our test UUID
        console.log('✅ All columns exist! The schema is ready.');
        console.log('Note: Test insert failed due to foreign key constraint (expected).');
      } else {
        console.log('Error:', error);
      }
    } else {
      // If it succeeded, clean up the test data
      if (data && data[0]) {
        await supabase.from('issues').delete().eq('id', data[0].id);
        console.log('✅ All columns exist! The schema is ready.');
        console.log('(Test data cleaned up)');
      }
    }

    // Also check if we can select with these columns
    const { data: selectTest, error: selectError } = await supabase
      .from('issues')
      .select('id, title, section, suggested_fix, test_type')
      .limit(1);

    if (selectError) {
      console.log('\nSelect test failed:', selectError.message);
    } else {
      console.log('\n✅ Successfully verified all columns are accessible.');
    }

  } catch (error) {
    console.error('Check failed:', error);
  }
}

checkSchema();