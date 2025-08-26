# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A website manual testing and review platform that allows users to systematically test and document issues on websites. The platform features an Excel-like interface for familiar QA workflows and is distinct from automated testing tools, focusing exclusively on manual testing processes.

## Tech Stack

- **Framework**: Next.js 14.2.5 with App Router
- **Language**: TypeScript with strict mode
- **Styling**: Tailwind CSS with custom Excel-like theme
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **State Management**: React Context + Zustand
- **UI Components**: Radix UI + shadcn/ui
- **Data Export**: xlsx library for Excel exports
- **Package Manager**: pnpm 10.13.1

## Development Commands

```bash
# Install dependencies
pnpm install

# Development server (port 3000)
pnpm run dev

# Production build
pnpm run build

# Start production server
pnpm run start

# Code quality
pnpm run lint         # ESLint analysis
pnpm run type-check   # TypeScript type checking

# Supabase commands
npx supabase start           # Start local Supabase
npx supabase db push         # Push migrations to database
npx supabase gen types typescript --local > lib/database.types.ts  # Generate TypeScript types
```

## Core Architecture

### Excel-like Interface Pattern
The application mimics Microsoft Excel's interface for familiar user experience:
- `components/excel/Ribbon.tsx` - Excel-style toolbar with tabs and actions
- `components/excel/PageGrid.tsx` - Spreadsheet grid with cell selection
- `components/excel/FormulaBar.tsx` - Issue entry and editing
- `components/excel/StatusBar.tsx` - Status and statistics display

### Testing Framework Structure
Two main test categories with predefined items:
- **Visual Checks** (5 items): Images, text colors, fonts, layout, responsiveness
- **Functional Checks** (5 items): Buttons, forms, navigation, loading, errors

Test states: "OK", "Not OK", or "Pending" for each page/test combination.

### State Management Pattern
```typescript
// Global website context
const { currentWebsite, pages, refreshPages } = useWebsite()

// Component state for UI interactions
const [selectedCell, setSelectedCell] = useState<CellPosition>()
```

## Database Schema

Key tables in Supabase:
- `websites`: Testing projects with base URL and metadata
- `pages`: Individual pages with hierarchical structure (parent_id)
- `test_results`: Test execution results per page/test type
- `issues`: Documented problems with title, description, and priority

All tables have Row Level Security enabled with temporary open policies.

## Project Structure

```
/
├── app/                    # Next.js App Router
│   ├── api/               # API routes (sitemap extraction, DB setup)
│   ├── layout.tsx         # Root layout with providers
│   └── page.tsx           # Main dashboard
├── components/            
│   ├── excel/            # Excel-like UI components
│   ├── export/           # Export functionality (Excel, JSON, CSV)
│   ├── sitemap/          # Sitemap management and extraction
│   ├── testing/          # Test execution panel
│   ├── ui/               # shadcn/ui components
│   └── website/          # Website CRUD operations
├── contexts/             # React Context providers
│   └── WebsiteContext.tsx # Global website state
├── lib/                  
│   ├── supabase/        # Database client and utilities
│   └── utils.ts         # Helper functions (cn)
├── types/               # TypeScript definitions
└── supabase/           
    └── migrations/      # Database schema migrations
```

## Implementation Patterns

### Supabase Integration
```typescript
// Client initialization
import { createClient } from '@/lib/supabase/client'
const supabase = createClient()

// Real-time subscriptions for collaborative testing
// Optimistic updates with error handling
// Typed queries using generated types
```

### Export Functionality
- Excel export with multiple worksheets (Overview, Test Results, Issues)
- Color-coded status indicators (green for OK, red for Not OK)
- Summary statistics and detailed breakdowns

### Component Conventions
- Use shadcn/ui components from `components/ui/`
- Follow Excel-like styling: sharp corners, professional colors
- Implement loading states and error handling
- Support mobile responsiveness

## Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=
```

## Key Features

1. **Sitemap Extraction**: Automatic page discovery from XML sitemaps
2. **Manual Page Entry**: Add pages individually or in bulk
3. **Inline Editing**: Direct cell editing in the grid
4. **Batch Testing**: Test multiple pages simultaneously
5. **Issue Documentation**: Detailed issue tracking with priorities
6. **Multi-format Export**: Excel, JSON, and CSV export options
7. **Pagination**: 20 pages per view with navigation controls

## Performance Considerations

- Implement virtual scrolling for large page lists (500+ pages)
- Use React.memo for expensive grid components
- Batch database updates to reduce API calls
- Consider implementing optimistic UI updates

## Testing Status

Currently no automated tests. When implementing:
- Use React Testing Library for component tests
- Consider Playwright for E2E testing of critical flows
- Test Supabase functions with database mocks

## ByteRover Integration

When working with this codebase:
- Use `byterover-retrieve-knowledge` tool before tasks to get context
- Use `byterover-store-knowledge` after successful task completion to persist critical information