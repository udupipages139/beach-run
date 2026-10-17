/**
 * Central API configuration and safe response helpers.
 * Handles normalization of VITE_API_BASE_URL (ensuring protocol & /api suffix)
 * and safe parsing of JSON responses with descriptive error messages.
 */

export const getApiBaseUrl = (): string => {
  let url = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').trim();

  // If user entered e.g. "udupipages-beach-run-backend.vercel.app" without protocol
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = url.startsWith('localhost') ? `http://${url}` : `https://${url}`;
  }

  // Remove trailing slashes
  url = url.replace(/\/+$/, '');

  // If url does not end in /api, append it
  if (!url.endsWith('/api') && !url.endsWith('/api/')) {
    url = `${url}/api`;
  }

  return url;
};

export const API_BASE_URL = getApiBaseUrl();

/**
 * Safely parse a fetch Response as JSON.
 * Throws a human-readable error if the body is empty, HTML, or invalid JSON.
 */
export async function safeFetchJson<T = any>(res: Response): Promise<T> {
  const text = await res.text();

  if (!text || !text.trim()) {
    if (!res.ok) {
      throw new Error(`Server returned error HTTP ${res.status} (${res.statusText || 'Empty response'})`);
    }
    throw new Error('Server returned an empty response. Please verify the API server is active.');
  }

  try {
    return JSON.parse(text) as T;
  } catch (_err) {
    // If it was an HTML error (e.g. 404 Cannot POST or 502 Bad Gateway)
    if (text.includes('<html') || text.includes('<!DOCTYPE') || text.includes('Cannot ')) {
      const match = text.match(/<pre>(.*?)<\/pre>/i) || text.match(/<title>(.*?)<\/title>/i);
      const snippet = match ? match[1] : text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 120);
      throw new Error(`Server returned HTTP ${res.status}: ${snippet || 'Non-JSON response'}`);
    }
    throw new Error(`Failed to parse response: ${text.slice(0, 100)}`);
  }
}
