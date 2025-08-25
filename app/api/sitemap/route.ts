import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const url = searchParams.get('url')

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 })
  }

  try {
    // Fetch the sitemap
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; WebsiteManualTester/1.0)',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch sitemap: ${response.status}`)
    }

    const text = await response.text()
    
    // Parse XML sitemap
    const pages: { url: string; title?: string }[] = []
    
    // Simple XML parsing for sitemap
    const urlMatches = Array.from(text.matchAll(/<url>[\s\S]*?<loc>(.*?)<\/loc>[\s\S]*?<\/url>/g))
    
    for (const match of urlMatches) {
      if (match[1]) {
        const pageUrl = match[1].trim()
        const urlObj = new URL(pageUrl)
        const pathname = urlObj.pathname
        
        // Generate title from URL path
        let title = pathname === '/' ? 'Home' : pathname
          .split('/')
          .filter(Boolean)
          .map(segment => segment
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
          )
          .join(' - ')
        
        pages.push({ url: pageUrl, title })
      }
    }

    // If no URLs found, try parsing as sitemap index
    if (pages.length === 0) {
      const sitemapMatches = Array.from(text.matchAll(/<sitemap>[\s\S]*?<loc>(.*?)<\/loc>[\s\S]*?<\/sitemap>/g))
      
      for (const match of sitemapMatches) {
        if (match[1]) {
          // Recursively fetch sub-sitemaps
          try {
            const subResponse = await fetch(match[1].trim(), {
              headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; WebsiteManualTester/1.0)',
              },
            })
            
            if (subResponse.ok) {
              const subText = await subResponse.text()
              const subUrlMatches = Array.from(subText.matchAll(/<url>[\s\S]*?<loc>(.*?)<\/loc>[\s\S]*?<\/url>/g))
              
              for (const subMatch of subUrlMatches) {
                if (subMatch[1]) {
                  const pageUrl = subMatch[1].trim()
                  const urlObj = new URL(pageUrl)
                  const pathname = urlObj.pathname
                  
                  let title = pathname === '/' ? 'Home' : pathname
                    .split('/')
                    .filter(Boolean)
                    .map(segment => segment
                      .split('-')
                      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                      .join(' ')
                    )
                    .join(' - ')
                  
                  pages.push({ url: pageUrl, title })
                }
              }
            }
          } catch (subError) {
            console.error('Error fetching sub-sitemap:', subError)
          }
        }
      }
    }

    return NextResponse.json({ pages })
  } catch (error) {
    console.error('Error fetching sitemap:', error)
    return NextResponse.json(
      { error: 'Failed to fetch or parse sitemap' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { sitemapUrl, websiteId } = await request.json()
    
    if (!sitemapUrl || !websiteId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Fetch the sitemap
    const response = await fetch(sitemapUrl)
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch sitemap' },
        { status: 400 }
      )
    }

    const sitemapXml = await response.text()
    
    // Parse the sitemap XML
    const urlRegex = /<loc>(.*?)<\/loc>/g
    const urls: string[] = []
    let match
    
    while ((match = urlRegex.exec(sitemapXml)) !== null) {
      urls.push(match[1])
    }

    if (urls.length === 0) {
      return NextResponse.json(
        { error: 'No URLs found in sitemap' },
        { status: 400 }
      )
    }

    // Insert pages into database
    const supabase = createClient()
    const pages = urls.map((url, index) => {
      // Extract title from URL (last segment, cleaned up)
      const urlObj = new URL(url)
      const pathSegments = urlObj.pathname.split('/').filter(Boolean)
      const title = pathSegments.length > 0 
        ? pathSegments[pathSegments.length - 1]
            .replace(/-/g, ' ')
            .replace(/_/g, ' ')
            .replace(/\.\w+$/, '') // Remove file extensions
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
        : 'Home'

      return {
        website_id: websiteId,
        url,
        title: title || 'Untitled',
        order_index: index
      }
    })

    const { data, error } = await supabase
      .from('pages')
      .insert(pages)
      .select()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to save pages' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      pagesCount: data?.length || 0,
      pages: data
    })
  } catch (error) {
    console.error('Sitemap import error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}