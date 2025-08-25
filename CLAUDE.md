# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A website manual testing and review platform that allows users to systematically test and document issues on websites. The platform is distinct from automated testing tools and focuses on manual QA processes.

## Tech Stack

- **Frontend**: Next.js with TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **State Management**: React Context or Zustand
- **Data Export**: xlsx library for Excel exports

## Core Features Architecture

### 1. Sitemap Generation & Page Management
- Automatic sitemap extraction from URL input
- Manual page entry capability
- Hierarchical page structure (pages and sub-pages)

### 2. Testing Framework
Two main test categories:
- **Visual Checks**: Image functionality, text colors, font styles, layout consistency
- **Functional Checks**: Button functionality, form submissions, navigation, loading speed

### 3. Review System
- Status marking: "OK" or "Not OK" for each page/section
- Issue documentation with:
  - Section title
  - Issue details
  - Suggested fixes
  - Priority levels (High/Medium/Low)

### 4. Data Export
- Excel export with color-coded status indicators
- Maintains platform data structure in export

## Database Schema (Supabase)

Key tables:
- `projects`: Website testing projects
- `pages`: Individual pages within a project
- `test_items`: Standard test checklist items
- `reviews`: Test results for each page
- `issues`: Documented problems with priority levels

## Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Type checking
npm run type-check

# Run Supabase locally
npx supabase start

# Generate Supabase types
npx supabase gen types typescript --local > lib/database.types.ts
```

## Project Structure

```
/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── (dashboard)/       # Dashboard pages
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── sitemap/          # Sitemap-related components
│   ├── testing/          # Test execution components
│   └── export/           # Export functionality
├── lib/                   # Utilities and configurations
│   ├── supabase/         # Supabase client and helpers
│   └── utils/            # Helper functions
├── hooks/                 # Custom React hooks
└── types/                # TypeScript type definitions
```

## Implementation Guidelines

1. **Single Page Application**: Design as a scrollable single page for reviewing all pages and sub-pages
2. **Real-time Updates**: Use Supabase real-time subscriptions for collaborative testing
3. **Responsive Design**: Ensure mobile compatibility for on-site testing
4. **Performance**: Implement virtual scrolling for large sitemaps
5. **Data Persistence**: Auto-save review progress to prevent data loss

## Supabase Integration

- Use Row Level Security (RLS) for multi-tenant support
- Implement authentication for team collaboration
- Store images/screenshots in Supabase Storage
- Use database functions for complex queries

## Testing Approach

- Component testing with React Testing Library
- E2E testing with Playwright for critical user flows
- API testing for Supabase functions

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=
```[byterover-mcp]

# important 
always use byterover-retrieve-knowledge tool to get the related context before any tasks 
always use byterover-store-knowledge to store all the critical informations after sucessful tasks