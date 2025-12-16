# BizBalance: AI Agent Development Guide

## Architecture Overview
**BizBalance** is a Vite + React 19 single-page app for calculating **Business Net Exact (BNE)**, a custom liquidity metric combining bank positions and operational float. The app integrates Gemini AI for generating executive financial summaries.

**Core entry point:** [App.tsx](../App.tsx) orchestrates all state, calculations, and AI triggers. Renders via [index.tsx](../index.tsx) → ReactDOM.createRoot to `<div id="root">` in [index.html](../index.html).

**Module loading:** Uses **importmap** in [index.html](../index.html) for CDN-based ESM imports from `esm.sh` (React 19, Recharts, Lucide, GoogleGenAI). Vite handles local `.tsx` transpilation but does NOT bundle dependencies—they load directly from CDN at runtime. Path alias `@/` resolves to project root via [tsconfig.json](../tsconfig.json).

## Data Model & Persistence
- **Schema:** [types.ts](../types.ts) defines FinancialItem, BankAccount (with AccountType enum), BusinessData, and CalculationResult interfaces
- **ID generation:** All items use `crypto.randomUUID()`; amounts are numbers (no strings)
- **localStorage:** BusinessData saved under key `bizbalance_data` in [App.tsx](../App.tsx) line 25–36. Backward compatibility critical—avoid restructuring without migration logic
- **Seed data:** [INITIAL_DATA](../App.tsx#L17-L23) provides two default bank accounts (Checking/Savings); no default AR/AP/credit items

## Calculations & BNE Formula
[useMemo in App.tsx](../App.tsx#L71-L101) derives totals (AR, AP, Credit, Bank) and executes the core logic:
- **Net Receivables:** `totalAR - totalAP` (operational float)
- **Net Bank:** `totalBank - totalCredit` (liquid cash minus debt)
- **BNE formula toggle:** `useStrictFormula` state switches between:
  - `strict: (AR - AP) - (B - C)` (user's initial spec)
  - `equity: (AR - AP) + (B - C)` (standard net-worth calculation; default UI)
- **Bank breakdown:** aggregated by `bankName` field for chart display

When extending calculations, update both the `CalculationResult` return shape and the AI prompt in [geminiService.ts](../services/geminiService.ts) to keep summaries in sync.

## Component Pattern
- **[FinancialInput.tsx](../components/FinancialInput.tsx):** Reusable list editor for AR, AP, and credit-card rows. Props: `items`, `onUpdate` (immutable array callback), optional `icon` and `colorClass`
- **[BankInput.tsx](../components/BankInput.tsx):** Bank account editor with type selector (Checking/Savings). Same immutable-update pattern
- **Both are controlled components:** expect parent to manage state; use `[...prev, newItem]` or `prev.map(...)` patterns to update
- **Keys:** Always use item `id` as React key (stable across rerenders; prevents list reorder bugs)

## Gemini AI Integration
- **Service:** [geminiService.ts](../services/geminiService.ts) calls GoogleGenAI `gemini-2.5-flash` model
- **Env var handling:** Vite config [vite.config.ts](../vite.config.ts) exposes `GEMINI_API_KEY` from `.env.local` as `process.env.API_KEY` via `define`
- **Fallbacks:** Missing API key returns user-friendly string; API errors caught, logged to console, and return fallback message
- **Prompt:** Constructed from CalculationResult + raw bank breakdown string; max 100-word executive summary focused on liquidity, solvency, and one key recommendation

## UI & Styling
- **Charts:** Recharts BarChart in [App.tsx](../App.tsx) visualizes Assets (AR+Bank), Liabilities (AP+Credit), and BNE. Bar colors hardcoded in `chartData` array
- **Styling:** Tailwind CSS loaded via **CDN** in [index.html](../index.html) with inline `tailwind.config` override (custom color palette: primary, secondary, accent, success, danger). No build-time PostCSS or separate CSS files—all classes applied directly in JSX `className` attributes
- **Inputs:** HTML form controls (text, number, select) with placeholder text; numeric inputs right-aligned via `font-mono`. Number inputs have `onWheel={(e) => e.currentTarget.blur()` to prevent accidental scroll changes

## Common Extension Points
1. **Add financial category:** Extend [types.ts](../types.ts) `BusinessData`, add calculation in useMemo, render new [FinancialInput](../components/FinancialInput.tsx) in App
2. **Modify BNE formula:** Edit `bneStrict` / `bneEquity` logic in [App.tsx](../App.tsx) lines 78–85 and the `operator` string
3. **Update AI insights:** Extend prompt in [geminiService.ts](../services/geminiService.ts); re-run `npm run dev` to test
4. **Change chart display:** Update `chartData` array in [App.tsx](../App.tsx); Recharts automatically reflows

## Development Workflow
- **Setup:** `npm install`
- **Local dev:** `npm run dev` (Vite server on `localhost:3000`, bound to `0.0.0.0` for network access); auto-hot-reload on save
- **Environment:** Create `.env.local` with `GEMINI_API_KEY=<your-key>`. Restart dev server after changes for Vite to reload env
- **Build:** `npm run build` (outputs to `dist/`)
- **Preview:** `npm run preview` (test production build locally)
- **No tests:** No test framework configured; manual testing or add Vitest if needed
- **Dependencies:** All runtime dependencies loaded from CDN via importmap—`npm install` only installs dev tooling (Vite, TypeScript, type definitions)

## Error Handling & Troubleshooting
- **Gemini errors:** Logged as "Gemini API Error" in console; UI shows fallback message
- **Missing API key:** Surfaces friendly message; no crash
- **localStorage conflicts:** Malformed JSON silently falls back to INITIAL_DATA
- **Vite env not reloading:** Restart dev server (`npm run dev`) after .env.local changes

## Key File Reference
| File | Purpose |
|------|---------|
| [App.tsx](../App.tsx) | Main component, state, calculations, AI orchestration |
| [types.ts](../types.ts) | TypeScript interfaces (data schema) |
| [components/FinancialInput.tsx](../components/FinancialInput.tsx) | Reusable list editor for financial items |
| [components/BankInput.tsx](../components/BankInput.tsx) | Bank account editor with type selector |
| [services/geminiService.ts](../services/geminiService.ts) | Gemini API integration & prompt construction |
| [vite.config.ts](../vite.config.ts) | Vite build config; env injection for GEMINI_API_KEY |
