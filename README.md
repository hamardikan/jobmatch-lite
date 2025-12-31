# JobMatch Lite

An AI-powered resume-to-job description matching application that analyzes how well a resume matches a job posting and generates downloadable PDF reports.

## Live Demo

- **Frontend**: https://jobmatch-web-mauve.vercel.app
- **Backend API**: https://jobmatch-api-seven.vercel.app
- **API Docs**: https://jobmatch-api-seven.vercel.app/openapi
- **API Health**: https://jobmatch-api-seven.vercel.app/api/health

## Features

- **Resume Analysis**: Upload PDF or DOCX resumes and compare against job descriptions
- **AI-Powered Matching**: Uses OpenRouter API (Gemini Flash) to analyze compatibility
- **Match Scoring**: Get a 0-100 match score with detailed explanation
- **Key Findings**: Identify strengths, gaps, and actionable suggestions
- **PDF Reports**: Generate and download professional PDF reports using Puppeteer
- **Analysis History**: View, search, and manage past analyses
- **User Dashboard**: Overview of your analysis stats and recent activity
- **User Authentication**: Secure login/registration with Better Auth
- **Dark/Light Mode**: Theme toggle with system preference support
- **Responsive Design**: Works on desktop and mobile devices
- **Animated UI**: Smooth transitions with Framer Motion

## Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **next-themes** - Dark mode support
- **lucide-react** - Icon library
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

## Routes

| Route | Description | Auth Required |
|-------|-------------|---------------|
| `/` | Landing page with features overview | No |
| `/login` | User sign in | No |
| `/register` | User registration | No |
| `/dashboard` | User dashboard with stats | Yes |
| `/analyze` | Resume analysis form | Yes |
| `/history` | Past analyses list | Yes |
| `/settings` | User settings (profile, preferences) | Yes |
| `/compare` | Compare multiple analyses side-by-side | Yes |

## Prerequisites

- [Bun](https://bun.sh/) v1.0 or higher
- [Docker](https://www.docker.com/) (for local PostgreSQL) or a remote PostgreSQL database
- [OpenRouter API key](https://openrouter.ai/keys) (free tier available)
- Chrome/Chromium (optional, for local PDF generation)

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

   Copy the example files and edit with your values:
   ```bash
   cp apps/api/.env.example apps/api/.env
   cp apps/web/.env.example apps/web/.env
   ```

   Edit the `.env` files with your configuration:

   **apps/api/.env**
   ```env
   # Database
   DATABASE_URL=postgresql://jobmatch:jobmatch@localhost:5432/jobmatch

   # OpenRouter API (get key from https://openrouter.ai/keys)
   OPENROUTER_API_KEY=sk-or-v1-your-key-here

   # Better Auth
   # Generate a secret: openssl rand -base64 32
   BETTER_AUTH_SECRET=your-secret-key-at-least-32-characters-long
   BETTER_AUTH_URL=http://localhost:3001

   # Frontend URL (for CORS)
   FRONTEND_URL=http://localhost:3000

   # Google OAuth (optional, for social login)
   # Get credentials at: https://console.cloud.google.com/apis/credentials
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```

   **apps/web/.env**
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```

4. **Set up the database**

   Start PostgreSQL with Docker:
   ```bash
   docker-compose up -d
   ```

   > **Note**: If you have PostgreSQL running locally on port 5432, stop it first or change the port in `docker-compose.yml`

   Push the database schema:
   ```bash
   cd apps/api
   bun run db:push
   ```

   You should see output like:
   ```
   [✓] Changes applied
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
- **API Docs**: http://localhost:3001/openapi
- **Health Check**: http://localhost:3001/api/health

## Usage

1. **Visit the Landing Page**: Go to the homepage to learn about the features
2. **Create an Account**: Click "Get Started" to register
3. **Dashboard**: View your analysis stats and recent activity
4. **New Analysis**: Click "New Analysis" to start
5. **Paste Job Description**: Enter the job posting text (min 100 characters)
6. **Upload Resume**: Upload a PDF or DOCX file (max 5MB)
7. **Analyze**: Click "Analyze Match" to get results
8. **View Results**: See your match score, strengths, gaps, and suggestions
9. **Download Report**: Click "Download Report" for a PDF
10. **History**: View all your past analyses in the History page

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
│           │   ├── (marketing)/  # Public pages (landing)
│           │   ├── (auth)/       # Auth pages (login, register)
│           │   └── (app)/        # Protected pages (dashboard, etc.)
│           ├── components/     # React components
│           ├── hooks/          # Custom hooks
│           └── lib/            # Utilities & API client
├── packages/
│   └── shared/                 # Shared types
├── e2e/                        # Playwright E2E tests
│   ├── pages/                  # Page objects
│   ├── tests/                  # Test specs
│   └── fixtures/               # Test fixtures
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

### Unit & Integration Tests
```bash
bun test                    # Run all tests
bun test tests/unit         # Unit tests only
bun test tests/integration  # Integration tests
```

### E2E Tests (Playwright)
```bash
bun run e2e                 # Run E2E tests
bun run e2e:ui              # Open Playwright UI
bun run e2e:headed          # Run in headed mode
```

E2E tests require Docker for the test database container.

## Deployment

Both apps are deployed to Vercel:
- **API**: https://vercel.com/dikas-projects-fa33ee27/jobmatch-api
- **Web**: https://vercel.com/dikas-projects-fa33ee27/jobmatch-web

### Deploy Commands

```bash
# Deploy API
cd apps/api && vercel --prod

# Deploy Web
cd apps/web && vercel --prod
```

### Environment Variables for Production

**API (Vercel):**
- `DATABASE_URL` - Production PostgreSQL connection string (Neon)
- `OPENROUTER_API_KEY` - OpenRouter API key
- `BETTER_AUTH_SECRET` - Random secret for auth (32+ chars, use `openssl rand -base64 32`)
- `BETTER_AUTH_URL` - Production API URL (e.g., https://jobmatch-api-seven.vercel.app)
- `FRONTEND_URL` - Production frontend URL (e.g., https://jobmatch-web-mauve.vercel.app)
- `GOOGLE_CLIENT_ID` - (Optional) Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - (Optional) Google OAuth client secret

**Web (Vercel):**
- `NEXT_PUBLIC_API_URL` - Production API URL (e.g., https://jobmatch-api-seven.vercel.app)

## License

MIT

## Author

Built for Jobsuit.ai technical assessment
