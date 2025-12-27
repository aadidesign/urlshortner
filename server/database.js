const sqlite3 = require('sqlite3').verbose();
const { nanoid } = require('nanoid');
const path = require('path');

const DB_PATH = path.join(__dirname, 'urls.db');
let db = null;

function getDb() {
  if (!db) {
    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Error opening database:', err);
      }
    });
  }
  return db;
}

function initDatabase() {
  const database = getDb();
  
  database.serialize(() => {
    database.run(`
      CREATE TABLE IF NOT EXISTS urls (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        original_url TEXT NOT NULL,
        short_code TEXT UNIQUE NOT NULL,
        clicks INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_accessed DATETIME
      )
    `, (err) => {
      if (err) {
        console.error('Error creating table:', err);
      } else {
        console.log('✅ Database initialized successfully');
      }
    });
  });
}

function createShortUrl(originalUrl, customCode = null) {
  return new Promise((resolve, reject) => {
    const database = getDb();
    const shortCode = customCode || nanoid(8);
    
    database.run(
      'INSERT INTO urls (original_url, short_code) VALUES (?, ?)',
      [originalUrl, shortCode],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            if (customCode) {
              reject(new Error('Custom code already exists'));
            } else {
              // Retry with a new code if collision (rare)
              createShortUrl(originalUrl, null).then(resolve).catch(reject);
            }
          } else {
            reject(err);
          }
        } else {
          resolve({
            id: this.lastID,
            originalUrl,
            shortCode,
            shortUrl: `${process.env.BASE_URL || 'http://localhost:5000'}/${shortCode}`,
            createdAt: new Date().toISOString()
          });
        }
      }
    );
  });
}

function getUrlByShortCode(shortCode) {
  return new Promise((resolve, reject) => {
    const database = getDb();
    database.get(
      'SELECT * FROM urls WHERE short_code = ?',
      [shortCode],
      (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      }
    );
  });
}

function getAllUrls() {
  return new Promise((resolve, reject) => {
    const database = getDb();
    database.all(
      'SELECT id, original_url, short_code, clicks, created_at, last_accessed FROM urls ORDER BY created_at DESC',
      [],
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows.map(row => ({
            ...row,
            shortUrl: `${process.env.BASE_URL || 'http://localhost:5000'}/${row.short_code}`
          })));
        }
      }
    );
  });
}

function deleteUrl(shortCode) {
  return new Promise((resolve, reject) => {
    const database = getDb();
    database.run(
      'DELETE FROM urls WHERE short_code = ?',
      [shortCode],
      function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
      }
    );
  });
}

function getUrlStats(shortCode) {
  return new Promise((resolve, reject) => {
    const database = getDb();
    database.get(
      'SELECT id, original_url, short_code, clicks, created_at, last_accessed FROM urls WHERE short_code = ?',
      [shortCode],
      (err, row) => {
        if (err) {
          reject(err);
        } else {
          if (row) {
            resolve({
              ...row,
              shortUrl: `${process.env.BASE_URL || 'http://localhost:5000'}/${row.short_code}`
            });
          } else {
            resolve(null);
          }
        }
      }
    );
  });
}

module.exports = {
  initDatabase,
  createShortUrl,
  getUrlByShortCode,
  getAllUrls,
  deleteUrl,
  getUrlStats,
  getDb
};

