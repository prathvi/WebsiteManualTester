'use client'

import { useState } from 'react'
import { Page, TestItem, Review, Issue } from '@/types'

interface TestingPanelProps {
  page: Page
}

const standardTestItems: TestItem[] = [
  // Visual Tests
  {
    id: 'visual-1',
    type: 'visual',
    title: 'Images Loading',
    description: 'Check that all images on the page load properly without broken links',
    category: 'Visual'
  },
  {
    id: 'visual-2',
    type: 'visual',
    title: 'Text Colors',
    description: 'Verify text colors match the design specifications',
    category: 'Visual'
  },
  {
    id: 'visual-3',
    type: 'visual',
    title: 'Font Styles',
    description: 'Check that fonts are consistent with the design system',
    category: 'Visual'
  },
  {
    id: 'visual-4',
    type: 'visual',
    title: 'Layout Consistency',
    description: 'Ensure layout is consistent across different screen sizes',
    category: 'Visual'
  },
  {
    id: 'visual-5',
    type: 'visual',
    title: 'Color Contrast',
    description: 'Verify color contrast meets accessibility standards',
    category: 'Visual'
  },
  
  // Functional Tests
  {
    id: 'functional-1',
    type: 'functional',
    title: 'Page Loading Speed',
    description: 'Check page loading time and performance',
    category: 'Performance'
  },
  {
    id: 'functional-2',
    type: 'functional',
    title: 'Navigation Links',
    description: 'Test all navigation links work correctly',
    category: 'Navigation'
  },
  {
    id: 'functional-3',
    type: 'functional',
    title: 'Form Submissions',
    description: 'Test form validation and submission functionality',
    category: 'Forms'
  },
  {
    id: 'functional-4',
    type: 'functional',
    title: 'Button Functionality',
    description: 'Verify all buttons perform expected actions',
    category: 'Interactions'
  },
  {
    id: 'functional-5',
    type: 'functional',
    title: 'Error Handling',
    description: 'Test error messages and recovery mechanisms',
    category: 'Error Handling'
  }
]

export default function TestingPanel({ page }: TestingPanelProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [issues, setIssues] = useState<Issue[]>([])

  const handleReviewChange = (testItemId: string, status: Review['status']) => {
    const existingReviewIndex = reviews.findIndex(r => r.testItemId === testItemId && r.pageId === page.id)
    
    if (existingReviewIndex >= 0) {
      const updatedReviews = [...reviews]
      updatedReviews[existingReviewIndex] = {
        ...updatedReviews[existingReviewIndex],
        status,
        updatedAt: new Date()
      }
      setReviews(updatedReviews)
    } else {
      const newReview: Review = {
        id: `${page.id}-${testItemId}`,
        pageId: page.id,
        testItemId,
        status,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      setReviews([...reviews, newReview])
    }

    // If status is "ok", remove any related issues
    if (status === 'ok') {
      setIssues(issues.filter(issue => {
        const review = reviews.find(r => r.id === issue.reviewId)
        return !(review && review.testItemId === testItemId && review.pageId === page.id)
      }))
    }
  }

  const handleIssueAdd = (reviewId: string, issueData: Omit<Issue, 'id' | 'reviewId' | 'createdAt'>) => {
    const newIssue: Issue = {
      id: `${reviewId}-${Date.now()}`,
      reviewId,
      ...issueData,
      createdAt: new Date()
    }
    setIssues([...issues, newIssue])
  }

  const getReviewForTest = (testItemId: string) => {
    return reviews.find(r => r.testItemId === testItemId && r.pageId === page.id)
  }

  const getIssuesForReview = (reviewId: string) => {
    return issues.filter(issue => issue.reviewId === reviewId)
  }

  return (
    <div className="space-y-6">
      {/* Page Preview */}
      <div className="bg-gray-100 p-4 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-2">Page Preview</h3>
        <p className="text-sm text-gray-600">{page.url}</p>
        <div className="mt-2">
          <a
            href={page.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            Open page in new tab →
          </a>
        </div>
      </div>

      {/* Test Items */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Test Checklist</h3>
        
        {standardTestItems.map((testItem) => {
          const review = getReviewForTest(testItem.id)
          const reviewIssues = review ? getIssuesForReview(review.id) : []
          
          return (
            <div key={testItem.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{testItem.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{testItem.description}</p>
                  <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full mt-2">
                    {testItem.type} • {testItem.category}
                  </span>
                </div>
                
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleReviewChange(testItem.id, 'ok')}
                    className={`px-3 py-1 rounded text-sm ${
                      review?.status === 'ok'
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    OK
                  </button>
                  <button
                    onClick={() => handleReviewChange(testItem.id, 'not-ok')}
                    className={`px-3 py-1 rounded text-sm ${
                      review?.status === 'not-ok'
                        ? 'bg-red-100 text-red-800 border border-red-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Not OK
                  </button>
                </div>
              </div>

              {/* Issue Reporting */}
              {review?.status === 'not-ok' && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <h5 className="font-medium text-red-900 mb-2">Report Issue</h5>
                  <IssueForm
                    reviewId={review.id}
                    testItem={testItem}
                    onIssueAdd={handleIssueAdd}
                    existingIssues={reviewIssues}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

interface IssueFormProps {
  reviewId: string
  testItem: TestItem
  onIssueAdd: (reviewId: string, issueData: Omit<Issue, 'id' | 'reviewId' | 'createdAt'>) => void
  existingIssues: Issue[]
}

function IssueForm({ reviewId, testItem, onIssueAdd, existingIssues }: IssueFormProps) {
  const [section, setSection] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [suggestedFix, setSuggestedFix] = useState('')
  const [priority, setPriority] = useState<Issue['priority']>('medium')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!section || !title || !description) return

    onIssueAdd(reviewId, {
      section,
      title,
      description,
      suggestedFix,
      priority,
      category: testItem.type
    })

    // Reset form
    setSection('')
    setTitle('')
    setDescription('')
    setSuggestedFix('')
    setPriority('medium')
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Section
            </label>
            <input
              type="text"
              value={section}
              onChange={(e) => setSection(e.target.value)}
              placeholder="e.g., Header, Footer, Main Content"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Issue['priority'])}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Issue Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Brief description of the issue"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Detailed Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the issue in detail..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Suggested Fix (Optional)
          </label>
          <textarea
            value={suggestedFix}
            onChange={(e) => setSuggestedFix(e.target.value)}
            placeholder="Suggest how to fix this issue..."
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Add Issue
        </button>
      </form>

      {/* Existing Issues */}
      {existingIssues.length > 0 && (
        <div className="mt-4">
          <h6 className="font-medium text-red-900 mb-2">Existing Issues:</h6>
          {existingIssues.map((issue) => (
            <div key={issue.id} className="bg-white p-2 rounded border mb-2">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{issue.title}</p>
                  <p className="text-sm text-gray-600">{issue.section}</p>
                  <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 priority-${issue.priority}`}>
                    {issue.priority}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}