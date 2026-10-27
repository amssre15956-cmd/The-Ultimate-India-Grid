import { useEffect, useState } from 'react'
import { Icon } from './icons'
import IndiaMap from './IndiaMap'
import Chatbot from './Chatbot'
import Methodology from './Methodology'
import Estimator from './Estimator'
import DecisionDashboard from './DecisionDashboard'
import DataScalability from './DataScalability'
import { Bars, CountUp, Donut, Heatmap, Line } from './Charts'
import { t, type Language } from './translations'
import { ttsService } from './tts'

const MODULES = [
  { id: 'map', icon: 'map', title: 'National GIS Map', desc: 'Explore charger locations, availability, and regional coverage across India.', frame: 'Frame 01 · GIS Map', key: 'mod_map' as const },
  { id: 'dash', icon: 'dash', title: 'Decision Dashboard', desc: 'Compare districts, analyze gaps, and prioritize infrastructure investments.', frame: 'Frame 02 · Dashboard', key: 'mod_dash' as const },
  { id: 'estimate', icon: 'calc', title: 'Charger Estimator', desc: 'Estimate current and future charger requirements using demand and growth indicators.', frame: 'Frame 03 · Estimation', key: 'mod_est' as const },
  { id: 'method', icon: 'doc', title: 'Methodology', desc: 'Understand the data sources, models, assumptions, and estimation approach.', frame: 'Frame 04 · Methodology', key: 'mod_meth' as const },
  { id: 'scale', icon: 'scale', title: 'Data & Scalability', desc: 'Model how the charging network can expand with EV adoption and traffic growth.', frame: 'Frame 05 · Scalability', key: 'mod_scale' as const },
]

const SIDEBAR_KEYS = ['mod_map_title', 'mod_dash_title', 'mod_est_title', 'mod_meth_title', 'mod_scale_title'] as const
const LANGS: Language[] = ['English', 'हिन्दी', 'தமிழ்', 'తెలుగు', 'বাংলা', 'मराठी', 'ગુજરાતી', 'ಕನ್ನಡ', 'മലയാളം', 'ਪੰਜਾਬੀ']
const NAV = ['Platform', 'Data', 'Methodology', 'Dashboard', 'Insights']
type Theme = 'light' | 'dark' | 'dynamic'
const THEMES: { id: Theme; label: string; bg: string }[] = [
  { id: 'light', label: 'Light mode', bg: 'linear-gradient(135deg,#fff,#cfeee3)' },
  { id: 'dark', label: 'Dark mode', bg: 'linear-gradient(135deg,#0b1220,#1b2a46)' },
  { id: 'dynamic', label: 'Dynamic mode', bg: 'conic-gradient(#2a1060,#05605f,#4dffb0,#0a2a6e,#2a1060)' },
]

const PARTICLES = Array.from({ length: 28 }, (_, i) => ({ l: (i * 37) % 100, t: 30 + ((i * 53) % 70), d: 6 + (i % 5) * 2, s: 2 + (i % 3), delay: (i % 9) * -1.1 }))

export default function App() {
  const [theme, setTheme] = useState<Theme>('dark')
  const [sidebar, setSidebar] = useState(true)
  const [active, setActive] = useState(0)
  const [lang, setLang] = useState<Language>('English')
  const [langOpen, setLangOpen] = useState(false)
  const [tts, setTts] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [view, setView] = useState<'home' | 'method' | 'estimate' | 'dash' | 'scale'>('home')

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  useEffect(() => {
    if (window.innerWidth < 1024) setSidebar(false)
  }, [])

  useEffect(() => {
    if (!toast) return
    const tTimer = setTimeout(() => setToast(null), 2600)
    return () => clearTimeout(tTimer)
  }, [toast])

  // Cancel speech on unmount
  useEffect(() => {
    return () => ttsService.stop()
  }, [])

  const toggleTts = () => {
    if (tts) {
      ttsService.stop()
      setTts(false)
    } else {
      let speechText = ''
      if (view === 'dash') {
        speechText = `${t('dash_title', lang)}. ${t('dash_sub', lang)}`
      } else if (view === 'estimate') {
        speechText = `${t('est_title', lang)}. ${t('est_sub', lang)}`
      } else if (view === 'method') {
        speechText = `${t('mod_meth_title', lang)}. ${t('mod_meth_desc', lang)}`
      } else if (view === 'scale') {
        speechText = `${t('mod_scale_title', lang)}. ${t('mod_scale_desc', lang)}`
      } else {
        speechText = `ChargeGrid India. ${t('hero_h1_pre', lang)} ${t('hero_h1_grad', lang)}. ${t('hero_p', lang)}`
      }

      ttsService.speak(
        speechText,
        lang,
        () => setTts(true),
        () => setTts(false),
      )
    }
  }

  const go = (i: number) => {
    setActive(i)
    ttsService.stop()
    setTts(false)

    if (i === 0) {
      setView('home')
      setToast(null)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    if (i === 1) {
      setView('dash')
      setToast(null)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    if (i === 2) {
      setView('estimate')
      setToast(null)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    if (i === 3) {
      setView('method')
      setToast(null)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    if (i === 4) {
      setView('scale')
      setToast(null)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    setView('home')
  }

  return (
    <div className="min-h-screen">
      <div className="app-bg" aria-hidden="true" />
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-brand focus:px-4 focus:py-2 focus:text-[var(--on-green)]">
        {t('skip_content', lang)}
      </a>

      {/* NAV */}
      <header className="glass fixed inset-x-0 top-0 z-40 flex h-16 items-center gap-3 rounded-none border-x-0 border-t-0 px-4 lg:px-6" style={{ background: 'var(--surface-strong)' }}>
        <button onClick={() => setSidebar((s) => !s)} aria-label={sidebar ? 'Collapse sidebar' : 'Expand sidebar'} aria-expanded={sidebar} className="hover-glow grid h-10 w-10 place-items-center rounded-xl border border-line">
          <Icon name="menu" />
        </button>
        <a href="#top" onClick={() => { setView('home'); setActive(0) }} className="flex items-center gap-2.5" aria-label="ChargeGrid India home">
          <span className="grid h-9 w-9 place-items-center rounded-xl text-[var(--on-green)]" style={{ background: 'linear-gradient(135deg,var(--green),var(--cyan))', boxShadow: '0 0 20px var(--glow)' }}>
            <Icon name="bolt" size={20} />
          </span>
          <span className="font-display text-lg font-bold leading-none">
            ChargeGrid<span className="text-grad"> {t('brand_sub', lang)}</span>
          </span>
        </a>
        <nav className="ml-6 hidden items-center gap-1 xl:flex" aria-label="Main">
          {NAV.map((n) => (
            <a
              key={n}
              href="#top"
              onClick={(e) => {
                e.preventDefault()
                if (n === 'Methodology') go(3)
                else if (n === 'Dashboard') go(1)
                else if (n === 'Data') go(4)
                else if (n === 'Platform') go(0)
                else go(0)
              }}
              className="hover-glow rounded-lg border border-transparent px-3.5 py-2 text-sm font-medium text-soft"
            >
              {n === 'Platform' ? t('nav_platform', lang) :
               n === 'Data' ? t('nav_data', lang) :
               n === 'Methodology' ? t('nav_method', lang) :
               n === 'Dashboard' ? t('nav_dashboard', lang) :
               n === 'Insights' ? t('nav_insights', lang) : n}
            </a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <div className={`flex items-center overflow-hidden rounded-xl border border-line transition-all duration-300 ${searchOpen ? 'w-44 bg-[var(--surface)] md:w-56' : 'w-10 border-transparent'}`}>
            <button onClick={() => setSearchOpen((s) => !s)} aria-label="Search" className="hover-glow grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-line">
              <Icon name="search" />
            </button>
            {searchOpen && (
              <input
                autoFocus
                aria-label="Search states, cities, reports"
                placeholder={t('search_placeholder', lang)}
                className="w-full bg-transparent px-2 text-sm text-ink placeholder:text-soft"
              />
            )}
          </div>

          {/* LANGUAGE SELECTOR */}
          <div className="relative hidden sm:block">
            <button
              onClick={() => setLangOpen((o) => !o)}
              aria-label="Select language"
              aria-haspopup="listbox"
              aria-expanded={langOpen}
              className="hover-glow flex h-10 items-center gap-1.5 rounded-xl border border-line px-3 text-sm font-medium"
            >
              <Icon name="globe" size={18} />
              <span className="hidden md:inline">{lang}</span>
              <Icon name="chevron" size={14} />
            </button>
            {langOpen && (
              <ul role="listbox" aria-label="Languages" className="glass rise absolute right-0 top-12 z-50 w-48 rounded-2xl p-1.5 shadow-2xl" style={{ background: 'var(--surface-strong)' }}>
                {LANGS.map((l) => (
                  <li key={l} role="option" aria-selected={l === lang}>
                    <button
                      onClick={() => {
                        setLang(l)
                        setLangOpen(false)
                        ttsService.stop()
                        setTts(false)
                      }}
                      className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition hover:bg-brand/15 hover:pl-4"
                    >
                      <span>{l}</span>
                      {l === lang && <Icon name="check" size={14} className="text-brand" />}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* THEME TOGGLE */}
          <div className="flex items-center gap-1.5 rounded-full border border-line p-1" role="radiogroup" aria-label="Theme">
            {THEMES.map((tItem) => (
              <button
                key={tItem.id}
                role="radio"
                aria-checked={theme === tItem.id}
                aria-label={tItem.label}
                title={tItem.label}
                onClick={() => setTheme(tItem.id)}
                className={`h-6 w-6 rounded-full border border-line transition hover:scale-125 ${
                  theme === tItem.id ? 'ring-2 ring-brand ring-offset-2 ring-offset-[var(--bg)]' : ''
                }`}
                style={{ background: tItem.bg }}
              />
            ))}
          </div>

          {/* TEXT TO SPEECH (SPEAKER BUTTON) */}
          <button
            onClick={toggleTts}
            aria-pressed={tts}
            aria-label={tts ? t('tts_stop', lang) : t('tts_listen', lang)}
            title={tts ? t('tts_stop', lang) : t('tts_listen', lang)}
            className={`hover-glow flex h-10 items-center gap-2 rounded-xl border px-3 transition-all ${
              tts ? 'border-brand bg-brand/15 text-brand shadow-[0_0_16px_var(--glow)]' : 'border-line'
            }`}
          >
            <Icon name="speaker" size={18} />
            {tts && (
              <span className="flex h-4 items-center gap-0.5" aria-label="Reading aloud">
                {[0, 1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className="h-full w-0.5 origin-center scale-y-[0.3] rounded bg-current"
                    style={{ animation: `wave ${0.7 + i * 0.12}s ease-in-out infinite` }}
                  />
                ))}
              </span>
            )}
          </button>

          <button onClick={() => go(0)} className="btn-primary hidden h-10 items-center gap-2 rounded-xl px-4 text-sm lg:flex">
            {t('nav_explore_map', lang)}<Icon name="arrow" size={16} />
          </button>
        </div>
      </header>

      {/* SIDEBAR - Renumbered 01 to 05 without Overview */}
      <aside
        aria-label="Primary sections"
        className={`glass fixed bottom-0 left-0 top-16 z-30 w-72 overflow-y-auto rounded-none border-b-0 border-l-0 border-t-0 p-4 transition-transform duration-500 ease-[cubic-bezier(.2,.8,.2,1)] ${
          sidebar ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ background: 'var(--surface-strong)' }}
      >
        <p className="mono-label mb-3 px-2">{t('sidebar_sections', lang)}</p>
        <ul className="space-y-1.5">
          {MODULES.map((m, i) => (
            <li key={m.id}>
              <button
                onClick={() => go(i)}
                aria-current={active === i}
                className={`group flex w-full items-center gap-3 rounded-xl border p-3 text-left text-sm font-medium transition-all duration-300 hover:translate-x-1 hover:scale-[1.02] hover:border-brand hover:shadow-[0_0_24px_-6px_var(--glow)] ${
                  active === i ? 'border-brand bg-brand/10' : 'border-transparent'
                }`}
              >
                <span
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg transition ${
                    active === i ? 'text-[var(--on-green)]' : 'bg-[var(--surface)] text-brand group-hover:bg-brand/20'
                  }`}
                  style={active === i ? { background: 'linear-gradient(135deg,var(--green),var(--cyan))' } : undefined}
                >
                  <Icon name={m.icon} size={18} />
                </span>
                <span className="flex-1 leading-snug">
                  <span className="font-mono text-[10px] text-soft">0{i + 1}</span>
                  <br />
                  {t(SIDEBAR_KEYS[i], lang)}
                </span>
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-6 rounded-2xl border border-line p-4" style={{ background: 'linear-gradient(160deg,color-mix(in srgb,var(--violet) 18%,transparent),transparent)' }}>
          <p className="mono-label">{t('sidebar_refreshed', lang)}</p>
          <p className="mt-1 font-display text-sm font-semibold">27 Oct 2026 · 10:00 IST</p>
          <p className="mt-2 text-xs text-soft">VAHAN &amp; BEE station telemetry feeds synced.</p>
        </div>
      </aside>

      <main id="main" className={`transition-[padding] duration-500 ease-[cubic-bezier(.2,.8,.2,1)] ${sidebar ? 'lg:pl-72' : ''}`}>
        {view === 'method' ? (
          <Methodology onBack={() => { setView('home'); setActive(0); window.scrollTo({ top: 0 }) }} />
        ) : view === 'estimate' ? (
          <Estimator lang={lang} onBack={() => { setView('home'); setActive(0); window.scrollTo({ top: 0 }) }} />
        ) : view === 'dash' ? (
          <DecisionDashboard lang={lang} onMap={() => { setView('home'); setActive(0); window.scrollTo({ top: 0, behavior: 'smooth' }) }} />
        ) : view === 'scale' ? (
          <DataScalability />
        ) : (
          <>
            {/* HERO */}
            <section id="top" className="relative px-6 pb-16 pt-32 lg:px-10">
              <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
                {[18, 52, 80].map((l, i) => (
                  <div key={l} className="absolute top-0 h-[70%] w-24 -skew-x-12" style={{ left: l + '%', background: 'linear-gradient(var(--cyan), transparent)', opacity: 0.12, filter: 'blur(24px)', animation: `beam ${5 + i}s ease-in-out infinite` }} />
                ))}
                {PARTICLES.map((p, i) => (
                  <span key={i} className="absolute rounded-full bg-brand" style={{ left: p.l + '%', top: p.t + '%', width: p.s, height: p.s, boxShadow: '0 0 8px var(--green)', animation: `drift ${p.d}s linear ${p.delay}s infinite` }} />
                ))}
              </div>

              <div className="relative mx-auto grid max-w-[1320px] items-center gap-10 xl:grid-cols-12">
                <div className="xl:col-span-5">
                  {/* Removed 'BETA' tag per request */}
                  <p className="rise mono-label mb-6 inline-flex items-center gap-2 rounded-full border border-line px-3 py-1.5" style={{ background: 'var(--surface)' }}>
                    {t('hero_tag', lang)}
                  </p>
                  <h1 className="rise text-[clamp(2.4rem,4.6vw,4.2rem)] font-bold leading-[1.04]" style={{ animationDelay: '.1s' }}>
                    {t('hero_h1_pre', lang)} <span className="text-grad">{t('hero_h1_grad', lang)}</span>
                  </h1>
                  <p className="rise mt-6 max-w-xl text-lg leading-relaxed text-soft" style={{ animationDelay: '.2s' }}>
                    {t('hero_p', lang)}
                  </p>
                  <div className="rise mt-9 flex flex-wrap gap-4" style={{ animationDelay: '.3s' }}>
                    <button onClick={() => go(0)} className="btn-primary flex items-center gap-2 rounded-2xl px-6 py-3.5">
                      {t('btn_open_map', lang)}<Icon name="arrow" size={18} />
                    </button>
                    {/* View Methodology directly jumps to Methodology */}
                    <button onClick={() => go(3)} className="btn-ghost rounded-2xl px-6 py-3.5">
                      {t('btn_view_method', lang)}
                    </button>
                  </div>
                  <dl className="rise mt-12 flex flex-wrap gap-x-10 gap-y-4 border-t border-line pt-6" style={{ animationDelay: '.4s' }}>
                    {[
                      [t('policymakers', lang), t('policymakers_sub', lang)],
                      [t('fleets', lang), t('fleets_sub', lang)],
                      [t('citizens', lang), t('citizens_sub', lang)],
                    ].map(([a, b]) => (
                      <div key={a}>
                        <dt className="font-display text-sm font-semibold">{a}</dt>
                        <dd className="text-xs text-soft">{b}</dd>
                      </div>
                    ))}
                  </dl>
                </div>

                <div className="relative xl:col-span-7">
                  <IndiaMap />
                  <FloatCard className="left-0 top-[6%]" label={t('active_chargers', lang)} delay="0s">
                    <CountUp to={32480} /><Delta v="+12.4% QoQ" />
                  </FloatCard>
                  <FloatCard className="right-0 top-[10%]" label={t('states_covered', lang)} delay="-1.5s">
                    <CountUp to={34} /><span className="text-base text-soft"> / 36</span><Progress p={94} />
                  </FloatCard>
                  <FloatCard className="bottom-[16%] left-0" label={t('coverage_gap', lang)} delay="-3s" tone="violet">
                    <CountUp to={27.6} decimals={1} suffix="%" /><Progress p={28} violet />
                  </FloatCard>
                  <FloatCard className="bottom-[8%] right-0" label={t('fast_charging_avail', lang)} delay="-4.5s">
                    <CountUp to={61.3} decimals={1} suffix="%" /><Progress p={61} />
                  </FloatCard>
                </div>
              </div>
            </section>

            {/* LIVE PREVIEW */}
            <section className="px-6 py-16 lg:px-10" aria-labelledby="preview-h">
              <div className="mx-auto max-w-[1320px]">
                <SectionHead kicker={t('live_preview_kicker', lang)} id="preview-h" title={t('live_preview_title', lang)} />
                <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-6 xl:grid-cols-12">
                  <Panel className="md:col-span-6 xl:col-span-5" title={t('chart_fast_coverage', lang)} sub={t('chart_fast_sub', lang)}>
                    <Bars data={[['AS', 12], ['BR', 15], ['OD', 18], ['JH', 24], ['UP', 33], ['RJ', 42], ['KA', 61], ['MH', 72]]} />
                  </Panel>
                  <Panel className="md:col-span-3 xl:col-span-3" title={t('chart_status', lang)} sub={t('chart_status_sub', lang)}>
                    <Donut parts={[{ label: 'Operational', v: 78, color: 'var(--green)' }, { label: 'In use', v: 14, color: 'var(--cyan)' }, { label: 'Offline', v: 8, color: 'var(--violet)' }]} />
                  </Panel>
                  <Panel className="md:col-span-3 xl:col-span-4" title={t('chart_installations', lang)} sub={t('chart_installations_sub', lang)}>
                    <Line data={[820, 910, 1040, 980, 1180, 1320, 1290, 1480, 1560, 1710, 1650, 1890]} />
                  </Panel>
                  <Panel className="md:col-span-6 xl:col-span-12" title={t('chart_heatmap', lang)} sub={t('chart_heatmap_sub', lang)}>
                    <Heatmap />
                  </Panel>
                </div>
              </div>
            </section>

            {/* 5 MODULES (Overview removed) */}
            <section className="px-6 py-16 lg:px-10" aria-labelledby="mod-h">
              <div className="mx-auto max-w-[1320px]">
                <SectionHead kicker={t('modules_kicker', lang)} id="mod-h" title={t('modules_title', lang)} />
                <ul className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {MODULES.map((m, i) => (
                    <li key={m.id}>
                      <button
                        onClick={() => go(i)}
                        className="glass lift group relative h-full w-full overflow-hidden rounded-3xl p-7 text-left"
                        style={{ animation: `rise .8s ${i * 0.08}s both` }}
                      >
                        <span
                          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                          style={{
                            background:
                              'radial-gradient(60% 80% at 100% 0%, color-mix(in srgb,var(--green) 20%, transparent), transparent), radial-gradient(60% 80% at 0% 100%, color-mix(in srgb,var(--violet) 18%, transparent), transparent)',
                          }}
                        />
                        <span className="relative flex items-start justify-between">
                          <span
                            className="grid h-14 w-14 place-items-center rounded-2xl border border-line text-brand transition duration-500 group-hover:rotate-6 group-hover:scale-110 group-hover:text-[var(--on-green)]"
                            style={{ background: 'var(--surface)' }}
                          >
                            <Icon name={m.icon} size={26} />
                          </span>
                          <span className="font-mono text-xs text-soft">0{i + 1}</span>
                        </span>
                        <h3 className="relative mt-6 text-xl font-semibold">{t(`${m.key}_title` as any, lang)}</h3>
                        <p className="relative mt-2 leading-relaxed text-soft">{t(`${m.key}_desc` as any, lang)}</p>
                        <span className="relative mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand">
                          Explore<Icon name="arrow" size={16} className="transition-transform duration-300 group-hover:translate-x-2" />
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          </>
        )}

        {/* FOOTER */}
        <footer className="mt-10 border-t border-line px-6 py-14 lg:px-10" style={{ background: 'var(--surface)' }}>
          <div className="mx-auto grid max-w-[1320px] gap-10 md:grid-cols-2 xl:grid-cols-12">
            <div className="xl:col-span-4">
              <p className="font-display text-xl font-bold">ChargeGrid<span className="text-grad"> {t('brand_sub', lang)}</span></p>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-soft">
                National EV infrastructure intelligence layer for charger availability, gap score analysis, demand modeling, and network expansion.
              </p>
            </div>
            <FooterCol
              cls="xl:col-span-2"
              title="Quick links"
              items={['National GIS Map', 'Decision Dashboard', 'Charger Estimator', 'Methodology', 'Data & Scalability']}
              onItemClick={(item) => {
                if (item === 'National GIS Map') go(0)
                else if (item === 'Decision Dashboard') go(1)
                else if (item === 'Charger Estimator') go(2)
                else if (item === 'Methodology') go(3)
                else if (item === 'Data & Scalability') go(4)
              }}
            />
            <FooterCol cls="xl:col-span-2" title="Data sources" items={['Ministry of Power', 'BEE / EESL', 'VAHAN registrations', 'OpenStreetMap', 'State DISCOM feeds']} />
            <FooterCol cls="xl:col-span-2" title="Contact" items={['contact@chargegrid.gov.in', 'Research & Whitepapers', 'Data Contribution']} />
            <FooterCol cls="xl:col-span-2" title="Accessibility" items={['Web Speech Narration', '10 Indian Languages', 'High-Contrast Theme', 'Keyboard Navigation']} />
          </div>
          <p className="mx-auto mt-12 max-w-[1320px] border-t border-line pt-6 text-xs text-soft">
            © 2026 ChargeGrid India. Built with open standards and verified national EV infrastructure datasets.
          </p>
        </footer>
      </main>

      {/* Persistent Floating Chatbot */}
      <Chatbot key={view === 'scale' ? 'scale' : 'default'} context={view === 'scale' ? 'scale' : undefined} />

      {toast && (
        <div role="status" className="glass rise fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-2xl px-5 py-3 text-sm" style={{ background: 'var(--surface-strong)', borderColor: 'var(--green)' }}>
          <span className="grid h-6 w-6 place-items-center rounded-full bg-brand text-[var(--on-green)]"><Icon name="arrow" size={14} /></span>{toast}
        </div>
      )}
    </div>
  )
}

function SectionHead({ kicker, title, id }: { kicker: string; title: string; id: string }) {
  return (
    <div className="max-w-2xl">
      <p className="mono-label mb-3 text-brand">{kicker}</p>
      <h2 id={id} className="text-3xl font-bold leading-tight md:text-4xl">{title}</h2>
    </div>
  )
}

function Panel({ title, sub, className, children }: { title: string; sub: string; className: string; children: React.ReactNode }) {
  return (
    <article className={`glass lift rounded-3xl p-6 ${className}`}>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mb-5 text-xs text-soft">{sub}</p>
      {children}
    </article>
  )
}

function FloatCard({ label, className, delay, tone, children }: { label: string; className: string; delay: string; tone?: string; children: React.ReactNode }) {
  return (
    <div className={`absolute z-10 hidden w-44 sm:block ${className}`}>
      <div className="glass lift float rounded-2xl p-4" style={{ animationDelay: delay, background: 'var(--surface-strong)', borderColor: tone === 'violet' ? 'color-mix(in srgb,var(--violet) 50%, transparent)' : undefined }}>
        <p className="mono-label mb-1.5 !text-[10px]">{label}</p>
        <div className="font-display text-2xl font-bold">{children}</div>
      </div>
    </div>
  )
}

function Delta({ v }: { v: string }) {
  return <span className="mt-1 block font-mono text-xs font-medium text-brand">{v}</span>
}

function Progress({ p, violet }: { p: number; violet?: boolean }) {
  return (
    <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-[var(--line)]">
      <span className="block h-full origin-left rounded-full" style={{ width: p + '%', animation: 'rise 1.6s ease-out both', background: violet ? 'linear-gradient(90deg,var(--violet),var(--cyan))' : 'linear-gradient(90deg,var(--green),var(--cyan))' }} />
    </span>
  )
}

function FooterCol({ title, items, cls, onItemClick }: { title: string; items: string[]; cls: string; onItemClick?: (i: string) => void }) {
  return (
    <div className={cls}>
      <h3 className="mono-label mb-4 !font-mono">{title}</h3>
      <ul className="space-y-2.5 text-sm">
        {items.map((i) => (
          <li key={i}>
            <button
              onClick={() => onItemClick?.(i)}
              className="inline-block text-left text-soft transition hover:translate-x-1 hover:text-brand"
            >
              {i}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
