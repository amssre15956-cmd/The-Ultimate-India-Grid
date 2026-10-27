import { defineConfig, type HtmlTagDescriptor, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'node:fs'
import path from 'node:path'

import siteConfiguration from './.figma/make/site.json'


// Vite config — https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // .figma/make/deploy-preview passes `--mode development` for cached-preview builds.
  const emitSourcemaps = mode === 'development'

  return {
    base: process.env.FIGMA_PUBLIC_URL ? `${process.env.FIGMA_PUBLIC_URL}/` : '/',
    build: {
      sourcemap: emitSourcemaps ? 'inline' : false,
      minify: !emitSourcemaps,
    },
    plugins: [
      react(),
      tailwindcss(),
      figmaSiteConfiguration(siteConfiguration),
      assistantServicePlugin(),
      figmaErrorOverlayReplay(),
      figmaReactRefreshBoundaryFallback(),
      figmaMakeKitPlugin({ storiesGlob: '/src/**/*.stories.{ts,tsx,js,jsx}' }),
      figmaLinkedPackageSourcemaps(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: parseInt(process.env.PORT || '3000'),
      allowedHosts: true,
      strictPort: true,
      watch: {
        ignored: [
          '**/.figma/**',
        ],
      },
    },
    preview: {
      host: '0.0.0.0',
      port: parseInt(process.env.PORT || '3000'),
    },
  }
})

type FigmaSiteConfiguration = {
  title?: string
  description?: string
  language?: string
  robots?: {
    index?: boolean
  }
  icons?: {
    icon?: string
  }
  openGraph?: {
    image?: string
  }
  analytics?: {
    googleAnalyticsId?: string
  }
  customScripts?: {
    headStart?: string
    headEnd?: string
    bodyStart?: string
    bodyEnd?: string
  }
  accessibility?: {
    addBypassLinks?: boolean
  }
}

/** Applies /.figma/make/site.json to the generated document shell. */
function figmaSiteConfiguration(config: FigmaSiteConfiguration): Plugin {
  function sanitizeHtmlValue(value: string | undefined): string {
    return value?.replace(/[^a-zA-Z0-9_-]/g, '') || ''
  }
  function escapeHtmlText(value: string): string {
    return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  }
  function replaceHtmlCommentSlot(html: string, slotName: string, content: string): string {
    return html.replace(`<!-- ${slotName} -->`, content)
  }

  const title = config.title ?? "Figma Make App"
  const description = config.description ?? ''
  // Imported HTML keeps its own favicon; new Makes default to the Make product icon.
  const favicon = config.icons?.icon ?? '/favicon.svg'
  const socialImage = config.openGraph?.image ?? ''
  const language = sanitizeHtmlValue(config.language) || 'en'
  const googleAnalyticsId = sanitizeHtmlValue(config.analytics?.googleAnalyticsId)
  const headStart = config.customScripts?.headStart ?? ''
  const headEnd = config.customScripts?.headEnd ?? ''
  const bodyStart = config.customScripts?.bodyStart ?? ''
  const bodyEnd = config.customScripts?.bodyEnd ?? ''
  const robotsTxt = config.robots?.index === false ? 'User-agent: *\nDisallow: /\n' : ''

  return {
    name: 'figma-site-configuration',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!robotsTxt || req.url?.split('?')[0] !== '/robots.txt') return next()

        res.setHeader('Content-Type', 'text/plain; charset=utf-8')
        res.end(robotsTxt)
      })
    },
    generateBundle() {
      if (!robotsTxt) return

      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: robotsTxt,
      })
    },
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        let result = html
        result = replaceHtmlCommentSlot(result, 'figma:lang', language)
        result = replaceHtmlCommentSlot(result, 'figma:title', escapeHtmlText(title))
        result = replaceHtmlCommentSlot(result, 'figma:head-start', headStart)
        result = replaceHtmlCommentSlot(result, 'figma:head-end', headEnd)
        result = replaceHtmlCommentSlot(result, 'figma:body-start', bodyStart)
        result = replaceHtmlCommentSlot(result, 'figma:body-end', bodyEnd)

        const tags: HtmlTagDescriptor[] = []
        if (description) {
          tags.push({ tag: 'meta', attrs: { name: 'description', content: description }, injectTo: 'head' })
        }
        if (config.robots?.index === false) {
          tags.push({ tag: 'meta', attrs: { name: 'robots', content: 'noindex, nofollow' }, injectTo: 'head' })
        }
        if (favicon) {
          tags.push({ tag: 'link', attrs: { rel: 'icon', href: favicon }, injectTo: 'head' })
        }
        if (title) {
          tags.push({ tag: 'meta', attrs: { property: 'og:title', content: title }, injectTo: 'head' })
        }
        if (description) {
          tags.push({ tag: 'meta', attrs: { property: 'og:description', content: description }, injectTo: 'head' })
        }
        if (socialImage) {
          tags.push(
            { tag: 'meta', attrs: { property: 'og:image', content: socialImage }, injectTo: 'head' },
            { tag: 'meta', attrs: { name: 'twitter:card', content: 'summary_large_image' }, injectTo: 'head' },
            { tag: 'meta', attrs: { name: 'twitter:image', content: socialImage }, injectTo: 'head' },
          )
        }

        if (googleAnalyticsId) {
          tags.push(
            {
              tag: 'script',
              attrs: {
                async: true,
                src: `https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`,
              },
              injectTo: 'head',
            },
            {
              tag: 'script',
              children: `
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', ${JSON.stringify(googleAnalyticsId)});
`,
              injectTo: 'head',
            },
          )
        }

        if (config.accessibility?.addBypassLinks) {
          tags.push(
            {
              tag: 'style',
              children: `
  .figma-bypass-link {
    position: fixed;
    top: 8px;
    left: 8px;
    z-index: 2147483647;
    transform: translateY(-150%);
    border-radius: 6px;
    background: #111827;
    color: #fff;
    padding: 8px 12px;
    font: 600 14px/1.2 system-ui, sans-serif;
    text-decoration: none;
  }
  .figma-bypass-link:focus {
    transform: translateY(0);
  }
`,
              injectTo: 'head',
            },
            {
              tag: 'a',
              attrs: { class: 'figma-bypass-link', href: '#root' },
              children: 'Skip to content',
              injectTo: 'body-prepend',
            },
          )
        }

        return {
          html: result,
          tags,
        }
      },
    },
  }
}

/**
 * Replay the most recent build error to clients that connect after
 * it was first broadcast. Vite buffers an error payload only while
 * no clients are connected and clears the buffer on the first
 * reconnect (see `bufferedMessage` in `createWebSocketServer`), so
 * if the preview iframe reloads after Vite already delivered an
 * error to a live socket, the new socket misses the payload and
 * the overlay stays hidden even though the build is still broken.
 * We intercept `ws.send` to remember the latest error and replay
 * it on every new connection; the cache clears on a successful
 * `update` or `full-reload` so a stale overlay can't survive a
 * fixed build.
 */
function figmaErrorOverlayReplay(): Plugin {
  return {
    name: 'figma-error-overlay-replay',
    apply: 'serve',
    configureServer(server) {
      let lastError: object | null = null

      const origSend = server.ws.send.bind(server.ws) as (...args: any[]) => void
      server.ws.send = ((...args: any[]) => {
        const payload = args[0]
        if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
          const type = (payload as { type?: string }).type
          if (type === 'error') {
            lastError = payload as object
          } else if (type === 'update' || type === 'full-reload') {
            lastError = null
          }
        }
        return origSend(...args)
      }) as typeof server.ws.send

      server.ws.on('connection', (socket) => {
        if (lastError !== null) {
          socket.send(JSON.stringify(lastError))
        }
      })
    },
  }
}

/**
 * Reload when a module that previously defined a React Refresh boundary stops
 * defining one. This happens when an agent moves a component into a new file
 * and replaces the old module with a re-export:
 *
 *   export { default } from './app/App'
 *
 * Vite otherwise accepts the update using the previous module's HMR boundary,
 * but the re-export-only transform no longer registers a replacement for the
 * mounted component family. React reports a successful refresh while leaving
 * the old tree mounted until the page is reloaded.
 */
function figmaReactRefreshBoundaryFallback(): Plugin {
  type ModuleNode = import('vite').ModuleNode
  const hadRefreshBoundary = new Map<string, boolean>()
  const lostRefreshBoundaries = new Set<string>()
  let sendFullReload: (() => void) | null = null

  return {
    name: 'figma-react-refresh-boundary-fallback',
    apply: 'serve',
    enforce: 'post',
    configureServer(server) {
      sendFullReload = () => server.ws.send({ type: 'full-reload', path: '*' })
    },
    handleHotUpdate({ modules, server, timestamp }) {
      if (lostRefreshBoundaries.size === 0) return

      const visited = new Set<ModuleNode>()
      const pending = [...modules]
      while (pending.length > 0) {
        const current = pending.pop()
        if (!current || visited.has(current)) continue
        visited.add(current)

        const moduleId = current.id?.split('?')[0]
        if (moduleId && lostRefreshBoundaries.has(moduleId)) {
          const invalidated = new Set<ModuleNode>()
          for (const updatedModule of modules) {
            server.moduleGraph.invalidateModule(updatedModule, invalidated, timestamp, true)
          }
          sendFullReload?.()
          return []
        }

        pending.push(...current.importers)
      }
    },
    transform(code, id) {
      if (!/\.[jt]sx?(?:\?|$)/.test(id) || id.includes('/node_modules/')) return null

      const moduleId = id.split('?')[0] ?? id
      const hasRefreshBoundary = code.includes('registerExportsForReactRefresh')
      const previousHadRefreshBoundary = hadRefreshBoundary.get(moduleId)
      hadRefreshBoundary.set(moduleId, hasRefreshBoundary)

      if (hasRefreshBoundary) lostRefreshBoundaries.delete(moduleId)
      if (previousHadRefreshBoundary && !hasRefreshBoundary) {
        lostRefreshBoundaries.add(moduleId)
        queueMicrotask(() => sendFullReload?.())
      }

      return null
    },
  }
}

/**
 * Serves a blank render-target page at /.figma/make/kit.html that
 * the Figma preview script drives directly. The page exposes a
 * registry of every file matching `storiesGlob` on
 * window.__FIGMA__.stories so the design surface can dynamically
 * import + mount each entry into its own grid view.
 *
 * Dev-only: `apply: 'serve'` gates the plugin to `vite dev`. Prod
 * builds (`vite build`) skip it entirely so the route doesn't leak
 * into shipped bundles.
 */
function figmaMakeKitPlugin(options: { storiesGlob: string | string[] }): Plugin {
  const storiesGlob = Array.isArray(options.storiesGlob) ? options.storiesGlob : [options.storiesGlob]
  const ROUTE = '/.figma/make/kit.html'
  const VIRTUAL_ID = 'virtual:figma-stories'
  const RESOLVED_ID = '\0' + VIRTUAL_ID
  const STORIES_MODULE = `export const stories = import.meta.glob(${JSON.stringify(storiesGlob)})`
  const HTML_BOOTSTRAP = `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body>
<div id="figma-make-kit-root"></div>
<script type="module">
  import { stories } from 'virtual:figma-stories'
  window.__FIGMA__ = Object.assign(window.__FIGMA__ ?? {}, { stories })
  window.dispatchEvent(new CustomEvent('figma.ready'))
</script>
</body>
</html>`

  return {
    name: 'figma-make-kit',
    apply: 'serve',
    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_ID
      return null
    },
    load(id) {
      if (id !== RESOLVED_ID) return null
      return STORIES_MODULE
    },
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || ''
        if (url.split('?')[0] !== ROUTE) return next()

        try {
          res.setHeader('Content-Type', 'text/html')
          res.end(await server.transformIndexHtml(url, HTML_BOOTSTRAP))
        } catch (err) {
          next(err as Error)
        }
      })
    },
  }
}

/**
 * Reports the sources of dependencies linked from outside node_modules (pnpm
 * or npm workspaces, `file:`, `link:`) under `node_modules/<name>/`, the way
 * installed packages appear in sourcemaps. Vite otherwise reports their real
 * path, such as `libraries/<name>/`.
 */
function figmaLinkedPackageSourcemaps(): Plugin {
  const packageJson = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'package.json'), 'utf8'))
  const linkedPackages = Object.keys({ ...packageJson.dependencies, ...packageJson.devDependencies }).flatMap((name) => {
    const installedDir = path.resolve(__dirname, 'node_modules', name)
    try {
      const realDir = fs.realpathSync(installedDir)
      return realDir.split(path.sep).includes('node_modules') ? [] : [{ installedDir, realDir }]
    } catch {
      return []
    }
  })
  const sourceMappingUrl = /\/\/# sourceMappingURL=(\S+)\s*$/

  function installedPath(file: string) {
    const linked = linkedPackages.find(({ realDir }) => file.startsWith(realDir + path.sep))
    return linked && path.join(linked.installedDir, path.relative(linked.realDir, file))
  }
  function readSourceMap(file: string, code: string) {
    const url = sourceMappingUrl.exec(code)?.[1]
    try {
      if (url?.startsWith('data:')) {
        return { map: JSON.parse(Buffer.from(url.split(',')[1], 'base64').toString()), mapDir: path.dirname(file) }
      }
      if (url) {
        const mapFile = path.resolve(path.dirname(file), url)
        return { map: JSON.parse(fs.readFileSync(mapFile, 'utf8')), mapDir: path.dirname(mapFile) }
      }
    } catch {}
    // Without a usable input map, map every line to itself.
    const mappings = code.split('\n').map((_, i) => (i ? 'AACA' : 'AAAA'))
    const map = { version: 3, sources: [file], sourcesContent: [code], names: [], mappings: mappings.join(';') }
    return { map, mapDir: path.dirname(file) }
  }

  return {
    name: 'figma-linked-package-sourcemaps',
    enforce: 'pre',
    load(id) {
      // Leave queried imports such as ?raw and ?url to Vite's own loaders.
      if (id.includes('?') || !/\.[cm]?[jt]sx?$/.test(id) || !installedPath(id)) return null

      const code = fs.readFileSync(id, 'utf8')
      const { map, mapDir } = readSourceMap(id, code)
      const sourceRoot = path.resolve(mapDir, map.sourceRoot ?? '')
      map.sources = map.sources.map((source: string) => {
        const original = path.resolve(sourceRoot, source)
        return installedPath(original) ?? original
      })
      delete map.sourceRoot
      return { code: code.replace(sourceMappingUrl, ''), map }
    },
  }
}

/** In-memory EV Assistant SSE & Health API endpoint handler */
function assistantServicePlugin(): Plugin {
  return {
    name: 'assistant-service-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || ''
        const pathname = url.split('?')[0]
        if (!pathname.startsWith('/api/v1/assistant')) return next()

        if (pathname === '/api/v1/assistant/health') {
          res.setHeader('Content-Type', 'application/json')
          res.end(
            JSON.stringify({
              status: 'READY',
              components: {
                api: { status: 'READY', detail: '' },
                ollama: { status: 'READY', detail: 'Integrated EV Assistant Engine' },
                llm_model: { status: 'READY', detail: 'Llama EV Knowledge Base' },
                embeddings_chromadb: { status: 'READY', detail: 'ChromaDB EV Methodology Store' },
                speech_to_text: { status: 'READY', detail: 'Whisper STT Service' },
                text_to_speech: { status: 'READY', detail: 'TTS Synthesizer' },
                storage: { status: 'READY', detail: '' },
              },
            }),
          )
          return
        }

        if (pathname === '/api/v1/assistant/stop') {
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ stopped: true }))
          return
        }

        if (req.method === 'DELETE' && pathname.startsWith('/api/v1/assistant/session/')) {
          const sid = pathname.split('/').pop() || ''
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ session_id: sid, deleted: true }))
          return
        }

        if (pathname === '/api/v1/assistant/chat' && req.method === 'POST') {
          let body = ''
          req.on('data', (chunk) => {
            body += chunk
          })
          req.on('end', async () => {
            let question = ''
            try {
              const parsed = JSON.parse(body)
              question = parsed.text || ''
            } catch {}

            res.writeHead(200, {
              'Content-Type': 'text/event-stream',
              'Cache-Control': 'no-cache, no-transform',
              'Connection': 'keep-alive',
            })

            const q = question.toLowerCase()
            let answerText =
              "India's EV Charging Network intelligence platform provides comprehensive national visibility into charging infrastructure, gap scores, and deployment prioritization."
            let sources = ['APP_METHODOLOGY', 'VAHAN_PORTAL', 'BEE_EV_YATRA']
            let quality = 'OFFICIAL_BENCHMARK'
            let notes = ['Calculated using national charging index benchmarks.']

            if (q.includes('formula') || q.includes('gap score') || q.includes('explain the gap')) {
              answerText = `**Gap Score** is a 0-100 score; higher means a larger mismatch between EV demand and public charging supply.\n\n\`\`\`\nGap Score = 100 x [ 0.45 x N(EVs per charger)\n                  + 0.25 x (1 - Coverage Score)\n                  + 0.20 x N(Demand Context)\n                  + 0.10 x N(Corridor Deficit) ]\n\`\`\`\n\n- **N(.)** normalises each term to 0-1.\n- **Coverage Score** is the share of the area served by public chargers (0-1), so lower coverage raises the score.\n- High-scoring districts should be prioritized for immediate public fast-charger allocation.`
              sources = ['APP_METHODOLOGY', 'NITI_AAYOG_GUIDELINES']
            } else if (
              q.includes('lucknow') ||
              q.includes('highest') ||
              q.includes('top district') ||
              q.includes('worst') ||
              q.includes('underserved')
            ) {
              answerText = `**Lucknow** has the highest Gap Score (**82.4**, Critical) among the analyzed Uttar Pradesh districts, with an estimated **141 additional chargers** required.\n\nTop prioritized districts:\n1. **Lucknow** (Score: 82.4, Critical, +141 chargers)\n2. **Gautam Buddha Nagar** (Score: 79.8, Critical, +88 chargers)\n3. **Ghaziabad** (Score: 68.2, High, +24 chargers)\n4. **Kanpur Nagar** (Score: 61.5, High, +21 chargers)`
              sources = ['DASHBOARD_SAMPLE', 'DISTRICT_ANALYTICS']
            } else if (q.includes('vahan') || q.includes('source') || q.includes('bee') || q.includes('data')) {
              answerText = `The platform aggregates from five primary data sources:\n\n- **VAHAN / Parivahan**: EV vehicle registrations across 2W, 3W, 4W, and commercial categories.\n- **BEE EV Yatra**: Registered public charging stations, operational connectors, and power ratings.\n- **Open Charge Map & CPO APIs**: Real-time connector status, network protocols (OCPI), and live availability.\n- **National Highway Authority GIS**: NH corridor geometry, toll density, and inter-city transit gaps.\n- **Census & Traffic Flow**: Urban density and fleet transit demand indicators.`
              sources = ['VAHAN_PARIVAHAN', 'BEE_EV_YATRA', 'OPEN_CHARGE_MAP']
            } else if (q.includes('scale') || q.includes('adapter') || q.includes('cpo')) {
              answerText = `To add a new CPO adapter or scale nationally:\n\n1. Implement the standardized \`fetch()\` interface returning normalized station telemetry.\n2. Map operator-specific connector types (CCS2, Type 2, CHAdeMO, Bharat DC001) to unified schemas.\n3. Register the connector in the pipeline registry and schedule automated synchronization intervals.\n4. Enable telemetry anomaly detection for offline or non-reporting charging points.`
              sources = ['PLATFORM_ARCHITECTURE', 'CPO_INTEGRATION_SPEC']
            }

            const words = answerText.split(/(\s+)/)
            for (const word of words) {
              res.write(`data: ${JSON.stringify({ event: 'token', text: word })}\n\n`)
              await new Promise((r) => setTimeout(r, 10))
            }

            res.write(`data: ${JSON.stringify({ event: 'source', sources, data_quality: quality, notes })}\n\n`)
            res.write(`data: ${JSON.stringify({ event: 'done' })}\n\n`)
            res.end()
          })
          return
        }

        if (pathname === '/api/v1/assistant/file-query' || pathname === '/api/v1/assistant/audio-query') {
          res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            'Connection': 'keep-alive',
          })
          if (pathname === '/api/v1/assistant/audio-query') {
            res.write(
              `data: ${JSON.stringify({ event: 'transcription', text: 'Analyzed voice query regarding district EV charger requirements.' })}\n\n`,
            )
          }
          const text =
            'Analysis completed: The query/file was processed against national EV charging benchmarks. District infrastructure requirements and gap indices have been updated in your session.'
          const words = text.split(/(\s+)/)
          for (const word of words) {
            res.write(`data: ${JSON.stringify({ event: 'token', text: word })}\n\n`)
            await new Promise((r) => setTimeout(r, 10))
          }
          res.write(
            `data: ${JSON.stringify({ event: 'source', sources: ['DATA_PROCESSOR'], data_quality: 'VALIDATED', notes: ['File/audio input parsed successfully.'] })}\n\n`,
          )
          res.write(`data: ${JSON.stringify({ event: 'done' })}\n\n`)
          res.end()
          return
        }

        next()
      })
    },
  }
}
