# NordicCap — Swedish Cap Table & VC Waterfall Engine

An institutional-grade LegalTech and Venture Capital equity modeling suite compliant with the **Swedish Companies Act (*Aktiebolagslagen 2005:551*, ABL)**.

---

## Architecture Overview

NordicCap is modularized into specialized domain engines, state providers, and editorial UI components:

```
NordicCap/
├── src/
│   ├── types/
│   │   └── index.ts                 # Full domain data model (ABL share classes, notes, warrants, waterfalls)
│   ├── constants/
│   │   ├── dictionary.ts            # Bilingual localization (English / Svenska)
│   │   ├── scenarios.ts             # Pre-loaded scenarios (Pre-Series A & Series A Closed)
│   │   └── brand.ts                 # Brand assets & SVG favicon
│   ├── utils/
│   │   ├── formatters.ts            # Swedish financial notation (NBSP thousands, kSEK/MSEK/BSEK, bps, MOIC)
│   │   └── csvExport.ts             # Excel-compatible Aktiebok CSV export
│   ├── engines/
│   │   ├── roundSimulator.ts        # Iterative fixed-point pre-money ESOP shuffle & K-lån conversion
│   │   ├── waterfallEngine.ts       # Pure TypeScript equilibrium exit waterfall & payout curves
│   │   └── ablLegalEngine.ts        # Statutory ABL compliance (Leo-lagen, 10:1 voting ratio) & SHA drafting
│   ├── context/
│   │   ├── CapTableContext.tsx      # Normalized state reducer, actions, and derived metrics hook
│   │   └── RecruiterDemoContext.tsx # 5-step guided interactive walkthrough engine
│   ├── components/
│   │   ├── ui/                      # BrandEmblem, CategoryBadge, SlideOverDrawer
│   │   ├── drawers/                 # Shareholder, ShareClass, ConvertibleNote, and Warrant CRUD forms
│   │   ├── demo/                    # DemoSpotlight, DemoNarratorBox, DemoPlayerBar, DemoCompletionModal
│   │   └── memo/                    # ExecutiveTransactionMemo (@media print A4 printable dossier)
│   ├── tabs/
│   │   ├── CapTableTab.tsx          # Tab 1: Shareholder Register (Aktiebok) & 10:1 Voting Control
│   │   ├── RoundSimulatorTab.tsx    # Tab 2: Primary equity rounds, option pool shuffle & dilution
│   │   ├── WaterfallTab.tsx         # Tab 3: M&A exit proceeds across seniority tiers & ITM warrants
│   │   └── AblLegalTab.tsx          # Tab 4: ABL majority checker, Bolagsverket dossier & SHA clauses
│   ├── NordicCapEngine.tsx          # Main application layout, editorial navigation & global overlays
│   ├── App.tsx                      # Root application wrapper with context providers
│   └── index.ts                     # Barrel export of all modules, engines, and components
├── NordicCap.tsx                    # Backward-compatible entry point
├── nordiccap_swedish_cap_table_vc_waterfall_engine.tsx # Backward-compatible entry point
├── package.json                     # NPM dependencies (React 18, Lucide, Recharts)
└── tsconfig.json                    # Strict TypeScript configuration
```

---

## Deployment & Running Locally

### 1. Run Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Deploy to GitHub Pages

NordicCap is pre-configured with a zero-configuration GitHub Actions workflow ([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)) and relative asset resolution in [`vite.config.ts`](vite.config.ts).

### Step-by-Step Instructions:

1. **Push this project to a GitHub repository**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: NordicCap Swedish Cap Table Engine"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git push -u origin main
   ```

2. **Enable GitHub Pages via Actions**:
   - Go to your repository on GitHub.
   - Click **Settings** (top menu) -> **Pages** (left sidebar under *Code and automation*).
   - Under **Build and deployment** > **Source**, select **"GitHub Actions"** from the dropdown.

3. **Automatic Deployment**:
   - As soon as you push to `main` (or trigger it from the *Actions* tab), GitHub Actions will automatically install dependencies, build the Vite app, and deploy it to:
   ```
   https://<your-username>.github.io/<your-repo-name>/
   ```

---

## Key Features

1. **Dual-Class Aktiebok & Governance**:
   - Class A shares (10 votes/share) vs Class B shares (1 vote/share).
   - Real-time statutory enforcement of **ABL 4 kap. 5 §** (maximum 10:1 voting ratio between classes) and **ABL 1 kap. 5 §** (minimum 25,000 SEK share capital for Swedish private ABs).

2. **Financing Round Simulator (Nyemission)**:
   - Resolves circular pre-money Option Pool Top-Up mathematics using a 40-iteration fixed-point solver.
   - Converts Swedish convertible debt (*K-lån / konvertibellån* under ABL 15 kap.) at $\min(\text{cap price}, \text{discount price})$ on principal plus accrued interest.
   - Preserves statutory quota value (*kvotvärde*).

3. **Equilibrium Exit Waterfall**:
   - Solves seniority-ranked liquidation preferences, participating caps via water-filling, rational common conversion equilibrium, and in-the-money warrant exercise against implied share price.
   - Interactive Recharts breakpoint curves (Line and Stacked Area) alongside a sequential, bilingual audit trace.

4. **ABL Corporate Law & Clause Drafting**:
   - Automated qualified majority alerts for **Leo-lagen (16 kap. 2 & 8 §§)** requiring 9/10 votes & shares for insider warrants.
   - Generates the 6-part **Bolagsverket registration dossier** (*Stämmoprotokoll, Bolagsordning, Styrelsens redogörelse, Teckningslista, Revisorsyttrande, Bankintyg*).
   - Live Clause-to-Math drafting of Shareholders' Agreement (SHA) and Articles of Association (*Bolagsordning*).

5. **Exports & Presentation**:
   - One-click Excel-compatible CSV export.
   - Law-firm grade A4 printable transaction memorandum (`@media print`).
   - Complete 5-step guided walkthrough demo.
