export interface Page {
  id: string;
  projectId?: string;
  url: string;
  title: string;
  parentId?: string;
  order: number;
  createdAt: Date;
}

export interface TestItem {
  id: string;
  type: 'visual' | 'functional';
  title: string;
  description: string;
  category: string;
}

export interface Review {
  id: string;
  pageId: string;
  testItemId: string;
  status: 'ok' | 'not-ok' | 'pending';
  comments?: string;
  priority?: 'high' | 'medium' | 'low';
  createdAt: Date;
  updatedAt: Date;
}

export interface Issue {
  id: string;
  reviewId: string;
  section: string;
  title: string;
  description: string;
  suggestedFix?: string;
  priority: 'high' | 'medium' | 'low';
  category: 'visual' | 'functional';
  createdAt: Date;
}

export interface Project {
  id: string;
  name: string;
  sitemapUrl?: string;
  baseUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExportData {
  project: Project;
  pages: Page[];
  reviews: Review[];
  issues: Issue[];
}