/* ═══════════════════════════════════════════════════
   ai_rewriter.js
   Loads WebLLM (Phi-3 Mini) in browser, parses
   raw resume text into structured JSON.
   No API key. Runs entirely on device.
═══════════════════════════════════════════════════ */

const WEBLLM_MODEL  = 'Phi-3-mini-4k-instruct-q4f16_1-MLC';
const WEBLLM_CDN    = 'https://esm.run/@mlc-ai/web-llm';

let _engine     = null;   // cached engine instance
let _engineBusy = false;

// ── Check if WebGPU is available ──────────────────────
function isWebGPUSupported() {
  return typeof navigator !== 'undefined' && !!navigator.gpu;
}

// ── Load model (downloads ~2GB on first use, cached after) ──
async function loadWebLLM(onProgress) {
  if (_engine) return _engine;
  if (!isWebGPUSupported()) {
    throw new Error(
      'Your browser does not support WebGPU. Please use Chrome or Edge (latest version) on a laptop or desktop.'
    );
  }

  onProgress && onProgress('Loading AI model — this takes a few minutes on first use…', 0.0);

  // Dynamic import so it doesn't block page load
  const { CreateMLCEngine } = await import(WEBLLM_CDN);

  _engine = await CreateMLCEngine(WEBLLM_MODEL, {
    initProgressCallback: (report) => {
      onProgress && onProgress(report.text, report.progress || 0);
    },
  });

  return _engine;
}

// ── Build grade instruction based on user's choice ───
function gradeInstruction(mode) {
  if (mode === 'cgpa') {
    return `Convert all percentage grades to CGPA using: CGPA = Percentage ÷ 9.5 (Tumkur University formula). ` +
           `Example: 78% → ${(78/9.5).toFixed(2)} CGPA. Show as "X.XX CGPA".`;
  }
  return `Convert all CGPA grades to percentage using: Percentage = CGPA × 9.5 (Tumkur University formula). ` +
         `Example: 8.37 CGPA → ${(8.37*9.5).toFixed(1)}%. Show as "XX.X%".`;
}

// ── Call WebLLM with resume text ──────────────────────
async function rewriteWithAI(rawText, gradeMode, onProgress) {
  if (_engineBusy) throw new Error('AI is already processing. Please wait.');
  _engineBusy = true;

  try {
    const engine = await loadWebLLM(onProgress);

    onProgress && onProgress('AI is reading your resume…', 0.85);

    const systemPrompt = RESUME_TEMPLATE.systemPrompt +
      '\n\nGrade instruction: ' + gradeInstruction(gradeMode);

    // Trim raw text to avoid exceeding context window (~3000 chars is safe for Phi-3 mini)
    const trimmedText = rawText.length > 6000
      ? rawText.slice(0, 6000) + '\n[text truncated]'
      : rawText;

    const response = await engine.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: 'Parse this resume and return JSON:\n\n' + trimmedText },
      ],
      temperature: 0.05,   // very low — we want consistent structured output
      max_tokens:  2000,
    });

    onProgress && onProgress('Formatting output…', 0.95);

    const raw = response.choices[0].message.content.trim();

    // Strip markdown code fences if model adds them
    const jsonStr = raw
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/,      '')
      .replace(/\s*```$/,      '')
      .trim();

    let parsed;
    try {
      parsed = JSON.parse(jsonStr);
    } catch(e) {
      // Try to extract JSON object if model added extra text
      const match = jsonStr.match(/\{[\s\S]*\}/);
      if (match) parsed = JSON.parse(match[0]);
      else throw new Error('AI returned invalid JSON. Try uploading again.');
    }

    // Validate minimum structure
    if (!parsed || typeof parsed !== 'object') {
      throw new Error('AI output was not a valid resume structure. Try again.');
    }

    // Ensure arrays exist
    ['education','experience','projects','skills','awards'].forEach(k => {
      if (!Array.isArray(parsed[k])) parsed[k] = [];
    });

    return parsed;

  } finally {
    _engineBusy = false;
  }
}
