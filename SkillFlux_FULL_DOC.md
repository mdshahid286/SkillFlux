# SkillFlux Career Platform – Full Documentation

## Executive Summary
SkillFlux is a comprehensive career development platform that empowers users to build ATS-friendly resumes, receive AI-powered career insights, practice aptitude skills, and follow structured, personalized learning roadmaps — all on a modern, cloud-enabled web experience.

## Key Features
- **Resume Builder:** Professional ATS-style resumes with real-time PDF preview, theme customization, drag-and-drop reordering, section visibility toggles, and cloud/local persistence.
- **Resume AI Analysis:** Upload and parse resumes (PDF/DOCX), receive a detailed ATS score and actionable feedback using Google Gemini AI.
- **Learning Roadmaps:** AI-generated weekly skill plans, gap analysis, career context, and recommended learning resources (courses, books, videos).
- **Aptitude Practice:** Randomized and tracked practice for general, logical, quantitative, and verbal skills.
- **Tech News Feed:** Aggregated, filterable technology news and trends.
- **Scalable, Modern Stack:** React, Redux Toolkit, Tailwind, @react-pdf/renderer, Express.js, Firebase, Google AI APIs.

## System Architecture

### High-Level Diagram
```
┌─────────────┐           ┌─────────────┐        ┌─────────────┐
│  CLIENT     │──API────▶│   BACKEND   │───────▶│  FIREBASE   │
│ (React, UX) │          │ (Express.js │        │  (DB/Auth)  │
└─────────────┘          └─────────────┘        └─────────────┘
      │                             │                     │
      │                   ┌─────────▼─────────┐           │
      │                   │  Google Gemini AI │           │
      │                   └─────────┬─────────┘           │
      │                             │                     │
      │                   ┌─────────▼───────────┐         │
      │                   │News/YouTube/Coursera│         │
      │                   └─────────────────────┘         │
```

### Primary Modules
- **Resume Builder (React):**
  - Collapsible multi-section form, theme and font picker, instant PDF preview and download (with @react-pdf/renderer).
  - State synced via Redux Toolkit and localStorage, with optional cloud sync (Firebase).
- **Resume AI Analysis (Express):**
  - Accepts resume data, parses via pdf-parse/mammoth, sends relevant info to Gemini for ATS review.
  - Routes: `/api/analyze-resume`
- **Learning Roadmap (Express, Gemini):**
  - Uses user skills and goals to create a week-by-week roadmap, provides tips, and aggregates search/book/video resources.
- **Aptitude Questions (Express & Firestore):**
  - Serves random, categorized aptitude questions; writes results to user record for progress analytics.
- **Tech News (Express):**
  - Proxies/caches requests to NewsAPI.org or Newsdata.io, supporting custom queries and fallbacks.
- **Authentication & Cloud Storage:**
  - Firebase Auth and Firestore provide secure, user-based storage for resumes, roadmaps, and progress.

## Deployment
- **Frontend:** Netlify/Vercel (CRA), static asset optimized, PWA enabled via manifest.json.
- **Backend:** Render.com/Railway, environment variables for all API keys.
- **Database:** Firebase (managed, serverless).

## Usage Overview
1. **Authenticate (Google or Email).**
2. **Build a new resume, customize style, and download as PDF (or sync to cloud).**
3. **Run resume through AI analysis for a detailed score and improvement tips.**
4. **Generate a learning roadmap based on skills and goals — receive actionable steps and resources.**
5. **Practice aptitude skills and analyze performance results.**
6. **Read tech news updates on the dashboard.
**

## Project Directory Layout
```
d:
└─abc
   ├─client
   │   └─src
   │      ├─components
   │      │    ├─Resume
   │      │    ├─ResumeForm
   │      │    └─...
   │      ├─pages
   │      ├─redux
   │      ├─config
   │      └─utils
   ├─rf/                    # (Reference: OpenResume-style TS files)
   ├─server
   │   ├─index.js
   │   └─...
   └─SkillFlux_FULL_DOC.md  # (this file)
```

## Unique Value
- **Unified career journey platform:** Resume, learning, and aptitude combined, not just another resume builder.
- **Cloud + AI:** Advanced resume scoring and learning paths using best-in-class Google Gemini integration.
- **Modern design, mobile support, rich theming, and data persistence (local/cloud).**

## Notes on the 'rf' Directory
The `rf` folder is a **reference** implementation, likely included for migrating or comparison with OpenResume-style code. It is **not directly linked** to your deployed production codebase, which uses `client/src` for all live features. You may remove it to save space or keep it for future reference, but none of your current JavaScript or production React code imports or runs code from the `rf` directory.

---
*This documentation merges and replaces all the previous .md files. For future changes, update only this file.*
