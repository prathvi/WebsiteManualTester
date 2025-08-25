'use client'

interface StatusBarProps {
  totalPages: number
  completedPages: number
  totalIssues: number
  selectedPage: string | null
}

export default function StatusBar({ totalPages, completedPages, totalIssues, selectedPage }: StatusBarProps) {
  const completionPercentage = totalPages > 0 ? Math.round((completedPages / totalPages) * 100) : 0

  return (
    <div className="excel-status-bar">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="font-medium">Ready</span>
          
          {selectedPage && (
            <span className="text-muted-foreground">
              Selected: {selectedPage}
            </span>
          )}
          
          <span className="text-muted-foreground">
            Pages: {completedPages}/{totalPages} ({completionPercentage}%)
          </span>
          
          <span className="text-muted-foreground">
            Issues: {totalIssues}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">
            {new Date().toLocaleTimeString()}
          </span>
        </div>
      </div>
    </div>
  )
}