/**
 * Image URL validation utilities
 * Prevents XSS and other attacks via malicious URLs
 */

// Allowed protocols for image URLs
const ALLOWED_PROTOCOLS = ['http:', 'https:', 'ipfs:', 'data:'];

// Maximum URL length to prevent DoS
const MAX_URL_LENGTH = 2048;

// Allowed MIME types for data URLs
const ALLOWED_DATA_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'image/bmp',
];

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  sanitizedUrl?: string;
}

/**
 * Validates and sanitizes an image URL
 * @param urlInput - The URL to validate
 * @returns ValidationResult with sanitized URL or error
 */
export function validateImageUrl(urlInput: string): ValidationResult {
  // Trim whitespace
  const trimmedUrl = urlInput.trim();

  // Check for empty input
  if (!trimmedUrl) {
    return { isValid: false, error: 'URL cannot be empty' };
  }

  // Check maximum length
  if (trimmedUrl.length > MAX_URL_LENGTH) {
    return { isValid: false, error: `URL must be less than ${MAX_URL_LENGTH} characters` };
  }

  // Handle data URLs separately
  if (trimmedUrl.startsWith('data:')) {
    return validateDataUrl(trimmedUrl);
  }

  // Handle IPFS URLs
  if (trimmedUrl.startsWith('ipfs://')) {
    // IPFS URLs are valid, just ensure they have content after the protocol
    if (trimmedUrl.length <= 7) {
      return { isValid: false, error: 'Invalid IPFS URL' };
    }
    return { isValid: true, sanitizedUrl: trimmedUrl };
  }

  // Parse and validate standard URLs
  try {
    const url = new URL(trimmedUrl);
    
    // Check protocol
    if (!ALLOWED_PROTOCOLS.includes(url.protocol)) {
      return { 
        isValid: false, 
        error: `Invalid URL protocol. Allowed: ${ALLOWED_PROTOCOLS.join(', ')}` 
      };
    }

    // Additional check to block javascript: and other dangerous protocols
    if (url.protocol === 'javascript:' || url.protocol === 'vbscript:') {
      return { isValid: false, error: 'Dangerous URL protocol detected' };
    }

    return { isValid: true, sanitizedUrl: trimmedUrl };
  } catch {
    return { isValid: false, error: 'Invalid URL format' };
  }
}

/**
 * Validates a data URL for image content
 */
function validateDataUrl(dataUrl: string): ValidationResult {
  // Parse data URL format: data:[<mediatype>][;base64],<data>
  const matches = dataUrl.match(/^data:([^;,]+)?(;base64)?,(.*)$/);
  
  if (!matches) {
    return { isValid: false, error: 'Invalid data URL format' };
  }

  const mimeType = matches[1] || '';
  const isBase64 = !!matches[2];
  const data = matches[3];

  // Validate MIME type
  if (mimeType && !ALLOWED_DATA_MIME_TYPES.includes(mimeType.toLowerCase())) {
    return { 
      isValid: false, 
      error: `Invalid image type. Allowed: ${ALLOWED_DATA_MIME_TYPES.join(', ')}` 
    };
  }

  // Check that there's actual data
  if (!data) {
    return { isValid: false, error: 'Data URL contains no data' };
  }

  // For base64 data, validate it's reasonably well-formed
  if (isBase64) {
    // Check for valid base64 characters (allowing for padding)
    const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
    // Remove any whitespace that might be present
    const cleanData = data.replace(/\s/g, '');
    
    if (!base64Regex.test(cleanData)) {
      return { isValid: false, error: 'Invalid base64 data' };
    }
  }

  return { isValid: true, sanitizedUrl: dataUrl };
}

/**
 * Check if a URL is safe for rendering in an img tag
 * Returns true for valid image URLs, false otherwise
 */
export function isSafeImageUrl(url: string): boolean {
  const result = validateImageUrl(url);
  return result.isValid;
}
