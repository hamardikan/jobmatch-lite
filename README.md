# JobMatch Lite

An AI-powered resume-to-job description matching application that analyzes how well a resume matches a job posting and generates downloadable PDF reports.

## Features

- **Resume Analysis**: Upload PDF or DOCX resumes and compare against job descriptions
- **AI-Powered Matching**: Uses OpenRouter API (Gemini Flash) to analyze compatibility
- **Match Scoring**: Get a 0-100 match score with detailed explanation
- **Key Findings**: Identify strengths, gaps, and actionable suggestions
- **PDF Reports**: Generate and download professional PDF reports using Puppeteer
- **Analysis History**: View past analyses (requires authentication)
- **User Authentication**: Secure login with Better Auth

## Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **Tailwind CSS** - Styling
- **TypeScript** - Type safety

### Backend
- **ElysiaJS** - Fast Bun-native web framework
- **Bun** - JavaScript runtime
- **Drizzle ORM** - Type-safe database ORM
- **PostgreSQL** - Database (Neon serverless in production)
- **Better Auth** - Authentication library
- **Puppeteer** - Server-side PDF generation

### AI & Parsing
- **OpenRouter API** - AI model gateway (Gemini Flash)
- **unpdf** - PDF text extraction
- **mammoth** - DOCX text extraction

## Prerequisites

- [Bun](https://bun.sh/) v1.0 or higher
- [Node.js](https://nodejs.org/) v18+ (for some dependencies)
- PostgreSQL database (local or Neon)
- Chrome/Chromium (for local PDF generation)

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/jobmatch-lite.git
   cd jobmatch-lite
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Set up environment variables**

   Create `.env` files in both `apps/api` and `apps/web`:

   **apps/api/.env**
   ```env
   # Database
   DATABASE_URL=postgresql://user:password@localhost:5432/jobmatch

   # OpenRouter API (get key from https://openrouter.ai)
   OPENROUTER_API_KEY=sk-or-v1-your-key-here

   # Better Auth
   BETTER_AUTH_SECRET=your-secret-key-here
   BETTER_AUTH_URL=http://localhost:3001

   # Frontend URL (for CORS)
   FRONTEND_URL=http://localhost:3000
   ```

   **apps/web/.env**
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```

4. **Set up the database**

   If using Docker for local PostgreSQL:
   ```bash
   docker-compose up -d
   ```

   Push the schema:
   ```bash
   cd apps/api
   bun run db:push
   ```

## Running Locally

### Development Mode

Start both frontend and backend:
```bash
bun run dev
```

Or run individually:

**Backend (port 3001):**
```bash
cd apps/api
bun run dev
```

**Frontend (port 3000):**
```bash
cd apps/web
bun run dev
```

### Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/health

## Usage

1. **Register/Login**: Create an account or sign in
2. **Paste Job Description**: Enter the job posting text (min 100 characters)
3. **Upload Resume**: Upload a PDF or DOCX file (max 5MB)
4. **Analyze**: Click "Check Resume Match"
5. **View Results**: See your match score, strengths, gaps, and suggestions
6. **Download Report**: Click "Download Report" for a PDF

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/analyze` | POST | Analyze resume against job description |
| `/api/generate-pdf` | POST | Generate PDF report |
| `/api/history` | GET | List analysis history |
| `/api/history/:id` | GET | Get single analysis |
| `/api/history/:id` | DELETE | Delete analysis |
| `/api/health` | GET | Health check |
| `/api/auth/*` | * | Authentication endpoints |

## Project Structure

```
jobmatch-lite/
├── apps/
│   ├── api/                    # ElysiaJS backend
│   │   ├── src/
│   │   │   ├── application/    # Use cases
│   │   │   ├── domain/         # Domain entities & value objects
│   │   │   ├── infrastructure/ # External services (AI, DB, PDF)
│   │   │   ├── presentation/   # HTTP controllers & middleware
│   │   │   ├── shared/         # Errors & constants
│   │   │   └── templates/      # HTML templates
│   │   └── tests/              # Unit & integration tests
│   └── web/                    # Next.js frontend
│       └── src/
│           ├── app/            # App Router pages
│           ├── components/     # React components
│           ├── hooks/          # Custom hooks
│           └── lib/            # Utilities & API client
├── packages/
│   └── shared/                 # Shared types
└── docs/                       # Documentation
```

## Architecture

The backend follows Clean Architecture with Domain-Driven Design:

- **Presentation Layer**: HTTP controllers, request validation
- **Application Layer**: Use cases, orchestration logic
- **Domain Layer**: Business entities, value objects
- **Infrastructure Layer**: External services (AI, database, PDF)

Key patterns:
- **Port/Adapter Pattern**: Dependency injection for testability
- **Value Objects**: Immutable domain concepts (MatchScore, KeyFindings)
- **Repository Pattern**: Database abstraction

## Testing

Run all tests:
```bash
bun test
```

Run specific tests:
```bash
bun test tests/unit          # Unit tests only
bun test tests/integration   # Integration tests
```

## Deployment

### Vercel (Recommended)

Both frontend and backend can be deployed to Vercel:

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy frontend (`apps/web`) and backend (`apps/api`) as separate projects

**Backend requirements:**
- Set `bunVersion: "1.x"` in vercel.json
- Configure `@sparticuz/chromium` for Puppeteer in serverless

### Environment Variables for Production

Set these in your deployment platform:

- `DATABASE_URL` - Production PostgreSQL connection string
- `OPENROUTER_API_KEY` - OpenRouter API key
- `BETTER_AUTH_SECRET` - Random secret for auth
- `BETTER_AUTH_URL` - Production API URL
- `FRONTEND_URL` - Production frontend URL
- `NEXT_PUBLIC_API_URL` - Production API URL (frontend)

## License

MIT

## Author

Built for Jobsuit.ai technical assessment
