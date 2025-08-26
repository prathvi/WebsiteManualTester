'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { Website } from '@/types/database'
import { Loader2, Globe, FileText, CheckCircle, Copy } from 'lucide-react'

interface AddWebsiteWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onWebsiteAdded: (website: Website) => void
}

type WizardStep = 'details' | 'sitemap' | 'duplicate' | 'complete'

export default function AddWebsiteWizard({ open, onOpenChange, onWebsiteAdded }: AddWebsiteWizardProps) {
  const [step, setStep] = useState<WizardStep>('details')
  const [websiteName, setWebsiteName] = useState('')
  const [baseUrl, setBaseUrl] = useState('')
  const [sitemapUrl, setSitemapUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [createdWebsite, setCreatedWebsite] = useState<Website | null>(null)
  const [importedPagesCount, setImportedPagesCount] = useState(0)
  const [duplicateFrom, setDuplicateFrom] = useState<string>('none')
  const [existingWebsites, setExistingWebsites] = useState<Website[]>([])

  const supabase = createClient()

  // Load existing websites when dialog opens
  useEffect(() => {
    if (open) {
      loadExistingWebsites()
    }
  }, [open])

  const loadExistingWebsites = async () => {
    const { data, error } = await supabase
      .from('websites')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setExistingWebsites(data)
    }
  }

  const resetWizard = () => {
    setStep('details')
    setWebsiteName('')
    setBaseUrl('')
    setSitemapUrl('')
    setError(null)
    setCreatedWebsite(null)
    setImportedPagesCount(0)
    setDuplicateFrom('none')
  }

  const handleClose = () => {
    resetWizard()
    onOpenChange(false)
  }

  const validateUrl = (url: string) => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const handleDetailsSubmit = async () => {
    setError(null)

    if (!websiteName.trim()) {
      setError('Please enter a website name')
      return
    }

    if (!validateUrl(baseUrl)) {
      setError('Please enter a valid URL')
      return
    }

    // If there are existing websites, show duplicate option
    if (existingWebsites.length > 0) {
      setStep('duplicate')
    } else {
      setStep('sitemap')
    }
  }

  const handleDuplicateSubmit = async () => {
    setLoading(true)
    setError(null)

    try {
      // Create the website
      const { data: website, error: websiteError } = await supabase
        .from('websites')
        .insert({
          name: websiteName,
          base_url: baseUrl
        })
        .select()
        .single()

      if (websiteError) throw websiteError

      setCreatedWebsite(website)

      // If duplicating from existing website
      if (duplicateFrom && duplicateFrom !== 'none') {
        // Fetch pages from the selected website
        const { data: pages, error: pagesError } = await supabase
          .from('pages')
          .select('title, url, order_index')
          .eq('website_id', duplicateFrom)
          .order('order_index')

        if (!pagesError && pages && pages.length > 0) {
          // Create duplicated pages for the new website
          const newPages = pages.map(page => ({
            website_id: website.id,
            title: page.title,
            url: page.url.replace(
              existingWebsites.find(w => w.id === duplicateFrom)?.base_url || '',
              baseUrl
            ),
            order_index: page.order_index
          }))

          const { error: insertError } = await supabase
            .from('pages')
            .insert(newPages)

          if (insertError) {
            console.warn('Failed to duplicate some pages:', insertError)
          } else {
            setImportedPagesCount(newPages.length)
          }
        }
      } else {
        // Continue to sitemap step
        setStep('sitemap')
        return
      }

      setStep('complete')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create website')
    } finally {
      setLoading(false)
    }
  }

  const handleSitemapSubmit = async () => {
    setLoading(true)
    setError(null)

    try {
      // Create the website
      const { data: website, error: websiteError } = await supabase
        .from('websites')
        .insert({
          name: websiteName,
          base_url: baseUrl,
          sitemap_url: sitemapUrl || null
        })
        .select()
        .single()

      if (websiteError) throw websiteError

      setCreatedWebsite(website)

      // Import sitemap if URL is provided
      if (sitemapUrl && validateUrl(sitemapUrl)) {
        const response = await fetch('/api/sitemap', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            sitemapUrl,
            websiteId: website.id 
          })
        })

        if (!response.ok) {
          console.warn('Failed to import sitemap, but website was created')
        } else {
          const data = await response.json()
          setImportedPagesCount(data.pagesCount || 0)
        }
      } else {
        // Create a default home page if no sitemap
        await supabase
          .from('pages')
          .insert({
            website_id: website.id,
            url: baseUrl,
            title: 'Home',
            order_index: 0
          })
        setImportedPagesCount(1)
      }

      setStep('complete')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create website')
    } finally {
      setLoading(false)
    }
  }

  const handleComplete = () => {
    if (createdWebsite) {
      onWebsiteAdded(createdWebsite)
    }
    handleClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        {step === 'details' && (
          <>
            <DialogHeader>
              <DialogTitle>Add New Website</DialogTitle>
              <DialogDescription>
                Enter the details of the website you want to test
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Website Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., My Company Website"
                  value={websiteName}
                  onChange={(e) => setWebsiteName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="url">Base URL</Label>
                <Input
                  id="url"
                  type="url"
                  placeholder="https://example.com"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                />
              </div>
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleDetailsSubmit}>
                Next
              </Button>
            </div>
          </>
        )}

        {step === 'duplicate' && (
          <>
            <DialogHeader>
              <DialogTitle>Duplicate Pages (Optional)</DialogTitle>
              <DialogDescription>
                Copy page structure from an existing website or start fresh
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="duplicate">Duplicate pages from</Label>
                <Select value={duplicateFrom} onValueChange={setDuplicateFrom}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a website to copy pages from..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Don't duplicate (start fresh)</SelectItem>
                    {existingWebsites.map((website) => (
                      <SelectItem key={website.id} value={website.id}>
                        <div className="flex items-center gap-2">
                          <Copy className="h-3 w-3" />
                          {website.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  This will copy page titles and relative URLs from the selected website
                </p>
              </div>
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
            </div>
            <div className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => setStep('details')}
                disabled={loading}
              >
                Back
              </Button>
              <div className="flex gap-2">
                {duplicateFrom === 'none' && (
                  <Button
                    variant="outline"
                    onClick={() => setStep('sitemap')}
                    disabled={loading}
                  >
                    Continue to Sitemap
                  </Button>
                )}
                <Button onClick={handleDuplicateSubmit} disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {duplicateFrom !== 'none' ? 'Create & Duplicate' : 'Continue'}
                </Button>
              </div>
            </div>
          </>
        )}

        {step === 'sitemap' && (
          <>
            <DialogHeader>
              <DialogTitle>Import Sitemap (Optional)</DialogTitle>
              <DialogDescription>
                Provide a sitemap URL to automatically import all pages, or skip to add pages manually
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="sitemap">Sitemap URL</Label>
                <Input
                  id="sitemap"
                  type="url"
                  placeholder="https://example.com/sitemap.xml"
                  value={sitemapUrl}
                  onChange={(e) => setSitemapUrl(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Leave empty to start with just the home page
                </p>
              </div>
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
            </div>
            <div className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => existingWebsites.length > 0 ? setStep('duplicate') : setStep('details')}
                disabled={loading}
              >
                Back
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSitemapUrl('')
                    handleSitemapSubmit()
                  }}
                  disabled={loading}
                >
                  Skip
                </Button>
                <Button onClick={handleSitemapSubmit} disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Website
                </Button>
              </div>
            </div>
          </>
        )}

        {step === 'complete' && (
          <>
            <DialogHeader>
              <DialogTitle>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Website Added Successfully
                </div>
              </DialogTitle>
            </DialogHeader>
            <div className="py-6 space-y-3">
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{websiteName}</p>
                  <p className="text-sm text-muted-foreground">{baseUrl}</p>
                </div>
              </div>
              {importedPagesCount > 0 && (
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <p className="text-sm">
                    {importedPagesCount} {importedPagesCount === 1 ? 'page' : 'pages'} imported
                  </p>
                </div>
              )}
            </div>
            <div className="flex justify-end">
              <Button onClick={handleComplete}>
                Start Testing
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}