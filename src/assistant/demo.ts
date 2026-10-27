import type { AssistantEvent } from './types'

const DISTRICTS: [string, string, number, number][] = [
  ['Lucknow', 'Critical', 82.4, 141],
  ['Gautam Buddha Nagar', 'Critical', 79.8, 88],
  ['Ghaziabad', 'High', 68.2, 24],
  ['Kanpur Nagar', 'High', 61.5, 21],
  ['Varanasi', 'Medium', 51.3, 17],
  ['Prayagraj', 'Medium', 47.9, 15],
  ['Agra', 'Medium', 44.2, 14],
  ['Meerut', 'Low', 36.8, 11],
  ['Bareilly', 'Low', 31.5, 9],
  ['Gorakhpur', 'Low', 27.1, 7],
]

const table = (rows: [string, string, number, number][]) =>
  '| Rank | District | Priority | Gap Score | Additional Chargers Needed |\n|---|---|---|---|---|\n' +
  rows.map((r, i) => `| ${i + 1} | ${r[0]} | ${r[1]} | ${r[2]} | +${r[3]} |`).join('\n')

export interface DemoAnswer {
  text: string
  sources: string[]
  notes: string[]
}

const FORMULA = `**Gap Score** is a standardized 0–100 index; higher values indicate a severe mismatch between EV charging demand and public supply.

\`\`\`
Gap Score = 100 × [ 0.45 × N(EVs per charger)
                  + 0.25 × (1 - Coverage Score)
                  + 0.20 × N(Demand Context)
                  + 0.10 × N(Corridor Deficit) ]
\`\`\`

- **N(.)**: Normalizes metrics to a 0–1 scale against national benchmark maximums.
- **Coverage Score**: Share of the administrative area or corridor length served by accessible public chargers (0–1).
- **Demand Context**: Composite weighting of commercial vehicle fleet density, urban transit nodes, and passenger vehicle adoption.
- **Corridor Deficit**: Intercity corridor gaps along National and State Highway networks exceeding 25 km intervals.`

export function demoAnswer(q: string): DemoAnswer {
  const t = q.toLowerCase()
  const has = (...k: string[]) => k.some((x) => t.includes(x))
  const dist = DISTRICTS.find((d) => t.includes(d[0].toLowerCase()))

  if (has('formula', 'explain the gap', 'how is gap', 'what is gap score')) {
    return {
      text: FORMULA,
      sources: ['APP_METHODOLOGY', 'NITI_AAYOG_EV_HANDBOOK'],
      notes: ['Derived from national EV infrastructure planning methodology.'],
    }
  }

  if (has('highest gap', 'top district', 'worst') || (has('which district') && has('gap'))) {
    const [d] = DISTRICTS
    return {
      text: `**${d[0]}** has the highest Gap Score (**${d[2]}**, ${d[1]} Priority) in the benchmark analysis, requiring an estimated **+${d[3]} additional charging points** to reach the target ratio of 100 EVs per public point.\n\n### Top Underserved Districts\n\n${table(DISTRICTS.slice(0, 4))}\n\nHigh-density urban corridors and commercial transit hubs account for over 60% of this deficit.`,
      sources: ['DISTRICT_ANALYTICS', 'VAHAN_DATABASE', 'BEE_EV_YATRA'],
      notes: ['Ranked by Gap Score descending; benchmarked against target of 100 EVs/charger.'],
    }
  }

  if (has('2029', 'forecast', 'estimate charging demand', 'demand by 2029')) {
    return {
      text: `### EV Infrastructure Demand Forecast (2026–2029 Horizon)\n\nBased on national VAHAN registration trajectories and NITI Aayog electrification roadmaps (projected 18% compound annual growth rate):\n\n- **Current EV Population (Benchmark State)**: ~286,400 EVs\n- **Projected 2029 EV Population**: ~466,900 EVs (~1.63× expansion)\n- **Target Ratio**: 100 EVs per public charging point\n- **Required Public Points Today**: 2,864 points\n- **Existing Operational Public Points**: 2,175 points\n- **Immediate Current Gap**: **+689 points**\n- **Total Required Points by 2029**: **4,669 points**\n- **Additional Points to Deploy by 2029**: **+2,494 new points**\n\n### Recommended Deployment Phasing\n1. **Phase 1 (Immediate)**: Deploy 689 high-capacity fast DC chargers (≥60 kW) in Critical districts.\n2. **Phase 2 (2027-2028)**: Expand corridor fast-charging hubs every 25 km along NH-27, NH-19, and NH-44.\n3. **Phase 3 (2029)**: Municipal AC Type 2 workplace and residential overnight hubs.`,
      sources: ['NITI_AAYOG_FORECAST', 'VAHAN_PORTAL', 'CHARGER_ESTIMATOR_MODEL'],
      notes: ['Assumes 18% CAGR and 100 EVs/charger target.'],
    }
  }

  if (has('compare evs', 'evs per charging point', 'evs per point', 'across districts')) {
    return {
      text: `### District EV Concentration vs. Charging Point Comparison\n\n| District | Registered EVs | Public Chargers | EVs per Point | Benchmark Status |\n|---|---|---|---|---|\n| Lucknow | 34,280 | 186 | **184.3** | Critical Deficit (Target: 100) |\n| Gautam Buddha Nagar | 38,400 | 240 | **160.0** | Critical Deficit |\n| Kanpur Nagar | 22,100 | 148 | **149.3** | High Deficit |\n| Ghaziabad | 25,600 | 182 | **140.7** | High Deficit |\n| Varanasi | 16,400 | 134 | **122.4** | Moderate Deficit |\n| Prayagraj | 14,200 | 120 | **118.3** | Moderate Deficit |\n| Agra | 15,800 | 162 | **97.5** | **Target Met** (Adequate) |\n\nDistricts with ratios exceeding 120 EVs per point experience peak-hour queuing and require accelerated DC fast-charger deployment.`,
      sources: ['VAHAN_DISTRICT_FEED', 'BEE_REGISTRY'],
      notes: ['Target ratio is 100 EVs per public charging point.'],
    }
  }

  if (has('highway', 'corridor', 'nh-', 'sh-', 'gaps')) {
    return {
      text: `### Highway Corridor Charging Gap Analysis\n\nIntercity transit corridors require continuous charging availability to eliminate range anxiety:\n\n- **NH-27 (Lucknow–Ayodhya Corridor, 157 km)**:\n  - Existing stations: **14**\n  - Coverage share: **43%**\n  - Critical unserved gap: **km 42 to km 78** (36 km unserved gap)\n  - Recommendation: Deploy 2 dual-gun 120 kW CCS2 hubs at km 55 and km 110.\n- **SH-25 (Lucknow–Hardoi Corridor, 114 km)**:\n  - Existing stations: **7**\n  - Coverage share: **32%**\n  - Critical gap: **km 35 to km 75**\n- **NH-19 (Delhi–Agra–Kanpur Expressway)**:\n  - Fast DC coverage is currently concentrated around toll plazas; intermediate wayside stops require dedicated heavy EV commercial charging.`,
      sources: ['NHAI_GIS_DATA', 'OPEN_CHARGE_MAP', 'CORRIDOR_INTELLIGENCE'],
      notes: ['Evaluated against the national standard of 1 fast charging station every 25 km.'],
    }
  }

  if (has('underserved', 'priority', 'rank', 'deficit')) {
    return {
      text: `### Priority Ranking of Underserved Districts\n\n${table(DISTRICTS)}\n\n**Action Plan**: Allocations should prioritize Critical districts (Lucknow and Gautam Buddha Nagar) first, which combined require over 220 additional public charging points.`,
      sources: ['DASHBOARD_SAMPLE', 'STATE_EV_POLICY'],
      notes: ['Score normalized on 0-100 scale.'],
    }
  }

  if (dist) {
    return {
      text: `### District Profile: **${dist[0]}**\n\n- **Priority Tier**: **${dist[1]}**\n- **Gap Score**: **${dist[2]} / 100**\n- **Additional Chargers Required**: **+${dist[3]} points**\n- **Recommended Allocation**:\n  - 40% Commercial Transit & City Center Hubs (+${Math.round(dist[3] * 0.4)} pts)\n  - 22% Logistics & Transport Nagar (+${Math.round(dist[3] * 0.22)} pts)\n  - 18% Highway-adjacent corridor hubs (+${Math.round(dist[3] * 0.18)} pts)\n  - 20% Multimodal transit stations & public hospitals (+${Math.round(dist[3] * 0.2)} pts)`,
      sources: ['DISTRICT_INTELLIGENCE_BASE'],
      notes: ['Figures customized for selected planning district.'],
    }
  }

  if (has('analyze', 'csv', 'file', 'upload')) {
    return {
      text: [
        '### District CSV & Dataset Ingestion Guide',
        '',
        'To profile your custom district dataset:',
        '',
        '1. **Required Columns**:',
        '   - `District` (or `State_UT`)',
        '   - `Registered_EVs` (number of registered electric vehicles)',
        '   - `Public_Chargers` (number of functional public charge points)',
        '   - *Optional*: `Fast_Chargers`, `Latitude`, `Longitude`',
        '2. **Upload**: Use the paperclip icon in this chat composer to attach your `.csv` or `.xlsx` file.',
        '3. **Automated Pipeline**: The system verifies coordinates against Indian territorial boundaries, calculates the normalized Gap Score, and outputs a downloadable priority report.',
      ].join('\n'),
      sources: ['DATA_INGESTION_SPEC', 'PIPELINE_DOCUMENTATION'],
      notes: ['Supports standard CSV and Excel formats up to 25 MB.'],
    }
  }

  if (has('source', 'vahan', 'bee', 'open charge', 'cpo', 'gis', 'methodology')) {
    return {
      text: `### Integrated Data Architecture\n\nThe platform unifies five authoritative data pipelines:\n\n1. **VAHAN / Parivahan (MoRTH)**: State and district EV vehicle registration statistics across 2W, 3W, 4W, and commercial categories.\n2. **BEE EV Yatra (Bureau of Energy Efficiency)**: Verified operational public charging stations, EVSE counts, connector standards, and power ratings.\n3. **Open Charge Map**: Open international registry for crowdsourced validation and real-time community reports.\n4. **CPO Direct Feeds (OCPI APIs)**: Live telemetry from major Charge Point Operators (Tata Power, Statiq, Jio-bp, ChargeZone) for real-time connector availability.\n5. **Government GIS Layers (Survey of India / NHAI)**: Authoritative state/district administrative borders and national highway corridor geometries.`,
      sources: ['NATIONAL_PORTAL_REGISTRY', 'CENTRAL_ELECTRICITY_AUTHORITY'],
      notes: ['All data normalized and refreshed on scheduled sync intervals.'],
    }
  }

  if (has('scale', 'adapter', 'nationally', 'new cpo')) {
    return {
      text: `### Scaling the Platform Nationally\n\nTo onboard new states or CPO adapters:\n\n1. **Adapter Registry**: Implement the standardized \`CpoAdapter\` interface with \`fetch()\` and \`normalize()\` methods.\n2. **Schema Mapping**: Harmonize connector protocols (CCS2, Type 2, GB/T, Bharat DC-001) into the canonical charging schema.\n3. **Spatial Deduplication**: 75-meter Haversine deduplication merges duplicate listings across BEE and CPO feeds.\n4. **Database Tier**: Scale to PostgreSQL + PostGIS for spatial indexing across all 780+ Indian districts and 140,000+ km of national highways.`,
      sources: ['SYSTEM_ARCHITECTURE_GUIDE'],
      notes: ['Designed for cloud-native zero-downtime scalability.'],
    }
  }

  return {
    text: `### ChargeGrid India EV Infrastructure Intelligence\n\nHere are some of the key areas I can analyze for you:\n\n- **Gap Score Calculation**: Explain the weighted 4-factor formula for district prioritization.\n- **Underserved Districts**: Identify which districts have the highest EV-to-charger deficit.\n- **Demand Forecasting**: Estimate charger requirements through 2029 based on growth rates.\n- **Highway Corridor Gaps**: Review charging gaps along NH-27, NH-19, and major intercity routes.\n- **Data Architecture**: Explain how VAHAN, BEE, and CPO APIs are integrated.\n\n*Click one of the suggestions above or ask about a specific district or corridor!*`,
    sources: ['NATIONAL_EV_REPOSITORY'],
    notes: ['Live assistant active.'],
  }
}

export async function* demoStream(q: string): AsyncGenerator<AssistantEvent> {
  const a = demoAnswer(q)
  for (const part of a.text.match(/\S+\s*|\n+/g) ?? []) {
    await new Promise((r) => setTimeout(r, 10))
    yield { event: 'token', text: part }
  }
  yield {
    event: 'source',
    sources: a.sources,
    data_quality: 'OK',
    notes: a.notes,
  }
  yield { event: 'done' }
}
