'use client'

import { useState, useEffect } from 'react'
import Ribbon from '@/components/excel/Ribbon'
import PageGrid from '@/components/excel/PageGrid'
import FormulaBar from '@/components/excel/FormulaBar'
import StatusBar from '@/components/excel/StatusBar'
import TestingPanel from '@/components/testing/TestingPanel'
import ExportButton from '@/components/export/ExportButton'
import WebsiteSwitcher from '@/components/website/WebsiteSwitcher'
import AddWebsiteWizard from '@/components/website/AddWebsiteWizard'
import { useWebsite } from '@/contexts/WebsiteContext'
import { Website, Page as DbPage } from '@/types/database'
import { Page, Project } from '@/types'
import { createClient } from '@/lib/supabase/client'

interface Issue {
  id: string
  pageId: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  status: 'open' | 'resolved'
  createdAt: Date
}

interface PageTestStatus {
  pageId: string
  loading: 'ok' | 'not-ok' | 'pending'
  images: 'ok' | 'not-ok' | 'pending'
  colors: 'ok' | 'not-ok' | 'pending'
  fonts: 'ok' | 'not-ok' | 'pending'
  layout: 'ok' | 'not-ok' | 'pending'
  navigation: 'ok' | 'not-ok' | 'pending'
  forms: 'ok' | 'not-ok' | 'pending'
  buttons: 'ok' | 'not-ok' | 'pending'
  overall: 'ok' | 'not-ok' | 'pending'
}

export default function Home() {
  const { currentWebsite, setCurrentWebsite, pages: dbPages, refreshPages } = useWebsite()
  const [showAddWebsite, setShowAddWebsite] = useState(false)
  const [project, setProject] = useState<Project | null>(null)
  const [pages, setPages] = useState<Page[]>([])
  const [selectedPage, setSelectedPage] = useState<Page | null>(null)
  const [showTestingPanel, setShowTestingPanel] = useState(false)
  const [issues, setIssues] = useState<Issue[]>([])
  const [pageStatuses, setPageStatuses] = useState<Record<string, PageTestStatus>>({})

  // Convert database pages to app pages when website changes
  useEffect(() => {
    if (currentWebsite && dbPages.length > 0) {
      const convertedPages: Page[] = dbPages.map(dbPage => ({
        id: dbPage.id,
        url: dbPage.url,
        title: dbPage.title || 'Untitled',
        order: dbPage.order_index,
        createdAt: new Date(dbPage.created_at)
      }))
      setPages(convertedPages)
      
      // Set project from current website
      setProject({
        id: currentWebsite.id,
        name: currentWebsite.name,
        baseUrl: currentWebsite.base_url,
        createdAt: new Date(currentWebsite.created_at),
        updatedAt: new Date(currentWebsite.updated_at)
      })
      
      // Load existing test results for all pages
      loadAllTestResults(convertedPages)
    } else {
      setPages([])
      setProject(null)
      setPageStatuses({})
    }
  }, [currentWebsite, dbPages])

  const loadAllTestResults = async (pages: Page[]) => {
    const supabase = createClient()
    
    try {
      // Fetch all test results for all pages at once
      const pageIds = pages.map(p => p.id)
      const { data: testResults, error } = await supabase
        .from('test_results')
        .select('*')
        .in('page_id', pageIds)

      if (error) throw error

      if (testResults && testResults.length > 0) {
        // Group test results by page_id and build page statuses
        const newPageStatuses: Record<string, PageTestStatus> = {}
        
        testResults.forEach(result => {
          if (!newPageStatuses[result.page_id]) {
            newPageStatuses[result.page_id] = {
              pageId: result.page_id,
              loading: 'pending',
              images: 'pending',
              colors: 'pending',
              fonts: 'pending',
              layout: 'pending',
              navigation: 'pending',
              forms: 'pending',
              buttons: 'pending',
              overall: 'pending'
            }
          }

          // Map test_type to the appropriate field
          const testTypeMapping: Record<string, keyof PageTestStatus> = {
            'functional-1': 'loading',
            'visual-1': 'images',
            'visual-2': 'colors',
            'visual-3': 'fonts',
            'visual-4': 'layout',
            'functional-2': 'navigation',
            'functional-3': 'forms',
            'functional-4': 'buttons'
          }

          const field = testTypeMapping[result.test_type]
          if (field && field !== 'pageId' && field !== 'overall') {
            newPageStatuses[result.page_id][field] = result.status as 'ok' | 'not-ok' | 'pending'
          }
        })

        // Calculate overall status for each page
        Object.values(newPageStatuses).forEach(pageStatus => {
          const statuses = [
            pageStatus.loading,
            pageStatus.images,
            pageStatus.colors,
            pageStatus.fonts,
            pageStatus.layout,
            pageStatus.navigation,
            pageStatus.forms,
            pageStatus.buttons
          ].filter(s => s !== 'pending')

          const hasNotOk = statuses.includes('not-ok')
          const hasOk = statuses.includes('ok')

          if (hasNotOk) {
            pageStatus.overall = 'not-ok'
          } else if (hasOk && statuses.length >= 5) {
            pageStatus.overall = 'ok'
          } else {
            pageStatus.overall = 'pending'
          }
        })

        setPageStatuses(newPageStatuses)
      }
      
      // Also load issues for all pages
      const { data: issuesData, error: issuesError } = await supabase
        .from('issues')
        .select('*')
        .in('page_id', pageIds)

      if (!issuesError && issuesData) {
        const loadedIssues: Issue[] = issuesData.map(issue => ({
          id: issue.id,
          pageId: issue.page_id,
          title: issue.title,
          description: issue.description || '',
          priority: issue.priority as 'low' | 'medium' | 'high',
          status: issue.status as 'open' | 'resolved',
          createdAt: new Date(issue.created_at)
        }))
        setIssues(loadedIssues)
      }
    } catch (error) {
      console.error('Error loading test results:', error)
    }
  }

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

  const handleWebsiteAdded = (website: Website) => {
    setCurrentWebsite(website)
    refreshPages()
  }

  const handlePageSelect = (page: Page) => {
    setSelectedPage(page)
    setShowTestingPanel(true)
  }
  
  const handleStatusUpdate = (pageId: string, testType: string, status: 'ok' | 'not-ok') => {
    setPageStatuses(prev => {
      const currentStatus = prev[pageId] || {
        pageId,
        loading: 'pending',
        images: 'pending',
        colors: 'pending',
        fonts: 'pending',
        layout: 'pending',
        navigation: 'pending',
        forms: 'pending',
        buttons: 'pending',
        overall: 'pending'
      }
      
      const updatedStatus = {
        ...currentStatus,
        [testType]: status
      }
      
      // Calculate overall status
      const statuses = Object.values(updatedStatus).filter(v => typeof v === 'string' && v !== 'pending')
      const hasNotOk = statuses.includes('not-ok')
      const hasOk = statuses.includes('ok')
      
      if (hasNotOk) {
        updatedStatus.overall = 'not-ok'
      } else if (hasOk && statuses.length >= 5) {
        updatedStatus.overall = 'ok'
      } else {
        updatedStatus.overall = 'pending'
      }
      
      return {
        ...prev,
        [pageId]: updatedStatus
      }
    })
  }

  const handleAddIssue = (issueData: { title: string; description: string; priority: string }) => {
    if (!selectedPage) return
    
    const newIssue: Issue = {
      id: Date.now().toString(),
      pageId: selectedPage.id,
      title: issueData.title,
      description: issueData.description,
      priority: issueData.priority as 'low' | 'medium' | 'high',
      status: 'open',
      createdAt: new Date()
    }
    
    setIssues(prev => [...prev, newIssue])
    
    // Show success feedback
    console.log('Issue added:', newIssue)
  }

  const handleExport = () => {
    // This would trigger the export functionality
    console.log('Export triggered')
  }


  const completedPages = pages.filter(() =>
    // Simulate completed pages - in real app, this would come from reviews
    Math.random() > 0.7
  ).length
  
  // Calculate issues per page
  const issuesPerPage = issues.reduce((acc, issue) => {
    acc[issue.pageId] = (acc[issue.pageId] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const totalIssues = issues.length

  return (
    <>
      <AddWebsiteWizard
        open={showAddWebsite}
        onOpenChange={setShowAddWebsite}
        onWebsiteAdded={handleWebsiteAdded}
      />
      
      <div className="flex flex-col h-screen bg-background">
        {/* Header with Website Switcher */}
        <div className="border-b bg-background px-4 py-2">
          <div className="flex items-center justify-between">
            <WebsiteSwitcher
              currentWebsiteId={currentWebsite?.id || null}
              onWebsiteChange={setCurrentWebsite}
              onAddWebsite={() => setShowAddWebsite(true)}
            />
            <div className="flex items-center gap-2">
              {project && (
                <ExportButton project={project} pages={pages} />
              )}
            </div>
          </div>
        </div>
        
        {/* Ribbon */}
        <Ribbon 
        onSitemapLoaded={handleSitemapLoaded} 
        onExport={handleExport} 
        onSettings={() => {}} 
        onAddPage={() => {
          const newPage: Page = {
            id: Date.now().toString(),
            url: project?.baseUrl ? `${project.baseUrl}/new-page-${pages.length + 1}` : `/new-page-${pages.length + 1}`,
            title: `New Page ${pages.length + 1}`,
            order: pages.length,
            createdAt: new Date()
          }
          setPages(prev => [...prev, newPage])
          setSelectedPage(newPage)
        }}
      />
      
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
            issuesPerPage={issuesPerPage}
            pageStatuses={pageStatuses}
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
              <TestingPanel 
                page={selectedPage} 
                onStatusUpdate={(testType, status) => handleStatusUpdate(selectedPage.id, testType, status)}
                currentStatus={pageStatuses[selectedPage.id]}
              />
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
    </>
  )
}