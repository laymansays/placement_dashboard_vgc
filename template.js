/* ═══════════════════════════════════════════════════
   template.js — Resume template + config
   Vidyavahini Placement Portal
═══════════════════════════════════════════════════ */

const RESUME_TEMPLATE = {

  // ── Google OAuth ──────────────────────────────────
  clientId: '232351760567-mtg3h8nbdngjsomsivvtv995nb6fsnd8.apps.googleusercontent.com',

  // ── College info ──────────────────────────────────
  college:       'Vidyavahini First Grade Degree College',
  footerText:    'Vidyavahini First Grade Degree College — Placement Cell',

  // ── Section order + labels ────────────────────────
  sections: [
    { key: 'name',       label: 'Full Name',              type: 'text'      },
    { key: 'phone',      label: 'Phone',                  type: 'text'      },
    { key: 'email',      label: 'Email',                  type: 'text'      },
    { key: 'linkedin',   label: 'LinkedIn URL',           type: 'text'      },
    { key: 'summary',    label: 'About Me',               type: 'paragraph' },
    { key: 'education',  label: 'Education',              type: 'table',
      fields: ['institution', 'course', 'grade', 'year']                    },
    { key: 'projects',   label: 'Projects',               type: 'bullets',
      fields: ['title', 'bullets']                                           },
    { key: 'experience', label: 'Work Experience',        type: 'entries',
      fields: ['company', 'role', 'duration', 'bullets']                    },
    { key: 'skills',     label: 'Skills',                 type: 'list'      },
    { key: 'awards',     label: 'Awards & Certifications',type: 'bullets'   },
  ],

  // ── Grade conversion (Tumkur University / UGC-CBCS) ──
  grade: {
    formula:        'CGPA = Percentage ÷ 9.5',
    toCGPA:  pct  => (parseFloat(pct)  / 9.5).toFixed(2),
    toPct:   cgpa => (parseFloat(cgpa) * 9.5).toFixed(1),
  },

  // ── AI prompt sent to WebLLM ──────────────────────
  systemPrompt: `You are a professional resume parser for Indian college students.
Extract all information from the resume text provided and return ONLY valid JSON — no markdown, no explanation, no extra text.

Return exactly this structure:
{
  "name": "string — full name only, no prefix/suffix",
  "phone": "string — 10-digit mobile number",
  "email": "string — email address",
  "linkedin": "string — complete LinkedIn URL as-is from resume",
  "summary": "string — 2 to 3 sentence professional summary, rewritten cleanly",
  "education": [
    {
      "institution": "string — full institution name including city",
      "course": "string — degree or class name",
      "grade": "string — as found in resume, e.g. 8.37 CGPA or 78%",
      "year": "string — passing year"
    }
  ],
  "experience": [
    {
      "company": "string",
      "role": "string",
      "duration": "string",
      "bullets": ["string"]
    }
  ],
  "projects": [
    {
      "title": "string",
      "bullets": ["string — clean, complete sentence"]
    }
  ],
  "skills": ["string — each skill as a separate item"],
  "awards": ["string — each award or certification as a separate item"]
},

Rules you must follow:
- Fix ALL OCR artifacts: rejoin split words (Wo rd → Word, Ms Ex cel → MS Excel)
- Fix hyphenation: Help -Hub → Help-Hub, Mobile -Based → Mobile-Based
- Remove address, city, state, pincode lines completely
- Keep LinkedIn URL exactly as found — do not truncate
- Split skills into individual items — do not keep them as one long string
- If a section is empty, return an empty array []
- Return ONLY the JSON object`,
};
