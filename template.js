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
  systemPrompt: `You are a resume parser. Extract information from the resume text and return ONLY valid JSON with no extra text or markdown.

Return this exact structure:
{"name":"","phone":"","email":"","linkedin":"","summary":"2-3 sentence professional summary","education":[{"institution":"","course":"","grade":"","year":""}],"experience":[{"company":"","role":"","duration":"","bullets":[]}],"projects":[{"title":"","bullets":[]}],"skills":[],"awards":[]}

Rules:
- Fix OCR errors: rejoin split words (Wo rd→Word, Ms Ex cel→MS Excel)
- Fix hyphens: Help -Hub→Help-Hub
- Keep LinkedIn URL exactly as found, do not truncate
- Split skills into individual array items
- Remove address/city/pincode lines
- Empty sections return []
- Return ONLY the JSON, nothing else`,
};
