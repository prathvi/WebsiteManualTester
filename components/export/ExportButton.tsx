'use client'

import { useRef } from 'react'
import * as XLSX from 'xlsx'
import { Project, Page, Review, Issue, ExportData } from '@/types'

interface ExportButtonProps {
  project: Project
  pages: Page[]
  // In a real implementation, you'd pass reviews and issues from state
}

export default function ExportButton({ project, pages }: ExportButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = () => {
    // In a real implementation, you'd get reviews and issues from your state management
    // For now, we'll create a mock export with sample data
    const exportData: ExportData = {
      project,
      pages,
      reviews: [
        {
          id: '1',
          pageId: '1',
          testItemId: 'visual-1',
          status: 'ok',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '2',
          pageId: '1',
          testItemId: 'visual-2',
          status: 'not-ok',
          comments: 'Text colors do not match design',
          priority: 'high',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      issues: [
        {
          id: '1',
          reviewId: '2',
          section: 'Header',
          title: 'Incorrect text color in navigation',
          description: 'Navigation text color should be #333 but is currently #666',
          suggestedFix: 'Update CSS to use correct color code',
          priority: 'high',
          category: 'visual',
          createdAt: new Date()
        }
      ]
    }

    exportToExcel(exportData)
  }

  const exportToExcel = (data: ExportData) => {
    // Create workbook
    const workbook = XLSX.utils.book_new()

    // Project Summary Sheet
    const projectSheetData = [
      ['Project Name', data.project.name],
      ['Base URL', data.project.baseUrl],
      ['Created At', data.project.createdAt.toLocaleDateString()],
      ['Total Pages', data.pages.length],
      ['Total Reviews', data.reviews.length],
      ['Total Issues', data.issues.length]
    ]
    const projectSheet = XLSX.utils.aoa_to_sheet(projectSheetData)
    XLSX.utils.book_append_sheet(workbook, projectSheet, 'Project Summary')

    // Pages Sheet
    const pagesSheetData = [
      ['Page ID', 'Title', 'URL', 'Order', 'Created At'],
      ...data.pages.map(page => [
        page.id,
        page.title,
        page.url,
        page.order,
        page.createdAt.toLocaleDateString()
      ])
    ]
    const pagesSheet = XLSX.utils.aoa_to_sheet(pagesSheetData)
    XLSX.utils.book_append_sheet(workbook, pagesSheet, 'Pages')

    // Reviews Sheet with color coding
    const reviewsSheetData = [
      ['Review ID', 'Page', 'Test Item', 'Status', 'Priority', 'Comments', 'Created At', 'Updated At'],
      ...data.reviews.map(review => {
        const page = data.pages.find(p => p.id === review.pageId)
        const testItem = getTestItemName(review.testItemId)
        
        return [
          review.id,
          page?.title || 'Unknown',
          testItem,
          review.status,
          review.priority || '',
          review.comments || '',
          review.createdAt.toLocaleDateString(),
          review.updatedAt.toLocaleDateString()
        ]
      })
    ]
    const reviewsSheet = XLSX.utils.aoa_to_sheet(reviewsSheetData)
    
    // Add color coding for status
    reviewsSheetData.forEach((row, rowIndex) => {
      if (rowIndex > 0) { // Skip header row
        const status = row[3] as string
        const cellAddress = XLSX.utils.encode_cell({ r: rowIndex, c: 3 })
        
        if (status === 'ok') {
          reviewsSheet[cellAddress].s = {
            fill: { fgColor: { rgb: 'FFE8F5E8' } },
            font: { color: { rgb: 'FF2E7D32' } }
          }
        } else if (status === 'not-ok') {
          reviewsSheet[cellAddress].s = {
            fill: { fgColor: { rgb: 'FFFFEBEE' } },
            font: { color: { rgb: 'FFC62828' } }
          }
        }
      }
    })
    
    XLSX.utils.book_append_sheet(workbook, reviewsSheet, 'Reviews')

    // Issues Sheet with priority color coding
    const issuesSheetData = [
      ['Issue ID', 'Page', 'Section', 'Title', 'Description', 'Suggested Fix', 'Priority', 'Category', 'Created At'],
      ...data.issues.map(issue => {
        const review = data.reviews.find(r => r.id === issue.reviewId)
        const page = review ? data.pages.find(p => p.id === review.pageId) : null
        
        return [
          issue.id,
          page?.title || 'Unknown',
          issue.section,
          issue.title,
          issue.description,
          issue.suggestedFix || '',
          issue.priority,
          issue.category,
          issue.createdAt.toLocaleDateString()
        ]
      })
    ]
    const issuesSheet = XLSX.utils.aoa_to_sheet(issuesSheetData)
    
    // Add color coding for priority
    issuesSheetData.forEach((row, rowIndex) => {
      if (rowIndex > 0) { // Skip header row
        const priority = row[6] as string
        const cellAddress = XLSX.utils.encode_cell({ r: rowIndex, c: 6 })
        
        if (priority === 'high') {
          issuesSheet[cellAddress].s = {
            fill: { fgColor: { rgb: 'FFFFEBEE' } },
            font: { color: { rgb: 'FFC62828' } }
          }
        } else if (priority === 'medium') {
          issuesSheet[cellAddress].s = {
            fill: { fgColor: { rgb: 'FFFFF8E1' } },
            font: { color: { rgb: 'FFEF6C00' } }
          }
        } else if (priority === 'low') {
          issuesSheet[cellAddress].s = {
            fill: { fgColor: { rgb: 'FFE3F2FD' } },
            font: { color: { rgb: 'FF1565C0' } }
          }
        }
      }
    })
    
    XLSX.utils.book_append_sheet(workbook, issuesSheet, 'Issues')

    // Export workbook
    const fileName = `website-test-report-${data.project.name.replace(/\s+/g, '-').toLowerCase()}.xlsx`
    XLSX.writeFile(workbook, fileName)
  }

  const getTestItemName = (testItemId: string): string => {
    // This would come from your standard test items definition
    const testItems: Record<string, string> = {
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
    return testItems[testItemId] || testItemId
  }

  return (
    <div className="space-y-4">
      <button
        onClick={handleExport}
        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Export to Excel
      </button>

      <div className="text-sm text-gray-600">
        <p>The export will include:</p>
        <ul className="list-disc list-inside mt-1">
          <li>Project summary with basic information</li>
          <li>List of all pages from the sitemap</li>
          <li>Review results with status color coding</li>
          <li>Detailed issues with priority levels</li>
        </ul>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        className="hidden"
        onChange={() => {}}
      />
    </div>
  )
}