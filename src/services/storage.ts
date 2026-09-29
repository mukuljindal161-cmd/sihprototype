import { TestRecord } from '../types';

const DB_NAME = 'colortrace_db';
const DB_VERSION = 1;
const STORE_NAME = 'records';

/**
 * Native Promise-based IndexedDB initialization
 */
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this browser.'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('createdAt', 'createdAt', { unique: false });
        store.createIndex('result', 'result', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Retrieve all records from IndexedDB
 */
export async function getAllRecords(): Promise<TestRecord[]> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const records = (request.result as TestRecord[]) || [];
        // Sort descending by testedAt or createdAt
        records.sort((a, b) => new Date(b.testedAt).getTime() - new Date(a.testedAt).getTime());
        resolve(records);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('Falling back to localStorage for getAllRecords:', err);
    const local = localStorage.getItem('colortrace_records_backup');
    return local ? JSON.parse(local) : [];
  }
}

/**
 * Retrieve a single record by ID
 */
export async function getRecordById(id: string): Promise<TestRecord | null> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('Falling back to localStorage for getRecordById:', err);
    const all = await getAllRecords();
    return all.find(r => r.id === id) || null;
  }
}

/**
 * Save a new record or update an existing one
 */
export async function saveRecord(record: TestRecord): Promise<void> {
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.put(record);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('Falling back to localStorage for saveRecord:', err);
  }

  // Also maintain localStorage mirror for reliability
  try {
    const records = await getAllRecords();
    const index = records.findIndex(r => r.id === record.id);
    if (index >= 0) {
      records[index] = record;
    } else {
      records.unshift(record);
    }
    localStorage.setItem('colortrace_records_backup', JSON.stringify(records));
  } catch (e) {
    // ignore quota errors
  }
}

/**
 * Generates the next sequential Test ID (CT-YYYY-NNNN) based on stored records
 */
export async function generateNextTestId(): Promise<string> {
  const currentYear = new Date().getFullYear();
  const records = await getAllRecords();
  
  // Find highest number for current year
  let maxSeq = 0;
  const prefix = `CT-${currentYear}-`;

  for (const record of records) {
    if (record.id && record.id.startsWith(prefix)) {
      const numPart = parseInt(record.id.replace(prefix, ''), 10);
      if (!isNaN(numPart) && numPart > maxSeq) {
        maxSeq = numPart;
      }
    }
  }

  const nextSeq = (maxSeq + 1).toString().padStart(4, '0');
  return `${prefix}${nextSeq}`;
}

/**
 * Seeds initial demo records if the database is completely empty
 */
export async function seedDemoRecordsIfEmpty(): Promise<void> {
  const records = await getAllRecords();
  if (records.length > 0) return;

  // Create a minimal 1x1 data URL for demo thumbnail
  const demoThumbnail = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23e8e6df"/%3E%3Ctext x="50" y="55" font-family="Times New Roman" font-size="12" fill="%23444" text-anchor="middle"%3EDEMO SAMPLE%3C/text%3E%3C/svg%3E';

  const demoRecords: TestRecord[] = [
    {
      id: 'CT-2026-0001',
      operatorId: 'OP-001 (DEMO)',
      createdAt: '2026-09-28T10:14:00.000Z',
      testedAt: '2026-09-28T10:14:00.000Z',
      location: {
        status: 'recorded',
        latitude: 28.6139,
        longitude: 77.2090,
        accuracy: 12,
      },
      imageDataUrl: demoThumbnail,
      imageHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      result: 'presumptive_positive',
      analysisStatus: 'completed',
      measurements: {
        rawTestRgb: { r: 42, g: 110, b: 195 },
        calibratedTestRgb: { r: 44, g: 118, b: 202 },
        hsv: { h: 212, s: 78, v: 79 },
        cielab: { l: 48, a: -4, b: -44 },
        gainCorrection: { r: 1.05, g: 1.07, b: 1.03 },
        referenceVariance: 14,
        testStdDev: 8,
        meanLuminance: 122,
      },
      classificationDetails: {
        result: 'presumptive_positive',
        targetHueRange: [180, 260],
        measuredHue: 212,
        saturation: 78,
        luminance: 122,
        rationale: 'Calibrated hue of 212° and saturation of 78% falls squarely within the designated target chromogenic shift range (180°–260°).',
      },
      verificationStatus: 'verified',
      lastVerifiedAt: '2026-09-28T10:16:00.000Z',
    },
    {
      id: 'CT-2026-0002',
      operatorId: 'OP-001 (DEMO)',
      createdAt: '2026-09-28T14:45:00.000Z',
      testedAt: '2026-09-28T14:45:00.000Z',
      location: {
        status: 'denied',
        reason: 'Permission denied by user preference in mobile browser.',
      },
      imageDataUrl: demoThumbnail,
      imageHash: 'd7a8fbb307d7809469ca9abcb0082e4f8d5651e46d3cdb762d02d0bf37c9e592',
      result: 'presumptive_negative',
      analysisStatus: 'completed',
      measurements: {
        rawTestRgb: { r: 215, g: 198, b: 150 },
        calibratedTestRgb: { r: 218, g: 202, b: 153 },
        hsv: { h: 45, s: 30, v: 85 },
        cielab: { l: 81, a: -2, b: 28 },
        gainCorrection: { r: 1.01, g: 1.02, b: 1.02 },
        referenceVariance: 11,
        testStdDev: 6,
        meanLuminance: 191,
      },
      classificationDetails: {
        result: 'presumptive_negative',
        targetHueRange: [180, 260],
        measuredHue: 45,
        saturation: 30,
        luminance: 191,
        rationale: 'Hue (45°) remains in the unreacted reagent amber band (25°–75°). Target blue chromogenic complex absent.',
      },
      verificationStatus: 'not_verified',
    },
    {
      id: 'CT-2026-0003',
      operatorId: 'OP-002 (DEMO)',
      createdAt: '2026-09-29T09:12:00.000Z',
      testedAt: '2026-09-29T09:12:00.000Z',
      location: {
        status: 'recorded',
        latitude: 28.5355,
        longitude: 77.3910,
        accuracy: 15,
      },
      imageDataUrl: demoThumbnail,
      imageHash: 'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e',
      result: 'inconclusive',
      analysisStatus: 'completed_with_warnings',
      measurements: {
        rawTestRgb: { r: 28, g: 26, b: 29 },
        calibratedTestRgb: { r: 35, g: 33, b: 37 },
        hsv: { h: 280, s: 11, v: 14 },
        cielab: { l: 14, a: 3, b: -2 },
        gainCorrection: { r: 1.25, g: 1.27, b: 1.28 },
        referenceVariance: 52,
        testStdDev: 24,
        meanLuminance: 32,
      },
      classificationDetails: {
        result: 'inconclusive',
        targetHueRange: [180, 260],
        measuredHue: 280,
        saturation: 11,
        luminance: 32,
        rationale: 'Mean illumination (luminance 32) is below minimum threshold (35). Reference patch variance (52) exceeded allowable threshold (45).',
        inconclusiveReason: 'Sub-optimal lighting conditions (underexposed) and uneven shadow across reference card.',
      },
      verificationStatus: 'not_verified',
    }
  ];

  for (const r of demoRecords) {
    await saveRecord(r);
  }
}
