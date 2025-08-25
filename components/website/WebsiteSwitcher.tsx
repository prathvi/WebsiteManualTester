'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, Plus, Trash2, Globe, Check } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { Website } from '@/types/database'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface WebsiteSwitcherProps {
  currentWebsiteId: string | null
  onWebsiteChange: (website: Website | null) => void
  onAddWebsite: () => void
}

export default function WebsiteSwitcher({ 
  currentWebsiteId, 
  onWebsiteChange, 
  onAddWebsite 
}: WebsiteSwitcherProps) {
  const [websites, setWebsites] = useState<Website[]>([])
  const [currentWebsite, setCurrentWebsite] = useState<Website | null>(null)
  const [deleteWebsite, setDeleteWebsite] = useState<Website | null>(null)
  const [loading, setLoading] = useState(true)
  
  const supabase = createClient()

  useEffect(() => {
    fetchWebsites()
  }, [])

  useEffect(() => {
    if (currentWebsiteId && websites.length > 0) {
      const website = websites.find(w => w.id === currentWebsiteId)
      if (website) {
        setCurrentWebsite(website)
      }
    } else if (!currentWebsiteId && websites.length > 0) {
      // Auto-select first website if none selected
      handleSelectWebsite(websites[0])
    }
  }, [currentWebsiteId, websites])

  const fetchWebsites = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('websites')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Failed to fetch websites:', error)
        // Don't throw error, just set empty array
        setWebsites([])
      } else {
        setWebsites(data || [])
      }
    } catch (error) {
      console.error('Failed to fetch websites:', error)
      setWebsites([])
    } finally {
      setLoading(false)
    }
  }

  const handleSelectWebsite = (website: Website) => {
    setCurrentWebsite(website)
    onWebsiteChange(website)
  }

  const handleDeleteWebsite = async () => {
    if (!deleteWebsite) return

    try {
      // Soft delete by setting deleted_at
      const { error } = await supabase
        .from('websites')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', deleteWebsite.id)

      if (error) throw error

      // Remove from local state
      setWebsites(prev => prev.filter(w => w.id !== deleteWebsite.id))
      
      // If deleting current website, select another or null
      if (currentWebsite?.id === deleteWebsite.id) {
        const remainingWebsites = websites.filter(w => w.id !== deleteWebsite.id)
        if (remainingWebsites.length > 0) {
          handleSelectWebsite(remainingWebsites[0])
        } else {
          setCurrentWebsite(null)
          onWebsiteChange(null)
        }
      }

      setDeleteWebsite(null)
    } catch (error) {
      console.error('Failed to delete website:', error)
    }
  }

  if (loading) {
    return (
      <Button variant="outline" disabled className="min-w-[200px]">
        <Globe className="mr-2 h-4 w-4" />
        Loading...
      </Button>
    )
  }

  if (websites.length === 0) {
    return (
      <Button onClick={onAddWebsite} variant="outline">
        <Plus className="mr-2 h-4 w-4" />
        Add Website
      </Button>
    )
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="min-w-[200px] justify-between">
            <div className="flex items-center">
              <Globe className="mr-2 h-4 w-4" />
              <span className="truncate">
                {currentWebsite ? currentWebsite.name : 'Select Website'}
              </span>
            </div>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[250px]">
          {websites.map((website) => (
            <DropdownMenuItem
              key={website.id}
              className="flex items-center justify-between group"
              onSelect={() => handleSelectWebsite(website)}
            >
              <div className="flex items-center flex-1 min-w-0">
                {currentWebsite?.id === website.id && (
                  <Check className="mr-2 h-4 w-4 shrink-0" />
                )}
                <div className="truncate">
                  <div className="font-medium truncate">{website.name}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {new URL(website.base_url).hostname}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 ml-2 h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation()
                  setDeleteWebsite(website)
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={onAddWebsite}>
            <Plus className="mr-2 h-4 w-4" />
            Add New Website
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={!!deleteWebsite} onOpenChange={() => setDeleteWebsite(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Website</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteWebsite?.name}"? 
              This will also delete all associated pages, test results, and issues.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteWebsite}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}