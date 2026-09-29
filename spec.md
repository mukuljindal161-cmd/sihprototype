You are helping me build the MVP prototype of my project: COLORTRACE.

We are using a SPEC-DRIVEN DEVELOPMENT workflow. The specification is the single source of truth. We define the spec, agree on scope, plan the implementation, and only then build the MVP in small verified steps.

This is NOT a request to build the complete product.
This is NOT a request to implement every feature I mention.
This is NOT a one-shot "generate the entire app" task.
Do NOT add features simply because they are technically possible.

FIRST DELIVERABLES: /docs/spec.md and /docs/plan.md. Then STOP and wait for my approval. DO NOT CODE YET.

============================================================
1. PROJECT IDENTITY
============================================================

Project name: ColorTrace
Tagline: Standardised Colour Analysis. Traceable Field Records.
Project type: Mobile/web MVP prototype (responsive web app usable on a phone browser)

Core idea:
ColorTrace is a digital application designed to work alongside an existing colour-based field testing workflow. It captures an image of a completed field-test result together with a reference colour card, performs basic image-based colour analysis, produces a PRESUMPTIVE classification, and creates a traceable digital record.

ColorTrace is NOT a replacement for laboratory confirmation.

The prototype demonstrates one workflow:
CAPTURE > CALIBRATE > ANALYSE > CLASSIFY > RECORD > VERIFY > SEARCH

Scientific honesty rules (apply everywhere in code, UI copy and docs):
- The general concept of using smartphone image analysis for more objective interpretation of colour-based presumptive tests has precedent in published NIJ-sponsored research. This does NOT mean this prototype is scientifically validated.
- Never claim validation, accuracy percentages, laboratory-grade calibration, forensic certification, legal admissibility, or a trained ML model.
- Never claim that hashing alone makes the system tamper-proof.
- Never use the words "Confirmed", "100% accurate", "Definitively identified" or "Laboratory verified".
- Always use the word "Presumptive" for classifications.
- Do not identify any substance. The MVP classifies a colour reaction outcome only.

============================================================
2. MVP-ONLY RULE
============================================================

Build ONLY one small, convincing, end-to-end workflow.

DO NOT build: a production system, advanced machine learning, complicated AI, laboratory integration, enterprise administration, advanced analytics, complex cloud architecture, unnecessary integrations, unnecessary authentication, role management, notifications, payments, subscriptions, social features, chatbots, maps, dashboards or settings pages.

If something is not required to demonstrate the core ColorTrace workflow, leave it out. A smaller functional prototype beats a large unfinished one.

============================================================
3. CORE WORKFLOW (EXACT CONCEPTUAL FLOW)
============================================================

Home
> Start New Test
> Test Information
> Capture / Upload Image
> Reference Colour Card
> Image Review
> Colour Calibration
> Test Region Analysis
> Presumptive Classification
> Result
> Save Test Record
> Digital Record + Image Hash
> Test History
> Record Details
> Integrity Verification

============================================================
4. MVP FEATURES (DETAILED REQUIREMENTS)
============================================================

FEATURE 01 - HOME
- ColorTrace name and tagline, short plain-language product explanation.
- Primary CTA "Start New Test". Secondary CTA "View Test History". Both above the fold, both real routes.
- Concise workflow explanation (numbered list or simple steps: Capture, Calibrate, Analyse, Record, Verify).
- Small visible disclaimer that results are presumptive and do not replace confirmatory testing.
- NOT a generic SaaS dashboard. No huge hero. No three feature cards. No fake statistics or testimonials.

FEATURE 02 - START NEW TEST
- Form/summary capturing: Test ID, Operator ID, date, time, location status.
- Test ID auto-generated and unique, format CT-YYYY-NNNN (e.g. CT-2026-0001), incrementing from existing stored records.
- Operator ID: simple prototype operator profile (e.g. a single editable/default demo operator such as OP-001), clearly marked as demo. No identity management.
- Date and time auto-filled from the device clock at test start.
- Location status shows: requesting / recorded / unavailable / denied, with the reason.
- Primary action: continue to Capture.

FEATURE 03 - IMAGE CAPTURE
- Dedicated capture screen with clear instruction: place the TEST RESULT and the REFERENCE COLOUR CARD together inside the image.
- Support both: camera capture (getUserMedia or file input with capture attribute) and image upload (file input). Choose the approach that works reliably on mobile and desktop browsers and document it in the spec.
- Required actions: Capture/Upload, Retake, Confirm.
- Do not build a fake camera UI that pretends to process. Preview is only a preview.
- Validate file type (JPEG/PNG/WebP) and a reasonable size limit; show clear errors.

FEATURE 04 - REFERENCE COLOUR CARD
- Use a predefined reference-card structure (documented in the spec: number of patches, their nominal RGB/Lab values, their layout, and how the user marks or aligns them).
- Demonstrate: IMAGE > REFERENCE AREA > COLOUR CALIBRATION > TEST AREA.
- MVP calibration approach: simple deterministic correction (for example per-channel gain/offset or a basic linear correction derived from measured versus nominal reference patch colours). State the method explicitly in the spec.
- Provide a printable/on-screen reference-card description or asset so the demo is reproducible (do not claim it is a validated card).
- Do not claim laboratory-grade calibration or validated accuracy.

FEATURE 05 - TEST REGION SELECTION
- Show the image, let the user select the reference-card area and the test-result region (guided drag-select on a canvas, or a predefined ROI overlay the user can adjust).
- Show the selected regions visibly on the image. Require a test region before continuing.
- Keep it simple; do not build complicated computer vision.

FEATURE 06 - COLOUR ANALYSIS
- Pipeline: IMAGE > REFERENCE CARD > CALIBRATION > TEST REGION > COLOUR FEATURES > CLASSIFICATION.
- Use the canvas API or lightweight browser-compatible processing. Add OpenCV only if the spec proves it is necessary.
- Compute simple features: mean RGB, HSV and CIE Lab of the calibrated test region.
- Use simple, deterministic, readable rules with thresholds defined in ONE config file, clearly labelled as prototype thresholds and not validated.
- Show the analysis step's real output (measured values, calibration applied). No fabricated confidence or accuracy percentages.
- No ML model unless one is genuinely implemented and validated (it will not be in the MVP).

FEATURE 07 - RESULT CLASSIFICATION
- Exactly three outcomes: PRESUMPTIVE POSITIVE, PRESUMPTIVE NEGATIVE, INCONCLUSIVE.
- INCONCLUSIVE must be produced by real conditions (for example: colour features outside all defined ranges, calibration patches unreliable, region too small or too variable). Define these conditions in the spec.
- The result page must state that this is a field-test result and does not replace confirmatory testing.

FEATURE 08 - RESULT SCREEN
Display: Test ID, presumptive result, date, time, operator ID, location, captured image, analysis status, record status.
Layout example:
  COLORTRACE RESULT
  Presumptive Result: INCONCLUSIVE
  Test ID: CT-2026-0001
  Operator: OP-001
  Date & Time: 29 September 2026, 04:32 PM
  Location: recorded coordinates or status
  Image: captured image
  Record: not yet saved / saved
Primary action: "Save Test Record".
Result colour treatment must be restrained and never rely on colour alone (always include text).

FEATURE 09 - DIGITAL RECORD
On save, create a structured record containing: Test ID, operator ID, timestamp, location, presumptive classification, captured image reference, image hash, record creation timestamp.
Purpose: demonstrate traceability only. Do not claim legal or forensic certification.

FEATURE 10 - IMAGE HASH AND VERIFICATION
- Generate SHA-256 of the captured image bytes using the Web Crypto API (crypto.subtle.digest). Hash exactly the bytes that are stored.
- Display: IMAGE INTEGRITY / SHA-256 [hash] / STATUS: Integrity record generated.
- "Verify Image" action: recompute the hash of the currently stored image and compare it with the stored hash.
  - Match: "INTEGRITY VERIFIED"
  - Mismatch: "INTEGRITY CHECK FAILED" with an explanation and next steps.
- Verification must be real, not a fake animation. To make the mismatch state demonstrable, provide a clearly labelled demo way to test it (for example: verify against a re-uploaded file, so uploading a different image produces a mismatch). Do not silently corrupt stored data.
- Include a plain note that a hash detects changes to the image but does not by itself make the system tamper-proof.

FEATURE 11 - TEST HISTORY
- Simple searchable list/table. Each row: Test ID, date/time, result, operator, verification status, and an Open action.
- Search by Test ID (and operator). Simple filters: result type and verification status.
- Empty state when there are no records (with a link to start a test). Empty state for no search matches with a "clear filters" action.
- No analytics, no charts.

FEATURE 12 - RECORD DETAILS
Display: Test ID, result, captured image, timestamp, location, operator, image hash, integrity status, Verify Image action, "Back to History" link.
Handle "record not found" (invalid ID in URL) with a useful message, not a blank page.

FEATURE 13 - LOCATION
- Use the browser Geolocation API where supported.
- Store and display latitude, longitude, accuracy if available, and a readable place name only if obtainable without adding a third-party service (otherwise coordinates only and say so).
- No map. A clean location field is enough.
- If unavailable or denied, the test can still continue with an explicit "Location not recorded" status and reason.

FEATURE 14 - ERROR AND EDGE STATES
Each must explain what happened and what the user can do. Never use "Something went wrong."
- camera permission denied (offer upload instead)
- location unavailable or denied
- image missing
- invalid image (wrong type, unreadable, too large)
- unclear image (too dark/blurry/low resolution by simple measurable checks, defined in spec)
- test region not selected
- inconclusive analysis
- record save failure (storage full or unavailable)
- verification mismatch
- record not found
- page not found (404)

============================================================
5. REQUIRED PAGES AND ROUTES
============================================================

Pages (do not add others without approval):
1. Home                  /
2. Start New Test        /test/new
3. Capture               /test/capture
4. Image Review          /test/review
5. Analysis              /test/analysis
6. Result                /test/result
7. Test Record           /records/[id]   (used for post-save view and details)
8. Test History          /records
9. 404 Page              (not-found route)
Plus: a simple Save Confirmation page (/test/saved) as the success page (see section 9).

Required navigation (all functional, no dead links or decorative buttons):
Home > Start Test; Home > Test History; Start Test > Capture; Capture > Image Review; Image Review > Analysis; Analysis > Result; Result > Save > Saved confirmation > Test Record; Test Record > Test History; Test History > Record Details; 404 > Home.

Guard the flow: if a user opens a mid-flow route directly with no test in progress, redirect or show a clear message with a link to start a new test. No broken routes.

Breadcrumbs: on deeper pages only, e.g. Home / Test History / CT-2026-0001. None on the homepage.

Persistent minimal navigation: Home, Start New Test, Test History. Collapses sensibly on mobile.

============================================================
6. SUCCESS PAGE
============================================================

After saving, show a dedicated page (not just a toast):
  TEST RECORD SAVED
  Test ID: CT-2026-0001
  Integrity record generated successfully.
  [View Record]  [Back to History]
No celebratory animation.

============================================================
7. OUT OF SCOPE (MUST NOT BE IMPLEMENTED)
============================================================

advanced AI model, real-world forensic validation, laboratory integration, chemical/substance identification, hardware development, automatic substance identification, advanced machine learning, advanced analytics, admin portal, multi-tenant architecture, complex permissions, advanced notifications, payment, subscriptions, waitlist, social login, chatbot, map system, chat, reports/PDF export, unnecessary integrations, team section, reviews/testimonials, cookie banner (unless cookies are actually used), contact page (unless real contact info is supplied), fake logout (no auth means no logout).

Future scope (document in spec only, do not implement): validated test-kit-specific colour profiles, larger validated image dataset, improved computer vision, controlled calibration procedures, model validation, laboratory workflow integration, advanced reporting, broader device compatibility, stronger deployment security.

============================================================
8. DESIGN LANGUAGE (CRITICAL)
============================================================

The interface must look like a genuine, carefully designed student-built product prototype, NOT an AI-generated or vibe-coded template.

AVOID ALL: harsh or giant gradients, gradients as a primary design device, rainbow or neon colours, excessive pastel colours, purple + black AI aesthetic, pure white empty layouts, excessive or huge shadows, glassmorphism, liquid glass, bento grids, terminal windows, sparkle icons, AI brain graphics, glowing effects, animated arrows, floating decorative objects, fake testimonials/reviews/statistics/logos/customers/partnerships/awards/social proof, coloured decorative left stripes, three feature cards in a row, icon + title + three lines patterns, checkmark-bullet marketing sections, pricing tables or tiers, grotesque or futuristic fonts, generic SaaS templates, generic AI dashboards, excessive pills, excessive rounded cards or border radius, unnecessary skeleton loaders, radial or decorative grids, floating blobs, unnecessary illustrations or 3D objects, unnecessary animations, excessive hover effects, page transitions, "magic" AI animations, emoji UI, em-dash-heavy copy, "It's [something]" copy, buzzword-heavy copy, startup hype.

Also avoid any pattern that makes the UI instantly recognisable as a generated template.

============================================================
9. TYPOGRAPHY (ABSOLUTE REQUIREMENT)
============================================================

USE ONLY Times New Roman. Every visible text element must use:

font-family: "Times New Roman", Times, serif;

This includes headings, paragraphs, buttons, navigation, forms, inputs, textareas, selects, placeholders, labels, tables, status text, footer, breadcrumbs, error messages, and any text drawn on canvas or inside generated images/SVGs.

Do not use Inter, Poppins, Roboto, Arial, Helvetica, Geist, DM Sans, Manrope, Space Grotesk, Montserrat, system-ui or any other font. Do not use next/font or Google Fonts. Form controls do not inherit fonts by default, so explicitly set font-family on button, input, select and textarea. Do not let any component library override the font.

Build hierarchy only through size, weight, spacing, alignment and capitalisation.

============================================================
10. COLOUR SYSTEM
============================================================

Soft lilac is only a suggestion. Do not make the app purple overall.
Direction: warm light neutral background (not pure white), deep neutral text, one restrained primary colour, muted lilac only as a subtle accent if it works, subtle borders, restrained status colours (result states must also be distinguishable by text and shape, not colour alone).
Define all colours as CSS variables in one place. Verify text contrast meets WCAG AA.
Colour is for hierarchy, actions, status and result classification only.

============================================================
11. UI PRINCIPLES
============================================================

- Do not make every element a card or every section rounded. No icon beside every heading.
- Use normal page sections, forms, tables, lists, compact panels, status indicators, dividers, buttons and practical whitespace.
- Modest corner radii, restrained borders, minimal purposeful shadows.
- Readable content widths, consistent spacing scale, clear hierarchy.
- Goal: REAL PRODUCT, not UI COMPONENT SHOWCASE.
- Images (captured photo, reference card) are content; show them at useful sizes with descriptive alt text. Any text inside images or the favicon must be real and intentional.

============================================================
12. COPYWRITING
============================================================

Write like an actual product team: direct wording, practical labels, concise explanations, realistic button text, meaningful error messages.
Avoid: Revolutionize, Transform, Unlock, Next-generation, Seamless, Supercharge, AI-powered future, Built for the future, Game-changing.
Do not invent statistics, testimonials, reviews, users, customers, certifications, team members, team photos or contact details. Omit sections for which no real information was provided.

============================================================
13. OTHER REQUIRED SUPPORTING QUALITIES
============================================================

- Team section: none. Reviews: none. Waitlist: none. Cookie banner: none unless cookies are actually used (prefer localStorage/IndexedDB or a lightweight backend without cookies and state this in the spec). Contact page: none.
- Analytics: none. If any numbers are shown for demo purposes they must be clearly labelled DEMO DATA.
- Authentication: none. Use a simple prototype operator profile. No fake logout.
- Favicon: simple ColorTrace mark (for example a small grid of reference colour patches or a single dropper/patch motif), SVG, no sparkles, robots, brains or gradients.
- Animation: minimal and only to communicate state (for example a simple progress indicator during analysis). Respect prefers-reduced-motion. The product must feel polished with animation disabled.
- Endpoints: any endpoint actually used must be implemented correctly. Do not create unused API routes or speculative endpoints.

============================================================
14. RESPONSIVENESS AND ACCESSIBILITY
============================================================

Responsive: desktop, tablet, mobile. Do not just shrink the desktop layout. Adapt navigation, spacing, image areas (canvas region selection must work with touch), forms, tables (history table becomes a stacked list on mobile) and buttons (comfortable tap targets).

Accessibility: semantic HTML, one h1 per page and logical heading order, labels on every input, keyboard-operable controls (including a keyboard alternative for region selection, such as numeric position/size inputs or arrow-key nudging), visible focus states, WCAG AA contrast, descriptive alt text, meaningful button labels, aria-live for status and error messages, no colour-only meaning.

============================================================
15. TECHNICAL APPROACH
============================================================

- Keep it simple and understandable to a student developer. Ask "is this dependency necessary?" before adding any.
- Suggested stack: React with Next.js (or Vite + React Router if simpler), plain CSS or CSS Modules, canvas API for region selection and colour sampling, Web Crypto for SHA-256, browser Geolocation API.
- Storage: prefer IndexedDB (images as Blobs) or localStorage for metadata, with the storage choice justified in the spec. Add a backend only if the spec proves it is genuinely necessary.
- Structure: a small number of files. Keep demo/sample data (seed records, reference-card definition, classification thresholds) in clearly named single files so they can be replaced later. Mark seed records clearly as DEMO DATA.
- Do NOT create: 40 component files, unnecessary service layers, fake enterprise architecture, unused API routes, unused database tables, unused environment variables, speculative integrations.
- Security and quality: no hard-coded secrets, validate all input, handle expected errors, do not expose sensitive information, do not claim production-grade security.

============================================================
16. DATA MODEL
============================================================

Start with this and add fields only when the spec requires them:

TestRecord {
  id,                  // CT-YYYY-NNNN
  operatorId,
  createdAt,           // record creation timestamp (ISO)
  testedAt,            // test timestamp (ISO)
  location,            // { status, latitude?, longitude?, accuracy?, reason? }
  imageReference,      // key/URL of stored image
  result,              // "presumptive_positive" | "presumptive_negative" | "inconclusive"
  analysisStatus,      // e.g. "completed" | "completed_with_warnings"
  measurements,        // calibrated mean RGB/HSV/Lab of test region (real computed values)
  imageHash,           // SHA-256 hex
  verificationStatus   // "not_verified" | "verified" | "failed"
}

============================================================
17. SPEC-DRIVEN PROCESS
============================================================

STEP 1 - REQUIREMENTS: Read this entire prompt.
STEP 2 - SCOPE: Classify every feature as MUST HAVE, SHOULD HAVE, FUTURE or OUT OF SCOPE.
STEP 3 - SPECIFICATION: Create /docs/spec.md containing: product goal, users, MVP scope, explicitly excluded features, user journey, pages and routes, functional requirements, data requirements, UI requirements, validation rules, error states, acceptance criteria. Every requirement must be testable and have an ID (for example FR-01, UI-03, AC-07).
STEP 4 - PLAN: Create /docs/plan.md, breaking the MVP into small tasks (no more than about 13), each with its goal, the spec requirement IDs it covers, and its own acceptance check:
  Task 01 Project shell (fonts, colour variables, layout, favicon)
  Task 02 Navigation and routing (including 404 and flow guards)
  Task 03 Home
  Task 04 Start Test (ID generation, operator, time, location)
  Task 05 Image Capture / Upload
  Task 06 Image Review, reference card and test region selection
  Task 07 Calibration and colour analysis
  Task 08 Result and classification
  Task 09 Save, digital record and success page
  Task 10 SHA-256 hash and verification
  Task 11 Test History (search, filters, empty states)
  Task 12 Record Details and final navigation audit
  Task 13 Responsive, accessibility and error-state QA
STEP 5 - STOP. Do not implement anything. Present to me:
  1. MVP scope (must / should / future / out of scope)
  2. Out-of-scope features
  3. Page list and routes
  4. User flow
  5. Data model
  6. Acceptance criteria
  7. Implementation plan
  8. Assumptions and open questions I need to approve (for example: framework choice, capture method, calibration method, reference card design, storage choice, classification thresholds, what "positive" and "negative" mean for the demo test kit)

If a requirement is unclear, STOP and ask. Do not invent a feature.

============================================================
18. IMPLEMENTATION RULES (AFTER MY APPROVAL)
============================================================

Implement ONE task at a time. After each task:
1. Run and check it.
2. Compare it against /docs/spec.md.
3. Fix issues.
4. Confirm the task's acceptance criteria and report them.
5. Only then move to the next task, and only after I say so if a task changes scope.

Never silently expand scope. If implementation conflicts with the spec, the spec wins unless I approve a change. If the spec needs changing, UPDATE THE SPEC FIRST, tell me, then update the code.

FINAL VALIDATION before calling the MVP complete: every MVP requirement works; all routes and internal links work; no dead buttons; forms validate; empty and error states exist; hashing and verification are real (match and mismatch both demonstrated); no fake functionality presented as real; no console errors; responsive at desktop, tablet and mobile widths; Times New Roman used everywhere including form controls and canvas text; no forbidden words or invented claims anywhere in the UI or docs.

============================================================
19. FINAL PRODUCT FEEL
============================================================

The MVP should feel: professional, quiet, practical, credible, student-built, purposeful, clean, functional, restrained.
It should NOT feel: AI-generated, template-generated, startup-hyped, over-designed, futuristic, neon, generic SaaS, "vibe coded".

Quality must come from: good information hierarchy + real functionality + consistent typography + careful spacing + realistic content + functional navigation + a small complete MVP.
NOT from: more gradients, animations, cards, icons, AI terminology or features.

============================================================
FINAL INSTRUCTION
============================================================

DO NOT CODE YET.
Create /docs/spec.md and /docs/plan.md, present the eight items listed in Step 5, then STOP and WAIT for my approval.