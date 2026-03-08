/* ═══════════════════════════════════════════════════
   resume_extractor.js
   Google OAuth (GIS) + Drive API fetch
   No LLM. Works with rule-based parser in student.html.
═══════════════════════════════════════════════════ */

const GDRIVE_CLIENT_ID = '232351760567-mtg3h8nbdngjsomsivvtv995nb6fsnd8.apps.googleusercontent.com';

function extractDriveFileId(url) {
  const patterns = [
    /\/file\/d\/([a-zA-Z0-9_-]+)/,
    /[?&]id=([a-zA-Z0-9_-]+)/,
    /\/d\/([a-zA-Z0-9_-]+)/,
    /open\?id=([a-zA-Z0-9_-]+)/,
  ];
  for (const rx of patterns) {
    const m = url && url.match(rx);
    if (m) return m[1];
  }
  return null;
}

function getGoogleAccessToken() {
  return new Promise((resolve, reject) => {
    if (typeof google === 'undefined' || !google.accounts) {
      reject(new Error('Google sign-in not available. Check your internet connection and try again.'));
      return;
    }
    const client = google.accounts.oauth2.initTokenClient({
      client_id: GDRIVE_CLIENT_ID,
      scope:     'https://www.googleapis.com/auth/drive.readonly',
      callback:  (resp) => {
        if (resp.error) reject(new Error('Google sign-in failed: ' + resp.error));
        else            resolve(resp.access_token);
      },
    });
    client.requestAccessToken({ prompt: '' });
  });
}

async function fetchResumeFile(driveUrl, onStatus) {
  const fileId = extractDriveFileId(driveUrl);
  if (!fileId) {
    throw new Error('Could not read your resume URL. Please contact the placement cell.');
  }

  onStatus && onStatus('Signing in with Google…');
  const token = await getGoogleAccessToken();

  onStatus && onStatus('Fetching your resume from Google Drive…');
  const resp = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (resp.status === 401) throw new Error('Google session expired. Please try again.');
  if (resp.status === 403) throw new Error('Access denied. Make sure your resume is shared as "Anyone with the link can view" in Google Drive.');
  if (!resp.ok)            throw new Error(`Could not fetch resume (error ${resp.status}). Please try again.`);

  const blob = await resp.blob();
  if (blob.size < 500)     throw new Error('Resume file appears empty. Check the file in Google Drive.');

  return new File([blob], 'resume.pdf', { type: 'application/pdf' });
}
