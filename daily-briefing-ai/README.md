# Daily Briefing AI

A Next.js web application that leverages the Google Gemini API to deliver personalized news briefings and satirical tweets.

## Features

- **Personalized Briefings**: Generate briefings based on user-defined interests
- **Trending Now**: Auto-identify top 3 global news topics from the last 24 hours
- **Adjustable Summary Length**: Support for Short, Medium, and Detailed formats
- **Google Search Grounding**: All summaries include cited sources
- **Satirical Tweet Generation**: Three witty, satirical tweets per topic
- **localStorage Persistence**: User preferences stored locally
- **Markdown Export**: Download briefings in Markdown format

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: Shadcn/UI
- **AI**: Google Gemini API
- **Deployment**: Node.js/Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- Google Gemini API key

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd daily-briefing-ai
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   # Add your Google Gemini API key to .env.local
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run tests with Jest

### Project Structure

```
daily-briefing-ai/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── api/            # Server actions
│   │   ├── layout.tsx      # Root layout
│   │   ├── page.tsx        # Home page with tabs
│   │   └── globals.css     # Global styles
│   ├── components/         # React components
│   │   ├── ui/            # Shadcn/UI components
│   │   ├── my-interests-view.tsx
│   │   └── trending-now-view.tsx
│   └── lib/               # Utility functions
│       ├── storage.ts     # localStorage service
│       ├── markdown.ts    # Export functionality
│       └── utils.ts       # Helper functions
├── .specify/              # Project specifications
├── implement.md          # Implementation guide
└── [config files]        # Next.js, TypeScript, Tailwind configs
```

## Deployment

### Vercel (Recommended)

1. **Connect to Vercel:**
   ```bash
   # Install Vercel CLI
   npm i -g vercel

   # Deploy
   vercel
   ```

2. **Environment Variables:**
   Set `GEMINI_API_KEY` in your Vercel dashboard:
   - Go to your project settings
   - Navigate to Environment Variables
   - Add `GEMINI_API_KEY` with your Google Gemini API key

3. **Automatic Deployments:**
   - Push to your main branch to trigger automatic deployments
   - Vercel will build and deploy your app automatically

### Manual Deployment

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Set environment variables:**
   ```bash
   export GEMINI_API_KEY=your_api_key_here
   ```

3. **Start production server:**
   ```bash
   npm start
   ```

### Docker Deployment

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

USER nextjs
EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

Build and run:
```bash
docker build -t daily-briefing-ai .
docker run -p 3000:3000 -e GEMINI_API_KEY=your_key daily-briefing-ai
```

## Project Structure

```
daily-briefing-ai/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── layout.tsx      # Root layout
│   │   ├── page.tsx        # Home page with tabs
│   │   └── globals.css     # Global styles
│   ├── components/         # React components
│   │   ├── ui/            # Shadcn/UI components
│   │   ├── my-interests-view.tsx
│   │   └── trending-now-view.tsx
│   └── lib/               # Utility functions
├── .specify/              # Project specifications
└── implement.md          # Implementation guide
```

## Development

The project follows the constitution and specifications defined in the `.specify/` directory:

- **Constitution**: Project principles and governance
- **Specification**: Feature requirements
- **Technical Plan**: Architecture and implementation details

## Contributing

1. Follow the project constitution and specifications
2. Ensure all features have test coverage
3. Changes to requirements must be reviewed
4. Maintain ethical standards for satirical content

## License

This project is private and proprietary.