# Product Requirements Document (PRD)
## JobMatch Lite - Resume-Job Description Matching Tool

**Version:** 1.0
**Last Updated:** December 17, 2025
**Author:** Development Team
**Status:** Approved

---

## 1. Executive Summary

### 1.1 Problem Statement

Job seekers face a critical disconnect between their resumes and job descriptions:

- **75% of resumes are rejected by Applicant Tracking Systems (ATS)** before a human ever reviews them
- Job seekers spend an average of **76 minutes per application** tailoring resumes, often with no feedback on effectiveness
- Career coaches lack quantitative tools to demonstrate resume improvement to clients
- HR professionals manually screening resumes spend **6-7 seconds per resume**, leading to qualified candidates being overlooked

### 1.2 Root Causes

1. **Keyword Mismatch**: Candidates don't know which terms from job descriptions are critical
2. **No Feedback Loop**: After applying, candidates receive no insight into why they were rejected
3. **Time Constraints**: Manually comparing resume content to job requirements is tedious
4. **Subjectivity**: Without objective scoring, resume optimization becomes guesswork

### 1.3 Solution

**JobMatch Lite** is a single-page web application that uses AI to instantly analyze how well a resume matches a specific job description, providing:
- An objective **match score (0-100)**
- **Detailed explanations** with strengths, gaps, and suggestions
- A **downloadable PDF report** for reference and sharing

---

## 2. Product Vision

### 2.1 Vision Statement

> "The fastest, simplest way to check resume-job fit. No account needed, instant results, downloadable report."

### 2.2 Value Proposition

| Stakeholder | Value Delivered |
|-------------|-----------------|
| **Job Seekers** | Instant, actionable feedback to optimize resumes before applying |
| **Career Coaches** | Quantitative before/after metrics to demonstrate coaching value |
| **HR Professionals** | Quick screening tool to prioritize candidate review |

### 2.3 Product Goals

1. Provide immediate feedback on resume-job alignment
2. Reduce time spent on resume optimization
3. Increase confidence in application decisions
4. Enable data-driven resume improvements

---

## 3. User Personas

### 3.1 Alex Chen - The Active Job Seeker

**Demographics**
- Age: 28
- Occupation: Software Developer seeking Senior role
- Location: Austin, TX
- Tech Savviness: High

**Goals**
- Apply to 10-15 positions per week efficiently
- Tailor resume for each application without spending hours
- Understand why previous applications might have failed

**Pain Points**
- "I've applied to 50+ jobs with minimal responses. I have no idea if my resume is terrible or if it's just the market."
- "Every job description uses different terminology - I can't keep up."
- "ATS systems feel like black boxes."

**How JobMatch Lite Helps**
Alex pastes a job description from LinkedIn, uploads his current resume, and instantly sees a 67/100 match score. The explanation highlights that the job emphasizes "cloud infrastructure" and "Kubernetes," terms missing from his resume despite having that experience. He updates his resume, re-checks, and sees 84/100.

**Quote**: *"I need a tool that tells me exactly what's missing before I hit 'Apply.'"*

---

### 3.2 Maria Santos - The Career Coach

**Demographics**
- Age: 42
- Occupation: Independent Career Coach
- Location: Miami, FL
- Tech Savviness: Medium

**Goals**
- Demonstrate tangible value to clients
- Scale her coaching practice with efficient tools
- Provide data-backed recommendations

**Pain Points**
- "Clients don't always trust my subjective feedback on their resumes."
- "I spend too much time on manual resume reviews."
- "I need shareable reports to justify my coaching fees."

**How JobMatch Lite Helps**
Maria uses JobMatch Lite during client sessions. She shows a client their initial 52/100 score, then works through improvements together. After revisions, they see 78/100. She downloads the PDF report showing improvement as proof of progress.

**Quote**: *"If I can show a client their score improved by 30 points, they understand exactly what they paid for."*

---

### 3.3 David Park - The HR Recruiter

**Demographics**
- Age: 35
- Occupation: Senior Recruiter at mid-size tech company
- Location: Seattle, WA
- Tech Savviness: Medium-High

**Goals**
- Screen candidates faster without missing qualified applicants
- Provide hiring managers with pre-vetted candidate shortlists
- Reduce time-to-hire metrics

**Pain Points**
- "I review 100+ resumes per open position. It's overwhelming."
- "Sometimes great candidates slip through because their resume doesn't 'look' right."
- "Hiring managers question my screening methodology."

**How JobMatch Lite Helps**
David copies the official job description, then quickly runs top candidates' resumes through JobMatch Lite. He shares the PDF reports with hiring managers, showing why he selected certain candidates for interviews. The objective scores support his recommendations.

**Quote**: *"I need to defend my candidate selections with more than 'gut feeling.'"*

---

## 4. Feature Specifications

### 4.1 F1: Job Description Input

| Attribute | Specification |
|-----------|---------------|
| **Description** | Text area for users to paste job description content |
| **Location** | Left pane of split-screen layout |
| **Input Type** | Multi-line text area |
| **Character Limit** | 10,000 characters (approximately 1,500-2,000 words) |
| **Validation** | Minimum 100 characters required |
| **Placeholder** | "Paste the full job description here, including requirements, responsibilities, and qualifications..." |

**Acceptance Criteria**
- [ ] User can paste text from any source (web, document, email)
- [ ] Character count displayed (e.g., "2,450 / 10,000")
- [ ] Warning shown when approaching limit
- [ ] Error state if under minimum (100 chars)
- [ ] Text area is resizable within layout constraints

---

### 4.2 F2: Resume Upload

| Attribute | Specification |
|-----------|---------------|
| **Description** | File upload component for resume documents |
| **Location** | Right pane of split-screen layout |
| **Supported Formats** | PDF (.pdf), Microsoft Word (.docx) |
| **Maximum File Size** | 5 MB |
| **Parsing** | Server-side text extraction |

**Acceptance Criteria**
- [ ] Drag-and-drop zone with visual feedback
- [ ] Click-to-browse file selection
- [ ] File type validation with user-friendly error messages
- [ ] File size validation with clear limit display
- [ ] Upload progress indicator
- [ ] File name displayed after successful upload
- [ ] Option to remove uploaded file and select another

---

### 4.3 F3: Match Analysis

| Attribute | Specification |
|-----------|---------------|
| **Trigger** | "Check Resume Match" button click |
| **AI Provider** | OpenRouter (free tier model) |
| **Output: Score** | Integer 0-100 |
| **Output: Explanation** | Structured text analysis (300-600 words) |
| **Response Time** | Target < 10 seconds |

**Scoring Rubric**

| Score Range | Interpretation |
|-------------|----------------|
| 90-100 | Excellent match - Resume strongly aligned |
| 75-89 | Good match - Minor gaps to address |
| 60-74 | Moderate match - Notable areas for improvement |
| 40-59 | Weak match - Significant alignment needed |
| 0-39 | Poor match - Major resume revision required |

**Explanation Structure**
1. **Overall Assessment**: 2-3 sentence summary
2. **Strengths**: Key areas where resume matches job requirements
3. **Gaps Identified**: Missing keywords, skills, or experience
4. **Recommendations**: Specific suggestions for improvement

---

### 4.4 F4: Results Display

| Attribute | Specification |
|-----------|---------------|
| **Layout** | Full-width card replacing/overlaying input view |
| **Components** | Score visualization, explanation sections, action buttons |

**UI Components**
1. **Score Circle/Gauge**: Large circular progress indicator with score number centered, color reflects score range
2. **Score Interpretation Badge**: Text label ("Excellent Match", "Good Match", etc.)
3. **Explanation Accordion**: Collapsible sections for Overall, Strengths, Gaps, Recommendations
4. **Action Buttons**: "Download Report as PDF" (primary), "Try Another Resume" (secondary)

---

### 4.5 F5: PDF Report Download

| Attribute | Specification |
|-----------|---------------|
| **Trigger** | "Download Report as PDF" button click |
| **Generation Method** | Server-side via Puppeteer headless browser |
| **Output** | PDF file downloaded to user's device |

**PDF Report Contents**
1. Header with branding and timestamp
2. Match score with visual indicator
3. Analysis details (overview, strengths, gaps, suggestions)
4. Footer with generation info

**Technical Requirement**
The backend MUST use Puppeteer (headless browser) to render HTML to PDF. This demonstrates server-side rendering and file stream handling capability.

---

## 5. Success Metrics

### 5.1 Primary KPIs

| Metric | Definition | Target |
|--------|------------|--------|
| **Analysis Completion Rate** | % of users who complete full analysis flow | > 80% |
| **PDF Download Rate** | % of completed analyses that generate PDF | > 40% |
| **Average Session Duration** | Time spent on application | 3-7 minutes |
| **Error Rate** | % of analysis attempts that fail | < 2% |

### 5.2 Secondary Metrics

| Metric | Definition | Target |
|--------|------------|--------|
| Repeat Usage | Users returning within 7 days | > 25% |
| File Parse Success | % of uploads successfully parsed | > 98% |
| AI Response Time | 95th percentile response time | < 12s |
| PDF Generation Time | 95th percentile generation time | < 6s |

---

## 6. Out of Scope (V1)

The following features are explicitly **NOT** included in this version:

| Feature | Reason for Exclusion |
|---------|---------------------|
| User Accounts/Authentication | MVP focused on single-use simplicity |
| Resume Storage/History | Privacy concerns; adds complexity |
| Multiple Resume Comparison | Future feature; requires UI redesign |
| Resume Editing Suggestions | Beyond matching scope |
| ATS Simulation | Requires proprietary algorithm knowledge |
| Job Description Scraping | Legal/ToS complications |
| API for Third-party Integration | Enterprise feature |
| Multi-language Support | English-only for V1 |
| Mobile Native Apps | Responsive web is sufficient |
| Batch Processing | Single document focus |

---

## 7. Technical Constraints

### 7.1 Platform Requirements

| Requirement | Specification |
|-------------|---------------|
| **Frontend Framework** | Next.js 15 (App Router) |
| **Backend Framework** | ElysiaJS (Bun runtime) |
| **PDF Engine** | Puppeteer with @sparticuz/chromium |
| **AI Provider** | OpenRouter (free tier model) |
| **Deployment** | Vercel (separate projects for FE/BE) |

### 7.2 Performance Constraints

| Constraint | Limit | Rationale |
|------------|-------|-----------|
| File Size | 5 MB max | Server memory management |
| Job Description | 10,000 chars | API token limits |
| Concurrent Users | ~50 simultaneous | Free tier limitations |
| PDF Generation | 60s timeout | Vercel function limit |

### 7.3 Security Constraints

- No persistent storage of user data
- Files processed in memory, not written to disk
- HTTPS required for all traffic
- Input sanitization for AI prompts
- Rate limiting to prevent abuse

### 7.4 Browser Support

| Browser | Minimum Version |
|---------|-----------------|
| Chrome | 90+ |
| Firefox | 88+ |
| Safari | 14+ |
| Edge | 90+ |

---

## 8. Dependencies & Risks

| Dependency | Risk Level | Mitigation |
|------------|------------|------------|
| OpenRouter API | Medium | Rate limits, downtime - Graceful error handling, retry logic |
| Puppeteer on Vercel | High | 50MB limit - Use @sparticuz/chromium-min |
| File parsing libraries | Low | Format edge cases - Comprehensive error handling |
| Vercel serverless | Low | Cold starts - Optimize function size |

---

## 9. Appendix

### 9.1 Glossary

- **ATS**: Applicant Tracking System - Software used by employers to filter resumes
- **Match Score**: Numerical representation (0-100) of resume-job alignment
- **OpenRouter**: AI API gateway providing access to multiple LLM models
- **Puppeteer**: Node.js library for headless browser automation

### 9.2 References

- Original requirement document: `requirement.md`
- Architecture documentation: `docs/ARCHITECTURE.md`
- API specification: `docs/API-SPEC.yaml`
- User research: `docs/USER-RESEARCH.md`
