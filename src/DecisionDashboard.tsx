import { useState } from 'react'
import { Icon } from './icons'
import { PumpScene, CoverageCar, CoinMap, ConnectorStage, RankChart, GapPanel } from './decision-parts'
import { Pie3D } from './Charts'
import { t, type Language } from './translations'

const districts = [
  ['Lucknow', 'Critical', 82.4, 141, '#ff5d68'],
  ['Gautam Buddha Nagar', 'Critical', 79.8, 88, '#ff5d68'],
  ['Ghaziabad', 'High', 68.2, 24, '#ff9a4b'],
  ['Kanpur Nagar', 'High', 61.5, 21, '#ff9a4b'],
  ['Varanasi', 'Medium', 51.3, 17, '#f6d365'],
  ['Prayagraj', 'Medium', 47.9, 15, '#f6d365'],
  ['Agra', 'Medium', 44.2, 14, '#f6d365'],
  ['Meerut', 'Low', 36.8, 11, '#35f5a1'],
  ['Bareilly', 'Low', 31.5, 9, '#35f5a1'],
  ['Gorakhpur', 'Low', 27.1, 7, '#35f5a1'],
]

const mix = [
  ['CCS2', 38, '1,410', '#35f5a1', 'Fast DC charging'],
  ['Type 2 AC', 34, '1,261', '#3fd8f5', 'AC destination charging'],
  ['Bharat DC', 12, '445', '#9b8cff', 'Legacy DC public charging'],
  ['Bharat AC', 10, '371', '#f6d365', 'Neighbourhood AC charging'],
  ['CHAdeMO', 6, '223', '#ff7e91', 'Specialist DC charging'],
]

function EvSuv() {
  return (
    <div className="suv-drive" aria-hidden="true">
      <svg viewBox="0 0 220 84" width="132" height="50">
        <defs>
          <linearGradient id="suvBody" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#5df7c0" />
            <stop offset="1" stopColor="#0f8f7a" />
          </linearGradient>
          <linearGradient id="suvGlass" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#bff6ff" />
            <stop offset="1" stopColor="#2b6f9c" />
          </linearGradient>
        </defs>
        <ellipse cx="108" cy="76" rx="92" ry="4" fill="#000" opacity=".35" />
        <path
          d="M12 56c0-8 3-13 10-15l22-6 24-20c3-3 7-4 11-4h56c6 0 11 2 15 6l20 18 22 4c8 2 11 7 11 15v6c0 3-2 5-5 5h-12a22 22 0 0 0-44 0H80a22 22 0 0 0-44 0H17c-3 0-5-2-5-5z"
          fill="url(#suvBody)"
        />
        <path d="M64 36l18-15c2-2 4-3 7-3h24v18zM118 18h22c3 0 6 1 8 3l17 15h-47z" fill="url(#suvGlass)" />
        <path d="M118 18v18" stroke="#0a2a3a" strokeWidth="2" />
        <path d="M178 46h22" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity=".9" />
        <rect x="12" y="46" width="9" height="4" rx="2" fill="#ff5a5a" />
        <path d="M40 56h132" stroke="#0a5e52" strokeWidth="1.5" opacity=".6" />
        <path d="M142 14l-6 11h6l-4 9" stroke="#fff" strokeWidth="2" fill="none" opacity=".0" />
        <g className="suv-wheel" style={{ transformBox: 'view-box' as const, transformOrigin: '58px 62px' }}>
          <circle cx="58" cy="62" r="17" fill="#0b1220" />
          <circle cx="58" cy="62" r="9" fill="#c9d6e8" />
          <path d="M58 53v18M49 62h18M52 56l12 12M64 56L52 68" stroke="#0b1220" strokeWidth="2" />
        </g>
        <g className="suv-wheel" style={{ transformBox: 'view-box' as const, transformOrigin: '158px 62px' }}>
          <circle cx="158" cy="62" r="17" fill="#0b1220" />
          <circle cx="158" cy="62" r="9" fill="#c9d6e8" />
          <path d="M158 53v18M149 62h18M152 56l12 12M164 56L152 68" stroke="#0b1220" strokeWidth="2" />
        </g>
      </svg>
      <span className="suv-bolt">⚡</span>
    </div>
  )
}

function Kpi({
  children,
  title,
  value,
  sub,
  tone = 'cyan',
  drive = false,
}: {
  children: React.ReactNode
  title: string
  value: string
  sub: string
  tone?: string
  drive?: boolean
}) {
  return (
    <article className={`decision-kpi decision-${tone}`}>
      {drive && <EvSuv />}
      <div>
        <p className="mono-label">{title}</p>
        <strong>{value}</strong>
        <p className="kpi-sub">{sub}</p>
      </div>
      <div className="kpi-object">{children}</div>
    </article>
  )
}

export default function DecisionDashboard({ onMap, lang = 'English' }: { onMap: () => void; lang?: Language }) {
  const [activeDistrict, setActiveDistrict] = useState(0)
  const [selectedMix, setSelectedMix] = useState(0)

  const downloadInsightReport = () => {
    const csvContent =
      'Category,Metric,Value,Status\n' +
      'Overview,EVs per Charging Point,128.4,Target: 100\n' +
      'Overview,Coverage Percentage,76.8%,Required: 4830 / Existing: 3710\n' +
      'Overview,Underserved Districts,28,Critical / High Gaps\n' +
      'Priority,Critical Districts,28,Immediate deployment\n' +
      'Priority,High Districts,64,Planned expansion\n' +
      'Priority,Medium Districts,106,Monitoring\n' +
      'Priority,Low Districts,82,Sufficient coverage\n' +
      'Connector,Ultra-Fast DC (>=120kW),18%,Highway corridors\n' +
      'Connector,Fast DC (50-60kW),36%,Commercial & fleet hubs\n' +
      'Connector,AC Type 2 (7-22kW),34%,Workplace & destination\n' +
      'Connector,Bharat DC-001 (15kW),12%,Legacy urban charging\n'

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `chargegrid_decision_insight_report_${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <section className="decision-page">
      <div className="decision-ambient" aria-hidden="true" />
      <header className="decision-header">
        <div>
          <p className="mono-label text-brand">{t('dash_kicker', lang)}</p>
          <h1>
            EV Charging <span>Decision-Support</span> Dashboard
          </h1>
          <p className="decision-intro">{t('dash_sub', lang)}</p>
          <p className="source-badge">VAHAN · BEE EV Yatra · Open Charge Map · CPO APIs · Government GIS</p>
        </div>
        <div className="decision-filters">
          <label>
            State
            <select className="est-select" defaultValue="Uttar Pradesh">
              <option>Uttar Pradesh</option>
              <option>Maharashtra</option>
              <option>Delhi</option>
            </select>
          </label>
          <label>
            Vehicle
            <select className="est-select">
              <option>All EVs</option>
              <option>2W</option>
              <option>3W</option>
              <option>4W</option>
            </select>
          </label>
          <label>
            Charger
            <select className="est-select">
              <option>All types</option>
              <option>CCS2</option>
              <option>Type 2 AC</option>
            </select>
          </label>
          <button onClick={downloadInsightReport} className="btn-primary report-btn">
            {t('dash_download_report', lang)} <Icon name="arrow" size={15} />
          </button>
        </div>
      </header>

      <div className="kpi-grid">
        <Kpi title={t('dash_ev_per_point', lang)} value="128.4" sub="Target: 100 EVs per charging point">
          <PumpScene />
        </Kpi>
        <Kpi drive title={t('dash_cov_pct', lang)} value="76.8%" sub="Required: 4,830 · Existing: 3,710" tone="green">
          <CoverageCar />
        </Kpi>
        <Kpi
          title={t('dash_underserved', lang)}
          value="28"
          sub="Above target EVs per charger or zero public chargers"
          tone="red"
        >
          <CoinMap />
        </Kpi>
        <Kpi
          title={t('dash_type_mix', lang)}
          value="5 connector types"
          sub="CCS2 · Type 2 AC · Bharat AC · Bharat DC · CHAdeMO"
          tone="violet"
        >
          <div className="connector-cluster">
            {['ϟ', '◉', '⌁', '↯', '◌'].map((x, i) => (
              <span key={i}>{x}</span>
            ))}
          </div>
        </Kpi>
        <Kpi
          title={t('dash_priority_rank', lang)}
          value="Top 25 districts"
          sub="Ranked by Gap Score and charger requirement"
          tone="orange"
        >
          <div className="podium">
            <i />
            <i />
            <i />
            <span>01</span>
          </div>
        </Kpi>
      </div>

      <GapPanel />

      <div className="decision-two-col">
        <section className="glass ranking-panel">
          <div className="section-title">
            <div>
              <p className="mono-label text-brand">Investment focus</p>
              <h2>District Priority Ranking</h2>
            </div>
            <button className="btn-ghost" onClick={onMap}>
              {t('dash_open_map', lang)} <Icon name="map" size={15} />
            </button>
          </div>
          <RankChart districts={districts} active={activeDistrict} setActive={setActiveDistrict} onMap={onMap} />
        </section>
        <section className="glass mix-panel">
          <p className="mono-label text-brand">Network composition</p>
          <h2>Public Charger-Type Mix</h2>
          <ConnectorStage mix={mix} selected={selectedMix} onSelect={setSelectedMix} />
          <div className="mix-body">
            <div className="mix-donut">
              <div>
                <b>{mix[selectedMix][1]}%</b>
                <span>{mix[selectedMix][0]}</span>
              </div>
            </div>
            <ul>
              {mix.map((m, i) => (
                <li
                  key={String(m[0])}
                  onMouseEnter={() => setSelectedMix(i)}
                  className={selectedMix === i ? 'selected' : ''}
                >
                  <i style={{ background: String(m[3]) }} />
                  <span>
                    <b>{m[0]}</b>
                    <small>{m[4]}</small>
                  </span>
                  <em>
                    {m[1]}%<small>{m[2]} pts</small>
                  </em>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      {/* Expanded Portfolio Health Card with 3D Bar Graph and 3D Elevated Pie Chart */}
      <section className="glass mt-8 rounded-3xl p-6 lg:p-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
          <div>
            <p className="mono-label text-brand">{t('dash_portfolio_health', lang)}</p>
            <h2 className="text-xl font-bold tracking-tight text-ink md:text-2xl">
              Portfolio Health &amp; Infrastructure Breakdown
            </h2>
            <p className="mt-1 text-xs text-soft">
              Interactive comparative analysis of district risk levels alongside charger power and connector mix.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-lg border border-line bg-[var(--surface)] px-3 py-1 font-mono text-xs text-soft">
              Total Analyzed: 280 Districts
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
          {/* Left: 3D Bar Graph of Priority Distribution */}
          <div className="rounded-2xl border border-line bg-[var(--surface)] p-6 lg:col-span-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-ink">{t('dash_priority_dist', lang)}</h3>
                <p className="text-xs text-soft">Districts classified by urgency and charging deficit</p>
              </div>
              <span className="font-mono text-xs text-brand">3D Bars</span>
            </div>

            <div className="priority-columns py-2">
              {[
                ['Critical', 28, '#ff5d68'],
                ['High', 64, '#ff9a4b'],
                ['Medium', 106, '#f6d365'],
                ['Low', 82, '#35f5a1'],
              ].map(([name, count, color]) => (
                <div key={String(name)} className="group relative">
                  <span className="font-mono text-xs font-bold text-ink">{count}</span>
                  <i
                    className="rounded-t-lg transition-all duration-300 group-hover:scale-105 group-hover:brightness-125"
                    style={{
                      height: `${Number(count) * 1.5}px`,
                      background: `linear-gradient(${color}, transparent)`,
                      boxShadow: `0 0 16px -4px ${color}80`,
                    }}
                  />
                  <b className="text-xs">{name}</b>
                </div>
              ))}
            </div>
            <p className="distribution-note mt-4 text-center text-xs text-soft">
              Interactive 3D elevation reflects district urgency tiers across India.
            </p>
          </div>

          {/* Right: 3D Elevated Pie Chart of Charger Power & Speed Mix */}
          <div className="rounded-2xl border border-line bg-[var(--surface)] p-6 lg:col-span-6">
            <Pie3D title={t('dash_power_mix', lang)} />
          </div>
        </div>
      </section>
    </section>
  )
}
