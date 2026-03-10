<<<<<<< HEAD
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

# IS219
Title
→ Buying a car

Essential Question (1 sentence)
→ Is car ownership still worth it in 2026?

Claim (Hypothesis) (1 sentence; can be wrong)
- The cost of buying a car in 2026 is considered financially unfeasible for many 

Audience (who is this for?)
→ Any age, those looking to purchase a car/weigh their transportation options

STAR Draft (bullets)
S — Situation: Why this matters to students now
→ Car ownership has traditionally been seen as essential for independence, commuting to work or school, and accessing opportunities. However, in recent years the total cost of owning a car—including loan payments, insurance, fuel, parking, and maintenance—has risen significantly. At the same time, student incomes and entry-level wages have not always kept pace. For college students and recent graduates, this raises an important question: is owning a car still financially reasonable in 2026, or is it becoming a major financial burden?
T — Task: What the viewer should be able to conclude or do
→ Viewers will be able to view price trends, calculate an approximate annual cost based on their vehicle, view alternatives, and view more things to consider before buying a car.
A — Action: What you will build (views + interaction)
Viewers can view four pages: 1) a data dashboard of the cost of car ownership vs median wages, 2) use a cost calculator that allows them to input their country of origin, car mode, commute distance, insurance category, purchase price, down payment, loan term, interest rate and fuel price to estimate an annual cost, 3) view some travel alternatives with prices, and 4) view some actionable tips 
R — Result: What you expect the data to show; what metric you’ll report
The analysis is expected to show that the total cost of car ownership has increased faster than income growth, making car ownership a larger percentage of income than in previous years. The key metric reported will be the percentage of annual income required to own and operate a car. This metric will help determine whether car ownership is financially manageable for students and early-career workers in 2026.

Dataset & Provenance (source links + retrieval date + license/usage)
→https://www.bts.gov/content/average-cost-owning-and-operating-automobilea-assuming-15000-vehicle-miles-year	

Data Dictionary (minimum 5 rows: column → meaning → units)
→
Data Viability Audit
→
Missing values + weird fields
→ Can’t prove is car is worth buying based on the landscape (urban vs suburban vs rural) and location (proximity to public transportation)
→ does not take income into account

Draft Chart Screenshot (from Sheets/Excel) + 2 bullets explaining why the chart answers the question

B) /data/
raw.csv or raw.json (or a scripted fetch plan you will implement)
notes.md (where the data came from + any caveats)
