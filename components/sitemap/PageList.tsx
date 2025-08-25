'use client'

import { Page } from '@/types'

interface PageListProps {
  pages: Page[]
  selectedPage: Page | null
  onPageSelect: (page: Page) => void
}

export default function PageList({ pages, selectedPage, onPageSelect }: PageListProps) {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pages.map((page) => (
          <button
            key={page.id}
            onClick={() => onPageSelect(page)}
            className={`p-4 border rounded-lg text-left transition-colors ${
              selectedPage?.id === page.id
                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-100'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <h3 className="font-medium text-gray-900 mb-2">{page.title}</h3>
            <p className="text-sm text-gray-600 truncate">{page.url}</p>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-gray-500">
                Order: {page.order}
              </span>
              {selectedPage?.id === page.id && (
                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                  Selected
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
      
      {pages.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No pages loaded. Please load a sitemap first.
        </div>
      )}
    </div>
  )
}