const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { initDatabase, createShortUrl, getUrlByShortCode, getAllUrls, deleteUrl, getUrlStats } = require('./database');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === 'production';

// Security middleware
app.use(helmet());

// Logging (skip in test environment)
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(isProduction ? 'combined' : 'dev'));
}

// CORS configuration
// In production, restrict to your domain by setting CORS_ORIGIN in .env
const corsOptions = {
  origin: process.env.CORS_ORIGIN || (isProduction ? false : true),
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use(express.json({ limit: '10kb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Initialize database
initDatabase();

// Routes
app.post('/api/shorten', async (req, res) => {
  try {
    const { url, customCode } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Validate URL
    try {
      new URL(url);
    } catch (e) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    const result = await createShortUrl(url, customCode);
    res.json(result);
  } catch (error) {
    console.error('Error creating short URL:', error);
    if (error.message === 'Custom code already exists') {
      return res.status(409).json({ error: 'Custom code already exists. Please choose a different one.' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/urls', async (req, res) => {
  try {
    const urls = await getAllUrls();
    res.json(urls);
  } catch (error) {
    console.error('Error fetching URLs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/stats/:shortCode', async (req, res) => {
  try {
    const { shortCode } = req.params;
    const stats = await getUrlStats(shortCode);
    
    if (!stats) {
      return res.status(404).json({ error: 'Short URL not found' });
    }
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/urls/:shortCode', async (req, res) => {
  try {
    const { shortCode } = req.params;
    const deleted = await deleteUrl(shortCode);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Short URL not found' });
    }
    
    res.json({ message: 'URL deleted successfully' });
  } catch (error) {
    console.error('Error deleting URL:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Redirect route
app.get('/:shortCode', async (req, res) => {
  try {
    const { shortCode } = req.params;
    const urlData = await getUrlByShortCode(shortCode);
    
    if (!urlData) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>URL Not Found</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            .container {
              text-align: center;
              color: white;
            }
            h1 { font-size: 3rem; margin: 0; }
            p { font-size: 1.2rem; margin-top: 1rem; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>404</h1>
            <p>Short URL not found</p>
          </div>
        </body>
        </html>
      `);
    }
    
    // Increment click count
    const db = require('./database').getDb();
    db.run(
      'UPDATE urls SET clicks = clicks + 1, last_accessed = CURRENT_TIMESTAMP WHERE short_code = ?',
      [shortCode]
    );
    
    res.redirect(urlData.original_url);
  } catch (error) {
    console.error('Error redirecting:', error);
    res.status(500).send('Internal server error');
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

