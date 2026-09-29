# ColorTrace — Implementation Plan

**Plan Version:** 1.0.0  
**Target:** 13-Task Linear Implementation Plan  
**Based on:** `/docs/spec.md`  

---

### Task 01: Project Shell & Design System
- **Goal:** Initialize React + Vite project with TypeScript. Setup Times New Roman typography globally on all elements (including form elements). Define CSS variables for the warm neutral palette, borders, and restrained status tokens. Create clean minimalist SVG favicon representing reference color patches.
- **Spec Coverage:** Section 8, Section 9, Section 10, Section 13.
- **Acceptance Check:** Application boots cleanly; typography inspector verifies `Times New Roman` on body, headings, buttons, and inputs; color tokens are centralized in `:root`.

---

### Task 02: Navigation, Routing & Flow Guards
- **Goal:** Setup React Router with routes for Home (`/`), Start New Test (`/test/new`), Capture (`/test/capture`), Image Review (`/test/review`), Analysis (`/test/analysis`), Result (`/test/result`), Saved Confirmation (`/test/saved`), History (`/records`), Record Details (`/records/:id`), and 404 (`*`). Implement `TestSessionContext` state container and Route Guards that gracefully redirect or inform users if an uninitialized step is accessed directly.
- **Spec Coverage:** Section 5 (Required Pages and Routes), Section 6, FR-13.
- **Acceptance Check:** Direct navigation to `/test/review` without an active session shows a helpful fallback card directing to `/test/new`; valid navigation links work with no dead routes; 404 page functions properly.

---

### Task 03: Home Screen
- **Goal:** Build the Home page with project title, tagline, plain-language description, two above-the-fold primary CTAs ("Start New Test" and "View Test History"), five-step workflow overview, and persistent scientific honesty disclaimer.
- **Spec Coverage:** FR-01.1 – FR-01.5.
- **Acceptance Check:** Home displays exact text requirements, clean restrained layout, responsive buttons, and visible disclaimer without marketing fluff.

---

### Task 04: Start Test (ID Generation, Operator, Geolocation)
- **Goal:** Implement `/test/new` screen. Generate sequential `CT-YYYY-NNNN` ID incrementing from highest recorded test in storage. Provide editable demo operator ID (`OP-001`). Capture client timestamp. Request Geolocation and display status (Recorded / Denied / Unavailable / Not Requested) with explicit coordinates and reasons.
- **Spec Coverage:** FR-02.1 – FR-02.4, FEATURE 13.
- **Acceptance Check:** Submitting initiates the session; Test ID increments; Geolocation handles both granted coordinates and denied permissions gracefully.

---

### Task 05: Image Capture & File Upload
- **Goal:** Build `/test/capture` with camera capture (`getUserMedia`) and file upload (`<input type="file">`). Include built-in sample reference images for immediate testing. Enforce image file type and 10MB size limits with actionable error messages.
- **Spec Coverage:** FR-03.1 – FR-03.5, FEATURE 03.
- **Acceptance Check:** User can upload a file, capture from camera (if available), or select sample image; preview renders with "Retake" and "Confirm & Proceed" buttons.

---

### Task 06: Reference Card Definition & ROI Selection
- **Goal:** Build `/test/review` interactive Canvas screen. Define 4 nominal reference card patches in `src/config/referenceCard.ts`. Allow interactive drag/resize ROI selection for reference card region and test reaction region. Provide keyboard numeric controls and arrow-key nudging for accessibility.
- **Spec Coverage:** FR-04.1, FR-05.1 – FR-05.5, FEATURE 04, FEATURE 05.
- **Acceptance Check:** Selected boxes clearly highlight on the image canvas; minimum region size enforced; coordinate inputs sync bidirectional with canvas box.

---

### Task 07: Calibration & Deterministic Colour Analysis
- **Goal:** Implement mathematical extraction in `/test/analysis`. Sample reference patch pixels, compute average RGB, determine per-channel gain normalization factors. Sample test region, apply gain corrections, calculate mean calibrated sRGB, convert to HSV and CIE $L^*a^*b^*$. Show live step-by-step calculation tables without fabricated percentages.
- **Spec Coverage:** FR-06.1 – FR-06.5, FEATURE 06.
- **Acceptance Check:** Measured values, gains, calibrated RGB, HSV, and Lab values are accurately computed and displayed in an audit table.

---

### Task 08: Result Classification
- **Goal:** Build `/test/result` presenting the classification: `PRESUMPTIVE POSITIVE`, `PRESUMPTIVE NEGATIVE`, or `INCONCLUSIVE`. Connect deterministic decision rules configured in `src/config/thresholds.ts`. Display dual text-and-shape indicators, full metadata summary, and "Save Test Record" button.
- **Spec Coverage:** FR-07.1 – FR-07.2, FR-08.1, FEATURE 07, FEATURE 08.
- **Acceptance Check:** Output is restrained; includes disclaimer that it is a presumptive field test; inconclusive conditions trigger correctly on unreacted or out-of-range samples.

---

### Task 09: Storage Persistence & Success Confirmation
- **Goal:** Build IndexedDB storage service (`src/services/storage.ts`). Save structured `TestRecord` with image Blob, hash, metadata, and measurements. Direct to dedicated `/test/saved` success screen with links to "View Record" and "Back to History".
- **Spec Coverage:** FR-09.1, Section 6, FEATURE 09.
- **Acceptance Check:** Records persist across browser reloads; `/test/saved` renders test ID and record summary with no celebratory animations.

---

### Task 10: Cryptographic Image Hash & Verification Utility
- **Goal:** Use Web Crypto API (`window.crypto.subtle.digest`) to generate SHA-256 hex string from raw image buffer on save. Implement live verification tool on record view that re-reads stored blob and checks hash match. Include demo mismatch testing tool (verifying against a different image) to demonstrate tamper detection.
- **Spec Coverage:** FR-10.1 – FR-10.3, FEATURE 10.
- **Acceptance Check:** Matching image shows "INTEGRITY VERIFIED"; testing with alternate image clearly triggers "INTEGRITY CHECK FAILED" with explanation; disclaimer clarifies hashing boundaries.

---

### Task 11: Test History (Search, Filters, Responsive List)
- **Goal:** Build `/records` screen. Fetch all stored records from IndexedDB. Implement search by Test ID and Operator ID. Provide filter dropdown by result type (`All`, `Positive`, `Negative`, `Inconclusive`). Render data table for desktop and responsive stacked card view for mobile. Include seed demo records if storage is empty.
- **Spec Coverage:** FR-11.1 – FR-11.4, FEATURE 11.
- **Acceptance Check:** Search and filters filter rows in real-time; empty states render appropriately; table switches to stacked list on mobile viewports.

---

### Task 12: Record Details Audit View
- **Goal:** Build `/records/:id` view displaying complete audit trail: Test ID, classification, full-resolution image, timestamps, operator, geolocation, computed colour values, and live cryptographic verification action. Handle invalid IDs with explicit "Record Not Found" recovery.
- **Spec Coverage:** FR-12.1, FEATURE 12.
- **Acceptance Check:** Valid ID loads complete record with image and verification; non-existent ID displays clean not found notice with navigation back to history.

---

### Task 13: Accessibility, Responsive Polish & Quality Audit
- **Goal:** Conduct complete audit: verify Times New Roman is applied everywhere; check keyboard navigation; ensure aria-live alerts on status changes; test responsive layouts across desktop, tablet, and mobile widths; ensure all scientific honesty rules and copy guidelines are strictly adhered to.
- **Spec Coverage:** Section 8, Section 9, Section 11, Section 12, Section 14, Section 18.
- **Acceptance Check:** Zero console errors; lighthouse/WCAG AA compliance; full end-to-end user flow operates smoothly without dead links or missing states.
