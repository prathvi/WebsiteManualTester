'use client'

import { useState } from 'react'
import * as XLSX from 'xlsx'
import { Project, Page } from '@/types'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Download, FileSpreadsheet, FileJson, FileText, Loader2, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useWebsite } from '@/contexts/WebsiteContext'

interface ExportButtonProps {
  project: Project
  pages: Page[]
}

export default function ExportButton({ project, pages }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [exportFormat, setExportFormat] = useState<'excel' | 'json' | 'csv' | null>(null)
  const supabase = createClient()
  const { currentWebsite } = useWebsite()

  const fetchTestData = async () => {
    if (!currentWebsite) return { testResults: [], issues: [] }

    try {
      // Fetch all test results for this website's pages
      const pageIds = pages.map(p => p.id)
      
      const { data: testResults } = await supabase
        .from('test_results')
        .select('*')
        .in('page_id', pageIds)

      const { data: issues } = await supabase
        .from('issues')
        .select('*')
        .in('page_id', pageIds)

      return {
        testResults: testResults || [],
        issues: issues || []
      }
    } catch (error) {
      console.error('Error fetching test data:', error)
      return { testResults: [], issues: [] }
    }
  }

  const handleExport = async (format: 'excel' | 'json' | 'csv') => {
    setIsExporting(true)
    setExportFormat(format)
    
    try {
      // Fetch test results and issues from database
      const { testResults, issues } = await fetchTestData()

      const exportData = {
        project,
        pages,
        testResults,
        issues,
        exportDate: new Date()
      }

      switch (format) {
        case 'excel':
          await exportToExcel(exportData)
          break
        case 'json':
          await exportToJSON(exportData)
          break
        case 'csv':
          await exportToCSV(exportData)
          break
      }

      setShowSuccess(true)
      setTimeout(() => {
        setShowSuccess(false)
        setExportFormat(null)
      }, 2000)
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const exportToExcel = async (data: any) => {
    const workbook = XLSX.utils.book_new()

    // Project Summary Sheet
    const summaryData = [
      ['Website Test Report'],
      [],
      ['Website Name', data.project.name],
      ['Base URL', data.project.baseUrl],
      ['Export Date', new Date().toLocaleString()],
      [],
      ['Statistics'],
      ['Total Pages', data.pages.length],
      ['Total Tests Run', data.testResults.length],
      ['Tests Passed', data.testResults.filter((r: any) => r.status === 'ok').length],
      ['Tests Failed', data.testResults.filter((r: any) => r.status === 'not-ok').length],
      ['Total Issues', data.issues.length],
      ['High Priority Issues', data.issues.filter((i: any) => i.priority === 'high').length],
      ['Medium Priority Issues', data.issues.filter((i: any) => i.priority === 'medium').length],
      ['Low Priority Issues', data.issues.filter((i: any) => i.priority === 'low').length]
    ]
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary')

    // Pages Sheet
    const pagesData = [
      ['Page Title', 'URL', 'Test Status', 'Issues Count'],
      ...data.pages.map((page: Page) => {
        const pageTests = data.testResults.filter((r: any) => r.page_id === page.id)
        const pageIssues = data.issues.filter((i: any) => i.page_id === page.id)
        const hasFailedTests = pageTests.some((t: any) => t.status === 'not-ok')
        
        return [
          page.title,
          page.url,
          hasFailedTests ? 'Failed' : pageTests.length > 0 ? 'Passed' : 'Not Tested',
          pageIssues.length
        ]
      })
    ]
    const pagesSheet = XLSX.utils.aoa_to_sheet(pagesData)
    XLSX.utils.book_append_sheet(workbook, pagesSheet, 'Pages')

    // Test Results Sheet
    const testResultsData = [
      ['Page', 'Test Type', 'Status', 'Notes', 'Last Updated'],
      ...data.testResults.map((result: any) => {
        const page = data.pages.find((p: Page) => p.id === result.page_id)
        return [
          page?.title || 'Unknown',
          formatTestType(result.test_type),
          result.status.toUpperCase(),
          result.notes || '',
          new Date(result.updated_at).toLocaleString()
        ]
      })
    ]
    const testResultsSheet = XLSX.utils.aoa_to_sheet(testResultsData)
    XLSX.utils.book_append_sheet(workbook, testResultsSheet, 'Test Results')

    // Issues Sheet with all fields
    const issuesData = [
      ['Page', 'Test Type', 'Section', 'Priority', 'Issue Title', 'Detailed Description', 'Suggested Fix', 'Status', 'Created Date'],
      ...data.issues.map((issue: any) => {
        const page = data.pages.find((p: Page) => p.id === issue.page_id)
        return [
          page?.title || 'Unknown',
          formatTestType(issue.test_type || ''),
          issue.section || 'Not specified',
          (issue.priority || 'medium').toUpperCase(),
          issue.title,
          issue.description || '',
          issue.suggested_fix || 'No suggestion provided',
          (issue.status || 'open').toUpperCase(),
          new Date(issue.created_at).toLocaleString()
        ]
      })
    ]
    const issuesSheet = XLSX.utils.aoa_to_sheet(issuesData)
    XLSX.utils.book_append_sheet(workbook, issuesSheet, 'Issues')

    // Failed Tests with Issues Sheet - Comprehensive view
    const failedTestsData = [
      ['Page', 'Test Type', 'Test Status', 'Section', 'Priority', 'Issue Title', 'Detailed Description', 'Suggested Fix'],
      ...data.testResults
        .filter((result: any) => result.status === 'not-ok')
        .map((result: any) => {
          const page = data.pages.find((p: Page) => p.id === result.page_id)
          const relatedIssue = data.issues.find((i: any) => 
            i.page_id === result.page_id && i.test_type === result.test_type
          )
          
          return [
            page?.title || 'Unknown',
            formatTestType(result.test_type),
            'NOT OK',
            relatedIssue?.section || '',
            relatedIssue ? (relatedIssue.priority || 'medium').toUpperCase() : '',
            relatedIssue?.title || 'No issue documented',
            relatedIssue?.description || '',
            relatedIssue?.suggested_fix || ''
          ]
        })
    ]
    const failedTestsSheet = XLSX.utils.aoa_to_sheet(failedTestsData)
    XLSX.utils.book_append_sheet(workbook, failedTestsSheet, 'Failed Tests')

    // Save file
    const fileName = `${data.project.name.replace(/\s+/g, '-').toLowerCase()}-test-report-${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(workbook, fileName)
  }

  const exportToJSON = async (data: any) => {
    // Enhance the JSON export with formatted test types
    const enhancedData = {
      ...data,
      issues: data.issues.map((issue: any) => ({
        ...issue,
        test_type_formatted: formatTestType(issue.test_type || ''),
        page: data.pages.find((p: Page) => p.id === issue.page_id)
      })),
      testResults: data.testResults.map((result: any) => ({
        ...result,
        test_type_formatted: formatTestType(result.test_type || ''),
        page: data.pages.find((p: Page) => p.id === result.page_id)
      }))
    }
    const jsonString = JSON.stringify(enhancedData, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const fileName = `${data.project.name.replace(/\s+/g, '-').toLowerCase()}-test-report-${new Date().toISOString().split('T')[0]}.json`
    
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const exportToCSV = async (data: any) => {
    // Create CSV content for issues with all fields
    const csvRows = [
      ['Page Title', 'Page URL', 'Test Type', 'Section', 'Priority', 'Issue Title', 'Detailed Description', 'Suggested Fix', 'Status'],
      ...data.issues.map((issue: any) => {
        const page = data.pages.find((p: Page) => p.id === issue.page_id)
        return [
          page?.title || 'Unknown',
          page?.url || '',
          formatTestType(issue.test_type || ''),
          issue.section || '',
          issue.priority || 'medium',
          issue.title,
          issue.description || '',
          issue.suggested_fix || '',
          issue.status || 'open'
        ]
      })
    ]

    const csvContent = csvRows.map(row => 
      row.map((cell: string) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const fileName = `${data.project.name.replace(/\s+/g, '-').toLowerCase()}-issues-${new Date().toISOString().split('T')[0]}.csv`
    
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const formatTestType = (testType: string): string => {
    const testTypeMap: Record<string, string> = {
      'visual-1': 'Images Loading',
      'visual-2': 'Text Colors',
      'visual-3': 'Font Styles',
      'visual-4': 'Layout Consistency',
      'visual-5': 'Color Contrast',
      'functional-1': 'Page Loading Speed',
      'functional-2': 'Navigation Links',
      'functional-3': 'Form Submissions',
      'functional-4': 'Button Functionality',
      'functional-5': 'Error Handling'
    }
    return testTypeMap[testType] || testType
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem 
            onClick={() => handleExport('excel')}
            disabled={isExporting}
            className="gap-2"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Export as Excel
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleExport('csv')}
            disabled={isExporting}
            className="gap-2"
          >
            <FileText className="h-4 w-4" />
            Export as CSV
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => handleExport('json')}
            disabled={isExporting}
            className="gap-2"
          >
            <FileJson className="h-4 w-4" />
            Export as JSON
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isExporting || showSuccess} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {showSuccess ? 'Export Complete' : 'Exporting Report'}
            </DialogTitle>
            <DialogDescription>
              {showSuccess 
                ? `Your test report has been exported successfully.`
                : `Preparing your ${exportFormat?.toUpperCase()} report...`
              }
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-6">
            {showSuccess ? (
              <CheckCircle className="h-12 w-12 text-green-600 animate-in zoom-in-50" />
            ) : (
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}