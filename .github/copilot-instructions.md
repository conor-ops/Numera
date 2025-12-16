# BizBalance AI Agent Guide

- Purpose: Vite + React 19 single-page "Business Net Exact (BNE)" calculator with a simple Gemini-backed insight generator.
- Core entry: App state and calculations live in App.tsx; render via index.tsx -> ReactDOM.createRoot.
- Data model: See types.ts (FinancialItem, BankAccount with AccountType enum, BusinessData, CalculationResult). IDs use crypto.randomUUID; amounts are numbers.
- Persistence: BusinessData is loaded/saved to localStorage under key bizbalance_data (App.tsx). Avoid breaking shape to keep backward compatibility.
- Default seed data: INITIAL_DATA in App.tsx seeds two bank accounts; no default AR/AP/credit rows.
- Calculation rules: useMemo in App.tsx derives totals, bankBreakdown grouped by bankName, netReceivables (AR-AP), netBank (B-C). BNE toggles between strict (netReceivables - netBank) and equity-style (netReceivables + netBank) via useStrictFormula state and UI toggle.
- UI components: FinancialInput manages AR/AP/C lists; BankInput manages bank accounts with type selector. Both are controlled components that expect immutable array updates via onUpdate.
- Visualization: Recharts BarChart in App.tsx shows Assets, Liabilities, and BNE; colors are hardcoded per bar.
- Styling: Uses utility-class styling in JSX (tailwind-like classes). Preserve className strings when editing; no dedicated CSS framework config in repo.
- AI integration: services/geminiService.ts builds an executive-summary prompt and calls GoogleGenAI model gemini-2.5-flash. It returns text or friendly error strings.
- API key handling: geminiService reads process.env.API_KEY; README instructs GEMINI_API_KEY in .env.local. For Vite, prefer exposing as import.meta.env.VITE_GEMINI_API_KEY and passing into the service to avoid undefined at runtime.
- AI trigger: handleAiGenerate in App.tsx assembles bank breakdown, guards missing API key, and toggles isGeneratingAi while awaiting generateFinancialInsight.
- Charts/insights depend on CalculationResult; if you extend the data model, update both calculation and prompt formatting to stay in sync.
- Scripts: npm install; npm run dev for local; npm run build and npm run preview for production preview (see package.json). No tests configured.
- Error handling: Gemini errors are caught and logged to console; UI falls back to a friendly message. Maintain this pattern for user-facing resilience.
- Accessibility: Inputs are simple HTML form controls; keep labels/placeholders meaningful and preserve numeric input right-align formatting.
- IDs and keys: When adding list items, preserve stable id and use id as React key to prevent list reordering bugs.
- File layout: components/BankInput.tsx and components/FinancialInput.tsx handle editing; services/geminiService.ts encapsulates AI calls; App.tsx orchestrates state and layout.
- Common extension points: add new financial categories by extending BusinessData + types.ts, wiring to calculation memo, and rendering another FinancialInput. Update chartData if totals change.
- Runbook for AI issues: confirm env var is injected (Vite import.meta.env), restart dev server after env changes, and inspect console for "Gemini API Error" logs.
- Deployment: Follow standard Vite static build (npm run build) and serve dist; ensure env injection strategy matches host (e.g., VITE_ prefix for client-side vars).
- No global state managers; keep everything local to App or pass props down. Favor useMemo/useEffect patterns already present.

Feedback welcome: flag any unclear sections to refine these notes.
