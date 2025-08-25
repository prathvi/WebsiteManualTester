import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'

export async function GET() {
  try {
    const supabase = createClient()
    
    // Test connection by checking if we can access the database
    const { data, error } = await supabase
      .from('projects')
      .select('count', { count: 'exact', head: true })
    
    if (error) {
      // If table doesn't exist, try to get database version
      const { data: versionData, error: versionError } = await supabase
        .rpc('version')
        .single()
      
      if (versionError) {
        return NextResponse.json({
          success: false,
          message: 'Supabase connection failed',
          error: versionError.message,
          details: {
            url: process.env.NEXT_PUBLIC_SUPABASE_URL,
            hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
          }
        }, { status: 500 })
      }
      
      return NextResponse.json({
        success: true,
        message: 'Supabase connected successfully!',
        details: {
          database: 'Connected',
          version: versionData,
          tablesStatus: 'Tables not yet created',
          url: process.env.NEXT_PUBLIC_SUPABASE_URL
        }
      })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Supabase connected and tables exist!',
      details: {
        database: 'Connected',
        tablesExist: true,
        projectsTableAccess: 'Success',
        url: process.env.NEXT_PUBLIC_SUPABASE_URL
      }
    })
    
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: 'Failed to connect to Supabase',
      error: error.message,
      details: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      }
    }, { status: 500 })
  }
}