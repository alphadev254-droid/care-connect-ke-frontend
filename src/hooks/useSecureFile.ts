import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

const BACKEND = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001';

/**
 * Extracts "subfolder/filename" from a full upload URL.
 * e.g. "http://localhost:5001/uploads/profile-images/profilePicture-123.jpg"
 *   → "profile-images/profilePicture-123.jpg"
 */
const extractFilename = (url: string): string | null => {
  if (!url) return null;
  const match = url.match(/\/uploads\/([^?#]+)/);
  return match ? match[1] : null;
};

/**
 * Requests a short-lived view token from the backend for a given upload URL,
 * then fetches the file as a blob and returns a blob: URL safe for <img src>.
 * Returns null while loading or on error.
 */
export const useSecureFile = (url: string | null | undefined) => {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!url) {
      setBlobUrl(null);
      return;
    }

    // Non-upload URLs (e.g. old Cloudinary) pass through unchanged
    if (!url.includes('/uploads/')) {
      setBlobUrl(url);
      return;
    }

    const filename = extractFilename(url);
    if (!filename) return;

    let objectUrl: string;
    let cancelled = false;

    (async () => {
      try {
        // Step 1 — get a short-lived token (type: image = any logged-in user)
        const { data } = await api.post('/documents/token', { filename, type: 'image' });

        if (cancelled) return;

        // Step 2 — fetch the file using the token (no cookie needed)
        const fileRes = await api.get(`/documents/view?token=${data.token}`, {
          responseType: 'blob',
        });

        if (cancelled) return;

        objectUrl = URL.createObjectURL(fileRes.data);
        setBlobUrl(objectUrl);
      } catch {
        // api interceptor already shows a toast on 403/404
        setBlobUrl(null);
      }
    })();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [url]);

  return blobUrl;
};

/**
 * Requests a token then opens the secure view URL in a new tab.
 * PDFs/images open inline; other files download.
 * @param url    - the stored URL e.g. http://localhost:5001/uploads/supportingDocuments-xxx.pdf
 * @param originalName - the human-readable filename for the download prompt
 */
export const openSecureFile = async (url: string, originalName?: string) => {
  if (!url) return;

  // Non-upload URLs pass through
  if (!url.includes('/uploads/')) {
    window.open(url, '_blank');
    return;
  }

  // Always use the disk filename extracted from the URL, not the original name
  const diskFilename = extractFilename(url);
  if (!diskFilename) return;

  try {
    const { data } = await api.post('/documents/token', { filename: diskFilename });
    // Open the view URL — backend streams with Content-Disposition using diskFilename
    // originalName is just for display; the browser will use the Content-Disposition header
    window.open(`${BACKEND}/api/documents/view?token=${data.token}`, '_blank');
  } catch {
    // api interceptor handles the toast
  }
};
