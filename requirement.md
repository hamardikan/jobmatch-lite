Take-Home Task: "JobMatch Lite"

Goal: Build a single-page application that compares a Resume against a Job Description using AI and generates a downloadable PDF report.
1. The UI Layout
Create a clean, single-page interface divided into two main sections:
Left Pane: A text area where the user pastes a Job Description.
Right Pane: A file uploader where the user uploads a Resume (PDF or DOCX).
Action: A prominent "Check Resume Match" button below these inputs.
2. The Workflow
When the button is clicked, the application should perform the following:
Parse File: Extract raw text from the uploaded resume (server-side).
Loading State: Show a loading spinner/skeleton while processing.
AI Analysis: Send the parsed Resume + Job Description to OpenRouter (use a free model available in open router).
Prompt Goal: Return a Match Score (0–100) regarding the resume and job description and a Explanation of it.
Display Results: Render the score and explanation in a polished UI component.
3. Feature: PDF Download (The Backend Challenge)
Once the result is displayed, show a "Download Report as PDF" button.
The Logic: When clicked, the frontend must trigger a backend endpoint.
The Requirement: The backend must use Puppeteer (or a headless browser equivalent like Playwright/Chromedp) to render the result HTML into a PDF file and return it to the client for download.
Why? We want to see how you handle server-side rendering and file streams.
4. Technical Requirements
Stack:
Frontend: Next.js
Backend: Next.js or any preffered option of your own is fine also
PDF Engine: use Puppeteer
Frontend: We will judge how clean and intuitive the design is. We look for a polished user experience.
Backend: We will judge how scalable and well-architected your code is.

Submission Instructions: Please reply to this email with a link to a public GitHub repository containing your code and a README.md with instructions on how to run it locally.
We prefer if you could submit this within the next 4-5 days, but please let us know if you need more flexibility. And feel free to ask us any questions regarding to the task

Best regards,
Philip, Jobsuit.AI