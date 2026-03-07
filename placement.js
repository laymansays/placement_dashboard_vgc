/* ═══════════════════════════════════════════════════════════════════
   placement.js — Placement Cell Dashboard Module
   Vidyavahini First Grade Degree College

   NOTE: The placement dashboard is a self-contained single-file
   application (placement.html). All dashboard logic — company data
   fetching, rendering, admin mode, JD cards, student tables — lives
   inline in placement.html and does NOT depend on this file.

   This file serves as the canonical module definition for:
     • Shared constants reference (mirrors shared.js)
     • GitHub Pages file-structure compliance
     • Future: extract placement logic into this module

   To add the Placement Cell dashboard to a page, simply link to:
     placement.html
═══════════════════════════════════════════════════════════════════ */

/* ── PLACEMENT CELL CONSTANTS (mirrors placement.html inline config) ── */
const PLACEMENT_CONFIG_SHEET_ID = '1Mb9jrzZMSta5NYs28i3STS2tYNqhMtabj3wktvHiYmw';
const PLACEMENT_CONFIG_TAB      = 'CONFIG_TAB';
const PLACEMENT_ADMIN_TAB       = 'ADMIN_MODE';
const PLACEMENT_ADMIN_PIN       = '1234';   // Change in placement.html

/* ── PORTAL NAVIGATION HELPER ── */
function goToPlacementDashboard() {
  window.location.href = 'placement.html';
}
function goToStudentPortal() {
  window.location.href = 'student.html';
}
function goToHome() {
  window.location.href = 'index.html';
}

/* ── FILE MANIFEST (for reference) ── */
const PORTAL_FILES = {
  'index.html':    'Homepage hero with stats and dual portal entry',
  'student.html':  'Student portal: login, profile, placement status, apply',
  'placement.html':'Placement Cell full dashboard (self-contained)',
  'shared.js':     'Shared utilities: fetch helpers, config loaders, logo renderer',
  'student.js':    'Student portal logic (requires shared.js)',
  'placement.js':  'This file: placement module manifest & nav helpers'
};
