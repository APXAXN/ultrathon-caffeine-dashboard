import { useState, useRef, useEffect } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line, Bar } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Filler,
  Tooltip,
  Legend
)

/* ─── Design tokens (JS mirrors of CSS vars for Chart.js) ─── */
const C = {
  blue:       '#378ADD',
  blueAlpha:  'rgba(55,138,221,0.08)',
  teal:       '#1D9E75',
  tealAlpha:  'rgba(29,158,117,0.08)',
  tealLight:  '#63B8A0',
  tealLAlpha: 'rgba(99,184,160,0.08)',
  orange:     '#F27025',
  red:        '#E24B4A',
  redAlpha:   'rgba(226,75,74,0.06)',
  gray:       '#888780',
  gridLine:   'rgba(136,135,128,0.12)',
  text:       '#888780',
}

const tickStyle = { color: C.gray, font: { size: 11, family: "'IBM Plex Mono', monospace" } }
const gridStyle = { color: C.gridLine }

/* ─── Reusable sub-components ─── */

function Divider() {
  return <hr style={{ border: 'none', borderTop: '0.5px solid rgba(255,255,255,0.08)', margin: '2rem 0' }} />
}

function SectionLabel({ children }) {
  return (
    <p style={{
      fontSize: 11,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      color: 'var(--color-text-secondary)',
      marginBottom: 12,
    }}>
      {children}
    </p>
  )
}

function MetricCard({ label, value, note, accent }) {
  return (
    <div style={{
      background: 'var(--color-surface)',
      borderRadius: 'var(--radius-md)',
      padding: '14px 12px',
      border: '0.5px solid var(--color-border)',
    }}>
      <p style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginBottom: 4 }}>{label}</p>
      <p style={{
        fontSize: 22,
        fontWeight: 500,
        color: accent ? 'var(--color-teal)' : 'var(--color-text-primary)',
        margin: 0,
      }}>
        {value}
      </p>
      <p style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 2 }}>{note}</p>
    </div>
  )
}

function InfoPanel({ head, body }) {
  return (
    <div style={{
      border: '0.5px solid var(--color-border)',
      borderRadius: 'var(--radius-md)',
      padding: '14px',
    }}>
      <p style={{
        fontSize: 11,
        letterSpacing: '0.07em',
        textTransform: 'uppercase',
        color: 'var(--color-text-secondary)',
        marginBottom: 6,
      }}>
        {head}
      </p>
      <p style={{ fontSize: 13, color: 'var(--color-text-primary)', lineHeight: 1.6 }}>{body}</p>
    </div>
  )
}

function DoseCard({ tag, value, desc, highlight }) {
  return (
    <div style={{
      border: `0.5px solid ${highlight ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.08)'}`,
      borderRadius: 'var(--radius-md)',
      padding: '10px 12px',
    }}>
      <p style={{ fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: 2 }}>{tag}</p>
      <p style={{ fontSize: 17, fontWeight: 500, color: 'var(--color-text-primary)', margin: 0 }}>{value}</p>
      <p style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 2 }}>{desc}</p>
    </div>
  )
}

function LegendRow({ items }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginBottom: 10, fontSize: 11, color: 'var(--color-text-secondary)' }}>
      {items.map(({ color, label }) => (
        <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: color, display: 'inline-block' }} />
          {label}
        </span>
      ))}
    </div>
  )
}

/* ─── Chart data & options ─── */

const doseChartData = {
  labels: ['1', '2', '3', '4', '5', '6', '7', '8'],
  datasets: [
    {
      type: 'line',
      label: 'Power improvement',
      data: [1.2, 2.5, 3.8, 4.8, 5.4, 5.7, 5.1, 4.0],
      borderColor: C.blue,
      backgroundColor: C.blueAlpha,
      borderWidth: 2,
      pointRadius: 4,
      pointBackgroundColor: C.blue,
      fill: true,
      tension: 0.4,
      yAxisID: 'y',
    },
    {
      type: 'line',
      label: 'Side effect burden',
      data: [0.3, 0.5, 0.8, 1.5, 2.5, 3.8, 5.5, 7.2],
      borderColor: C.red,
      backgroundColor: C.redAlpha,
      borderWidth: 2,
      pointRadius: 4,
      pointBackgroundColor: C.red,
      fill: true,
      tension: 0.4,
      yAxisID: 'y2',
    },
  ],
}

const doseChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index', intersect: false },
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: ctx =>
          ctx.datasetIndex === 0
            ? ` Power: +${ctx.parsed.y.toFixed(1)}%`
            : ` Side effects: ${ctx.parsed.y.toFixed(1)}/10`,
      },
    },
  },
  scales: {
    x: {
      title: { display: true, text: 'Dose (mg/kg body weight)', font: { size: 11 }, color: C.gray },
      grid: gridStyle,
      ticks: tickStyle,
    },
    y: {
      title: { display: true, text: 'Power improvement (%)', font: { size: 11 }, color: C.blue },
      grid: gridStyle,
      ticks: { ...tickStyle, color: C.blue, callback: v => `+${v.toFixed(1)}%` },
      min: 0, max: 8,
    },
    y2: {
      position: 'right',
      title: { display: true, text: 'Side effect score', font: { size: 11 }, color: C.red },
      grid: { drawOnChartArea: false },
      ticks: { ...tickStyle, color: C.red },
      min: 0, max: 8,
    },
  },
}

const timingChartData = {
  labels: ['-60', '-45', '-30', '-15', '0', '15', '30', '60', '90', '120', '150', '180'],
  datasets: [{
    data: [0, 5, 18, 42, 65, 85, 95, 100, 93, 82, 68, 54],
    borderColor: C.teal,
    backgroundColor: C.tealAlpha,
    borderWidth: 2,
    pointRadius: 3,
    pointBackgroundColor: C.teal,
    fill: true,
    tension: 0.4,
  }],
}

const timingChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { callbacks: { label: ctx => ` Plasma: ${Math.round(ctx.parsed.y)}%` } },
  },
  scales: {
    x: {
      title: { display: true, text: 'Minutes from ingestion (peak at ~60 min)', font: { size: 11 }, color: C.gray },
      grid: gridStyle,
      ticks: { ...tickStyle, maxRotation: 0 },
    },
    y: {
      title: { display: true, text: 'Relative plasma level (%)', font: { size: 11 }, color: C.gray },
      grid: gridStyle,
      ticks: { ...tickStyle, callback: v => `${v}%` },
      min: 0, max: 110,
    },
  },
}

const loadingChartData = {
  labels: ['Wk 0', 'Wk 1', 'Wk 2', 'Wk 3', 'Wk 4', 'Wk 5', 'Wk 6', 'Wk 8', 'Wk 10', 'Wk 12'],
  datasets: [{
    data: [0, 12, 28, 45, 62, 75, 84, 92, 97, 100],
    borderColor: C.tealLight,
    backgroundColor: C.tealLAlpha,
    borderWidth: 2,
    pointRadius: 4,
    pointBackgroundColor: C.tealLight,
    fill: true,
    tension: 0.4,
  }],
}

const loadingChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { callbacks: { label: ctx => ` Carnosine: ${Math.round(ctx.parsed.y)}% of peak` } },
  },
  scales: {
    x: { grid: gridStyle, ticks: tickStyle },
    y: {
      title: { display: true, text: 'Muscle carnosine (% of maximum)', font: { size: 11 }, color: C.gray },
      grid: gridStyle,
      ticks: { ...tickStyle, callback: v => `${v}%` },
      min: 0, max: 110,
    },
  },
}

const compoundChartData = {
  labels: ['Peak power\n(sprint)', 'Mean power\n(sustained)', 'Repeat sprint\nperformance', 'Time to\nexhaustion', 'RPE\n(perceived effort)'],
  datasets: [
    { label: 'Caffeine',     data: [4.9, 3.9, 3.1, 15, 12], backgroundColor: 'rgba(55,138,221,0.75)',  borderRadius: 3 },
    { label: 'Beta-alanine', data: [1.2, 1.8, 2.5,  4,  2], backgroundColor: 'rgba(99,184,160,0.75)',  borderRadius: 3 },
    { label: 'Combined',     data: [7.3, 6.4, 6.8, 20, 15], backgroundColor: 'rgba(242,112,37,0.88)',  borderRadius: 3 },
  ],
}

const compoundChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { callbacks: { label: ctx => ` ${ctx.dataset.label}: +${ctx.parsed.y.toFixed(1)}%` } },
  },
  scales: {
    x: { grid: { display: false }, ticks: tickStyle },
    y: {
      title: { display: true, text: 'Improvement over placebo (%)', font: { size: 11 }, color: C.gray },
      grid: gridStyle,
      ticks: { ...tickStyle, callback: v => `+${v}%` },
      min: 0, max: 25,
    },
  },
}

/* ─── Race day protocol timeline ─── */
const timelineItems = [
  { label: 'T−6 weeks', desc: 'Begin BA loading', color: C.tealLight, pct: 100 },
  { label: 'T−7 days',  desc: 'Caffeine washout', color: C.gray,      pct: 80  },
  { label: 'T−60 min',  desc: 'Caffeine dose',    color: C.blue,      pct: 60  },
  { label: 'Race start',desc: 'Peak window',       color: C.teal,      pct: 40  },
]

/* ─── Main component ─── */
export default function SupplementDashboard() {
  const [bw, setBw] = useState(75)
  const [bw2, setBw2] = useState(75)

  const caffDose = (mult) => Math.round(bw * mult)
  const baDose = () => ({
    low:     (bw2 * 0.043).toFixed(1),
    high:    (bw2 * 0.085).toFixed(1),
    serving: (bw2 * 0.011).toFixed(1),
  })

  const s = {
    page: {
      maxWidth: 820,
      margin: '0 auto',
      padding: '2.5rem 1.5rem 4rem',
    },
    grid4: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, minmax(0,1fr))',
      gap: 10,
      marginBottom: '1.5rem',
    },
    grid2: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, minmax(0,1fr))',
      gap: 10,
      marginBottom: '1.5rem',
    },
    grid3: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, minmax(0,1fr))',
      gap: 10,
    },
    calcBlock: {
      background: 'var(--color-surface)',
      border: '0.5px solid var(--color-border)',
      borderRadius: 'var(--radius-lg)',
      padding: '1rem 1.25rem',
      marginBottom: '1.5rem',
    },
    calcRow: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      marginBottom: 10,
    },
    calcLabel: {
      fontSize: 12,
      color: 'var(--color-text-secondary)',
      minWidth: 80,
    },
    calcVal: {
      fontSize: 13,
      fontWeight: 500,
      color: 'var(--color-text-primary)',
      minWidth: 52,
      textAlign: 'right',
    },
    chartWrap: (h) => ({
      position: 'relative',
      width: '100%',
      height: h,
      marginBottom: '1.5rem',
    }),
    synergyBlock: {
      border: '0.5px solid rgba(255,255,255,0.2)',
      borderRadius: 'var(--radius-lg)',
      padding: '1.25rem 1.5rem',
      marginBottom: '1.5rem',
      background: 'var(--color-surface)',
    },
    sup: {
      fontSize: 9,
      verticalAlign: 'super',
    },
  }

  const ba = baDose()

  return (
    <div style={s.page}>

      {/* ── Top-right wordmark ── */}
      <div style={{ position: 'fixed', top: 20, right: 24, zIndex: 100 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#F5C842', letterSpacing: '0.06em' }}>
          ultrathon.io
        </span>
      </div>

      {/* ── Header ── */}
      <p style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: 8 }}>
        Supplement intelligence / cycling · anaerobic sprint protocol
      </p>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 32, fontWeight: 700, lineHeight: 1.2, marginBottom: 6 }}>
        More is not better.<br />
        <em style={{ fontStyle: 'italic', fontWeight: 400, color: 'var(--color-text-secondary)' }}>But stacked is.</em>
      </h1>
      <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.7, marginBottom: '2rem', maxWidth: 600 }}>
        Caffeine alone plateaus at 5 mg/kg — more doesn't move the needle, it just moves your stomach.
        Beta-alanine works a different mechanism entirely. Combined, the compound effect outperforms either alone by a meaningful margin.
      </p>

      {/* ── Summary metrics ── */}
      <div style={s.grid4}>
        <MetricCard label="Caffeine alone"      value="+4.9%" note="Peak sprint power"    />
        <MetricCard label="Beta-alanine alone"  value="+2.5%" note="Repeat sprint"        />
        <MetricCard label="Stacked"             value="+7.3%" note="Additive compound gain" accent />
        <MetricCard label="Beta-alanine onset"  value="4–6 wk" note="Loading required"   />
      </div>

      <Divider />

      {/* ── Section I: Caffeine ── */}
      <SectionLabel>I. Caffeine — dose-response &amp; timing</SectionLabel>

      <div style={s.calcBlock}>
        <div style={s.calcRow}>
          <span style={s.calcLabel}>Body weight</span>
          <input
            type="range" min={50} max={120} step={1} value={bw}
            onChange={e => setBw(Number(e.target.value))}
            style={{ flex: 1 }}
          />
          <span style={s.calcVal}>{bw} kg</span>
        </div>
        <div style={s.grid3}>
          <DoseCard tag="Conservative (3 mg/kg)" value={`${caffDose(3)} mg`} desc="~2 espresso shots"         />
          <DoseCard tag="Optimal (5 mg/kg)"       value={`${caffDose(5)} mg`} desc="Best power-to-side-effect" highlight />
          <DoseCard tag="Ceiling (6 mg/kg)"        value={`${caffDose(6)} mg`} desc="GI risk increases sharply" />
        </div>
      </div>

      <LegendRow items={[
        { color: C.blue, label: 'Power improvement' },
        { color: C.red,  label: 'Side effect burden' },
      ]} />
      <div style={s.chartWrap(220)}>
        <Line data={doseChartData} options={doseChartOptions} />
      </div>

      <LegendRow items={[{ color: C.teal, label: 'Plasma level (relative)' }]} />
      <div style={s.chartWrap(200)}>
        <Line data={timingChartData} options={timingChartOptions} />
      </div>

      <div style={s.grid2}>
        <InfoPanel
          head="Tolerance / washout"
          body="Habitual users see blunted response. A 7–10 day abstinence period before key events restores near-full sensitivity."
        />
        <InfoPanel
          head="CYP1A2 genotype"
          body="Fast metabolizers (AA) see strongest gains. Slow metabolizers (C allele) may see reduced or negligible benefit at standard doses."
        />
      </div>

      <Divider />

      {/* ── Section II: Beta-alanine ── */}
      <SectionLabel>II. Beta-alanine — mechanism &amp; loading</SectionLabel>

      <div style={s.grid2}>
        <InfoPanel
          head="How it works"
          body="Beta-alanine raises muscle carnosine, the primary intracellular buffer against H⁺ ions generated during high-intensity effort. More carnosine = slower acidification = sustained power in the 1–4 min sprint range."
        />
        <InfoPanel
          head="Why caffeine can't do this"
          body="Caffeine acts centrally — adenosine antagonism and catecholamine release. It can't address the peripheral acidosis that limits repeat sprints. Beta-alanine fills exactly that gap."
        />
      </div>

      <div style={s.calcBlock}>
        <div style={s.calcRow}>
          <span style={s.calcLabel}>Body weight</span>
          <input
            type="range" min={50} max={120} step={1} value={bw2}
            onChange={e => setBw2(Number(e.target.value))}
            style={{ flex: 1 }}
          />
          <span style={s.calcVal}>{bw2} kg</span>
        </div>
        <div style={s.grid3}>
          <DoseCard tag="Daily dose"    value={`${ba.low}–${ba.high} g`} desc="Split into 0.8–1.6 g doses" />
          <DoseCard tag="Per serving"   value={`${ba.serving} g`}         desc="Reduces paresthesia"         highlight />
          <DoseCard tag="Time to peak"  value="4–6 wk"                    desc="~4 wk to see sprint gains"   />
        </div>
      </div>

      <SectionLabel>Carnosine accumulation over loading phase</SectionLabel>
      <div style={s.chartWrap(210)}>
        <Line data={loadingChartData} options={loadingChartOptions} />
      </div>

      <div style={s.grid2}>
        <InfoPanel
          head="Paresthesia (tingling)"
          body="Normal and harmless. Split into smaller doses (≤1.6 g per serving) or use slow-release formulations to minimize. Not a side effect to eliminate performance-wise."
        />
        <InfoPanel
          head="Who benefits most"
          body="Largest gains in efforts of 1–4 min at near-maximal intensity. Hill climbs, criterium surges, and repeated sprint intervals — your race contexts."
        />
      </div>

      <Divider />

      {/* ── Section III: Compound effect ── */}
      <SectionLabel>III. Compound effect — stacking the two</SectionLabel>

      <div style={s.synergyBlock}>
        <p style={{ fontFamily: 'var(--font-serif)', fontSize: 17, fontStyle: 'italic', lineHeight: 1.5, marginBottom: 10, color: 'var(--color-text-primary)' }}>
          "Caffeine peaks fast and fades. Beta-alanine builds slow and holds. Together, they cover the full anaerobic timeline."
        </p>
        <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.8, marginBottom: 10 }}>
          Caffeine fires the central system — sharpening motor unit recruitment, blunting perceived effort, spiking catecholamines before the start.<sup style={s.sup}>1</sup>{' '}
          Beta-alanine works the periphery — keeping muscle pH stable as intensity peaks, delaying the acidosis that makes legs seize in the third minute of a hard effort.<sup style={s.sup}>2</sup>{' '}
          Neither addresses what the other does. The stack is additive precisely because the mechanisms don't overlap.<sup style={s.sup}>3</sup>
        </p>
        <div style={{ borderTop: '0.5px solid var(--color-border)', paddingTop: 10 }}>
          <p style={{ fontSize: 11, color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
            <sup style={s.sup}>1</sup> Grgic et al. (2019) <em>Br J Sports Med</em> — umbrella review of 21 caffeine meta-analyses &nbsp;&nbsp;
            <sup style={s.sup}>2</sup> Hobson et al. (2012) <em>Amino Acids</em> — β-alanine meta-analysis, exercise performance &nbsp;&nbsp;
            <sup style={s.sup}>3</sup> Sale et al. (2011) <em>Med Sci Sports Exerc</em> — β-alanine + acidosis buffering in high-intensity cycling
          </p>
        </div>
      </div>

      <LegendRow items={[
        { color: C.blue,      label: 'Caffeine'     },
        { color: C.tealLight, label: 'Beta-alanine' },
        { color: C.orange,    label: 'Combined'     },
      ]} />
      <div style={s.chartWrap(260)}>
        <Bar data={compoundChartData} options={compoundChartOptions} />
      </div>

      {/* ── Race day timeline ── */}
      <SectionLabel>Protocol — race day stack</SectionLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: '2rem' }}>
        {timelineItems.map(({ label, desc, color, pct }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 11, color: 'var(--color-text-secondary)', minWidth: 72 }}>{label}</span>
            <div style={{
              flex: 1,
              background: 'var(--color-surface)',
              border: '0.5px solid var(--color-border)',
              borderRadius: 3,
              height: 8,
              overflow: 'hidden',
            }}>
              <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 3 }} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-primary)', minWidth: 90, textAlign: 'right' }}>{desc}</span>
          </div>
        ))}
      </div>

      {/* ── Footer ── */}
      <Divider />
      <p style={{ fontSize: 11, color: 'var(--color-text-muted)', lineHeight: 1.7 }}>
        Sources: Grgic et al. (2019) umbrella review 21 meta-analyses · Hobson et al. (2012) β-alanine meta-analysis ·
        Sale et al. (2011) β-alanine + sodium bicarbonate cycling · Derave et al. (2007) carnosine accumulation ·
        Spriet (2014) caffeine review · Pickering &amp; Kiely (2018) CYP1A2 genotype
      </p>
      <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 6 }}>
        Built with State Street Consulting · Data sourced from PubMed-indexed RCTs and meta-analyses
      </p>
    </div>
  )
}
