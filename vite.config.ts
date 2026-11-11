import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import type { Connect, Plugin } from 'vite'

// Server-side proxy for Gemini. The API key is read from .env.local (GEMINI_API_KEY)
// and added here, so it never reaches the browser bundle.
function atlasAi(key: string, model: string): Plugin {
  const install = (middlewares: Connect.Server) => {
    middlewares.use('/api/atlas/status', (_req, res) => {
      res.setHeader('content-type', 'application/json')
      res.end(JSON.stringify({ live: Boolean(key), model }))
    })

    middlewares.use('/api/atlas/generate', (req, res) => {
      const chunks: Buffer[] = []
      req.on('data', (chunk: Buffer) => chunks.push(chunk))
      req.on('end', async () => {
        res.setHeader('content-type', 'application/json')
        if (!key) {
          res.statusCode = 503
          res.end(JSON.stringify({ error: { message: 'GEMINI_API_KEY is not set' } }))
          return
        }
        try {
          const upstream = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
            {
              method: 'POST',
              headers: { 'content-type': 'application/json', 'x-goog-api-key': key },
              body: Buffer.concat(chunks),
            },
          )
          res.statusCode = upstream.status
          res.end(await upstream.text())
        } catch (error) {
          res.statusCode = 502
          res.end(JSON.stringify({ error: { message: String(error) } }))
        }
      })
    })
  }

  return {
    name: 'atlas-ai',
    configureServer: (server) => install(server.middlewares),
    configurePreviewServer: (server) => install(server.middlewares),
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [
      react(),
      atlasAi(env.GEMINI_API_KEY ?? '', env.GEMINI_MODEL || 'gemini-flash-latest'),
    ],
  }
})
