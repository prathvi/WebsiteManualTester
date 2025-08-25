import { NextRequest, NextResponse } from 'next/server'

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
    const urlMatches = text.matchAll(/<url>[\s\S]*?<loc>(.*?)<\/loc>[\s\S]*?<\/url>/g)
    
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
      const sitemapMatches = text.matchAll(/<sitemap>[\s\S]*?<loc>(.*?)<\/loc>[\s\S]*?<\/sitemap>/g)
      
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
              const subUrlMatches = subText.matchAll(/<url>[\s\S]*?<loc>(.*?)<\/loc>[\s\S]*?<\/url>/g)
              
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