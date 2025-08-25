'use client'

import { useState } from 'react'
import SitemapInput from '@/components/sitemap/SitemapInput'
import PageList from '@/components/sitemap/PageList'
import TestingPanel from '@/components/testing/TestingPanel'
import ExportButton from '@/components/export/ExportButton'
import { Page, Project } from '@/types'

export default function Home() {
  const [project, setProject] = useState<Project | null>(null)
  const [pages, setPages] = useState<Page[]>([])
  const [selectedPage, setSelectedPage] = useState<Page | null>(null)

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
  }

  return (
    <div className="space-y-8">
      {/* Project Setup Section */}
      <section className="bg-card rounded-lg shadow p-4 md:p-6">
        <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-4">
          Project Setup
        </h2>
        <SitemapInput onSitemapLoaded={handleSitemapLoaded} />
      </section>

      {/* Pages List Section */}
      {pages.length > 0 && (
        <section className="bg-card rounded-lg shadow p-4 md:p-6">
          <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-4">
            Pages to Test ({pages.length})
          </h2>
          <PageList
            pages={pages}
            selectedPage={selectedPage}
            onPageSelect={handlePageSelect}
          />
        </section>
      )}

      {/* Testing Section */}
      {selectedPage && (
        <section className="bg-card rounded-lg shadow p-4 md:p-6">
          <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-4">
            Testing: {selectedPage.title}
          </h2>
          <TestingPanel page={selectedPage} />
        </section>
      )}

      {/* Export Section */}
      {project && pages.length > 0 && (
        <section className="bg-card rounded-lg shadow p-4 md:p-6">
          <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-4">
            Export Results
          </h2>
          <ExportButton project={project} pages={pages} />
        </section>
      )}
    </div>
  )
}