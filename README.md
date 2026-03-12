# Supplement Intelligence Dashboard
### Caffeine & Beta-Alanine — Cycling Sprint Protocol

Built with React + Vite + Chart.js. Designed for deployment on Vercel.

---

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:5173

---

## Deploy to Vercel

### Option A — Vercel CLI (from Claude Code terminal)

```bash
npm install -g vercel
vercel
```

Follow the prompts. Vercel auto-detects Vite. Done.

### Option B — GitHub + Vercel dashboard

1. Push this folder to a GitHub repo
2. Go to vercel.com → New Project → Import repo
3. Framework preset: **Vite** (auto-detected)
4. Build command: `npm run build`
5. Output directory: `dist`
6. Deploy

---

## Project structure

```
supplement-dashboard/
├── index.html
├── vite.config.js
├── vercel.json
├── package.json
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── index.css          ← design tokens, global styles
│   └── components/
│       └── SupplementDashboard.jsx   ← all dashboard logic & charts
```

---

## Extending the dashboard

To add a new supplement panel (e.g. dietary nitrates):

1. Add chart data constants at the top of `SupplementDashboard.jsx`
2. Add a new `<Section>` block inside the return JSX
3. Follow the existing `MetricCard / InfoPanel / DoseCard` pattern

---

## Sources

- Grgic et al. (2019) *Br J Sports Med* — caffeine umbrella review, 21 meta-analyses
- Hobson et al. (2012) *Amino Acids* — β-alanine exercise performance meta-analysis
- Sale et al. (2011) *Med Sci Sports Exerc* — β-alanine + acidosis buffering, cycling
- Derave et al. (2007) *J Appl Physiol* — carnosine accumulation
- Spriet (2014) *Sports Med* — caffeine and endurance performance
- Pickering & Kiely (2018) *Nutrients* — CYP1A2 genotype and caffeine response
