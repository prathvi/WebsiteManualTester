#!/bin/bash

echo "======================================"
echo "Website Manual Tester - Database Setup"
echo "======================================"
echo ""
echo "To create the required database tables, please follow these steps:"
echo ""
echo "1. Open your Supabase Dashboard:"
echo "   https://supabase.com/dashboard/project/gsvkoklhjpkmlrvvbphj/sql"
echo ""
echo "2. Click on 'New query' button"
echo ""
echo "3. Copy ALL the SQL below and paste it into the SQL editor:"
echo "------------------------------------------------------"
cat supabase/migrations/001_create_websites_table.sql
echo "------------------------------------------------------"
echo ""
echo "4. Click the 'Run' button (or press Cmd/Ctrl + Enter)"
echo ""
echo "5. You should see 'Success: No rows returned'"
echo ""
echo "6. Go to Table Editor to verify the tables were created:"
echo "   https://supabase.com/dashboard/project/gsvkoklhjpkmlrvvbphj/editor"
echo ""
echo "7. Refresh your application - it should now work!"
echo ""
echo "Press Enter to open the Supabase SQL Editor in your browser..."
read

# Try to open the URL in the default browser
if command -v open &> /dev/null; then
    open "https://supabase.com/dashboard/project/gsvkoklhjpkmlrvvbphj/sql"
elif command -v xdg-open &> /dev/null; then
    xdg-open "https://supabase.com/dashboard/project/gsvkoklhjpkmlrvvbphj/sql"
elif command -v start &> /dev/null; then
    start "https://supabase.com/dashboard/project/gsvkoklhjpkmlrvvbphj/sql"
else
    echo "Please open this URL manually: https://supabase.com/dashboard/project/gsvkoklhjpkmlrvvbphj/sql"
fi