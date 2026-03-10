# project_sample — Node.js static server

This folder contains a small static site (HTML/CSS/JS). I've added a minimal Node.js + Express server so you can run the site locally with Node.

Quick start (PowerShell):

```powershell
cd c:\Users\arvha\is219\project_sample
npm install
npm run dev   # for development (requires nodemon)
# or
npm start     # run with node
```

Server features:
- Serves all files from the project root (so your existing `index.html`, `alternatives.html`, etc. are available).
- Basic health API at `/api/health`.
- Falls back to `index.html` to support SPA-style routing.

If you don't have Node.js installed, download it from https://nodejs.org (LTS recommended).
Is Car Ownership Worth It? — Static site (2026)

This is a small static website demonstrating a Swiss international style layout that:

- Visualizes sample cost trends vs wages (Chart.js)
- Provides an interactive cost calculator including loan, insurance, fuel, and maintenance
- Offers alternatives and actionable tips

How to run

1. Open the workspace folder and open `index.html` in your browser (double-click or use Live Server).
2. The site is client-side only — no server required.

Files

- `index.html` — main site
- `styles.css` — styling (Swiss-inspired minimal design)
- `script.js` — sample data, chart, and calculator logic

Next steps / Improvements

- Replace sample data with official datasets (CSV/JSON) for country-specific analysis.
- Persist user inputs and allow scenario comparisons.
- Add more robust insurance, depreciation, and tax models.
- Add unit tests for calculation functions.

Notes

This project is illustrative and not financial advice. For purchase decisions, consult official sources and financial advisors.
