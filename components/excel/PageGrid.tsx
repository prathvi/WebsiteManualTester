'use client'

import { useState } from 'react'
import { Page } from '@/types'

interface PageGridProps {
  pages: Page[]
  selectedPage: Page | null
  onPageSelect: (page: Page) => void
}

export default function PageGrid({ pages, selectedPage, onPageSelect }: PageGridProps) {
  const [selectedCell, setSelectedCell] = useState<string | null>(null)

  const columns = [
    { key: 'order', header: '#', width: 'w-16' },
    { key: 'title', header: 'Page Title', width: 'w-64' },
    { key: 'url', header: 'URL', width: 'w-96' },
    { key: 'status', header: 'Status', width: 'w-32' },
    { key: 'issues', header: 'Issues', width: 'w-24' }
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
      case 'status':
        return 'Pending' // Would come from reviews in real implementation
      case 'issues':
        return '0' // Would come from issues count in real implementation
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
      {pages.map((page) => (
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
    </div>
  )
}