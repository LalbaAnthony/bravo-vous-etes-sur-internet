import express, { Express, Request, Response, NextFunction } from 'express'
import helmet from 'helmet'
import cors from 'cors'
import morgan from 'morgan'
import path from 'path'

const app: Express = express()

// Apache terminates TLS and reverse-proxies to this process (see apache.conf), so the
// socket peer is always the proxy. Trust exactly one hop so req.ip is the real client.
app.set('trust proxy', 1)

// Security headers. The CSP is spelled out rather than left to helmet's defaults:
// the defaults set `script-src-attr 'none'`, which kills the inline onclick handlers
// the frontend depends on, and the page loads Google Fonts from two external hosts.
app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      'script-src': ["'self'"],
      // Required by the onclick="" attributes in public/index.html and in
      'script-src-attr': ["'unsafe-inline'"],
      'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      'font-src': ["'self'", 'data:', 'https://fonts.gstatic.com'],
      'img-src': ["'self'", 'data:'],
      'connect-src': ["'self'"],
    },
  },
}))

// CORS middleware to allow cross-origin requests
app.use(cors({
  origin: true,
  credentials: true
}))

// Logging middleware
app.use(morgan('combined'))

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, '../public')));

// Parse JSON bodies (as sent by API clients)
app.use(express.json({ limit: '10mb' }))

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({ extended: true }))

// Serve the main HTML file at the root path
app.get('/', (_req: Request, res: Response): void => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// Health check. Deliberately mounted before the rate limiter: the container
// healthcheck polls it every 30s and must never be throttled.
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
  })
})


// Redirect to home page for any unknown routes
app.use((_req: Request, res: Response): void => {
  res.redirect('/');
})

// Global error handler. The 4th parameter is what makes Express treat this as an
// error handler rather than as ordinary middleware — do not remove it.
app.use((err: Error, _req: Request, res: Response, _next: NextFunction): void => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

export default app
