import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Import and register routes only if the file exists (for development compatibility)
try {
  const { registerRoutes } = await import('./dist/index.js');
  await registerRoutes(app);
  console.log('✅ API routes registered successfully');
} catch (error) {
  console.warn('⚠️  Could not load API routes:', error.message);
  // Add basic health check route as fallback
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
  });
}

// Serve static files from dist/public
const staticPath = path.join(__dirname, 'dist', 'public');
console.log('📁 Static files path:', staticPath);
app.use(express.static(staticPath));

// Catch-all handler: send back React's index.html file for SPA routing
app.get('*', (req, res) => {
  const indexPath = path.join(staticPath, 'index.html');
  console.log('📄 Serving index.html from:', indexPath);
  res.sendFile(indexPath);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
  console.log(`📱 Open http://localhost:${port} to view the app`);
});
