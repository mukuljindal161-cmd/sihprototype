# ColorTrace

**Standardised Colour Analysis. Traceable Field Records.**

ColorTrace is a digital application designed to operate alongside colour-based field testing workflows (such as presumptive chemical or colorimetric field assays). It captures an image of a completed field-test result together with a standard reference colour card, performs deterministic image-based colour normalisation, produces a **presumptive** classification, and generates an auditable cryptographic record.

---

## 1. Scientific Honesty & Regulatory Notice

* **Presumptive Classification Only:** ColorTrace evaluates observable colour changes under calibrated illumination. It does **not** confirm specific chemical or substance identities.
* **Not a Replacement for Laboratory Confirmation:** All field results are preliminary indicators and must be confirmed using certified analytical methods (e.g. GC-MS, HPLC).
* **Cryptographic Integrity:** SHA-256 image byte hashing detects bit-level alterations or file substitutions; hashing alone does not constitute certified legal admissibility.
* **Deterministic Normalisation:** Colour correction uses linear per-channel gains computed against standard reference patches, not certified laboratory optical calibration.

---

## 2. Core Workflow

The system provides a complete 5-stage pipeline:

```
CAPTURE / UPLOAD -> CALIBRATE -> ANALYSE -> CLASSIFY -> RECORD & VERIFY
```

1. **Start Test (`/test/new`):** Auto-generates sequential Test ID (`CT-YYYY-NNNN`), assigns operator profile, captures timestamp, and records GPS coordinates (with graceful fallback).
2. **Image Capture (`/test/capture`):** Captures test photo via camera, image upload, or built-in test targets containing both the reaction vessel and the reference card.
3. **Region Review (`/test/review`):** Interactive canvas with dual region-of-interest (ROI) selectors for reference card calibration and the test reaction area (plus accessible keyboard/numeric coordinates).
4. **Colour Analysis (`/test/analysis`):** Samples pixels, derives per-channel gain factors, computes calibrated sRGB, HSV, and CIE $L^*a^*b^*$, and generates a SHA-256 hash of the exact image bytes.
5. **Presumptive Result (`/test/result`):** Deterministic classification into `PRESUMPTIVE POSITIVE`, `PRESUMPTIVE NEGATIVE`, or `INCONCLUSIVE` based on transparent thresholds.
6. **Save & Integrity Verification (`/records/:id`):** Persists record into browser IndexedDB and provides a live cryptographic audit tool with a demonstrable mismatch check.

---

## 3. Technology Stack

* **Framework:** React 18 with TypeScript
* **Bundler & Dev Server:** Vite 5.x
* **Routing:** React Router v6
* **Styling & Design System:** Vanilla CSS (`src/styles/index.css`)
* **Typography:** Strict **Times New Roman** (`"Times New Roman", Times, serif`) across all elements and form controls
* **Persistence:** Native browser IndexedDB (`colortrace_db`) with fallback mirror
* **Cryptography:** Native browser Web Crypto API (`window.crypto.subtle.digest`) for real SHA-256 calculation
* **Image Processing:** HTML5 Canvas 2D Context API for direct pixel array sampling

---

## 4. Prerequisites

Ensure you have the following installed on your machine:

* **Node.js:** v18.0.0 or higher (v20+ or v24+ recommended)
* **npm:** v9.0.0 or higher
* **Modern Web Browser:** Chrome, Edge, Firefox, or Safari (supporting Canvas API, Web Crypto API, and IndexedDB)

To verify your Node and npm installations, run:
```bash
node -v
npm -v
```

---

## 5. Local Setup and Running Instructions

### Step 1: Clone or Navigate to the Project Directory
```bash
cd "c:\Users\Mukul Jindal\OneDrive\Desktop\sihprototype"
```

### Step 2: Install Dependencies
Install the required packages:
```bash
npm install
```

### Step 3: Run the Development Server
Start the local Vite development server:
```bash
npm run dev
```

The terminal will display the local URL:
```text
  VITE v5.4.21  ready in 350 ms

  ➜  Local:   http://localhost:5173/
```

### Step 4: Open in Your Browser
Open your browser and navigate to:
[http://localhost:5173](http://localhost:5173)

---

## 6. How to Test the Complete Workflow

### Quick Evaluation (Using Built-in Test Targets)
If testing without a physical camera or colour card:
1. On the **Home** page, click **"Start New Test"**.
2. Review the auto-generated Test ID (e.g. `CT-2026-0004`), optionally click **"Acquire GPS Coordinates"**, and click **"Continue to Image Capture"**.
3. Under **"Standard Evaluation Test Samples"**, choose one of the three reference targets:
   * **Sample 1:** Distinct Chromogenic Shift (Blue Complex) &rarr; evaluates as `PRESUMPTIVE POSITIVE`
   * **Sample 2:** Unreacted Baseline Reagent (Pale Amber) &rarr; evaluates as `PRESUMPTIVE NEGATIVE`
   * **Sample 3:** Shadow / High Variance &rarr; evaluates as `INCONCLUSIVE` (triggers reliability guard)
4. Click **"Confirm & Proceed to Region Review"**.
5. The canvas will display the image with marked regions for the Reference Card and Test Reaction ROI. You can drag to reposition or adjust coordinate inputs.
6. Click **"Run Colour Analysis &rarr;"**.
7. Review the live mathematical breakdown: channel gain multipliers, sRGB swatches, HSV model, CIE $L^*a^*b^*$ coordinates, and the SHA-256 cryptographic digest.
8. Click **"View Presumptive Result &rarr;"**.
9. View the outcome badge and decision rationale, then click **"Save Test Record"**.
10. On the **"TEST RECORD SAVED"** confirmation screen, click **"View Record Details"**.

### Testing Cryptographic Integrity & Tamper Detection
1. On any record details page (`/records/:id`), locate the **"Image Integrity & Cryptographic Audit"** section.
2. Click **"Verify Stored Image Integrity"**:
   * The system reads the stored image bytes directly, re-computes its SHA-256 hash using the Web Crypto API, compares it to the stored hash, and confirms: **`✓ INTEGRITY VERIFIED`**.
3. Click **"Demo Mismatch Test (Select Other File)"** and select any different image from your computer:
   * The system computes the hash of the alternate image against the expected record digest, detecting the mismatch immediately: **`⚠ DEMO MISMATCH DETECTED`**.
   * Demonstrates that any byte corruption or modification is flagged without altering the original record.

---

## 7. Project Structure

```text
sihprototype/
├── docs/
│   ├── spec.md               # Complete System Specification (single source of truth)
│   └── plan.md               # 13-task implementation plan
├── src/
│   ├── components/           # Navbar, Footer, Breadcrumbs, Layout, FlowGuard
│   ├── config/
│   │   ├── referenceCard.ts  # Standard 4-patch nominal values (CT-RC4)
│   │   └── thresholds.ts     # Deterministic classification rules & ranges
│   ├── context/
│   │   └── TestSessionContext.tsx # Workflow state container
│   ├── pages/
│   │   ├── Home.tsx          # Route /
│   │   ├── StartTest.tsx     # Route /test/new
│   │   ├── Capture.tsx       # Route /test/capture
│   │   ├── Review.tsx        # Route /test/review (canvas ROI selection)
│   │   ├── Analysis.tsx      # Route /test/analysis (colour extraction)
│   │   ├── Result.tsx        # Route /test/result (presumptive outcome)
│   │   ├── Saved.tsx         # Route /test/saved (confirmation)
│   │   ├── History.tsx       # Route /records (search & filter table)
│   │   ├── RecordDetails.tsx # Route /records/:id (audit & hash verify)
│   │   └── NotFound.tsx      # Route * (404 recovery)
│   ├── services/
│   │   ├── analysis.ts       # Canvas pixel sampling & colour transforms
│   │   ├── crypto.ts         # Web Crypto SHA-256 digest & verification
│   │   ├── sampleImages.ts   # Built-in evaluation test images
│   │   └── storage.ts        # Native IndexedDB persistent store & ID generation
│   ├── styles/
│   │   └── index.css         # Global tokens & strict Times New Roman styling
│   ├── types/
│   │   └── index.ts          # Core TypeScript data schemas
│   ├── App.tsx               # Route definitions & providers
│   └── main.tsx              # Application entry point
├── index.html                # HTML template with SVG favicon
├── package.json              # Project dependencies & scripts
├── tsconfig.json             # TypeScript compiler configuration
├── vite.config.ts            # Vite configuration
└── README.md                 # Local setup and workflow documentation
```

---

## 8. Available Scripts

* **`npm run dev`**: Starts the local development server at `http://localhost:5173`.
* **`npm run build`**: Type-checks with `tsc` and compiles the production bundle into `/dist`.
* **`npm run preview`**: Locally serves the production build for testing.
