'use client'

import { useState } from 'react'
import Ribbon from '@/components/excel/Ribbon'
import PageGrid from '@/components/excel/PageGrid'
import FormulaBar from '@/components/excel/FormulaBar'
import StatusBar from '@/components/excel/StatusBar'
import TestingPanel from '@/components/testing/TestingPanel'
import ExportButton from '@/components/export/ExportButton'
import { Page, Project } from '@/types'

export default function Home() {
  const [project, setProject] = useState<Project | null>(null)
  const [pages, setPages] = useState<Page[]>([])
  const [selectedPage, setSelectedPage] = useState<Page | null>(null)
  const [showTestingPanel, setShowTestingPanel] = useState(false)

  const handleSitemapLoaded = (loadedPages: Page[], baseUrl: string) => {
    const newProject: Project = {
      id: Date.now().toString(),
      name: `Project ${new Date().toLocaleDateString()}`,
      baseUrl,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    setProject(newProject)
    setPages(loadedPages)
    if (loadedPages.length > 0) {
      setSelectedPage(loadedPages[0])
    }
  }

  const handlePageSelect = (page: Page) => {
    setSelectedPage(page)
    setShowTestingPanel(true)
  }

  const handleAddIssue = (issueData: { title: string; description: string; priority: string }) => {
    console.log('Adding issue:', issueData, 'for page:', selectedPage?.title)
    // In a real implementation, this would save to the database
  }

  const handleExport = () => {
    // This would trigger the export functionality
    console.log('Export triggered')
  }

  const handleImport = () => {
    // This would trigger import functionality
    console.log('Import triggered')
  }

  const completedPages = pages.filter(page =>
    // Simulate completed pages - in real app, this would come from reviews
    Math.random() > 0.7
  ).length

  const totalIssues = Math.floor(pages.length * 0.3) // Simulated issues count

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Ribbon */}
      <Ribbon onImport={handleImport} onExport={handleExport} onSettings={() => {}} />
      
      {/* Formula Bar */}
      <FormulaBar selectedPage={selectedPage} onAddIssue={handleAddIssue} />
      
      {/* Main Content - Grid and Testing Panel */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Page Grid */}
        <div className="flex-1 overflow-auto">
          <PageGrid
            pages={pages}
            selectedPage={selectedPage}
            onPageSelect={handlePageSelect}
          />
        </div>
        
        {/* Right Panel - Testing (Collapsible) */}
        {showTestingPanel && selectedPage && (
          <div className="w-96 border-l border-border overflow-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Testing: {selectedPage.title}</h3>
                <button
                  onClick={() => setShowTestingPanel(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ×
                </button>
              </div>
              <TestingPanel page={selectedPage} />
            </div>
          </div>
        )}
      </div>
      
      {/* Status Bar */}
      <StatusBar
        totalPages={pages.length}
        completedPages={completedPages}
        totalIssues={totalIssues}
        selectedPage={selectedPage?.title || null}
      />
    </div>
  )
}