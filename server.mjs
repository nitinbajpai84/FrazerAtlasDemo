import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const dist = join(root, 'dist');
const port = Number(process.env.PORT || 3000);
const host = '0.0.0.0';
const apiKey = process.env.GEMINI_API_KEY || '';
const model = process.env.GEMINI_MODEL || 'gemini-flash-latest';
const maxBodyBytes = 1_000_000;
const requestWindowMs = 60_000;
const maxRequestsPerWindow = 30;
const requests = new Map();

if (!existsSync(join(dist, 'index.html'))) {
  console.error('Production build missing. Run `npm run build` before starting the server.');
  process.exit(1);
}

const sendJson = (res, status, body) => {
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
  });
  res.end(JSON.stringify(body));
};

function allowGeminiRequest(req, res) {
  const now = Date.now();
  const address = req.socket.remoteAddress || 'unknown';
  const entry = requests.get(address);
  const current = !entry || now - entry.startedAt >= requestWindowMs
    ? { startedAt: now, count: 0 }
    : entry;

  current.count += 1;
  requests.set(address, current);

  if (requests.size > 10_000) {
    for (const [ip, bucket] of requests) {
      if (now - bucket.startedAt >= requestWindowMs) requests.delete(ip);
    }
  }

  if (current.count > maxRequestsPerWindow) {
    sendJson(res, 429, { error: { message: 'Demo request limit reached. Please try again in a minute.' } });
    return false;
  }
  return true;
}

async function handleGemini(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('allow', 'POST');
    sendJson(res, 405, { error: { message: 'Method not allowed' } });
    return;
  }
  if (!allowGeminiRequest(req, res)) return;
  if (!apiKey) {
    sendJson(res, 503, { error: { message: 'GEMINI_API_KEY is not set' } });
    return;
  }

  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > maxBodyBytes) {
      sendJson(res, 413, { error: { message: 'Request body is too large' } });
      req.destroy();
      return;
    }
    chunks.push(chunk);
  }

  try {
    const upstream = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-goog-api-key': apiKey },
        body: Buffer.concat(chunks),
        signal: AbortSignal.timeout(60_000),
      },
    );
    res.writeHead(upstream.status, {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
    });
    res.end(await upstream.text());
  } catch (error) {
    sendJson(res, 502, { error: { message: `Gemini request failed: ${error.message}` } });
  }
}

const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

const server = createServer(async (req, res) => {
  const url = new URL(req.url || '/', 'http://localhost');
  if (url.pathname === '/api/atlas/status') {
    sendJson(res, 200, { live: Boolean(apiKey), model });
    return;
  }
  if (url.pathname === '/api/atlas/generate') {
    await handleGemini(req, res);
    return;
  }
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { allow: 'GET, HEAD' });
    res.end('Method not allowed');
    return;
  }

  const requested = decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname);
  const safePath = resolve(dist, `.${normalize(requested)}`);
  const withinDist = safePath === dist || safePath.startsWith(dist + sep);
  const file = withinDist && existsSync(safePath) && statSync(safePath).isFile()
    ? safePath
    : join(dist, 'index.html');

  res.writeHead(200, {
    'content-type': mimeTypes[extname(file)] || 'application/octet-stream',
    'x-content-type-options': 'nosniff',
  });
  if (req.method === 'HEAD') res.end();
  else createReadStream(file).pipe(res);
});

server.listen(port, host, () => {
  console.log(`Finance Atlas listening on ${host}:${port}`);
});
