# Daily Briefing AI - Implementation Guide

## Project Overview
This guide outlines the step-by-step implementation of the Daily Briefing AI application using Next.js, TypeScript, Tailwind CSS, and Shadcn/UI components.

## Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Google Gemini API key

## Implementation Steps

### Phase 1: Project Setup (T001)
1. **Initialize Next.js Project**
   ```bash
   npx create-next-app@latest daily-briefing-ai --typescript --tailwind --eslint --app
   cd daily-briefing-ai
   ```

2. **Install Dependencies**
   ```bash
   npm install @google/generative-ai
   npm install @radix-ui/react-tabs @radix-ui/react-button @radix-ui/react-input
   npm install @radix-ui/react-select @radix-ui/react-dialog @radix-ui/react-toast
   npm install lucide-react
   ```

3. **Set up Shadcn/UI**
   ```bash
   npx shadcn-ui@latest init --yes
   npx shadcn-ui@latest add button input select tabs toast card badge
   ```

### Phase 2: Core UI Structure (T002-T004)
1. **Create Main Layout**
   - Implement tab navigation ("My Interests", "Trending Now")
   - Add responsive design with Tailwind CSS
   - Create interest management interface with removable badges

2. **Implement Interest Management**
   - Form for adding user interests
   - Visual badge system for interests
   - Remove functionality for interests
   - Context-aware "Generate" button

3. **Build Trending Now Interface**
   - Tab UI for trending topics
   - Display area for generated briefings
   - Loading states and error handling

### Phase 3: Data Persistence (T003)
1. **localStorage Implementation**
   - User preferences storage
   - Interest list persistence
   - Summary length preferences
   - Export format settings

### Phase 4: Server Actions (T005)
1. **Create Server Actions**
   - `generateBriefing()` - Main briefing generation
   - `generateTrendingBriefing()` - Trending topics briefing
   - `getTrendingTopics()` - Identify top 3 global topics
   - `generateSingleBriefingForInterest()` - Single interest briefing
   - `generateTweetsForSummary()` - Satirical tweet generation

### Phase 5: API Integration (T006-T007)
1. **Gemini API Setup**
   - Configure Google Gemini client
   - Implement googleSearch tool integration
   - Process and format summaries with sources
   - Generate structured satirical content

### Phase 6: Export Functionality (T008)
1. **Markdown Export**
   - Client-side conversion to Markdown
   - Include sources and citations
   - Download functionality
   - Format preservation

### Phase 7: Testing & Deployment (T009-T010)
1. **Test Coverage**
   - Unit tests for all components
   - Integration tests for API calls
   - E2E tests for user workflows

2. **Deployment Preparation**
   - Environment variables setup
   - Vercel configuration
   - Production build optimization

## File Structure
```
daily-briefing-ai/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── my-interests/
│   │   └── page.tsx
│   ├── trending-now/
│   │   └── page.tsx
│   └── api/
│       └── actions.ts
├── components/
│   ├── ui/ (shadcn components)
│   ├── interest-form.tsx
│   ├── interest-badges.tsx
│   ├── briefing-display.tsx
│   └── export-button.tsx
├── lib/
│   ├── gemini.ts
│   ├── storage.ts
│   └── utils.ts
└── types/
    └── index.ts
```

## Next Steps
1. Begin with project scaffolding (T001)
2. Implement core UI components (T002-T004)
3. Add server actions and API integration (T005-T007)
4. Complete export functionality and testing (T008-T010)