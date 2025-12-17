# JobMatch Lite - Comprehensive Implementation Plan

## Overview

Building a resume-to-job description matching application with AI-powered analysis and PDF report generation.

**Stack:**
- Frontend: Next.js 15 (App Router)
- Backend: ElysiaJS (Bun runtime)
- AI: OpenRouter (free tier model)
- PDF: Puppeteer with @sparticuz/chromium
- Deployment: Vercel (both FE and BE)

---

## Phase 0: Documentation & Design (COMPLETED)

Documentation files already created:
- `docs/PRD.md` - Product Requirements Document
- `docs/USER-RESEARCH.md` - Hypothetical user research data
- `docs/USER-FLOWS.md` - User flow diagrams and edge cases
- `docs/ARCHITECTURE.md` - Technical architecture overview
- `docs/API-SPEC.yaml` - OpenAPI 3.0 specification
- `CLAUDE.md` - Claude Code guidance file (excluded from git)

---

## Phase 1: Project Setup (COMPLETED)

### 1.1 Monorepo Structure (Turborepo + Bun)
```
jobmatch-lite/
├── apps/
│   ├── web/                  # Next.js Frontend
│   └── api/                  # ElysiaJS Backend
├── packages/
│   └── shared/               # Shared types & utilities (COMPLETED)
├── docs/                     # Documentation (COMPLETED)
├── turbo.json
├── package.json
├── pnpm-workspace.yaml       # Bun supports pnpm workspace format
└── .env.example
```

### 1.2 Shared Package (`packages/shared/`) - COMPLETED
Files created:
- `src/types/analysis.ts` - AnalysisResult, KeyFindings, ScoreInterpretation
- `src/types/api.ts` - ApiResponse, ApiError, ErrorCode, FILE_CONSTRAINTS
- `src/index.ts` - Main exports

---

## Phase 2: Backend (ElysiaJS) - Following Elysia Best Practices

### 2.1 Project Structure (Elysia Idiomatic - Feature-Based)

Based on [ElysiaJS Best Practices](https://elysiajs.com/essential/best-practice.md):
- **1 Elysia instance = 1 controller**
- **Services**: Abstract classes with static methods (non-request dependent)
- **Models**: Using `t.Object()` with namespace pattern

```
apps/api/
├── src/
│   ├── index.ts                    # Main Elysia app (export default for Vercel)
│   ├── modules/
│   │   ├── analysis/               # Analysis feature module
│   │   │   ├── index.ts            # Elysia controller (routes)
│   │   │   ├── service.ts          # Business logic (abstract class)
│   │   │   └── model.ts            # Validation schemas (t.Object)
│   │   ├── report/                 # PDF report feature module
│   │   │   ├── index.ts            # Elysia controller
│   │   │   ├── service.ts          # PDF generation logic
│   │   │   └── model.ts            # Validation schemas
│   │   └── health/                 # Health check module
│   │       └── index.ts            # Simple health endpoint
│   ├── services/                   # Shared services
│   │   ├── openrouter.ts           # AI service
│   │   ├── file-parser.ts          # PDF/DOCX parsing
│   │   └── pdf-generator.ts        # Puppeteer PDF generation
│   ├── errors/                     # Custom error classes
│   │   └── index.ts                # AppError with status codes
│   └── templates/
│       └── report.html             # PDF HTML template
├── tests/
│   ├── unit/
│   └── integration/
├── vercel.json
└── package.json
```

### 2.2 API Endpoints

| Endpoint | Method | Purpose | Rate Limit |
|----------|--------|---------|------------|
| `/api/analyze` | POST | Analyze resume vs job description | 10/min |
| `/api/generate-pdf` | POST | Generate PDF report | 5/min |
| `/api/health` | GET | Health check | None |
| `/openapi` | GET | OpenAPI documentation (Scalar UI) | None |

### 2.3 Key Dependencies
```json
{
  "dependencies": {
    "elysia": "^1.2.0",
    "@elysiajs/openapi": "^1.4.0",
    "@elysiajs/cors": "^1.1.0",
    "elysia-rate-limit": "^4.0.0",
    "unpdf": "^0.12.0",
    "mammoth": "^1.8.0",
    "puppeteer-core": "^23.0.0",
    "@sparticuz/chromium": "^131.0.0"
  }
}
```

### 2.4 Vercel Configuration
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "bunVersion": "1.x"
}
```

Note: Zero config deployment - just export default Elysia instance from `src/index.ts`.

### 2.5 Code Examples (Following Elysia Patterns)

#### Main App Entry (`src/index.ts`)
```typescript
import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { openapi } from '@elysiajs/openapi'
import { rateLimit } from 'elysia-rate-limit'

import { analysis } from './modules/analysis'
import { report } from './modules/report'
import { health } from './modules/health'
import { AppError } from './errors'

export default new Elysia()
  .use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
  }))
  .use(openapi())
  .use(rateLimit())
  .error({ AppError })
  .onError(({ code, error, status }) => {
    if (code === 'AppError') {
      return status(error.status, {
        success: false,
        error: { code: error.code, message: error.message }
      })
    }
  })
  .use(analysis)
  .use(report)
  .use(health)
  .listen(3000)
```

#### Analysis Module (`src/modules/analysis/index.ts`)
```typescript
import { Elysia } from 'elysia'
import { AnalysisModel } from './model'
import { AnalysisService } from './service'

export const analysis = new Elysia({ prefix: '/api' })
  .post('/analyze', async ({ body }) => {
    const result = await AnalysisService.analyze(
      body.resume,
      body.jobDescription
    )
    return { success: true, data: result }
  }, {
    body: AnalysisModel.analyzeRequest,
    response: {
      200: AnalysisModel.analyzeResponse,
      400: AnalysisModel.errorResponse
    }
  })
```

#### Analysis Model (`src/modules/analysis/model.ts`)
```typescript
import { t } from 'elysia'

export namespace AnalysisModel {
  export const analyzeRequest = t.Object({
    resume: t.File({
      type: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      maxSize: 5 * 1024 * 1024,
      error: 'Please upload a PDF or DOCX file (max 5MB)'
    }),
    jobDescription: t.String({
      minLength: 100,
      maxLength: 10000,
      error: 'Job description must be 100-10,000 characters'
    })
  })
  export type analyzeRequest = typeof analyzeRequest.static

  export const analyzeResponse = t.Object({
    success: t.Literal(true),
    data: t.Object({
      score: t.Number({ minimum: 0, maximum: 100 }),
      explanation: t.String(),
      keyFindings: t.Object({
        strengths: t.Array(t.String()),
        gaps: t.Array(t.String()),
        suggestions: t.Array(t.String())
      }),
      processingTime: t.Number()
    })
  })

  export const errorResponse = t.Object({
    success: t.Literal(false),
    error: t.Object({
      code: t.String(),
      message: t.String()
    })
  })
}
```

#### Analysis Service (`src/modules/analysis/service.ts`)
```typescript
import { OpenRouterService } from '../../services/openrouter'
import { FileParserService } from '../../services/file-parser'
import { AppError, ErrorCode } from '../../errors'

// Non-request dependent service - abstract class with static methods
export abstract class AnalysisService {
  static async analyze(resumeFile: File, jobDescription: string) {
    const startTime = performance.now()

    // Parse resume
    const resumeText = await FileParserService.parse(resumeFile)
    if (!resumeText || resumeText.length < 50) {
      throw new AppError(ErrorCode.EMPTY_CONTENT, 'Resume appears to be empty')
    }

    // Call AI
    const aiResult = await OpenRouterService.analyzeMatch(resumeText, jobDescription)

    return {
      ...aiResult,
      processingTime: Math.round(performance.now() - startTime)
    }
  }
}
```

#### Custom Error Class (`src/errors/index.ts`)
```typescript
export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_FILE_TYPE = 'INVALID_FILE_TYPE',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  FILE_PARSE_ERROR = 'FILE_PARSE_ERROR',
  EMPTY_CONTENT = 'EMPTY_CONTENT',
  AI_SERVICE_ERROR = 'AI_SERVICE_ERROR',
  PDF_GENERATION_ERROR = 'PDF_GENERATION_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED'
}

export class AppError extends Error {
  status: number

  constructor(
    public code: ErrorCode,
    message: string,
    status = 400
  ) {
    super(message)
    this.status = status
  }
}
```

### 2.6 OpenRouter Integration
- **Model:** `meta-llama/llama-3.2-3b-instruct:free` (or `deepseek/deepseek-r1-0528:free`)
- **Rate Limit:** 50 requests/day (free tier), 1000/day with $10 credits
- **Response Format:** JSON with structured schema
- **Prompt Engineering:** System prompt for HR analyst role, structured JSON output

### 2.7 PDF Generation Strategy
- Use `@sparticuz/chromium` for serverless compatibility
- Browser singleton pattern for reuse across requests
- HTML template with inline CSS (no external dependencies)
- A4 format with proper margins
- Color-coded score visualization

---

## Phase 3: Frontend (Next.js)

### 3.1 Project Structure
```
apps/web/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx          # Main SPA
│   │   ├── globals.css
│   │   └── loading.tsx
│   ├── components/
│   │   ├── ui/               # Shadcn components
│   │   ├── job-description-pane.tsx
│   │   ├── resume-uploader.tsx
│   │   ├── match-result-card.tsx
│   │   ├── score-gauge.tsx
│   │   └── pdf-download-button.tsx
│   ├── hooks/
│   │   └── use-match-analysis.ts
│   └── lib/
│       ├── api-client.ts
│       └── utils.ts
├── public/
├── next.config.js
├── tailwind.config.js
└── package.json
```

### 3.2 UI Components

**Main Layout (page.tsx):**
- Split-pane interface (50/50 on desktop, stacked on mobile)
- Left: Job Description textarea (min 100 chars, max 10,000)
- Right: Resume upload zone (drag-drop + click, PDF/DOCX, max 5MB)
- Center: "Check Resume Match" button (disabled until both inputs valid)

**Results View (match-result-card.tsx):**
- Score circle/gauge with color coding (green/yellow/orange/red)
- Score interpretation badge ("Excellent Match", "Good Match", etc.)
- Collapsible sections: Overview, Strengths, Gaps, Suggestions
- Action buttons: Download PDF, Try Another

**Loading State:**
- Full overlay with spinner
- Progress steps: Parsing → Analyzing → Generating insights
- Estimated time indicator

### 3.3 Key Dependencies
```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "tailwindcss": "^3.4.0",
    "@radix-ui/react-progress": "^1.1.0",
    "lucide-react": "^0.460.0",
    "clsx": "^2.1.0"
  }
}
```

### 3.4 State Management
- React useState/useCallback for local state
- Custom `useMatchAnalysis` hook managing:
  - `isLoading`, `isGeneratingPdf`, `result`, `error`
  - `analyze(file, jobDescription)` function
  - `downloadReport()` function
  - `reset()` function

---

## Phase 4: Integration & Testing

### 4.1 Frontend-Backend Integration
- API client with proper error handling
- FormData for file uploads
- Blob handling for PDF downloads
- CORS configuration for cross-origin requests

### 4.2 Error Handling Matrix

| Scenario | Frontend Display | Backend Response |
|----------|------------------|------------------|
| Invalid file type | "Please upload PDF or DOCX" | 400 INVALID_FILE_TYPE |
| File too large | "Max file size is 5MB" | 400 FILE_TOO_LARGE |
| Parse failure | "Unable to read file" | 422 FILE_PARSE_ERROR |
| AI timeout | "Analysis timed out. Retry?" | 504 TIMEOUT |
| Rate limited | "Too many requests" | 429 RATE_LIMIT_EXCEEDED |

### 4.3 Accessibility Requirements
- WCAG 2.1 AA compliance
- Keyboard navigation (Tab order: JD → Upload → Button → Results)
- Screen reader announcements for loading/results
- Color contrast 4.5:1 minimum
- Focus indicators on all interactive elements

---

## Phase 5: Deployment

### 5.1 Environment Variables

**Backend (.env):**
```
OPENROUTER_API_KEY=sk-or-v1-xxxx
FRONTEND_URL=https://jobmatch-lite.vercel.app
```

**Frontend (.env.local):**
```
NEXT_PUBLIC_API_URL=https://jobmatch-lite-api.vercel.app
```

### 5.2 Vercel Deployment
- Two separate Vercel projects (web + api)
- Automatic deployments from GitHub
- Environment variables in Vercel dashboard
- Custom domains (optional)

### 5.3 Post-Deployment Checklist
- [ ] CORS working between FE and BE
- [ ] File uploads functioning
- [ ] AI analysis completing within timeout
- [ ] PDF generation working
- [ ] Rate limiting active
- [ ] Health check endpoint responding

---

## Implementation Sequence

### Step 1: Documentation (COMPLETED)
- [x] `docs/PRD.md` - Product Requirements Document
- [x] `docs/USER-RESEARCH.md` - Hypothetical user research data
- [x] `docs/USER-FLOWS.md` - User flow diagrams and edge cases
- [x] `docs/API-SPEC.yaml` - OpenAPI 3.0 specification
- [x] `docs/ARCHITECTURE.md` - Technical architecture overview
- [x] `CLAUDE.md` - Claude Code guidance file

### Step 2: Project Initialization (COMPLETED)
- [x] Initialize git repo with .gitignore (excluding CLAUDE.md)
- [x] Set up Turborepo monorepo with Bun workspace
- [x] Create `packages/shared/` with TypeScript types

### Step 3: Backend Setup (NEXT)
1. Create `apps/api/package.json` with dependencies
2. Create `apps/api/src/index.ts` (main Elysia app with export default)
3. Create `apps/api/src/errors/index.ts` (AppError class)
4. Create `apps/api/vercel.json` (bunVersion: "1.x")

### Step 4: Backend Services
1. Create `apps/api/src/services/file-parser.ts` (unpdf + mammoth)
2. Create `apps/api/src/services/openrouter.ts` (AI integration)
3. Create `apps/api/src/services/pdf-generator.ts` (Puppeteer)

### Step 5: Backend Modules
1. Create `apps/api/src/modules/analysis/` (model, service, index)
2. Create `apps/api/src/modules/report/` (model, service, index)
3. Create `apps/api/src/modules/health/index.ts`

### Step 6: Frontend Setup
1. Create `apps/web/` with Next.js 15
2. Set up Tailwind CSS
3. Configure environment variables

### Step 7: Frontend Components (Parallel with Figma Design)
1. Create split-pane layout
2. Create job description pane
3. Create resume uploader (drag-drop)
4. Create `useMatchAnalysis` hook
5. Create match result card with score gauge

### Step 8: Integration & Deployment
1. Test FE-BE integration
2. Deploy BE to Vercel
3. Deploy FE to Vercel
4. Configure CORS + environment variables

---

## Critical Files to Create

| Priority | File | Purpose |
|----------|------|---------|
| P0 | `apps/api/src/index.ts` | Main Elysia app (export default) |
| P0 | `apps/api/src/modules/analysis/index.ts` | Analysis controller |
| P0 | `apps/api/src/modules/analysis/model.ts` | Validation schemas |
| P0 | `apps/api/src/modules/analysis/service.ts` | Business logic |
| P0 | `apps/api/src/services/openrouter.ts` | AI integration |
| P0 | `apps/api/src/services/file-parser.ts` | PDF/DOCX parsing |
| P0 | `apps/web/src/app/page.tsx` | Main SPA page |
| P0 | `apps/web/src/hooks/use-match-analysis.ts` | State management hook |
| P1 | `apps/api/src/modules/report/` | PDF generation module |
| P1 | `apps/api/src/services/pdf-generator.ts` | Puppeteer PDF |
| P1 | `apps/web/src/components/match-result-card.tsx` | Results display |
| P1 | `apps/api/vercel.json` | Deployment config |

---

## Technical Decisions & Rationale

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Monorepo | Turborepo | Shared types, unified deployment |
| Backend runtime | Bun | Native ElysiaJS support, fast |
| File parsing | unpdf + mammoth | Serverless-compatible, reliable |
| PDF generation | @sparticuz/chromium | Only serverless-compatible Chromium |
| AI model | Llama 3.2 or DeepSeek R1 (free) | No cost, sufficient quality |
| Rate limiting | elysia-rate-limit | Simple, effective |
| UI components | Shadcn/UI + Tailwind | Fast development, customizable |

---

## User Decisions (Confirmed)

| Decision | Choice | Notes |
|----------|--------|-------|
| Deployment | **Separate Vercel projects** | FE: jobmatch-lite.vercel.app, BE: jobmatch-lite-api.vercel.app |
| Design Flow | **Parallel approach** | Code core logic while designing UI in Figma simultaneously |
| AI Model | **TBD at runtime** | Will select based on OpenRouter availability (DeepSeek R1, Llama 3.2, or Gemini Flash) |
| Documentation | **Full docs first** | Create PRD, User Research, User Flows, OpenAPI spec before implementation |
| Backend Pattern | **Elysia Idiomatic** | Feature-based modules (not DDD), following ElysiaJS best practices |
| Development Style | **TDD** | Test-Driven Development with `bun:test` |
| Package Manager | **Bun** | Using Bun for runtime and package management |

---

## Development Guidelines

### ElysiaJS Best Practices

Based on [ElysiaJS Best Practices](https://elysiajs.com/essential/best-practice.md):

1. **Controllers**: Use Elysia instances as controllers (1 instance = 1 controller)
2. **Services**: Abstract classes with static methods for non-request-dependent logic
3. **Models**: Use `t.Object()` with namespace pattern for validation schemas
4. **Error Handling**: Custom error classes with `onError` hook
5. **File Uploads**: Use `t.File()` for single file, `t.Files()` for multiple

### Test-Driven Development (TDD)

**Test Structure:**
```
apps/api/
├── src/
└── tests/
    ├── unit/                  # Unit tests for services
    │   ├── services/
    │   │   ├── openrouter.test.ts
    │   │   └── file-parser.test.ts
    │   └── modules/
    │       └── analysis.service.test.ts
    └── integration/           # Integration tests using Elysia .handle()
        ├── analyze.test.ts
        └── generate-pdf.test.ts

apps/web/
├── src/
└── tests/
    ├── unit/
    │   ├── hooks/
    │   │   └── use-match-analysis.test.ts
    │   └── components/
    │       └── score-gauge.test.ts
    └── integration/
        └── analysis-flow.test.tsx
```

**Testing with Elysia:**
```typescript
// Use .handle() for testing routes
import { describe, expect, it } from 'bun:test'
import { analysis } from './modules/analysis'

describe('Analysis API', () => {
  it('should analyze resume', async () => {
    const formData = new FormData()
    formData.append('resume', new File(['...'], 'resume.pdf'))
    formData.append('jobDescription', 'Job description...')

    const response = await analysis
      .handle(new Request('http://localhost/api/analyze', {
        method: 'POST',
        body: formData
      }))
      .then((x) => x.json())

    expect(response.success).toBe(true)
  })
})
```

### Git Commit Guidelines

**Commit Message Format:**
```
<type>(<scope>): <subject>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `test`: Adding tests
- `refactor`: Code refactoring
- `docs`: Documentation
- `chore`: Build/tooling changes

**TDD-Style Commits:**
```bash
git commit -m "test(analysis): add unit tests for AnalysisService"
git commit -m "feat(analysis): implement AnalysisService"
git commit -m "test(analysis): add edge case tests for empty resume"
```

### Files to Exclude from Git

**.gitignore (already configured):**
```
CLAUDE.md              # Claude Code guidance (local only - NEVER commit)
.env, .env.local       # Environment files
node_modules/          # Dependencies
.next/, dist/, .turbo/ # Build outputs
```

---

## Sources & References

### ElysiaJS Documentation (Local)
- `docs/llms-full.txt` - Complete ElysiaJS documentation for LLM reference

### Official Documentation
- [ElysiaJS Best Practices](https://elysiajs.com/essential/best-practice.md) - MVC pattern, services, models
- [ElysiaJS Vercel Deployment](https://elysiajs.com/integrations/vercel) - Zero config with `bunVersion: "1.x"`
- [ElysiaJS Error Handling](https://elysiajs.com/patterns/error-handling.md) - Custom errors, onError hook
- [ElysiaJS File Upload](https://elysiajs.com/essential/validation#file) - t.File(), t.Files()
- [ElysiaJS Rate Limit Plugin](https://github.com/rayriffy/elysia-rate-limit) - elysia-rate-limit
- [ElysiaJS OpenAPI Plugin](https://elysiajs.com/plugins/openapi) - @elysiajs/openapi
- [Puppeteer on Vercel](https://vercel.com/guides/deploying-puppeteer) - @sparticuz/chromium
- [OpenRouter Free Models](https://openrouter.ai/models/?q=free) - Free tier AI models
