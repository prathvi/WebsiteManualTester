'use client'

import { Button } from '@/components/ui/button'
import { Home, FileText, CheckSquare, Download, Upload, Settings, Plus } from 'lucide-react'
import SitemapDialog from './SitemapDialog'

interface RibbonProps {
  onSitemapLoaded: (pages: any[], baseUrl: string) => void
  onExport: () => void
  onSettings: () => void
  onAddPage?: () => void
}

export default function Ribbon({ onSitemapLoaded, onExport, onSettings, onAddPage }: RibbonProps) {
  return (
    <div className="excel-ribbon">
      <div className="flex items-center gap-4">
        {/* File Section */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="gap-2">
            <Home className="h-4 w-4" />
            Home
          </Button>
          
          <SitemapDialog onSitemapLoaded={onSitemapLoaded}>
            <Button variant="ghost" size="sm" className="gap-2">
              <Upload className="h-4 w-4" />
              Import Sitemap
            </Button>
          </SitemapDialog>
          
          <Button variant="ghost" size="sm" className="gap-2" onClick={onExport}>
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>

        {/* Testing Section */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="gap-2">
            <FileText className="h-4 w-4" />
            Pages
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-2"
            onClick={onAddPage}
          >
            <Plus className="h-4 w-4" />
            Add Page
          </Button>
          <Button variant="ghost" size="sm" className="gap-2">
            <CheckSquare className="h-4 w-4" />
            Tests
          </Button>
        </div>

        {/* Settings */}
        <div className="flex items-center gap-2 ml-auto">
          <Button variant="ghost" size="sm" className="gap-2" onClick={onSettings}>
            <Settings className="h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>
    </div>
  )
}