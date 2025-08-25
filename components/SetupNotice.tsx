'use client'

import { AlertCircle, Database, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SetupNoticeProps {
  error?: string
}

export default function SetupNotice({ error }: SetupNoticeProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-card border rounded-lg p-8 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-amber-100 dark:bg-amber-900/20 p-3">
              <Database className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-xl font-semibold mb-2">Database Setup Required</h2>
                <p className="text-muted-foreground">
                  The application database tables need to be created before you can start using the Website Manual Tester.
                </p>
              </div>

              {error && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
                  <div className="flex gap-2">
                    <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <h3 className="font-medium">Quick Setup Steps:</h3>
                <ol className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="font-medium">1.</span>
                    <span>Go to your Supabase project dashboard</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-medium">2.</span>
                    <span>Navigate to the SQL Editor</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-medium">3.</span>
                    <span>Copy the migration SQL from <code className="bg-muted px-1 py-0.5 rounded">supabase/migrations/001_create_websites_table.sql</code></span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-medium">4.</span>
                    <span>Run the SQL to create the tables</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-medium">5.</span>
                    <span>Refresh this page</span>
                  </li>
                </ol>
              </div>

              <div className="flex gap-3">
                <Button asChild>
                  <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer">
                    Open Supabase Dashboard
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Refresh Page
                </Button>
              </div>

              <div className="text-xs text-muted-foreground pt-4 border-t">
                For detailed instructions, see <code className="bg-muted px-1 py-0.5 rounded">setup-database.md</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}