# ColorTrace — System Specification

**Document Version:** 1.0.0  
**Status:** Approved Specification  
**Project:** ColorTrace  
**Tagline:** Standardised Colour Analysis. Traceable Field Records.  
**System Type:** Responsive Mobile/Web Prototype (MVP)  

---

## 1. Product Goal and Context

ColorTrace is a digital prototype designed to operate alongside colour-based field testing workflows (such as presumptive chemical or colorimetric field assays). In conventional field testing, operators subjectively interpret subtle colour changes under variable lighting conditions without standardized reference controls or persistent digital trails.

ColorTrace addresses this by:
1. Capturing an image of the test result alongside a standardized reference colour card.
2. Performing deterministic, image-based colour normalization and feature extraction in the browser.
3. Producing an automated **presumptive** classification (`PRESUMPTIVE POSITIVE`, `PRESUMPTIVE NEGATIVE`, or `INCONCLUSIVE`).
4. Generating a traceable digital record containing an immutable SHA-256 cryptographic hash of the raw image bytes for tamper detection.

### Scientific Honesty Boundaries
- **Presumptive Only:** Results are preliminary indicators and never replace confirmatory laboratory testing (e.g., GC-MS, HPLC, or certified laboratory assays).
- **No Substance Identification:** The system classifies reaction colour states, not chemical identities.
- **No Forensic Certification:** Digital hashing verifies data integrity of stored bytes; it does not constitute a legally certified chain of custody.
- **Deterministic Calibration:** Normalization is achieved through gain/offset corrections against nominal patch values, not certified optical laboratory calibration.

---

## 2. Target Users and Use Cases

- **Primary User:** Field Operator (e.g., environmental technician, field screening personnel, quality control technician).
- **Core Workflow:**
  1. Open ColorTrace on a mobile browser or desktop workstation.
  2. Initiate a new test with auto-generated Test ID and operator information.
  3. Capture or upload a single photograph containing both the field-test reaction vessel/strip and the reference colour card.
  4. Review and select regions of interest (Reference Card patches and Test Reaction area).
  5. Run colour calibration and deterministic analysis.
  6. Review the presumptive classification.
  7. Save the record to local persistent storage (IndexedDB).
  8. Verify cryptographic image hash integrity at any point in the future.

---

## 3. Scope Classification

### Must Have (MVP Scope)
- **FR-01 (Home):** Clean introduction, workflow explanation, clear disclaimers, direct navigation to Start Test and Test History.
- **FR-02 (Start Test):** Sequential ID generation (`CT-YYYY-NNNN`), operator assignment, device timestamp, browser geolocation capture with status handling.
- **FR-03 (Capture/Upload):** Live camera capture (`getUserMedia`) and file upload (`input[type=file]`), file validation (JPEG, PNG, WebP ≤ 10MB), sample demo image loader.
- **FR-04 (Reference Card):** Standard 4-patch reference card definition (White, Neutral Gray, Reference A / Blue, Reference B / Red) with nominal RGB/Lab values.
- **FR-05 (ROI Selection):** Interactive canvas region-of-interest selection for reference card and test sample, with keyboard numeric/nudge accessibility.
- **FR-06 (Colour Analysis):** Canvas pixel extraction, mean RGB, HSV, and CIE Lab calculation, linear channel gain/offset calibration against reference patches.
- **FR-07 (Classification):** Deterministic evaluation into `PRESUMPTIVE POSITIVE`, `PRESUMPTIVE NEGATIVE`, or `INCONCLUSIVE` based on transparent thresholds in a single configuration file.
- **FR-08 (Result Screen):** Presentation of Test ID, classification, timestamp, location, operator, image, analysis metrics, and save action.
- **FR-09 (Digital Record):** Structured record persistence using browser IndexedDB.
- **FR-10 (Integrity Verification):** Web Crypto API SHA-256 hashing of raw image bytes, verification comparison, and demonstrable mismatch test utility.
- **FR-11 (Test History):** Searchable, filterable list of past tests, collapsible for mobile viewports.
- **FR-12 (Record Details):** Dedicated view for individual test records with live integrity check.
- **FR-13 (Error Handling):** Concrete, actionable error screens and flow guards for missing data or interrupted workflows.
- **FR-14 (Typography & Design):** Strict enforcement of Times New Roman, warm neutral palette, WCAG AA compliance, and zero AI-template styling.

### Explicitly Out of Scope
- Machine learning or neural network models.
- Chemical or compound identification.
- User authentication, login/logout, multi-tenant databases.
- Cloud backends, remote databases, or external third-party API dependencies.
- Interactive mapping systems or satellite tiles.
- PDF generation libraries or report export suites.
- Marketing gimmicks: testimonials, statistics, pricing tiers, chatbots, social links.

---

## 4. Information Architecture & Routes

| Route | Page | Purpose | Access Guard |
| :--- | :--- | :--- | :--- |
| `/` | Home | Product summary, workflow overview, primary CTAs | Public |
| `/test/new` | Start New Test | Initializes Test ID, operator, timestamp, location | Public |
| `/test/capture` | Image Capture | Captures or uploads photo of test + reference card | Requires active test session |
| `/test/review` | Image Review & ROI | Selects reference patches and test region on canvas | Requires captured image |
| `/test/analysis` | Calibration & Analysis | Executes deterministic math and feature extraction | Requires selected ROIs |
| `/test/result` | Result Summary | Displays presumptive outcome and measurements | Requires completed analysis |
| `/test/saved` | Save Confirmation | Confirmation screen with direct links | Requires saved test |
| `/records` | Test History | List, search, filter, and access historical records | Public |
| `/records/:id` | Record Details | Full audit view of record, metadata, and hash check | Public (handles 404) |
| `*` | Not Found | Clean 404 recovery page | Public |

---

## 5. Functional Requirements Specification

### FR-01: Home Screen
- **ID:** FR-01.1 — Header displaying project name "ColorTrace" and tagline "Standardised Colour Analysis. Traceable Field Records."
- **ID:** FR-01.2 — Prominent primary button "Start New Test" directing to `/test/new`.
- **ID:** FR-01.3 — Prominent secondary button "View Test History" directing to `/records`.
- **ID:** FR-01.4 — Five-step workflow guide: 1. Capture, 2. Calibrate, 3. Analyse, 4. Record, 5. Verify.
- **ID:** FR-01.5 — Persistent disclaimer: "Presumptive field testing tool. Does not replace certified laboratory confirmation."

### FR-02: Test Initialization
- **ID:** FR-02.1 — Auto-generate Test ID matching `CT-[CURRENT_YEAR]-[0001...]`, incrementing from the highest existing ID in IndexedDB.
- **ID:** FR-02.2 — Pre-fill Operator ID with default demo profile `OP-001`, permitting inline edit.
- **ID:** FR-02.3 — Capture ISO timestamp from client device clock.
- **ID:** FR-02.4 — Request geolocation via `navigator.geolocation.getCurrentPosition`. Display coordinates (latitude, longitude, accuracy) or explicit reason if denied/unavailable (`Permission Denied`, `Position Unavailable`, `Timeout`, `Not Supported`).

### FR-03: Image Acquisition
- **ID:** FR-03.1 — Support live camera stream via `navigator.mediaDevices.getUserMedia` with video preview and capture snapshot button.
- **ID:** FR-03.2 — Support direct file upload via file input (`accept="image/jpeg,image/png,image/webp"`).
- **ID:** FR-03.3 — Support built-in standard demo test image for rapid evaluation without physical equipment.
- **ID:** FR-03.4 — Validate file MIME type and maximum payload size (≤ 10 MB).
- **ID:** FR-03.5 — Provide "Retake" / "Change Image" and "Confirm & Proceed" buttons.

### FR-04 & FR-05: Reference Card & ROI Selection
- **ID:** FR-04.1 — Standard Reference Card patches:
  - Patch 1 (White): Nominal sRGB (240, 240, 240)
  - Patch 2 (Neutral Gray): Nominal sRGB (128, 128, 128)
  - Patch 3 (Reference Cyan/Blue): Nominal sRGB (40, 120, 200)
  - Patch 4 (Reference Magenta/Red): Nominal sRGB (200, 50, 70)
- **ID:** FR-05.1 — Render image on HTML5 Canvas.
- **ID:** FR-05.2 — Interactive selection for:
  - Reference Card Bounding Box (or 4 patch sample points).
  - Test Reaction Region of Interest (ROI).
- **ID:** FR-05.3 — Render clear visual overlays on canvas distinguishing reference area and test area.
- **ID:** FR-05.4 — Provide accessible numeric coordinate adjustments (X, Y, Width, Height) and keyboard nudging for touch/screen-reader users.
- **ID:** FR-05.5 — Guard: Prevent proceeding until a valid test ROI (minimum 10x10 pixels) is selected.

### FR-06 & FR-07: Calibration, Analysis & Classification
- **ID:** FR-06.1 — Extract raw pixel data via `CanvasRenderingContext2D.getImageData`.
- **ID:** FR-06.2 — Calculate mean raw RGB of reference patches.
- **ID:** FR-06.3 — Compute channel gain factors:
  $$\text{Gain}_c = \frac{\text{Nominal}_c}{\text{Measured}_c}$$
  Clamped to a safe linear range $[0.5, 2.0]$.
- **ID:** FR-06.4 — Apply gain to sampled test region pixels and compute calibrated mean sRGB.
- **ID:** FR-06.5 — Convert calibrated sRGB to HSV and CIE $L^*a^*b^*$.
- **ID:** FR-07.1 — Deterministic classification rules configured in `src/config/thresholds.ts`:
  - **Presumptive Positive:** Calibrated Hue in designated target reaction range (e.g., $200^\circ - 260^\circ$ for cobalt thiocyanate / blue complex reaction) and Saturation $\ge 25\%$ and Brightness $\ge 15\%$.
  - **Presumptive Negative:** Calibrated reaction remains in baseline/unreacted range (e.g., pale amber/yellow hue $35^\circ - 70^\circ$, or low saturation $< 15\%$).
  - **Inconclusive:** Triggers when illumination is extreme (mean raw brightness $< 30$ or $> 245$), reference patch variance $> 40$, or colour falls outside recognized reaction windows.
- **ID:** FR-07.2 — Exactly three outputs: `PRESUMPTIVE POSITIVE`, `PRESUMPTIVE NEGATIVE`, `INCONCLUSIVE`.

### FR-08, FR-09 & FR-10: Results, Record Persistence & Cryptographic Hash
- **ID:** FR-08.1 — Display Test ID, result classification with dual text-and-shape indicators, operator, timestamps, location coordinates, captured photo preview, and measured colour values.
- **ID:** FR-09.1 — Persist complete record into IndexedDB store `records`. Store image as binary Blob.
- **ID:** FR-10.1 — Compute SHA-256 hash using `window.crypto.subtle.digest('SHA-256', rawImageBuffer)`. Convert to lowercase hex string.
- **ID:** FR-10.2 — Implement "Verify Image Integrity" tool: re-reads stored image Blob, re-hashes bytes, and compares against `record.imageHash`.
- **ID:** FR-10.3 — Demonstrable Mismatch Utility: provide a button to test integrity check against an alternate file to demonstrate detection of tampering/mismatch without damaging original data.

### FR-11 & FR-12: Test History & Record Inspection
- **ID:** FR-11.1 — Paginated/scrollable table of all stored tests showing Test ID, Date/Time, Operator, Result, and Integrity Status.
- **ID:** FR-11.2 — Real-time search filter by Test ID or Operator ID.
- **ID:** FR-11.3 — Filter dropdown by Result (`All`, `Positive`, `Negative`, `Inconclusive`).
- **ID:** FR-11.4 — Responsive fallback: renders as structured card list on mobile screens $\le 640\text{px}$.
- **ID:** FR-12.1 — Route `/records/:id` presents full audit record. If ID is not present in storage, render explicit "Record Not Found" state with link to `/records`.

---

## 6. Technical Stack & Architecture

- **Runtime & Bundler:** Node.js v24, Vite 5.x, React 18, TypeScript.
- **Routing:** React Router v6.
- **Styling:** Vanilla CSS with scoped design tokens in CSS variables.
- **Typography:** Strictly `"Times New Roman", Times, serif`.
- **Data Persistence:** Native browser IndexedDB (via `idb` lightweight promise wrapper or direct native IndexedDB).
- **Cryptographic Operations:** Native browser Web Crypto API (`window.crypto.subtle`).
- **Image Processing:** HTML5 Canvas 2D Context API.
- **Zero Third-Party UI Kits:** No Tailwind, no Bootstrap, no Material UI, no Lucide/FontAwesome icon bloat.

---

## 7. Data Model Schema

```typescript
export type PresumptiveResult = 
  | 'presumptive_positive' 
  | 'presumptive_negative' 
  | 'inconclusive';

export interface LocationData {
  status: 'recorded' | 'denied' | 'unavailable' | 'not_requested';
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  reason?: string;
}

export interface ColourMeasurements {
  rawRgb: { r: number; g: number; b: number };
  calibratedRgb: { r: number; g: number; b: number };
  hsv: { h: number; s: number; v: number };
  cielab: { l: number; a: number; b: number };
  gainCorrection: { r: number; g: number; b: number };
  patchVariance?: number;
}

export interface TestRecord {
  id: string; // Format: CT-YYYY-NNNN
  operatorId: string;
  createdAt: string; // ISO 8601
  testedAt: string; // ISO 8601
  location: LocationData;
  imageBlob: Blob;
  imageUrl?: string;
  imageHash: string; // SHA-256 hex string (64 characters)
  result: PresumptiveResult;
  analysisStatus: 'completed' | 'completed_with_warnings';
  measurements: ColourMeasurements;
  inconclusiveReason?: string;
  verificationStatus: 'not_verified' | 'verified' | 'failed';
  lastVerifiedAt?: string;
}
```

---

## 8. Acceptance Criteria Matrix

| ID | Description | Verification Method |
| :--- | :--- | :--- |
| **AC-01** | Strict Typography: all text renders in Times New Roman | CSS audit & computed style check |
| **AC-02** | Test ID generation increments correctly from previous record | Generate 3 records and verify sequential numbering |
| **AC-03** | Dual capture methods work (camera capture & local file upload) | Test with sample file and mock camera stream |
| **AC-04** | ROI selection allows positioning reference card and test region | Canvas visual verification and keyboard adjustment |
| **AC-05** | Calibration calculates channel gains and modifies raw values | Check mathematical outputs in analysis screen |
| **AC-06** | Classification delivers three states based on clear thresholds | Validate with target hue, baseline hue, and noisy inputs |
| **AC-07** | SHA-256 generation produces matching hash for identical bytes | Re-digest image bytes and assert strict equality |
| **AC-08** | Integrity verification demonstrates both Match and Mismatch states | Execute standard verify and test mismatch utility |
| **AC-09** | Test History displays records with search and filter | Populate demo records, search by ID, filter by result |
| **AC-10** | Flow guards prevent direct access to review/analysis without test | Navigate directly to `/test/analysis` and verify redirect |
