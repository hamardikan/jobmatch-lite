# User Flows Document
## JobMatch Lite - User Flow Diagrams and Edge Cases

**Version:** 1.0
**Last Updated:** December 17, 2025

---

## 1. Primary User Flow (Happy Path)

### 1.1 Flow Diagram

```
                                    START
                                      |
                                      v
                    +-------------------------------------+
                    |      Landing Page Loads             |
                    |   (Split-pane interface ready)      |
                    +-------------------------------------+
                                      |
                    +-----------------+-----------------+
                    |                                   |
                    v                                   v
        +---------------------+         +---------------------+
        |  User pastes Job    |         |  User uploads       |
        |  Description in     |         |  Resume (PDF/DOCX)  |
        |  left text area     |         |  via right pane     |
        +---------------------+         +---------------------+
                    |                                   |
                    |   Character count                 |   File name shown
                    |   updates real-time               |   Upload confirmed
                    |                                   |
                    +-----------------+-----------------+
                                      |
                                      v
                    +-------------------------------------+
                    |  "Check Resume Match" button        |
                    |   becomes ENABLED                   |
                    |  (Both inputs validated)            |
                    +-------------------------------------+
                                      |
                                      v
                    +-------------------------------------+
                    |   User clicks "Check Resume Match"  |
                    +-------------------------------------+
                                      |
                                      v
                    +-------------------------------------+
                    |   LOADING STATE                     |
                    |   - Button shows spinner            |
                    |   - "Analyzing your resume..."      |
                    |   - Progress steps displayed        |
                    +-------------------------------------+
                                      |
                                      |  (5-10 seconds)
                                      v
                    +-------------------------------------+
                    |   RESULTS DISPLAYED                 |
                    |   - Match Score (0-100)             |
                    |   - Score visualization             |
                    |   - Detailed explanation            |
                    |   - Strengths/Gaps/Suggestions      |
                    +-------------------------------------+
                                      |
                                      v
                    +-------------------------------------+
                    |   User clicks "Download Report      |
                    |   as PDF"                           |
                    +-------------------------------------+
                                      |
                                      v
                    +-------------------------------------+
                    |   PDF GENERATION                    |
                    |   - Button shows loading            |
                    |   - Server renders HTML to PDF      |
                    |   - PDF streamed to client          |
                    +-------------------------------------+
                                      |
                                      v
                    +-------------------------------------+
                    |   PDF DOWNLOADS                     |
                    |   Browser downloads file:           |
                    |   "JobMatch_Report_YYYY-MM-DD.pdf"  |
                    +-------------------------------------+
                                      |
                    +-----------------+-----------------+
                    |                                   |
                    v                                   v
        +---------------------+         +---------------------+
        |   User clicks       |         |   User closes       |
        |   "Try Another"     |         |   browser/tab       |
        |   -> Returns to     |         |   -> END            |
        |   input view        |         |                     |
        +---------------------+         +---------------------+
                    |
                    v
                 RESTART
```

### 1.2 Step-by-Step Flow

| Step | User Action | System Response | UI State |
|------|-------------|-----------------|----------|
| 1 | Navigates to application URL | Load application | Split-pane interface, empty inputs |
| 2 | Pastes job description | Validate input, update char count | Left pane shows text, counter updates |
| 3 | Clicks upload zone / drags file | Show file dialog or accept drop | Upload zone highlights |
| 4 | Selects resume file | Upload and validate file | Progress bar, then file name shown |
| 5 | Clicks "Check Resume Match" | Send to backend API | Button shows loading spinner |
| 6 | (Waits) | Parse file, call AI, process response | Loading overlay with progress |
| 7 | Views results | Display score and explanation | Results card with visualizations |
| 8 | Clicks "Download Report as PDF" | Generate PDF via Puppeteer | Button loading state |
| 9 | Receives download | Browser download dialog | Success confirmation |
| 10 | Clicks "Try Another Resume" | Reset interface | Return to clean input state |

---

## 2. Error States and Handling

### 2.1 E1: Invalid File Type

**Trigger:** User attempts to upload non-PDF/DOCX file

**User Experience:**
```
+----------------------------------------+
|  [!] Invalid File Format               |
|                                        |
|  Please upload a PDF or DOCX file.     |
|  You selected: resume.txt              |
|                                        |
|  [Try Again]                           |
+----------------------------------------+
```

**System Behavior:**
- File rejected before upload (client-side validation)
- No API call made
- User can immediately select another file
- Original job description preserved

**HTTP Response:** N/A (client-side)

---

### 2.2 E2: File Too Large

**Trigger:** User uploads file > 5 MB

**User Experience:**
```
+----------------------------------------+
|  [!] File Too Large                    |
|                                        |
|  Maximum file size is 5 MB.            |
|  Your file: 8.2 MB                     |
|                                        |
|  Try compressing your PDF or           |
|  removing images.                      |
|                                        |
|  [Select Different File]               |
+----------------------------------------+
```

**System Behavior:**
- File rejected before upload
- Clear size comparison shown
- Suggestion for resolution provided

**HTTP Response:** N/A (client-side) or 400 if server-side validation

---

### 2.3 E3: File Parsing Failure

**Trigger:** Server cannot extract text from uploaded file

**Causes:**
- Corrupted PDF
- Image-only PDF (scanned document)
- Password-protected file
- Malformed DOCX

**User Experience:**
```
+----------------------------------------+
|  [X] Unable to Read Resume             |
|                                        |
|  We couldn't extract text from your    |
|  file. This might happen if:           |
|                                        |
|  * The PDF contains only images        |
|  * The file is password-protected      |
|  * The file is corrupted               |
|                                        |
|  Please try a different file format    |
|  or export your resume as a new PDF.   |
|                                        |
|  [Upload Different File]               |
+----------------------------------------+
```

**HTTP Response:** 422 Unprocessable Entity
```json
{
  "success": false,
  "error": {
    "code": "FILE_PARSE_ERROR",
    "message": "Unable to extract text from the uploaded file",
    "details": { "reason": "PDF parsing failed" }
  }
}
```

---

### 2.4 E4: Job Description Too Short

**Trigger:** User enters < 100 characters in job description

**User Experience:**
```
+----------------------------------------+
|  Job Description                       |
|  +----------------------------------+  |
|  | Software developer needed...     |  |
|  |                                  |  |
|  +----------------------------------+  |
|  [!] 45 / 10,000 characters            |
|  Please enter at least 100 characters  |
|  for accurate analysis.                |
+----------------------------------------+
```

**System Behavior:**
- "Check Resume Match" button remains disabled
- Inline warning below text area
- Counter shows in warning color (amber/orange)
- Real-time validation as user types

**HTTP Response:** N/A (client-side validation)

---

### 2.5 E5: AI API Error

**Trigger:** OpenRouter API fails (timeout, rate limit, server error)

**User Experience:**
```
+----------------------------------------+
|  [X] Analysis Failed                   |
|                                        |
|  We couldn't complete the analysis.    |
|  This is usually temporary.            |
|                                        |
|  [Try Again]    [Start Over]           |
+----------------------------------------+
```

**System Behavior:**
1. Retry once automatically (with exponential backoff)
2. If retry fails, show error
3. Preserve user inputs for manual retry
4. Log error for monitoring

**HTTP Responses:**
- 502 Bad Gateway (AI service unavailable)
- 504 Gateway Timeout (AI request timed out)
- 429 Too Many Requests (rate limited)

```json
{
  "success": false,
  "error": {
    "code": "AI_SERVICE_ERROR",
    "message": "Unable to connect to AI analysis service",
    "details": { "service": "OpenRouter", "reason": "timeout" }
  }
}
```

---

### 2.6 E6: PDF Generation Failure

**Trigger:** Puppeteer fails to render PDF

**User Experience:**
```
+----------------------------------------+
|  [!] PDF Generation Failed             |
|                                        |
|  We couldn't create your PDF report.   |
|  Your results are still saved on       |
|  this page.                            |
|                                        |
|  [Try Download Again]                  |
|                                        |
|  Tip: You can also take a screenshot   |
|  or copy the results text.             |
+----------------------------------------+
```

**HTTP Response:** 500 Internal Server Error
```json
{
  "success": false,
  "error": {
    "code": "PDF_GENERATION_ERROR",
    "message": "Failed to generate PDF report"
  }
}
```

---

### 2.7 E7: Network Error

**Trigger:** User loses internet connection during operation

**User Experience:**
```
+----------------------------------------+
|  [~] Connection Lost                   |
|                                        |
|  Please check your internet connection |
|  and try again.                        |
|                                        |
|  [Retry]                               |
+----------------------------------------+
```

**System Behavior:**
- Detect network failure (fetch error)
- Show clear message
- Preserve all user inputs
- Allow retry when connection restored

---

### 2.8 E8: Rate Limit Exceeded

**Trigger:** User exceeds allowed requests per time window

**User Experience:**
```
+----------------------------------------+
|  [!] Too Many Requests                 |
|                                        |
|  Please wait a moment before trying    |
|  again. Rate limit resets in 45        |
|  seconds.                              |
|                                        |
|  [Got it]                              |
+----------------------------------------+
```

**HTTP Response:** 429 Too Many Requests
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "details": { "retryAfter": 60, "limit": 10, "window": "1 minute" }
  }
}
```

---

### 2.9 Error State Summary

| Error Code | Error Type | Retryable | Inputs Preserved | HTTP Status |
|------------|------------|-----------|------------------|-------------|
| E1 | Invalid File Type | Yes (new file) | JD: Yes | N/A |
| E2 | File Too Large | Yes (new file) | JD: Yes | 400 |
| E3 | File Parse Failure | Yes (new file) | JD: Yes | 422 |
| E4 | JD Too Short | Yes (add content) | Resume: Yes | N/A |
| E5 | AI API Error | Yes (auto + manual) | Both: Yes | 502/504/429 |
| E6 | PDF Generation | Yes (manual) | Results: Yes | 500 |
| E7 | Network Error | Yes (manual) | Both: Yes | N/A |
| E8 | Rate Limited | Yes (after wait) | Both: Yes | 429 |

---

## 3. Loading States

### 3.1 L1: File Upload Loading

**Duration:** 1-3 seconds (depending on file size)

```
+----------------------------------------+
|         Upload Resume                  |
|                                        |
|   +--------------------------------+   |
|   | ========-------- 45%           |   |
|   +--------------------------------+   |
|                                        |
|   Uploading resume.pdf...              |
+----------------------------------------+
```

**Behavior:**
- Progress bar shows actual upload progress
- File name displayed
- Cancel button available
- Transitions to "uploaded" state on completion

---

### 3.2 L2: Analysis Loading

**Duration:** 5-10 seconds

```
+--------------------------------------------------------+
|                                                        |
|                    [Spinning Icon]                     |
|                                                        |
|              Analyzing your resume...                  |
|                                                        |
|   +------------------------------------------------+   |
|   | ===================----------------------      |   |
|   +------------------------------------------------+   |
|                                                        |
|   This usually takes about 10 seconds                  |
|                                                        |
|   [x] Parsing resume content                           |
|   [x] Extracting job requirements                      |
|   [o] Comparing qualifications...                      |
|   [ ] Generating recommendations                       |
|                                                        |
+--------------------------------------------------------+
```

**Behavior:**
- Full overlay covers input area
- Animated spinner
- Progress steps update in sequence
- Estimated time shown
- Non-interruptible (no cancel)

---

### 3.3 L3: PDF Generation Loading

**Duration:** 2-5 seconds

```
+----------------------------------------+
|                                        |
|  [====----] Generating PDF...          |
|                                        |
|  Creating your downloadable report     |
|                                        |
+----------------------------------------+
```

**Behavior:**
- Inline loading in button area
- Progress indicator
- Results remain visible
- User can still view results

---

### 3.4 L4: Initial Page Load

**Duration:** 1-2 seconds

```
+---------------------------+---------------------------+
|  [skeleton placeholder]   |  [skeleton placeholder]   |
|  [skeleton placeholder]   |                           |
|  [skeleton placeholder]   |    +---------------+      |
|  [skeleton placeholder]   |    |   [skeleton]  |      |
|  [skeleton placeholder]   |    |   [skeleton]  |      |
|  [skeleton placeholder]   |    +---------------+      |
|  [skeleton placeholder]   |                           |
+---------------------------+---------------------------+
              [skeleton button placeholder]
```

**Behavior:**
- Skeleton screens for both panes
- Animated shimmer effect
- Progressive content reveal
- Fast transition (< 2 seconds)

---

## 4. Edge Cases

### 4.1 EC1: Very Short Resume

**Scenario:** User uploads a resume with minimal content (< 200 words)

**Handling:**
- Allow analysis to proceed
- AI notes limited content in response
- Score likely lower due to insufficient detail
- Recommendation: "Your resume appears brief. Consider adding more detail."

**AI Response Includes:**
```
"Note: The provided resume is brief (under 200 words).
The analysis may be limited by the available content."
```

---

### 4.2 EC2: Very Long Job Description

**Scenario:** User pastes extremely long JD (approaching 10,000 char limit)

**Handling:**
- Show warning at 9,000 characters (yellow counter)
- Hard stop at 10,000 with truncation notice
- System processes full content up to limit
- AI handles gracefully (server truncates if needed)

**UI Indicator:**
```
9,234 / 10,000 characters [!] Approaching limit
```

---

### 4.3 EC3: Non-English Content

**Scenario:** User submits resume/JD in non-English language

**Handling:**
- V1: Process as-is, AI attempts analysis
- Results may be lower quality for non-English
- No error shown
- Future consideration: Language detection + warning

---

### 4.4 EC4: Heavily Formatted Resume

**Scenario:** Resume with tables, columns, graphics, complex layouts

**Handling:**
- Text extraction is best-effort
- Some formatting context may be lost
- If extraction yields garbled text, may trigger parse warning
- Recommendation: Use simpler format for best results

---

### 4.5 EC5: Job Description is Just a Title

**Scenario:** User enters "Software Engineer" with nothing else

**Handling:**
- Fails minimum 100 character validation
- Clear message explaining need for full description
- Button remains disabled
- Example hint: "Include responsibilities, requirements, and qualifications"

---

### 4.6 EC6: Resume Doesn't Match Job at All

**Scenario:** Completely unrelated resume (e.g., graphic designer -> data scientist)

**Handling:**
- System processes normally
- Low score (likely 10-25)
- Explanation clearly states lack of overlap
- Recommendation: "This may not be a target role for your background"

**Example Response:**
```
Score: 18/100

The resume shows experience in graphic design and visual arts,
while the position requires data science and machine learning skills.
There is minimal overlap between your background and this role.

Recommendation: Consider roles that align with your design expertise,
or pursue additional training in data science fundamentals.
```

---

### 4.7 EC7: Browser Back Button During Analysis

**Scenario:** User presses back during loading state

**Handling:**
- SPA intercepts navigation
- Cancel in-flight request
- Return to input state
- Inputs preserved
- No partial results shown

---

### 4.8 EC8: Session Timeout

**Scenario:** User leaves tab idle for extended period, then returns

**Handling:**
- SPA maintains state in memory
- If page still loaded, inputs preserved
- If browser cleared memory, fresh start
- No server-side session to timeout (stateless)

---

### 4.9 EC9: Rapid Re-submission

**Scenario:** User quickly clicks "Check Resume Match" multiple times

**Handling:**
- Button disabled immediately on first click
- Subsequent clicks ignored (debounced)
- Only one API request sent
- Loading state prevents interaction

---

### 4.10 EC10: PDF Download on Mobile

**Scenario:** User accesses on mobile device, downloads PDF

**Handling:**
- PDF generation works normally
- Mobile browser handles download
- May open in new tab on iOS Safari
- File saved to Downloads or opens in PDF reader

---

### 4.11 EC11: Copy-Paste Formatting Issues

**Scenario:** User pastes JD from website with hidden formatting/characters

**Handling:**
- Strip HTML tags on paste
- Normalize whitespace
- Remove zero-width characters
- Preserve basic line breaks

---

### 4.12 EC12: Empty File Upload

**Scenario:** User uploads a valid PDF/DOCX that contains no text

**Handling:**
- Parse succeeds but extracts empty/minimal text
- Return specific error: "EMPTY_CONTENT"
- Message: "No text content could be extracted"
- Suggest: "The file may contain only images"

---

## 5. State Transitions

### 5.1 Application States

```
                    +-------------+
                    |    IDLE     |
                    | (Initial)   |
                    +------+------+
                           |
         +-----------------+-----------------+
         |                                   |
         v                                   v
+--------+--------+                 +--------+--------+
|   JD_ENTERED    |                 | RESUME_UPLOADED |
| (JD valid)      |                 | (File uploaded) |
+--------+--------+                 +--------+--------+
         |                                   |
         +-----------------+-----------------+
                           |
                           v
                    +------+------+
                    |    READY    |
                    | (Both valid)|
                    +------+------+
                           |
                           v
                    +------+------+
                    |  ANALYZING  |
                    | (Loading)   |
                    +------+------+
                           |
         +-----------------+-----------------+
         |                                   |
         v                                   v
+--------+--------+                 +--------+--------+
|    RESULTS      |                 |     ERROR       |
| (Success)       |                 | (Failed)        |
+--------+--------+                 +--------+--------+
         |                                   |
         v                                   |
+--------+--------+                          |
| GENERATING_PDF  |                          |
| (PDF loading)   |                          |
+--------+--------+                          |
         |                                   |
         +-----------------+-----------------+
                           |
                           v
                    +------+------+
                    |    IDLE     |
                    | (Reset)     |
                    +-------------+
```

### 5.2 State Descriptions

| State | Description | Valid Actions |
|-------|-------------|---------------|
| IDLE | Initial state, no inputs | Enter JD, Upload file |
| JD_ENTERED | Job description entered and valid | Upload file, Edit JD |
| RESUME_UPLOADED | Resume uploaded successfully | Enter JD, Change file |
| READY | Both inputs valid, ready to analyze | Click "Check Resume Match" |
| ANALYZING | Analysis in progress | None (wait) |
| RESULTS | Analysis complete, results displayed | Download PDF, Try another |
| ERROR | An error occurred | Retry, Start over |
| GENERATING_PDF | PDF generation in progress | None (wait) |

---

## 6. Accessibility Flow

### 6.1 Keyboard Navigation Order

```
Tab Order:
1. Skip link (hidden until focused)
2. Logo/Home link (if present)
3. Job Description textarea
4. Character counter (read-only)
5. Resume upload zone (Enter/Space to trigger)
6. "Check Resume Match" button
7. [After results load]
8. Score display (focusable for screen readers)
9. Accordion section headers (Enter to expand)
10. "Download Report as PDF" button
11. "Try Another Resume" button
```

### 6.2 Screen Reader Announcements

| Event | Announcement |
|-------|--------------|
| Page load | "JobMatch Lite. Compare your resume to a job description." |
| File selected | "File selected: [filename]" |
| File upload success | "Resume uploaded successfully: [filename]" |
| File upload error | "Error uploading file: [error message]" |
| Analysis started | "Analyzing your resume. Please wait." |
| Analysis progress | "Step [n] of 4: [step name]" |
| Analysis complete | "Analysis complete. Your match score is [X] out of 100." |
| PDF generating | "Generating PDF report." |
| PDF ready | "PDF report ready for download." |
| Error occurred | "Error: [error message]" |

### 6.3 Focus Management

| Event | Focus Behavior |
|-------|---------------|
| Results displayed | Focus moves to score announcement |
| Error displayed | Focus moves to error message |
| Modal opened | Focus trapped in modal |
| Modal closed | Focus returns to trigger element |
| "Try Another" clicked | Focus moves to JD textarea |

---

## 7. Mobile-Specific Flows

### 7.1 Layout Changes

**Desktop (>1024px):** Side-by-side panes
**Tablet (768-1024px):** Side-by-side, reduced spacing
**Mobile (<768px):** Stacked layout (JD on top, Resume below)

### 7.2 Touch Interactions

| Element | Touch Behavior |
|---------|---------------|
| Upload zone | Tap to open file picker (no drag-drop) |
| Accordions | Tap header to expand/collapse |
| Buttons | 44px minimum touch target |
| Text areas | Native keyboard on focus |

### 7.3 Mobile-Specific Considerations

- No drag-and-drop messaging on mobile
- Simplified upload zone design
- Larger touch targets
- Native file picker integration
- PDF opens in device viewer or downloads

---

## 8. Analytics Events

### 8.1 Event Tracking

| Event Name | Trigger | Properties |
|------------|---------|------------|
| `page_view` | Page loads | `page: home` |
| `jd_entered` | JD reaches 100+ chars | `char_count` |
| `file_selected` | File picker closes | `file_type`, `file_size` |
| `file_uploaded` | Upload completes | `duration_ms` |
| `analysis_started` | Button clicked | `jd_length`, `file_type` |
| `analysis_completed` | Results displayed | `score`, `duration_ms` |
| `analysis_failed` | Error returned | `error_code` |
| `pdf_requested` | Download clicked | `score` |
| `pdf_generated` | PDF download starts | `duration_ms` |
| `pdf_failed` | PDF generation fails | `error_code` |
| `try_another` | Reset button clicked | `previous_score` |

### 8.2 Conversion Funnel

```
Page View (100%)
     |
     v
JD Entered (85%)
     |
     v
File Uploaded (75%)
     |
     v
Analysis Started (70%)
     |
     v
Analysis Completed (68%)
     |
     v
PDF Downloaded (40%)
```

---

## 9. Appendix: UI Component States

### 9.1 Button States

| State | Appearance | Behavior |
|-------|------------|----------|
| Disabled | Gray, 50% opacity | No hover effect, cursor: not-allowed |
| Default | Primary blue | Clickable |
| Hover | Darker blue, slight elevation | Pointer cursor |
| Active | Even darker, pressed effect | On click |
| Loading | Blue with spinner icon | Non-interactive |

### 9.2 Input States

| State | Appearance |
|-------|------------|
| Empty | Placeholder text, light border |
| Focused | Blue border, no placeholder |
| Valid | Green checkmark icon |
| Invalid | Red border, error message below |
| Disabled | Gray background, not editable |

### 9.3 Upload Zone States

| State | Appearance |
|-------|------------|
| Empty | Dashed border, icon, "drag files here" |
| Drag over | Blue dashed border, blue background |
| Uploading | Progress bar, file name |
| Uploaded | Solid border, file name, "Change" link |
| Error | Red border, error message |
