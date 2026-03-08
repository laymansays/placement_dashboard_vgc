/* ═══════════════════════════════════════════════════
   resume_extractor.js
   1. OAuth token via Google Identity Services
   2. Fetch PDF from Google Drive
   3. Extract text via PDF.js
═══════════════════════════════════════════════════ */

// ── Extract Drive file ID from any Drive URL format ──
function extractDriveFileId(url) {
  const patterns = [
    /\/file\/d\/([a-zA-Z0-9_-]+)/,
    /[?&]id=([a-zA-Z0-9_-]+)/,
    /\/d\/([a-zA-Z0-9_-]+)/,
    /open\?id=([a-zA-Z0-9_-]+)/,
  ];
  for (const rx of patterns) {
    const m = url.match(rx);
    if (m) return m[1];
  }
  return null;
}

// ── Request OAuth access token ────────────────────────
function getGoogleAccessToken() {
  return new Promise((resolve, reject) => {
    if (typeof google === 'undefined' || !google.accounts) {
      reject(new Error('Google Identity Services not loaded. Check your internet connection.'));
      return;
    }
    const client = google.accounts.oauth2.initTokenClient({
      client_id: RESUME_TEMPLATE.clientId,
      scope:     'https://www.googleapis.com/auth/drive.readonly',
      callback:  (resp) => {
        if (resp.error) reject(new Error('Google sign-in failed: ' + resp.error));
        else            resolve(resp.access_token);
      },
    });
    // Try silent first; if fails, show consent screen
    client.requestAccessToken({ prompt: '' });
  });
}

// ── Fetch PDF blob from Drive using OAuth token ───────
async function fetchResumeFromDrive(driveUrl, accessToken) {
  const fileId = extractDriveFileId(driveUrl);
  if (!fileId) throw new Error('Could not read file ID from your resume URL. Contact the placement cell.');

  const resp = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (resp.status === 401) throw new Error('Google session expired. Please try again.');
  if (resp.status === 403) throw new Error('Access denied. Make sure your resume is shared as "Anyone with the link can view".');
  if (!resp.ok)            throw new Error(`Could not fetch resume (status ${resp.status}).`);

  const blob = await resp.blob();
  if (blob.size < 500)     throw new Error('Resume file appears empty. Check Google Drive sharing settings.');

  return new File([blob], 'resume.pdf', { type: 'application/pdf' });
}

// ── Extract raw text from PDF using PDF.js ────────────
async function extractTextFromPDF(file) {
  const pdfjsLib = window['pdfjs-dist/build/pdf'];
  if (!pdfjsLib) throw new Error('PDF.js not loaded.');

  const buf = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
  let fullText = '';

  for (let p = 1; p <= pdf.numPages; p++) {
    const page    = await pdf.getPage(p);
    const content = await page.getTextContent();
    const lineMap = {};

    for (const item of content.items) {
      if (!item.str.trim()) continue;
      const y = Math.round(item.transform[5]);
      if (!lineMap[y]) lineMap[y] = [];
      lineMap[y].push({ x: item.transform[4], t: item.str });
    }

    const ys = Object.keys(lineMap).map(Number).sort((a, b) => b - a);
    fullText += ys
      .map(y => lineMap[y].sort((a, b) => a.x - b.x).map(i => i.t).join(' '))
      .join('\n') + '\n';
  }

  if (!fullText.trim()) throw new Error('No text found in PDF. This may be a scanned image — only text-based PDFs are supported.');
  return fullText;
}

// ── Main entry: auth → fetch → extract ───────────────
async function extractResumeText(driveUrl, onStatus) {
  onStatus && onStatus('Connecting to Google…', 0.1);
  const token = await getGoogleAccessToken();

  onStatus && onStatus('Fetching your resume from Google Drive…', 0.25);
  const file = await fetchResumeFromDrive(driveUrl, token);

  onStatus && onStatus('Reading PDF content…', 0.4);
  return await extractTextFromPDF(file);
}
