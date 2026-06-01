# Barrier Life Financial — Claude Context

## Project Overview
Static landing page for Thomas Berrios, a licensed independent insurance broker. The site captures leads via a multi-step quote form and sends them directly into Ringy CRM.

## Tech Stack
- Pure static HTML/CSS/JS (no framework)
- Netlify hosting (auto-deploys from GitHub `main` branch)
- Netlify Functions (serverless) for secure Ringy API proxy
- Fonts: Comfortaa + Nunito (Google Fonts)

## Deployment Pipeline
GitHub (`main` branch) → Netlify → live under custom domain

## Key Files
| File | Purpose |
|---|---|
| `index.html` | Main landing page — hero + multi-step quote form |
| `styles.css` | All site styles |
| `script.js` | Form validation, step navigation, Ringy submission |
| `netlify/functions/submit-lead.js` | Serverless proxy — sends leads to Ringy API |
| `.env` | Local dev credentials (gitignored — never commit) |
| `.gitignore` | Ignores `.env` and `.DS_Store` |

## Ringy CRM Integration
- **Endpoint:** `POST https://app.ringy.com/api/public/leads/new-lead`
- **Auth:** SID + AuthToken stored as Netlify environment variables
  - `RINGY_SID`
  - `RINGY_AUTH_TOKEN`
- The form POSTs to `/.netlify/functions/submit-lead` (never directly to Ringy)
- Credentials are in `.env` locally and in Netlify dashboard → Site Configuration → Environment Variables

## Quote Form Structure (index.html)
3-step multi-step form with required validation and shake/red error states:

**Step 1 — Coverage**
1. What describes you best? (opt-btn)
2. What is your main reason for seeking coverage? (opt-btn)
3. What is your current age? (opt-btn)

**Step 2 — Details**
4. How would you describe your overall health? (opt-btn)
5. Which monthly budget range? (opt-btn)
6. Who will be your beneficiary? (text input)
7. When are you looking to get coverage? (opt-btn)

**Step 3 — Contact**
8. First Name, Last Name, Phone, ZIP, Email (text inputs)

## Nav
Simplified to logo (left) + "Check my price" button (right, links to `index.html`). No dropdown menus.

## What's Done
- [x] Nav simplified
- [x] Form step visibility bug fixed (steps 2 & 3 hidden on load)
- [x] All form questions updated with correct content
- [x] Required validation with shake animation + red highlight + scroll to first error
- [x] Ringy serverless function created
- [x] script.js wired to submit to Netlify function
- [x] .env and .gitignore created
- [x] Ringy credentials added to .env and Netlify dashboard

## Pending / Next Steps
- [ ] Test a live form submission end-to-end and confirm lead appears in Ringy
- [ ] Add CSS error highlight for missing required fields (partially done — shake + red border on grids)
- [ ] Privacy Policy and Terms of Service pages (currently `href="#"`)
- [ ] Consider adding a phone number format mask on the Phone input
