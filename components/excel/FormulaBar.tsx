'use client'

import { useState } from 'react'
import { Page } from '@/types'

interface FormulaBarProps {
  selectedPage: Page | null
  onAddIssue: (issueData: { title: string; description: string; priority: string }) => void
}

export default function FormulaBar({ selectedPage, onAddIssue }: FormulaBarProps) {
  const [issueTitle, setIssueTitle] = useState('')
  const [issueDescription, setIssueDescription] = useState('')
  const [priority, setPriority] = useState('medium')

  const handleSubmit = () => {
    if (issueTitle.trim() && selectedPage) {
      onAddIssue({
        title: issueTitle,
        description: issueDescription,
        priority
      })
      setIssueTitle('')
      setIssueDescription('')
      setPriority('medium')
    }
  }

  return (
    <div className="excel-formula-bar">
      <div className="flex items-center gap-2 w-full">
        <span className="text-xs font-medium text-muted-foreground min-w-16">
          {selectedPage ? `Page: ${selectedPage.title}` : 'No selection'}
        </span>
        
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            placeholder="Issue title..."
            value={issueTitle}
            onChange={(e) => setIssueTitle(e.target.value)}
            className="flex-1 px-2 py-1 text-sm border border-border rounded bg-background focus:outline-none focus:ring-1 focus:ring-primary"
          />
          
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="px-2 py-1 text-sm border border-border rounded bg-background focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          
          <button
            onClick={handleSubmit}
            disabled={!issueTitle.trim() || !selectedPage}
            className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Issue
          </button>
        </div>
      </div>
      
      {issueDescription && (
        <div className="mt-1">
          <textarea
            placeholder="Issue description..."
            value={issueDescription}
            onChange={(e) => setIssueDescription(e.target.value)}
            rows={2}
            className="w-full px-2 py-1 text-sm border border-border rounded bg-background focus:outline-none focus:ring-1 focus:ring-primary resize-none"
          />
        </div>
      )}
    </div>
  )
}