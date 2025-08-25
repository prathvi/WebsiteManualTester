'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

export default function SupabaseTestPage() {
  const [connectionStatus, setConnectionStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState<any[]>([])

  useEffect(() => {
    testConnection()
  }, [])

  const testConnection = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/test-supabase')
      const data = await response.json()
      setConnectionStatus(data)
      
      if (data.success) {
        fetchProjects()
      }
    } catch (error) {
      setConnectionStatus({
        success: false,
        message: 'Failed to test connection',
        error: error
      })
    }
    setLoading(false)
  }

  const fetchProjects = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .limit(10)
    
    if (!error && data) {
      setProjects(data)
    }
  }

  const createTestProject = async () => {
    const supabase = createClient()
    
    const testProject = {
      name: `Test Project ${new Date().toISOString()}`,
      base_url: 'https://example.com',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    const { data, error } = await supabase
      .from('projects')
      .insert([testProject])
      .select()
    
    if (error) {
      alert(`Error creating project: ${error.message}`)
    } else {
      alert('Test project created successfully!')
      fetchProjects()
    }
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Supabase Connection Test</h1>
      
      {loading ? (
        <div>Testing connection...</div>
      ) : (
        <div className="space-y-6">
          {/* Connection Status */}
          <div className={`p-4 rounded-lg ${connectionStatus?.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border`}>
            <h2 className="text-xl font-semibold mb-2">Connection Status</h2>
            <p className={`text-lg ${connectionStatus?.success ? 'text-green-700' : 'text-red-700'}`}>
              {connectionStatus?.message}
            </p>
            {connectionStatus?.details && (
              <div className="mt-3 text-sm">
                <pre className="bg-white p-2 rounded border">
                  {JSON.stringify(connectionStatus.details, null, 2)}
                </pre>
              </div>
            )}
            {connectionStatus?.error && (
              <div className="mt-2 text-red-600 text-sm">
                Error: {connectionStatus.error}
              </div>
            )}
          </div>

          {/* Test Actions */}
          {connectionStatus?.success && (
            <div className="space-y-4">
              <div className="flex gap-4">
                <Button onClick={testConnection}>
                  Retest Connection
                </Button>
                <Button onClick={createTestProject} variant="outline">
                  Create Test Project
                </Button>
              </div>

              {/* Projects List */}
              {projects.length > 0 && (
                <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-3">Projects in Database</h3>
                  <div className="space-y-2">
                    {projects.map((project) => (
                      <div key={project.id} className="p-2 bg-gray-50 rounded">
                        <div className="font-medium">{project.name}</div>
                        <div className="text-sm text-gray-600">{project.base_url}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}