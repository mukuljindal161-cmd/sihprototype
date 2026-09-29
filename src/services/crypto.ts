/**
 * Web Crypto API Cryptographic Image Integrity Module
 * 
 * Generates and verifies SHA-256 digests directly on binary image data.
 * 
 * NOTE: As specified in project requirements, cryptographic hashing verifies
 * byte-for-byte data integrity against silent modification or corruption;
 * it does not alone establish full forensic chain-of-custody.
 */

/**
 * Converts an ArrayBuffer to a lowercase hexadecimal string.
 */
function bufferToHex(buffer: ArrayBuffer): string {
  const byteArray = new Uint8Array(buffer);
  const hexCodes = [...byteArray].map(b => b.toString(16).padStart(2, '0'));
  return hexCodes.join('');
}

/**
 * Converts a data URL to an ArrayBuffer.
 */
export async function dataUrlToArrayBuffer(dataUrl: string): Promise<ArrayBuffer> {
  const response = await fetch(dataUrl);
  return await response.arrayBuffer();
}

/**
 * Computes a SHA-256 hexadecimal hash from an ArrayBuffer or Blob.
 */
export async function computeSha256(source: ArrayBuffer | Blob): Promise<string> {
  const buffer = source instanceof Blob ? await source.arrayBuffer() : source;
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  return bufferToHex(hashBuffer);
}

/**
 * Computes a SHA-256 hexadecimal hash from a data URL string.
 */
export async function computeDataUrlHash(dataUrl: string): Promise<string> {
  const buffer = await dataUrlToArrayBuffer(dataUrl);
  return computeSha256(buffer);
}

export interface VerificationResult {
  verified: boolean;
  computedHash: string;
  expectedHash: string;
  timestamp: string;
  message: string;
}

/**
 * Verifies an image's integrity by comparing its current byte SHA-256 hash with an expected hash.
 */
export async function verifyImageIntegrity(
  imageData: string | Blob,
  expectedHash: string
): Promise<VerificationResult> {
  try {
    const computedHash = typeof imageData === 'string' 
      ? await computeDataUrlHash(imageData) 
      : await computeSha256(imageData);

    const verified = computedHash.toLowerCase() === expectedHash.toLowerCase();
    const timestamp = new Date().toISOString();

    return {
      verified,
      computedHash,
      expectedHash,
      timestamp,
      message: verified 
        ? 'INTEGRITY VERIFIED: Image bytes match the recorded SHA-256 cryptographic digest exactly.' 
        : 'INTEGRITY CHECK FAILED: The computed image hash does not match the stored record hash. The image data may have been altered, re-encoded, or replaced.'
    };
  } catch (error) {
    return {
      verified: false,
      computedHash: 'ERROR',
      expectedHash,
      timestamp: new Date().toISOString(),
      message: `Failed to compute hash: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}
