# JobMatch Lite - Redesign Control Panel

> **Status**: Planning Complete | **Figma**: Pending | **API**: Pending | **FE**: Pending

This document serves as the central control panel for the UI/UX redesign project.

---

## Table of Contents

1. [Quick Reference](#quick-reference)
2. [Design System](#design-system)
3. [Site Architecture](#site-architecture)
4. [Figma MAKE Prompts](#figma-make-prompts)
5. [API Contracts](#api-contracts)
6. [Implementation Checklist](#implementation-checklist)
7. [QC Checklists](#qc-checklists)

---

## Quick Reference

### Brand Summary
| Element | Value |
|---------|-------|
| Primary Color | `#2563EB` (Blue 600) |
| Font Family | Inter |
| Border Radius | 8px (buttons), 12px (cards) |
| Tagline | "Match. Improve. Succeed." |

### Pages to Build
| Page | Priority | Status |
|------|----------|--------|
| Landing (/) | P0 | ⬜ |
| Dashboard (/dashboard) | P0 | ⬜ |
| Analyze (/analyze) | P0 | ⬜ |
| History (/history) | P1 | ⬜ |
| Compare (/compare) | P1 | ⬜ |
| Settings (/settings) | P2 | ⬜ |

---

## Design System

### Color Palette

```
PRIMARY
├── blue-600     #2563EB   (primary actions, links)
├── blue-700     #1D4ED8   (hover states)
├── blue-100     #DBEAFE   (backgrounds, highlights)

SEMANTIC
├── green-500    #10B981   (success, excellent scores 90+)
├── amber-500    #F59E0B   (warning, moderate scores 60-74)
├── red-500      #EF4444   (error, poor scores <40)
├── purple-500   #8B5CF6   (suggestions, insights)

NEUTRAL
├── slate-900    #0F172A   (headings)
├── slate-700    #334155   (body text)
├── slate-500    #64748B   (secondary text)
├── slate-300    #CBD5E1   (borders)
├── slate-100    #F1F5F9   (backgrounds)
├── white        #FFFFFF   (cards)

SCORE COLORS (use for gauges/badges)
├── 90-100%      #10B981   "Excellent"
├── 75-89%       #2563EB   "Good"
├── 60-74%       #F59E0B   "Moderate"
├── 40-59%       #F97316   "Needs Work"
├── 0-39%        #EF4444   "Poor"
```

### Typography Scale

```
HEADINGS (Inter, weight 600-700)
├── Display XL   48px/56px   (landing hero)
├── Display      36px/44px   (page titles)
├── H1           30px/38px   (section titles)
├── H2           24px/32px   (card titles)
├── H3           20px/28px   (subsections)

BODY (Inter, weight 400-500)
├── Large        18px/28px   (lead paragraphs)
├── Base         16px/24px   (default)
├── Small        14px/20px   (captions, labels)
├── XS           12px/16px   (timestamps)
```

### Spacing Scale (4px base)

```
├── xs     4px
├── sm     8px
├── md     16px
├── lg     24px
├── xl     32px
├── 2xl    48px
├── 3xl    64px
├── 4xl    96px
```

### Component Tokens

```
BORDER RADIUS
├── sm       6px   (chips, small buttons)
├── md       8px   (buttons, inputs)
├── lg       12px  (cards, modals)
├── xl       16px  (featured sections)
├── full     9999px (avatars, pills)

SHADOWS
├── sm       0 1px 2px rgba(0,0,0,0.05)
├── md       0 4px 6px rgba(0,0,0,0.07)
├── lg       0 10px 15px rgba(0,0,0,0.1)
├── xl       0 20px 25px rgba(0,0,0,0.15)
├── glow     0 0 20px rgba(37,99,235,0.3)
```

---

## Site Architecture

### Route Structure

```
PUBLIC
├── /                    Landing page
├── /login              Login form
└── /register           Registration form

AUTHENTICATED (requires session)
├── /dashboard          Home after login - stats & recent activity
├── /analyze            Main analysis tool (redesigned)
├── /history            Analysis history with search/filter
├── /compare            Side-by-side job comparison (NEW)
└── /settings           User preferences (NEW)
```

### User Flows

```
FLOW 1: New User
Landing → Register → Dashboard → First Analysis → Results

FLOW 2: Returning User
Login → Dashboard → Quick Action → Continue

FLOW 3: Analysis
Dashboard → Analyze → Input → Results → Save/Compare/Download

FLOW 4: Comparison
History → Select 2-3 → Compare → Insights → Decision

FLOW 5: Progress Check
Dashboard → View Stats → Trends → Identify Improvements
```

---

## Figma MAKE Prompts

### PROMPT 1: Design System Foundation

```
Create a new Figma design file called "JobMatch Lite Design System"

SET UP COLOR STYLES:
1. Create a "Colors" page
2. Add color styles with these exact values:
   - Primary/Blue-600: #2563EB
   - Primary/Blue-700: #1D4ED8
   - Primary/Blue-100: #DBEAFE
   - Semantic/Success: #10B981
   - Semantic/Warning: #F59E0B
   - Semantic/Error: #EF4444
   - Semantic/Info: #8B5CF6
   - Neutral/Slate-900: #0F172A
   - Neutral/Slate-700: #334155
   - Neutral/Slate-500: #64748B
   - Neutral/Slate-300: #CBD5E1
   - Neutral/Slate-100: #F1F5F9
   - Neutral/White: #FFFFFF

SET UP TEXT STYLES:
1. Font family: Inter (download from Google Fonts if needed)
2. Create text styles:
   - Display/XL: 48px, weight 700, line-height 56px
   - Display/Base: 36px, weight 700, line-height 44px
   - Heading/H1: 30px, weight 600, line-height 38px
   - Heading/H2: 24px, weight 600, line-height 32px
   - Heading/H3: 20px, weight 600, line-height 28px
   - Body/Large: 18px, weight 400, line-height 28px
   - Body/Base: 16px, weight 400, line-height 24px
   - Body/Small: 14px, weight 400, line-height 20px
   - Body/XS: 12px, weight 400, line-height 16px

SET UP EFFECT STYLES:
1. Shadow/SM: 0px 1px 2px rgba(0,0,0,0.05)
2. Shadow/MD: 0px 4px 6px rgba(0,0,0,0.07)
3. Shadow/LG: 0px 10px 15px rgba(0,0,0,0.1)
4. Shadow/XL: 0px 20px 25px rgba(0,0,0,0.15)

SET UP GRID SYSTEMS:
1. Desktop: 12-column, 1280px max-width, 24px gutter
2. Tablet: 8-column, 768px max-width, 16px gutter
3. Mobile: 4-column, 375px max-width, 16px gutter
```

**QC Checklist - Design System:**
- [ ] All 13 colors added as styles
- [ ] All 9 text styles created with Inter font
- [ ] All 4 shadow effects defined
- [ ] 3 grid systems configured
- [ ] Styles are organized in folders

---

### PROMPT 2: Button Component Set

```
Create a Button component with the following variants:

COMPONENT STRUCTURE:
- Name: "Button"
- Create as a component set with variants

SIZE VARIANTS (height):
- SM: 32px height, 12px horizontal padding, 14px font
- MD: 40px height, 16px horizontal padding, 14px font
- LG: 48px height, 24px horizontal padding, 16px font
- XL: 56px height, 32px horizontal padding, 18px font

STYLE VARIANTS:
1. Primary:
   - Background: #2563EB
   - Text: White
   - Hover: #1D4ED8
   - Active: #1E40AF

2. Secondary:
   - Background: White
   - Border: 1px solid #CBD5E1
   - Text: #334155
   - Hover: Background #F1F5F9

3. Ghost:
   - Background: Transparent
   - Text: #2563EB
   - Hover: Background #DBEAFE

4. Danger:
   - Background: #EF4444
   - Text: White
   - Hover: #DC2626

STATE VARIANTS:
- Default
- Hover
- Active/Pressed
- Disabled (opacity 0.5, cursor not-allowed)
- Loading (show spinner, text "Loading...")

COMMON PROPERTIES:
- Border radius: 8px
- Font weight: 500
- Transition: all 150ms ease
- Icon slots: left icon (optional), right icon (optional)
- Icon size: 16px (SM/MD), 20px (LG/XL)

Create icon-only variant:
- Square aspect ratio
- Same sizes but width = height
```

**QC Checklist - Buttons:**
- [ ] 4 sizes created (SM, MD, LG, XL)
- [ ] 4 styles created (Primary, Secondary, Ghost, Danger)
- [ ] 5 states per style (Default, Hover, Active, Disabled, Loading)
- [ ] Icon slots work (left, right, icon-only)
- [ ] All use design system colors
- [ ] Border radius is 8px
- [ ] Loading state has spinner

---

### PROMPT 3: Card Components

```
Create Card components with these variants:

BASE CARD:
- Background: White (#FFFFFF)
- Border: 1px solid #E2E8F0
- Border radius: 12px
- Shadow: Shadow/SM
- Padding: 24px

CARD VARIANTS:

1. Default Card:
   - Base styling only
   - Auto-layout: vertical, 16px gap

2. Elevated Card:
   - Same as default
   - Shadow: Shadow/LG instead of SM

3. Interactive Card:
   - Same as default
   - Hover: Shadow/MD, translateY(-2px)
   - Cursor: pointer

4. Accent Card:
   - Same as default
   - Add 4px left border
   - Border color variants: Blue, Green, Amber, Red, Purple

5. Stat Card (for dashboard):
   - Centered content
   - Icon: 40px in colored circle (light background)
   - Label: 14px, Slate-500
   - Value: 32px, weight 700, Slate-900
   - Trend: small text with arrow icon (+5% green, -3% red)

CARD SUBCOMPONENTS:
1. CardHeader:
   - Title (H2 style) + optional action button area
   - Padding bottom: 16px
   - Border bottom: 1px solid #E2E8F0 (optional)

2. CardContent:
   - Main content area
   - Auto-layout vertical

3. CardFooter:
   - Padding top: 16px
   - Border top: 1px solid #E2E8F0
   - Buttons aligned right
```

**QC Checklist - Cards:**
- [ ] 5 card variants created
- [ ] Accent card has 5 color options
- [ ] Stat card has icon, label, value, trend
- [ ] CardHeader, CardContent, CardFooter exist
- [ ] Interactive card has hover effect
- [ ] All use design system tokens

---

### PROMPT 4: Score Visualization Components

```
Create score visualization components:

1. CIRCULAR GAUGE (ScoreGauge):

Sizes:
- SM: 80px diameter, 8px ring
- MD: 120px diameter, 10px ring
- LG: 160px diameter, 12px ring
- XL: 200px diameter, 14px ring

Structure:
- Background ring: #E2E8F0
- Progress ring: Colored based on score
- Center content:
  - Score number (bold, large)
  - Label text below (small)

Score-based colors:
- 90-100: #10B981 (Excellent)
- 75-89: #2563EB (Good)
- 60-74: #F59E0B (Moderate)
- 40-59: #F97316 (Needs Work)
- 0-39: #EF4444 (Poor)

Labels for each range:
- 90-100: "Excellent"
- 75-89: "Good Match"
- 60-74: "Moderate"
- 40-59: "Needs Work"
- 0-39: "Poor Match"

2. SCORE BADGE (ScoreBadge):

Structure:
- Pill shape (border-radius: 9999px)
- Horizontal padding: 12px
- Vertical padding: 4px
- Background: Score-based color
- Text: White, 14px, weight 600
- Format: "78% Good"

Sizes:
- SM: 12px font, 8px/3px padding
- MD: 14px font, 12px/4px padding
- LG: 16px font, 16px/6px padding

3. MINI GAUGE (for tables/lists):
- 40px diameter
- 4px ring thickness
- Just ring + number, no label
- Same color system
```

**QC Checklist - Score Components:**
- [ ] ScoreGauge has 4 sizes
- [ ] 5 color states based on score ranges
- [ ] Labels match score ranges
- [ ] ScoreBadge has 3 sizes
- [ ] MiniGauge is 40px with no label
- [ ] Colors match design system

---

### PROMPT 5: Form Input Components

```
Create form input components:

1. TEXT INPUT:

Properties:
- Height: 44px
- Border: 1px solid #CBD5E1
- Border radius: 8px
- Padding: 12px 16px
- Font: 16px Inter
- Background: White

States:
- Default: as described
- Focus: Border #2563EB, 3px ring #DBEAFE
- Error: Border #EF4444, 3px ring #FEE2E2
- Disabled: Background #F1F5F9, opacity 0.7

Variants:
- With left icon (icon 20px, gray-500)
- With right icon
- With both icons

Label:
- 14px, weight 500, Slate-700
- Margin bottom: 6px

Helper text:
- 14px, Slate-500
- Error text: 14px, Red-500
- Margin top: 6px

2. TEXTAREA:

Properties:
- Min-height: 120px
- Same styling as input
- Resize: vertical only

Features:
- Character count (bottom-right, gray-500)
- Format: "X / 10,000"

3. FILE UPLOAD:

Structure:
- Dashed border: 2px dashed #CBD5E1
- Border radius: 12px
- Min-height: 160px
- Centered content

Content:
- Upload cloud icon (48px, gray-400)
- Text: "Drag & drop your resume"
- Subtext: "or click to browse (PDF, DOCX, max 5MB)"

States:
- Default: as described
- Hover: Border #2563EB, Background #F8FAFC
- Drag-active: Background #DBEAFE, Border solid #2563EB
- File selected: Solid border, show file info

File selected display:
- File icon + filename + size
- Remove button (X icon, gray-500)

4. SELECT/DROPDOWN:

Structure:
- Same as text input base
- Chevron-down icon on right

Dropdown menu:
- Background: White
- Shadow: Shadow/LG
- Border radius: 8px
- Max-height: 300px (scroll if overflow)

Option:
- Height: 40px
- Padding: 12px 16px
- Hover: Background #F1F5F9
- Selected: Background #DBEAFE, text #2563EB
```

**QC Checklist - Form Inputs:**
- [ ] Text input has all 4 states
- [ ] Text input has icon variants
- [ ] Label and helper text components exist
- [ ] Textarea has character count
- [ ] File upload has 4 states
- [ ] File upload shows selected file
- [ ] Select has dropdown menu
- [ ] All use 44px height consistently

---

### PROMPT 6: Navigation Components

```
Create navigation components:

1. SIDEBAR (Desktop):

Structure:
- Width: 240px (expanded), 72px (collapsed)
- Height: 100vh
- Background: White
- Border-right: 1px solid #E2E8F0
- Padding: 24px 16px

Content:
- Logo area (top, 48px height)
- Nav items (middle, scrollable)
- User card (bottom, fixed)

Collapse toggle:
- Button at bottom of sidebar
- Icon: chevrons-left (expanded), chevrons-right (collapsed)

2. NAV ITEM:

Structure:
- Height: 44px
- Padding: 12px 16px
- Border radius: 8px
- Gap: 12px between icon and text

Content:
- Icon: 20px
- Text: 14px, weight 500

States:
- Default: Text gray-600, Icon gray-500
- Hover: Background #F1F5F9
- Active: Background #DBEAFE, text #2563EB, left border 3px #2563EB

Icons for nav items:
- Dashboard: LayoutDashboard
- New Analysis: FileSearch
- History: History
- Compare: GitCompare
- Settings: Settings

3. BOTTOM NAV (Mobile):

Structure:
- Fixed bottom
- Height: 64px + safe area inset
- Background: White
- Border-top: 1px solid #E2E8F0
- Shadow: Shadow/LG (upward)

Items (max 5):
- Width: equal distribution
- Icon: 24px (centered)
- Label: 12px (below icon)

States:
- Default: Gray-500
- Active: Blue-600, icon filled style

4. USER MENU:

Avatar:
- Size: 36px circle
- Border: 2px solid #E2E8F0

Dropdown:
- Trigger: Click on avatar
- Background: White
- Shadow: Shadow/LG
- Border radius: 12px
- Width: 200px

Menu items:
- User info header (name, email)
- Divider
- Profile link
- Settings link
- Divider
- Sign out (red text)
```

**QC Checklist - Navigation:**
- [ ] Sidebar has expanded (240px) and collapsed (72px) states
- [ ] 5 nav items with correct icons
- [ ] Nav item has default, hover, active states
- [ ] Bottom nav has 5 items max
- [ ] User menu has avatar + dropdown
- [ ] Dropdown has all menu items
- [ ] Mobile nav has safe area padding

---

### PROMPT 7: Landing Page

```
Create Landing Page design (1440px desktop width):

SECTION 1: HERO (min-height 90vh)

Background:
- Gradient: linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)
- Optional: subtle pattern overlay

Content (centered):
- Badge: "AI-Powered Resume Matching" (pill, white/20% opacity bg)
- Headline: "Land Your Dream Job with AI-Powered Resume Matching"
  - Display/XL, White, max-width 800px
- Subheadline: "Get instant feedback on how well your resume matches any job description. Identify gaps, improve your chances, and track your progress."
  - Body/Large, White/80%, max-width 600px
- CTA buttons (centered):
  - [Get Started Free] - White bg, Blue text, XL size
  - [See How It Works] - Ghost white, XL size
- Trust indicator: "Join 10,000+ job seekers" with avatars stack

Scroll indicator:
- Chevron-down icon, animated bounce
- Position: bottom center

SECTION 2: FEATURES (padding 96px vertical)

Background: White

Header:
- "Everything you need to land your dream job"
- Display/Base, centered
- Subtext: Body/Large, gray-600, max-width 600px

3-Column Grid (gap 32px):

Card 1:
- Icon: Zap (lightning) in blue circle
- Title: "Instant Analysis"
- Description: "Get detailed match scores and insights in seconds, not hours. Our AI analyzes your resume against any job description."

Card 2:
- Icon: Brain in purple circle
- Title: "Smart Insights"
- Description: "Understand exactly what's missing. Get actionable suggestions to improve your resume for each specific role."

Card 3:
- Icon: TrendingUp in green circle
- Title: "Track Progress"
- Description: "Compare multiple jobs, track your improvements over time, and see how your match scores evolve."

SECTION 3: HOW IT WORKS (padding 96px, gray-50 bg)

Header:
- "How it works"
- Display/Base, centered

3-Step Process (horizontal):

Step 1:
- Number badge: "1" in blue circle
- Illustration: Upload icon + document
- Title: "Upload Your Resume"
- Description: "Upload your resume in PDF or DOCX format"

Step 2:
- Number badge: "2" in blue circle
- Illustration: Paste icon + text lines
- Title: "Paste Job Description"
- Description: "Copy and paste the full job posting"

Step 3:
- Number badge: "3" in blue circle
- Illustration: Chart/gauge icon
- Title: "Get Instant Insights"
- Description: "See your match score, strengths, and suggestions"

Arrow connectors between steps (dashed line)

SECTION 4: STATS (padding 64px)

Background: White

4-Column Grid:

Stat 1: "50K+" / "Analyses Completed"
Stat 2: "85%" / "Success Rate"
Stat 3: "4.9" / "User Rating" (with stars)
Stat 4: "24/7" / "Available"

SECTION 5: CTA FOOTER (padding 96px)

Background: Gradient same as hero

Content (centered):
- Headline: "Ready to boost your job search?"
- Subtext: "Join thousands of job seekers who improved their applications"
- [Create Free Account] - White bg, Blue text, XL
- Note: "No credit card required"
```

**QC Checklist - Landing Page:**
- [ ] Hero has gradient background
- [ ] Hero has badge, headline, subheadline, 2 CTAs
- [ ] Features section has 3 cards with icons
- [ ] How it works has 3 steps with connectors
- [ ] Stats section has 4 stat items
- [ ] CTA footer matches hero gradient
- [ ] All text uses typography scale
- [ ] Responsive variants (tablet, mobile)

---

### PROMPT 8: Dashboard Page

```
Create Dashboard Page (1440px with 240px sidebar):

LAYOUT:
- Sidebar: 240px fixed left
- Main content: remaining width
- Padding: 32px

HEADER ROW:
- Left: "Welcome back, {Name}" (H1)
- Right: [+ New Analysis] button (Primary, MD)

STATS ROW (4 columns, gap 24px):

Stat Card 1: "Total Analyses"
- Icon: FileText in blue circle
- Value: "24"
- Trend: "+3 this week" (green)

Stat Card 2: "Average Score"
- Icon: Target in purple circle
- Value: "76%"
- Trend: "+5% improvement" (green)

Stat Card 3: "Best Match"
- Icon: Trophy in amber circle
- Value: "92%"
- Subtext: "Senior Dev @ Google" (truncated)

Stat Card 4: "Jobs Compared"
- Icon: GitCompare in green circle
- Value: "8"
- Trend: "2 comparisons saved"

TWO-COLUMN LAYOUT (below stats, gap 24px):

Left Column - Score Trend Chart:
- Card with "Score Trend" header
- Line chart showing last 10 analyses
- X-axis: Date
- Y-axis: Score (0-100)
- Data points with tooltips

Right Column - Skills Gap:
- Card with "Top Skills to Improve" header
- Horizontal bar chart
- Bars: JavaScript (85%), TypeScript (70%), React (90%), Node.js (60%)
- Color based on percentage

RECENT ANALYSES TABLE:
- Card with "Recent Analyses" header + "View All" link
- Table columns:
  - Job (title + company, truncated)
  - Score (MiniGauge)
  - Date (relative: "2 days ago")
  - Actions (View, Compare, Delete icons)
- Show 5 rows
- Hover: row highlights
```

**QC Checklist - Dashboard:**
- [ ] Sidebar present with nav items
- [ ] Welcome header with user name
- [ ] 4 stat cards with icons and trends
- [ ] Line chart placeholder for score trend
- [ ] Bar chart for skills gap
- [ ] Recent analyses table with 5 rows
- [ ] All interactive elements have hover states
- [ ] Responsive: tablet stacks to 2 columns, mobile to 1

---

### PROMPT 9: Analysis Page

```
Create Analysis Page (split layout):

LAYOUT:
- Two-panel split: 50/50 on desktop
- Stack vertically on mobile
- Gap: 32px

LEFT PANEL - INPUT:

Header:
- "New Analysis" (H1)
- Subtext: "Analyze how well your resume matches a job"

Job Description Card:
- Title input: "Job Title (optional)"
- Company input: "Company Name (optional)"
- Textarea: Job description
  - Placeholder: "Paste the full job description here..."
  - Character count
  - Min indicator: "Minimum 100 characters"
- Tip text: "Include requirements, responsibilities, and qualifications for best results"

Resume Upload Card:
- File upload zone (from form components)
- Accepted formats note

Action Bar:
- [Analyze Match] button (Primary, XL, full-width)
- Loading state: Spinner + "Analyzing your resume..." + progress indicator

RIGHT PANEL - RESULTS (shown after analysis):

Score Hero:
- ScoreGauge (XL size)
- Processing time: "Analyzed in 4.2 seconds"

Summary Card:
- Header: "Analysis Summary"
- AI-generated explanation (2-3 paragraphs)

Findings Grid (3 cards):

Card 1 - Strengths (green accent):
- Icon: CheckCircle (green)
- Header: "Strengths"
- Bulleted list (3-5 items)

Card 2 - Gaps (red accent):
- Icon: XCircle (red)
- Header: "Gaps to Address"
- Bulleted list (3-5 items)

Card 3 - Suggestions (purple accent):
- Icon: Lightbulb (purple)
- Header: "Suggestions"
- Bulleted list (3-5 items)

Action Bar:
- [Add to Compare] - Secondary
- [Download PDF] - Secondary
- [Analyze Another] - Ghost
```

**QC Checklist - Analysis Page:**
- [ ] Two-panel layout (50/50)
- [ ] Job description has optional title/company fields
- [ ] Textarea has character count
- [ ] File upload works correctly
- [ ] Loading state shows progress
- [ ] Score gauge is XL size
- [ ] 3 findings cards with correct colors
- [ ] Action buttons present
- [ ] Mobile stacks vertically

---

### PROMPT 10: History Page

```
Create History Page:

HEADER SECTION:
- Title: "Analysis History" (H1)
- Subtitle: "24 analyses saved"
- Action row:
  - Search input (with search icon)
  - Filter dropdown: Score range (All, 90+, 75-89, 60-74, <60)
  - Sort dropdown: Newest, Oldest, Highest Score, Lowest Score
  - View toggle: [List icon] [Grid icon]

LIST VIEW (default):
- Table layout
- Columns:
  - Checkbox (for bulk select)
  - Job Info (title + company in 2 lines)
  - Score (ScoreBadge)
  - Date (relative format)
  - Actions (View, Compare, Delete icon buttons)
- Row hover: light gray background
- Pagination: "Showing 1-10 of 24" + page buttons

GRID VIEW (alternative):
- 3-column card grid
- Card content:
  - ScoreBadge (top-right corner, absolute)
  - Job title (H3, truncated)
  - Company name (Body/Small, gray)
  - Date (XS, gray)
  - MiniGauge (bottom-left)
  - Actions row (View, Compare, Delete)

EMPTY STATE:
- Centered content
- Illustration: Empty folder or documents
- Title: "No analyses yet"
- Subtext: "Start by analyzing your first job match"
- [Start Your First Analysis] button
```

**QC Checklist - History Page:**
- [ ] Search input works
- [ ] Filter dropdown has score ranges
- [ ] Sort dropdown has 4 options
- [ ] View toggle switches between list/grid
- [ ] List view has proper table columns
- [ ] Grid view shows 3 columns
- [ ] Empty state design complete
- [ ] Pagination present

---

### PROMPT 11: Compare Page

```
Create Compare Page:

HEADER:
- Title: "Compare Jobs" (H1)
- Subtitle: "Select up to 3 analyses to compare"
- [+ Add Job] button (Secondary)

EMPTY STATE (no jobs selected):
- 3 empty placeholder cards (dashed border)
- Each shows: "Click to add a job"
- Click opens job selector modal

JOB SELECTOR MODAL:
- Title: "Select an Analysis"
- Search input
- List of analyses from history:
  - Job title + company
  - Score badge
  - Date
- Click to add to comparison
- Max 3 selections

COMPARISON VIEW (jobs selected):

Column Headers:
- 1-3 columns based on selection
- Each column:
  - Job title (H3)
  - Company name
  - [X] Remove button
  - Score gauge (MD size)

Comparison Table:

Row 1: "Overall Score"
- Score gauges side by side

Row 2: "Strengths"
- Count per job (e.g., "5 strengths")

Row 3: "Gaps"
- Count per job

Row 4: "Key Skills"
- Checkmarks or X for each skill per job
- Skills: JavaScript, React, Node.js, TypeScript, etc.

RADAR CHART:
- 5 dimensions: Skills Match, Experience, Education, Keywords, Culture Fit
- Overlay lines for each job (different colors)
- Legend below

RECOMMENDATION CARD:
- "Best Match" badge on winning job
- Summary: "Job A at Company X is your strongest match because..."
- [Focus on This Job] button (Primary)
```

**QC Checklist - Compare Page:**
- [ ] Empty state shows 3 placeholder cards
- [ ] Job selector modal works
- [ ] Up to 3 jobs can be selected
- [ ] Comparison table has all rows
- [ ] Radar chart placeholder designed
- [ ] Recommendation card shows best match
- [ ] Remove button works on each job

---

### PROMPT 12: Settings Page

```
Create Settings Page:

LAYOUT:
- Sidebar tabs (left, 200px) + Content (right)
- Or top tabs on mobile

TABS:
1. Profile
2. Notifications
3. Account

PROFILE TAB:

Avatar Section:
- Current avatar (80px circle)
- [Change Photo] button
- [Remove] link (if photo exists)

Form Fields:
- Full Name (text input)
- Email (text input, readonly with "Change email" link)

[Save Changes] button (Primary)

NOTIFICATIONS TAB:

Toggle Settings:
- "Email notifications" - toggle switch + description
- "Analysis complete alerts" - toggle switch + description
- "Weekly progress summary" - toggle switch + description

[Save Preferences] button (Primary)

ACCOUNT TAB:

Password Section:
- [Change Password] button
- Opens modal with current/new/confirm fields

Connected Accounts:
- Google: Connected (with disconnect option) or Connect button

Data Section:
- [Export My Data] button (Secondary)
- Description: "Download all your analyses as JSON"

Danger Zone (red border card):
- Title: "Delete Account"
- Description: "Permanently delete your account and all data"
- [Delete Account] button (Danger)
- Opens confirmation modal
```

**QC Checklist - Settings Page:**
- [ ] 3 tabs work correctly
- [ ] Profile has avatar upload
- [ ] Profile form saves
- [ ] Notifications have toggles
- [ ] Account has password change
- [ ] Export data button present
- [ ] Delete account in danger zone
- [ ] All modals designed

---

## API Contracts

### New Endpoints Required

```typescript
// Dashboard Stats
GET /api/dashboard/stats
Response: {
  totalAnalyses: number
  averageScore: number
  bestMatch: { score: number, jobTitle: string, company: string }
  comparisonCount: number
  weeklyChange: number
}

// Score Trends
GET /api/dashboard/trends
Query: ?days=30
Response: {
  data: Array<{ date: string, score: number, jobTitle: string }>
}

// Comparisons
POST /api/compare
Body: { name?: string, analysisIds: string[] }
Response: { id: string, createdAt: string }

GET /api/compare
Response: Array<{ id: string, name: string, analysisIds: string[], createdAt: string }>

GET /api/compare/:id
Response: { id: string, name: string, analyses: AnalysisResult[] }

DELETE /api/compare/:id
Response: { success: true }

// User Settings
GET /api/settings
Response: { emailNotifications: boolean, weeklyDigest: boolean, theme: string }

PUT /api/settings
Body: { emailNotifications?: boolean, weeklyDigest?: boolean, theme?: string }
Response: { success: true }
```

### Database Schema Updates

```sql
-- Add to analysis table
ALTER TABLE analysis ADD COLUMN job_title TEXT;
ALTER TABLE analysis ADD COLUMN company_name TEXT;

-- New comparison table
CREATE TABLE comparison (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES "user"(id) ON DELETE CASCADE,
  name TEXT,
  analysis_ids UUID[] NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User preferences
CREATE TABLE user_preferences (
  user_id TEXT PRIMARY KEY REFERENCES "user"(id) ON DELETE CASCADE,
  email_notifications BOOLEAN DEFAULT true,
  weekly_digest BOOLEAN DEFAULT false,
  theme TEXT DEFAULT 'light',
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## Implementation Checklist

### Phase 1: Foundation
- [ ] Update Tailwind config with design tokens
- [ ] Create base UI components (button, card, input)
- [ ] Build navigation (sidebar, mobile nav, user menu)
- [ ] Set up route structure

### Phase 2: Landing & Auth
- [ ] Build landing page
- [ ] Redesign login page
- [ ] Redesign register page

### Phase 3: Core App
- [ ] Build dashboard page
- [ ] Redesign analysis page
- [ ] Enhance history page

### Phase 4: New Features
- [ ] Build compare page
- [ ] Build settings page
- [ ] Add chart components

### Phase 5: API
- [ ] Dashboard stats endpoint
- [ ] Trends endpoint
- [ ] Compare CRUD endpoints
- [ ] Settings endpoints
- [ ] Database migrations

### Phase 6: Polish
- [ ] Animations
- [ ] Loading states
- [ ] Error states
- [ ] Mobile testing
- [ ] Accessibility audit

---

## QC Checklists

### Design QC
- [ ] All colors from design system
- [ ] All text uses typography scale
- [ ] Consistent spacing (4px scale)
- [ ] All interactive elements have states
- [ ] Shadows used consistently
- [ ] Border radius consistent

### Component QC
- [ ] All variants documented
- [ ] States: default, hover, active, disabled
- [ ] Responsive behavior defined
- [ ] Accessibility considered
- [ ] Dark mode ready (optional)

### Page QC
- [ ] Desktop layout (1440px)
- [ ] Tablet layout (768px)
- [ ] Mobile layout (375px)
- [ ] Empty states designed
- [ ] Loading states designed
- [ ] Error states designed

### API QC
- [ ] Request/response types defined
- [ ] Error codes documented
- [ ] Authentication required marked
- [ ] Rate limits considered

---

## Working Notes

> Use this section to track progress and decisions during implementation.

### Decisions Made
-

### Blockers
-

### Next Actions
1. Set up Figma MCP connection
2. Create design system in Figma
3. Start with component library
4. Build pages after components done

---

*Last Updated: [Auto-update on save]*
