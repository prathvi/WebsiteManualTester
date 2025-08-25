import { createClient } from './client'
import { Database } from '@/lib/database.types'
import { Page, Project, Review, Issue, TestItem } from '@/types'

type Tables = Database['public']['Tables']

export async function createProject(projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('projects')
    .insert({
      name: projectData.name,
      sitemap_url: projectData.sitemapUrl,
      base_url: projectData.baseUrl
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function createPages(projectId: string, pages: Omit<Page, 'id' | 'projectId' | 'createdAt'>[]) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('pages')
    .insert(
      pages.map(page => ({
        project_id: projectId,
        url: page.url,
        title: page.title,
        parent_id: page.parentId,
        order: page.order
      }))
    )
    .select()

  if (error) throw error
  return data
}

export async function saveReview(reviewData: Omit<Review, 'id' | 'createdAt' | 'updatedAt'>) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('reviews')
    .upsert({
      page_id: reviewData.pageId,
      test_item_id: reviewData.testItemId,
      status: reviewData.status,
      comments: reviewData.comments,
      priority: reviewData.priority
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function createIssue(issueData: Omit<Issue, 'id' | 'createdAt'>) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('issues')
    .insert({
      review_id: issueData.reviewId,
      section: issueData.section,
      title: issueData.title,
      description: issueData.description,
      suggested_fix: issueData.suggestedFix,
      priority: issueData.priority,
      category: issueData.category
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getProjectPages(projectId: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .eq('project_id', projectId)
    .order('order')

  if (error) throw error
  return data
}

export async function getPageReviews(pageId: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('page_id', pageId)

  if (error) throw error
  return data
}

export async function getReviewIssues(reviewId: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('issues')
    .select('*')
    .eq('review_id', reviewId)

  if (error) throw error
  return data
}

export async function getStandardTestItems() {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('test_items')
    .select('*')
    .order('created_at')

  if (error) throw error
  return data
}

// Helper function to convert database types to app types
export function convertToAppPage(dbPage: Tables['pages']['Row']): Page {
  return {
    id: dbPage.id,
    url: dbPage.url,
    title: dbPage.title,
    parentId: dbPage.parent_id || undefined,
    order: dbPage.order,
    createdAt: new Date(dbPage.created_at)
  }
}

export function convertToAppReview(dbReview: Tables['reviews']['Row']): Review {
  return {
    id: dbReview.id,
    pageId: dbReview.page_id,
    testItemId: dbReview.test_item_id,
    status: dbReview.status,
    comments: dbReview.comments || undefined,
    priority: dbReview.priority || undefined,
    createdAt: new Date(dbReview.created_at),
    updatedAt: new Date(dbReview.updated_at)
  }
}

export function convertToAppIssue(dbIssue: Tables['issues']['Row']): Issue {
  return {
    id: dbIssue.id,
    reviewId: dbIssue.review_id,
    section: dbIssue.section,
    title: dbIssue.title,
    description: dbIssue.description,
    suggestedFix: dbIssue.suggested_fix || undefined,
    priority: dbIssue.priority,
    category: dbIssue.category,
    createdAt: new Date(dbIssue.created_at)
  }
}