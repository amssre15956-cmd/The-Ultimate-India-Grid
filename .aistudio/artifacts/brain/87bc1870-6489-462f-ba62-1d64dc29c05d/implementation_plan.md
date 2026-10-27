# ChargeGrid India: Navigation, Multilingual Translation, 3D Analytics & Chatbot Enhancements

A comprehensive upgrade to ChargeGrid India to enable real interactive voice narration, full-site localization across 10 Indian languages, direct methodology navigation, refined sidebar indexing, expanded Portfolio Health analytics with a 3D elevated pie chart, responsive Estimator downloads and resets, and robust AI Chatbot operations.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following key decisions were confirmed through Phase 1 clarification:
> - **3D Elevated Pie Chart Metric**: Charger power and connector types breakdown (Ultra-Fast DC 150kW+, Fast DC 50-120kW, Fast AC Type 2 22kW, Destination AC 7.4kW) placed alongside the interactive Priority Distribution bar graph.
> - **Multilingual Localization Scope**: Comprehensive dictionary covering all UI labels, stats, navigation tabs, cards, estimator parameters, and user actions across 10 languages (English, हिन्दी, தமிழ், తెలుగు, বাংলা, मराठी, ગુજરાતી, ಕನ್ನಡ, മലയാളം, ਪੰਜਾਬੀ).
> - **Estimator Download Recommendation Format**: Clean, formatted CSV report containing district/corridor planning inputs, target ratios, forecast horizons, and location allocation recommendations downloaded directly to the user's local filesystem.

---

## 1. Overview & Core Concept

- **What It Does**: ChargeGrid India provides state and national policymakers, fleet operators, and energy planners with intelligent EV charging intelligence. This release adds interactive voice narration, comprehensive multi-language accessibility across 10 languages, direct navigation to methodology, an expanded Portfolio Health analytics suite featuring both 3D bar and elevated 3D pie charts, local CSV exports in the Estimator, a responsive scenario reset, and an improved AI assistant.
- **Target Audience / Persona**: State transport departments, charging point operators (CPOs), highway infrastructure planners, and EV fleet managers across India who require regional language access, accessibility features, and actionable scenario modeling.
- **Key Value**: Delivers complete accessibility for non-English speakers, transparent download capabilities for offline reporting, intuitive navigation, and high-fidelity 3D visual analytics without UI clutter.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Text-to-Speech (Speaker Option)**:
   - User clicks the speaker button in the top navigation bar.
   - The browser's native `speechSynthesis` engine initiates spoken audio of the active section's overview or key findings in a natural rate and pitch.
   - Animated waveform bars reflect active playback; clicking again immediately halts speech via `speechSynthesis.cancel()`.
   - Switching views updates speech to narrate the newly selected view.

2. **Multilingual Language Switching**:
   - User opens the language dropdown in the top bar and selects one of the 10 supported regional languages.
   - All navigation items, headings, metric cards, chart titles, interactive filters, estimator sliders, methodology chapters, and status badges translate seamlessly without reloading.

3. **Methodology Direct Navigation**:
   - User clicks "View Methodology" in the hero section or in the top navigation.
   - The interface switches view state directly to `method` and smoothly scrolls to the top of the methodology documentation without triggering placeholder toasts or navigating to the map.

4. **Expanded Portfolio Health with 3D Elevated Pie Chart**:
   - The outdated "National Coverage Lens" card is removed from the Decision Dashboard.
   - The "Portfolio Health" card expands into a full-width comparative analytics panel featuring two side-by-side 3D statistical tools:
     1. **Priority Distribution (3D Bar Graph)**: Extruded bars with hover elevation and district count indicators for Critical, High, Medium, and Low tiers.
     2. **Connector & Power Mix (3D Elevated Pie Chart)**: An isometric/3D circular visualization with individual elevated, pop-out wedge sections (Ultra-Fast DC, Fast DC, Type 2 AC, Destination AC) on hover, percentage readouts, and connector specs.

5. **Estimator Download & Responsive Reset**:
   - In the Charger Requirement Estimator, clicking "Download recommendation" instantly compiles a formatted CSV summary of the current district, scenario assumptions, required points today, forecast demand, and spatial allocations (`ChargeGrid_Recommendation_[Location]_[Timestamp].csv`) and triggers a browser download.
   - Clicking "Reset scenario" smoothly restores all parameters (mode to District, Lucknow, target to 100 EVs/charger, 3-year horizon, 18% growth, all EVs, corridor buffer/spacing) and displays a toast confirmation.

6. **AI Assistant Refinements**:
   - Launcher label updated to "EV Planning Assistant · National Knowledge Base".
   - Seamless question chip clicks that generate streaming token responses with official benchmark source attribution.
   - Audio query transcription and document/CSV parsing resilience.
   - Responsive session termination ("Exit") and clean session reset without unhandled error states.

### Visual Identity & Theme

- **Palette**: Neutral dark canvas (`--bg: #070d1a`), subtle frosted glass surfaces (`--surface: rgba(255,255,255,0.045)`), neon teal (`--green: #35f5a1`), cyan (`--cyan: #3fd8f5`), and royal violet (`--violet: #9b8cff`).
- **Typography**: Clean display sans (`Sora`) paired with `Inter` for body prose and `JetBrains Mono` with `tabular-nums` for data tables and calculations.
- **Anti-Slop Discipline**:
  - Removed "· Beta" and the pulsing decorative dot from the hero header, leaving a crisp, unboxed text badge: "National EV charger intelligence".
  - Sidebar modules cleanly numbered `01` to `05` with "Overview" removed.
  - Zero pill enclosures on static metadata; single-elevation depth on dashboard cards.

---

## 3. Key Product Decisions & Trade-Offs

### Decision 1: Browser-Native SpeechSynthesis vs Remote TTS Audio
- **Chosen Approach**: Use the standard Web Speech API (`window.speechSynthesis`) configured with locale-matching voices where available.
- **Why**: Zero network latency, instant start/pause/cancel, no dependency on external streaming servers or blocked mixed-content HTTP ports, fully compliant with browser security sandboxes.
- **Alternatives Considered**: Remote streaming audio via backend Piper TTS, which fails in sandboxes without active local Python runtime.

### Decision 2: Static Dictionary vs Runtime Machine Translation API
- **Chosen Approach**: Built-in comprehensive dictionary (`src/translations.ts`) covering all 10 Indian regional languages for all UI strings, metrics, and actions.
- **Why**: Instantaneous switching without network requests, guaranteed contextual accuracy for EV industry terms (e.g. VAHAN, charging points, corridor deficit, gap score), and total offline reliability.
- **Alternatives Considered**: Calling a third-party translation API on every state change, which introduces latency, API keys, and layout shifts.

### Decision 3: SVG/CSS 3D Elevated Pie Chart vs Heavy Canvas Library
- **Chosen Approach**: Custom SVG and CSS 3D perspective-transformed pie chart matching the exact aesthetic of `PumpScene` and `RankChart` in `decision-parts.tsx`.
- **Why**: Keeps bundle size minimal, preserves seamless Tailwind CSS styling and theme variables, and provides smooth hardware-accelerated hover elevation on each slice without loading heavy Three.js or D3 dependencies.

---

## 4. Technical Architecture & Data Strategy

### System Component Architecture

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                             ChargeGrid India Root                            │
└──────┬───────────────────────┬───────────────────────────────┬───────────────┘
       │                       │                               │
       ▼                       ▼                               ▼
┌──────────────┐       ┌───────────────┐               ┌───────────────┐
│ Header Nav   │       │ Active View   │               │ AI Assistant  │
│ - Speaker TTS│       │ 01 Map (Home) │               │ - SSE Stream  │
│ - 10-Lang Sel│       │ 02 Dashboard  │               │ - Voice Query │
│ - Theme      │       │ 03 Estimator  │               │ - Suggestions │
│ - Search     │       │ 04 Method     │               │ - File Parse  │
└──────────────┘       │ 05 Scale      │               └───────────────┘
                       └───────┬───────┘
                               │
               ┌───────────────┴───────────────┐
               ▼                               ▼
      ┌─────────────────┐             ┌─────────────────┐
      │DecisionDashboard│             │    Estimator    │
      │- Priority Rank  │             │- Scenario Sliders│
      │- Portfolio Health             │- CSV Export     │
      │  ├─ 3D Bar Graph              │- Scenario Reset │
      │  └─ 3D Pie Chart              │- Spatial Splits │
      └─────────────────┘             └─────────────────┘
```

### Module & Sidebar Re-Indexing

| Index | Identifier | Title | Target View |
|---|---|---|---|
| `01` | `map` | National GIS Map | `home` (Map frame) |
| `02` | `dash` | Decision Dashboard | `dash` |
| `03` | `estimate` | Charger Estimator | `estimate` |
| `04` | `method` | Methodology | `method` |
| `05` | `scale` | Data & Scalability | `scale` |

### State & Interactive Handlers

- **`lang` & `t(key, lang)`**: Shared state stored in `App.tsx` and propagated via context/props to all sections.
- **`tts` & `toggleTts()`**: Tracks speech synthesis state, reads active section text, and registers `window.speechSynthesis.onend`.
- **`exportRecommendationCSV()`**: Compiles current estimator inputs, calculated outputs, and allocation splits into a Blob, creates an object URL, and triggers an anchor download.
- **`resetEstimator()`**: Restores all slider defaults (`target: 100`, `years: 3`, `growth: 18%`, `vehicle: 'All EVs'`, `mode: 'District'`, `district: 'Lucknow'`, `spacing: 25km`, `buffer: 5km`).
- **`ElevatedPieChart3D`**: Renders SVG circular paths with pseudo-3D extrusion facets and `transform: translateY(-8px)` elevation on active slice selection.
