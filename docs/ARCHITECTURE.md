# Technical Architecture Document
## JobMatch Lite

**Version:** 1.0
**Last Updated:** December 17, 2025

---

## 1. System Overview

### 1.1 High-Level Architecture

```
+------------------------------------------------------------------+
|                         CLIENT BROWSER                            |
+------------------------------------------------------------------+
|                                                                    |
|    +----------------------------------------------------------+   |
|    |                    NEXT.JS FRONTEND                       |   |
|    |    (jobmatch-lite.vercel.app)                             |   |
|    |                                                            |   |
|    |    +------------------+    +-------------------+           |   |
|    |    | Job Description  |    | Resume Upload     |           |   |
|    |    | Input Pane       |    | Pane              |           |   |
|    |    +------------------+    +-------------------+           |   |
|    |                                                            |   |
|    |    +--------------------------------------------------+   |   |
|    |    |              Results Display                      |   |   |
|    |    |    Score | Explanation | PDF Download             |   |   |
|    |    +--------------------------------------------------+   |   |
|    +----------------------------------------------------------+   |
|                              |                                     |
+------------------------------------------------------------------+
                               |
                               | HTTPS (REST API)
                               |
+------------------------------------------------------------------+
|                    VERCEL SERVERLESS                              |
+------------------------------------------------------------------+
|                                                                    |
|    +----------------------------------------------------------+   |
|    |                  ELYSIAJS BACKEND                          |   |
|    |    (jobmatch-lite-api.vercel.app)                          |   |
|    |                                                            |   |
|    |    +-------------+  +-------------+  +-------------+       |   |
|    |    | /api/analyze|  |/api/gen-pdf |  | /api/health |       |   |
|    |    +------+------+  +------+------+  +-------------+       |   |
|    |           |                |                               |   |
|    |    +------+------+  +------+------+                        |   |
|    |    |File Parser  |  |PDF Generator|                        |   |
|    |    |(unpdf,      |  |(Puppeteer)  |                        |   |
|    |    | mammoth)    |  |             |                        |   |
|    |    +------+------+  +-------------+                        |   |
|    |           |                                                |   |
|    |    +------+------+                                         |   |
|    |    |OpenRouter   |                                         |   |
|    |    |Client       |                                         |   |
|    |    +------+------+                                         |   |
|    +----------------------------------------------------------+   |
|                              |                                     |
+------------------------------------------------------------------+
                               |
                               | HTTPS
                               |
+------------------------------------------------------------------+
|                     EXTERNAL SERVICES                             |
+------------------------------------------------------------------+
|                                                                    |
|    +-------------------------+    +-------------------------+     |
|    |      OPENROUTER AI      |    |    CHROMIUM (BUNDLED)   |     |
|    |   (openrouter.ai/api)   |    |   (@sparticuz/chromium) |     |
|    |                         |    |                         |     |
|    |   - Llama 3.2           |    |   - HTML to PDF         |     |
|    |   - DeepSeek R1         |    |   - Serverless-ready    |     |
|    |   - Gemini Flash        |    |                         |     |
|    +-------------------------+    +-------------------------+     |
|                                                                    |
+------------------------------------------------------------------+
```

### 1.2 Technology Stack

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| Frontend | Next.js | 15.x | React framework with App Router |
| Frontend | React | 19.x | UI library |
| Frontend | Tailwind CSS | 3.4.x | Styling |
| Frontend | TypeScript | 5.x | Type safety |
| Backend | ElysiaJS | 1.2.x | API framework |
| Backend | Bun | 1.x | JavaScript runtime |
| Backend | TypeScript | 5.x | Type safety |
| File Parsing | unpdf | 0.12.x | PDF text extraction |
| File Parsing | mammoth | 1.8.x | DOCX text extraction |
| PDF Generation | puppeteer-core | 23.x | Headless browser |
| PDF Generation | @sparticuz/chromium | 131.x | Serverless Chromium |
| AI | OpenRouter API | - | LLM gateway |
| Deployment | Vercel | - | Serverless hosting |
| Build Tool | Turborepo | 2.x | Monorepo management |
| Package Manager | pnpm | 9.x | Dependency management |

---

## 2. Repository Structure

### 2.1 Monorepo Layout

```
jobmatch-lite/
├── .github/
│   └── workflows/
│       └── ci.yml                    # GitHub Actions CI
├── apps/
│   ├── web/                          # Next.js Frontend
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── layout.tsx        # Root layout
│   │   │   │   ├── page.tsx          # Main SPA page
│   │   │   │   ├── globals.css       # Global styles
│   │   │   │   └── loading.tsx       # Loading UI
│   │   │   ├── components/
│   │   │   │   ├── ui/               # Base UI components
│   │   │   │   │   ├── button.tsx
│   │   │   │   │   ├── textarea.tsx
│   │   │   │   │   ├── card.tsx
│   │   │   │   │   ├── progress.tsx
│   │   │   │   │   └── skeleton.tsx
│   │   │   │   ├── job-description-pane.tsx
│   │   │   │   ├── resume-uploader.tsx
│   │   │   │   ├── match-result-card.tsx
│   │   │   │   ├── score-gauge.tsx
│   │   │   │   └── pdf-download-button.tsx
│   │   │   ├── hooks/
│   │   │   │   └── use-match-analysis.ts
│   │   │   ├── lib/
│   │   │   │   ├── api-client.ts     # API wrapper
│   │   │   │   └── utils.ts          # Utilities
│   │   │   └── types/
│   │   │       └── index.ts          # Type re-exports
│   │   ├── public/
│   │   ├── next.config.js
│   │   ├── tailwind.config.js
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── api/                          # ElysiaJS Backend
│       ├── src/
│       │   ├── index.ts              # Main Elysia app
│       │   ├── routes/
│       │   │   ├── index.ts          # Route aggregator
│       │   │   ├── analyze.ts        # POST /api/analyze
│       │   │   ├── generate-pdf.ts   # POST /api/generate-pdf
│       │   │   └── health.ts         # GET /api/health
│       │   ├── services/
│       │   │   ├── file-parser.ts    # PDF/DOCX parsing
│       │   │   ├── openrouter.ts     # AI client
│       │   │   └── pdf-generator.ts  # Puppeteer PDF
│       │   ├── middleware/
│       │   │   ├── error-handler.ts  # Global error handling
│       │   │   ├── cors.ts           # CORS config
│       │   │   └── rate-limiter.ts   # Rate limiting
│       │   ├── templates/
│       │   │   └── report.html       # PDF HTML template
│       │   └── utils/
│       │       └── logger.ts         # Logging
│       ├── api/
│       │   └── index.ts              # Vercel entry point
│       ├── vercel.json
│       ├── tsconfig.json
│       └── package.json
│
├── packages/
│   └── shared/                       # Shared code
│       ├── src/
│       │   ├── types/
│       │   │   ├── api.ts            # API types
│       │   │   ├── analysis.ts       # Analysis types
│       │   │   └── index.ts
│       │   ├── constants/
│       │   │   └── index.ts
│       │   └── index.ts
│       ├── tsconfig.json
│       └── package.json
│
├── docs/                             # Documentation
│   ├── PRD.md
│   ├── USER-RESEARCH.md
│   ├── USER-FLOWS.md
│   ├── API-SPEC.yaml
│   └── ARCHITECTURE.md
│
├── turbo.json                        # Turborepo config
├── package.json                      # Root package.json
├── pnpm-workspace.yaml               # pnpm workspace config
├── .env.example                      # Environment template
├── .gitignore
├── CLAUDE.md                         # Claude Code guidance
└── README.md
```

---

## 3. Component Architecture

### 3.1 Frontend Components

```
                        +------------------+
                        |   App Layout     |
                        |  (layout.tsx)    |
                        +--------+---------+
                                 |
                        +--------+---------+
                        |    Main Page     |
                        |   (page.tsx)     |
                        +--------+---------+
                                 |
         +-----------------------+-----------------------+
         |                       |                       |
+--------+--------+     +--------+--------+     +--------+--------+
| JobDescription  |     | ResumeUploader  |     | MatchResult     |
| Pane            |     | Pane            |     | Card            |
+-----------------+     +-----------------+     +--------+--------+
         |                       |                       |
         |                       |              +--------+--------+
         |                       |              |                 |
+--------+--------+     +--------+--------+     | ScoreGauge      |
|  UI/Textarea    |     | UI/FileUpload   |     +--------+--------+
+-----------------+     +-----------------+              |
                                                +--------+--------+
                                                | PdfDownload     |
                                                | Button          |
                                                +-----------------+
```

### 3.2 State Flow

```
                    +-------------------+
                    |   useMatchAnalysis|
                    |       Hook        |
                    +--------+----------+
                             |
                             | Manages:
                             | - isLoading
                             | - isGeneratingPdf
                             | - result
                             | - error
                             |
         +-------------------+-------------------+
         |                   |                   |
         v                   v                   v
    +----+----+        +-----+-----+       +-----+-----+
    | analyze |        | download  |       |   reset   |
    | (file,  |        | Report()  |       |    ()     |
    |  jd)    |        |           |       |           |
    +---------+        +-----------+       +-----------+
         |                   |
         v                   v
    +----+----+        +-----+-----+
    | POST    |        | POST      |
    |/analyze |        |/gen-pdf   |
    +---------+        +-----------+
```

### 3.3 Backend Services

```
                    +-------------------+
                    |   Elysia App      |
                    |   (index.ts)      |
                    +--------+----------+
                             |
         +-------------------+-------------------+
         |                   |                   |
+--------+--------+ +--------+--------+ +--------+--------+
|   CORS Plugin   | | OpenAPI Plugin  | | Error Handler   |
+-----------------+ +-----------------+ +-----------------+
                             |
         +-------------------+-------------------+
         |                   |                   |
+--------+--------+ +--------+--------+ +--------+--------+
|  /api/analyze   | | /api/gen-pdf   | |  /api/health    |
+--------+--------+ +--------+--------+ +--------+--------+
         |                   |
+--------+--------+ +--------+--------+
|  FileParser     | |  PDFGenerator   |
|  Service        | |  Service        |
+--------+--------+ +--------+--------+
         |
+--------+--------+
|  OpenRouter     |
|  Client         |
+-----------------+
```

---

## 4. Data Flow

### 4.1 Analysis Flow

```
+---------------+     +---------------+     +---------------+
|   Frontend    |     |   Backend     |     |  OpenRouter   |
+-------+-------+     +-------+-------+     +-------+-------+
        |                     |                     |
        | 1. POST /api/analyze                      |
        | (FormData: file + JD)                     |
        +-------------------->|                     |
        |                     |                     |
        |              2. Validate file             |
        |                     |                     |
        |              3. Parse file                |
        |                 (unpdf/mammoth)           |
        |                     |                     |
        |                     | 4. POST /chat/completions
        |                     +-------------------->|
        |                     |                     |
        |                     |<--------------------+
        |                     | 5. AI Response      |
        |                     |    (JSON)           |
        |                     |                     |
        |              6. Parse & validate          |
        |                     |                     |
        |<--------------------+                     |
        | 7. JSON Response    |                     |
        |    { score, explanation, keyFindings }    |
        |                     |                     |
+-------+-------+     +-------+-------+     +-------+-------+
```

### 4.2 PDF Generation Flow

```
+---------------+     +---------------+     +---------------+
|   Frontend    |     |   Backend     |     |   Puppeteer   |
+-------+-------+     +-------+-------+     +-------+-------+
        |                     |                     |
        | 1. POST /api/generate-pdf                 |
        | (JSON: analysisData)                      |
        +-------------------->|                     |
        |                     |                     |
        |              2. Build HTML                |
        |                 from template             |
        |                     |                     |
        |                     | 3. page.setContent()
        |                     +-------------------->|
        |                     |                     |
        |                     | 4. page.pdf()       |
        |                     +-------------------->|
        |                     |                     |
        |                     |<--------------------+
        |                     | 5. PDF Buffer       |
        |                     |                     |
        |<--------------------+                     |
        | 6. Binary PDF       |                     |
        |    (application/pdf)|                     |
        |                     |                     |
        | 7. Browser download |                     |
        |                     |                     |
+-------+-------+     +-------+-------+     +-------+-------+
```

---

## 5. API Design

### 5.1 Endpoints Summary

| Method | Endpoint | Purpose | Rate Limit |
|--------|----------|---------|------------|
| POST | `/api/analyze` | Analyze resume match | 10/min |
| POST | `/api/generate-pdf` | Generate PDF report | 5/min |
| GET | `/api/health` | Health check | None |
| GET | `/openapi` | API documentation | None |

### 5.2 Request/Response Formats

See `docs/API-SPEC.yaml` for complete OpenAPI specification.

### 5.3 Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| VALIDATION_ERROR | 400 | Invalid input data |
| INVALID_FILE_TYPE | 400 | Unsupported file format |
| FILE_TOO_LARGE | 400 | File exceeds 5MB limit |
| FILE_PARSE_ERROR | 422 | Cannot parse file content |
| EMPTY_CONTENT | 422 | No text extracted |
| RATE_LIMIT_EXCEEDED | 429 | Too many requests |
| AI_SERVICE_ERROR | 502 | OpenRouter unavailable |
| PDF_GENERATION_ERROR | 500 | Puppeteer failure |
| INTERNAL_ERROR | 500 | Unexpected error |
| TIMEOUT | 504 | Request timeout |

---

## 6. External Integrations

### 6.1 OpenRouter AI

**Purpose:** LLM inference for resume-job matching analysis

**Configuration:**
```typescript
const OPENROUTER_CONFIG = {
  baseUrl: 'https://openrouter.ai/api/v1',
  models: [
    'deepseek/deepseek-r1-0528:free',
    'meta-llama/llama-3.2-3b-instruct:free',
    'google/gemini-2.0-flash-exp:free'
  ],
  maxTokens: 1500,
  temperature: 0.3
}
```

**Headers Required:**
- `Authorization: Bearer ${OPENROUTER_API_KEY}`
- `HTTP-Referer: https://jobmatch-lite.vercel.app`
- `X-Title: JobMatch Lite`

**Rate Limits:**
- Free tier: 50 requests/day
- With $10 credits: 1000 requests/day

### 6.2 Puppeteer/Chromium

**Purpose:** Server-side HTML to PDF rendering

**Serverless Configuration:**
```typescript
import chromium from '@sparticuz/chromium'
import puppeteer from 'puppeteer-core'

const browser = await puppeteer.launch({
  args: chromium.args,
  defaultViewport: chromium.defaultViewport,
  executablePath: await chromium.executablePath(),
  headless: chromium.headless
})
```

**Constraints:**
- Bundle size must be < 50MB
- Use `@sparticuz/chromium` for serverless
- Browser singleton pattern for reuse
- 60-second timeout on Vercel

---

## 7. Deployment Architecture

### 7.1 Vercel Configuration

**Frontend (apps/web):**
```json
{
  "framework": "nextjs",
  "buildCommand": "cd ../.. && pnpm turbo build --filter=web"
}
```

**Backend (apps/api):**
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "bunVersion": "1.x",
  "functions": {
    "api/index.ts": {
      "memory": 1024,
      "maxDuration": 60
    }
  },
  "rewrites": [
    { "source": "/api/:path*", "destination": "/api/index.ts" }
  ]
}
```

### 7.2 Environment Variables

**Backend (.env):**
```
OPENROUTER_API_KEY=sk-or-v1-xxxx
FRONTEND_URL=https://jobmatch-lite.vercel.app
NODE_ENV=production
```

**Frontend (.env.local):**
```
NEXT_PUBLIC_API_URL=https://jobmatch-lite-api.vercel.app
```

### 7.3 Domain Structure

| Service | Domain | Purpose |
|---------|--------|---------|
| Frontend | jobmatch-lite.vercel.app | User interface |
| Backend | jobmatch-lite-api.vercel.app | API endpoints |

---

## 8. Security Considerations

### 8.1 Input Validation

- File type validation (PDF, DOCX only)
- File size validation (5MB max)
- Job description length validation (100-10,000 chars)
- Content sanitization for AI prompts

### 8.2 Rate Limiting

- IP-based rate limiting
- `/api/analyze`: 10 requests/minute
- `/api/generate-pdf`: 5 requests/minute
- 429 response with Retry-After header

### 8.3 CORS Configuration

```typescript
cors({
  origin: [
    'https://jobmatch-lite.vercel.app',
    /\.vercel\.app$/
  ],
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true
})
```

### 8.4 Data Handling

- No persistent storage of user data
- Files processed in memory only
- No cookies or session storage
- HTTPS enforced

---

## 9. Performance Considerations

### 9.1 Targets

| Metric | Target | Method |
|--------|--------|--------|
| Page Load | < 2s | Static generation, CDN |
| Analysis | < 10s | Optimized prompts, streaming |
| PDF Generation | < 5s | Browser reuse, minimal HTML |
| Time to Interactive | < 3s | Code splitting |

### 9.2 Optimization Strategies

**Frontend:**
- Next.js static optimization
- Image optimization
- Code splitting
- Lazy loading results component

**Backend:**
- Puppeteer browser singleton
- Minimal dependencies
- Efficient file parsing
- Response streaming

### 9.3 Cold Start Mitigation

- Keep function bundle small (< 50MB)
- Lazy load heavy dependencies
- Warm-up requests (optional cron)

---

## 10. Monitoring & Observability

### 10.1 Health Endpoint

`GET /api/health` returns:
- Service status
- External service connectivity
- Uptime
- Version

### 10.2 Logging Strategy

```typescript
// Structured logging
logger.info('Analysis completed', {
  score: result.score,
  processingTime: duration,
  fileType: file.type,
  fileSize: file.size
})

logger.error('AI service error', {
  error: error.message,
  service: 'OpenRouter',
  requestId: generateRequestId()
})
```

### 10.3 Error Tracking

- Include requestId in 500 errors
- Log all error details server-side
- Return user-friendly messages to client

---

## 11. Future Considerations

### 11.1 Scalability

- Consider Redis for rate limiting at scale
- CDN caching for static assets
- Database for usage analytics (optional)

### 11.2 Feature Extensions

- User accounts and history
- Batch processing
- API access for integrations
- Multiple language support

### 11.3 Alternative Deployments

The architecture supports:
- Docker containerization
- AWS Lambda deployment
- Self-hosted options

---

## 12. Appendix

### 12.1 TypeScript Shared Types

```typescript
// packages/shared/src/types/api.ts

export interface AnalysisResult {
  score: number
  explanation: string
  keyFindings: {
    strengths: string[]
    gaps: string[]
    suggestions: string[]
  }
  processingTime: number
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: ApiError
}

export interface ApiError {
  code: ErrorCode
  message: string
  details?: Record<string, unknown>
  requestId?: string
}

export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_FILE_TYPE = 'INVALID_FILE_TYPE',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  FILE_PARSE_ERROR = 'FILE_PARSE_ERROR',
  EMPTY_CONTENT = 'EMPTY_CONTENT',
  AI_SERVICE_ERROR = 'AI_SERVICE_ERROR',
  PDF_GENERATION_ERROR = 'PDF_GENERATION_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  TIMEOUT = 'TIMEOUT'
}
```

### 12.2 AI Prompt Template

```typescript
const SYSTEM_PROMPT = `You are an expert HR analyst and career coach.
Analyze how well a resume matches a job description.

Respond with valid JSON:
{
  "score": <0-100>,
  "explanation": "<detailed analysis>",
  "keyFindings": {
    "strengths": ["<strength 1>", ...],
    "gaps": ["<gap 1>", ...],
    "suggestions": ["<suggestion 1>", ...]
  }
}

Scoring:
- 90-100: Excellent match
- 70-89: Strong match
- 50-69: Moderate match
- 30-49: Weak match
- 0-29: Poor match`
```

### 12.3 PDF HTML Template Structure

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    /* Inline CSS for serverless compatibility */
    body { font-family: system-ui; padding: 40px; }
    .score-circle { /* Score visualization */ }
    .section { margin: 20px 0; }
    /* ... */
  </style>
</head>
<body>
  <header>JobMatch Lite Report</header>
  <div class="score-section">{{score}}/100</div>
  <div class="explanation">{{explanation}}</div>
  <div class="findings">
    <div class="strengths">{{strengths}}</div>
    <div class="gaps">{{gaps}}</div>
    <div class="suggestions">{{suggestions}}</div>
  </div>
  <footer>Generated {{date}}</footer>
</body>
</html>
```
