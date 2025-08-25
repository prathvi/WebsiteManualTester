'use client'

import { useState } from 'react'
import { Page } from '@/types'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PageGridProps {
  pages: Page[]
  selectedPage: Page | null
  onPageSelect: (page: Page) => void
  issuesPerPage?: Record<string, number>
}

export default function PageGrid({ pages, selectedPage, onPageSelect, issuesPerPage = {} }: PageGridProps) {
  const [selectedCell, setSelectedCell] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  const totalPages = Math.ceil(pages.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentPages = pages.slice(startIndex, startIndex + itemsPerPage)

  const columns = [
    { key: 'order', header: '#', width: 'w-12' },
    { key: 'title', header: 'Page Title', width: 'w-48' },
    { key: 'url', header: 'URL', width: 'w-64' },
    { key: 'loading', header: 'Loading', width: 'w-20' },
    { key: 'images', header: 'Images', width: 'w-20' },
    { key: 'colors', header: 'Colors', width: 'w-20' },
    { key: 'fonts', header: 'Fonts', width: 'w-20' },
    { key: 'layout', header: 'Layout', width: 'w-20' },
    { key: 'navigation', header: 'Navigation', width: 'w-24' },
    { key: 'status', header: 'Overall', width: 'w-24' },
    { key: 'issues', header: 'Issues', width: 'w-20' }
  ]

  const handleCellClick = (pageId: string, columnKey: string) => {
    setSelectedCell(`${pageId}-${columnKey}`)
    const page = pages.find(p => p.id === pageId)
    if (page) {
      onPageSelect(page)
    }
  }

  const getCellValue = (page: Page, columnKey: string) => {
    switch (columnKey) {
      case 'order':
        return page.order + 1
      case 'title':
        return page.title
      case 'url':
        return page.url
      case 'loading':
        return '✓' // Loading speed check
      case 'images':
        return '✓' // Images check
      case 'colors':
        return '✓' // Colors check
      case 'fonts':
        return '✓' // Fonts check
      case 'layout':
        return '✓' // Layout check
      case 'navigation':
        return '✓' // Navigation check
      case 'status':
        return 'Pending'
      case 'issues':
        return issuesPerPage[page.id] || 0
      default:
        return ''
    }
  }

  return (
    <div className="excel-grid">
      {/* Header Row */}
      <div className="excel-row">
        {columns.map((column) => (
          <div
            key={column.key}
            className={`excel-cell excel-header ${column.width}`}
          >
            {column.header}
          </div>
        ))}
      </div>

      {/* Data Rows */}
      {currentPages.map((page) => (
        <div
          key={page.id}
          className={`excel-row ${
            selectedPage?.id === page.id ? 'bg-accent/50' : ''
          }`}
        >
          {columns.map((column) => (
            <div
              key={`${page.id}-${column.key}`}
              className={`excel-cell ${column.width} ${
                selectedCell === `${page.id}-${column.key}` ? 'excel-selected' : ''
              } cursor-pointer hover:bg-accent/30`}
              onClick={() => handleCellClick(page.id, column.key)}
            >
              {getCellValue(page, column.key)}
            </div>
          ))}
        </div>
      ))}

      {/* Empty state */}
      {pages.length === 0 && (
        <div className="excel-row">
          <div className="excel-cell w-full text-center text-muted-foreground py-8">
            No pages loaded. Import a sitemap to get started.
          </div>
        </div>
      )}

      {/* Pagination */}
      {pages.length > itemsPerPage && (
        <div className="excel-row bg-muted">
          <div className="excel-cell w-full flex items-center justify-between p-2">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, pages.length)} of {pages.length} pages
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}