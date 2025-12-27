import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import './App.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function App() {
  const [url, setUrl] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [shortUrl, setShortUrl] = useState(null);
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingUrls, setFetchingUrls] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const fetchUrls = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/urls`);
      setUrls(response.data);
    } catch (err) {
      console.error('Error fetching URLs:', err);
    } finally {
      setFetchingUrls(false);
    }
  }, []);

  useEffect(() => {
    fetchUrls();
  }, [fetchUrls]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/shorten`, {
        url,
        customCode: customCode || undefined
      });
      setShortUrl(response.data);
      setUrl('');
      setCustomCode('');
      fetchUrls();
      showToast('URL shortened successfully');
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to shorten URL';
      setError(errorMessage);
      setShortUrl(null);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text, id = 'result') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      showToast('Copied to clipboard');
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      showToast('Failed to copy', 'error');
    }
  };

  const deleteUrl = async (shortCode) => {
    if (!window.confirm('Are you sure you want to delete this URL?')) {
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/urls/${shortCode}`);
      fetchUrls();
      if (shortUrl && shortUrl.shortCode === shortCode) {
        setShortUrl(null);
      }
      showToast('URL deleted');
    } catch (err) {
      showToast('Failed to delete URL', 'error');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="app">
      <div className="container">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="header"
        >
          <div className="logo" aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          </div>
          <h1 className="title">
            <span className="title-gradient">ShortURL</span>
          </h1>
          <p className="subtitle">Create short, memorable links in seconds</p>
        </motion.header>

        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="card"
        >
          <form onSubmit={handleSubmit} className="form">
            <div className="input-group">
              <label htmlFor="url-input" className="input-label">
                URL to shorten
              </label>
              <input
                id="url-input"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/your-long-url"
                className="input"
                required
                autoComplete="url"
              />
            </div>

            <div className="input-group">
              <label htmlFor="custom-code" className="input-label">
                Custom code <span style={{ fontWeight: 400, color: '#9ca3af' }}>(optional)</span>
              </label>
              <input
                id="custom-code"
                type="text"
                value={customCode}
                onChange={(e) => setCustomCode(e.target.value)}
                placeholder="my-custom-link"
                className="input input-custom"
                pattern="[A-Za-z0-9_-]+"
                title="Only letters, numbers, hyphens, and underscores"
              />
              <span className="input-hint">Letters, numbers, hyphens, and underscores only</span>
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="error-message"
                  role="alert"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              type="submit"
              className="button"
              disabled={loading || !url}
              whileHover={{ scale: loading ? 1 : 1.01 }}
              whileTap={{ scale: loading ? 1 : 0.99 }}
            >
              {loading ? (
                <span className="button-loading">
                  <span className="spinner" />
                  Creating...
                </span>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                  </svg>
                  Shorten URL
                </>
              )}
            </motion.button>
          </form>

          <AnimatePresence>
            {shortUrl && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="result-card"
              >
                <div className="result-header">
                  <span className="result-label">Your shortened URL</span>
                </div>
                <div className="result-content">
                  <div className="short-url-container">
                    <input
                      type="text"
                      value={shortUrl.shortUrl}
                      readOnly
                      className="short-url-input"
                      aria-label="Shortened URL"
                    />
                    <motion.button
                      onClick={() => copyToClipboard(shortUrl.shortUrl, 'result')}
                      className={`copy-button ${copiedId === 'result' ? 'copied' : ''}`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {copiedId === 'result' ? (
                        <>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          Copied
                        </>
                      ) : (
                        <>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                          </svg>
                          Copy
                        </>
                      )}
                    </motion.button>
                  </div>
                  <div className="original-url">
                    <span className="original-label">Original URL</span>
                    <a
                      href={shortUrl.originalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="original-link"
                    >
                      {shortUrl.originalUrl}
                    </a>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.main>

        {(urls.length > 0 || fetchingUrls) && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="urls-list"
            aria-label="Recent URLs"
          >
            <div className="list-header">
              <h2 className="list-title">Recent URLs</h2>
              {urls.length > 0 && (
                <span className="list-count">{urls.length}</span>
              )}
            </div>

            {fetchingUrls ? (
              <div className="urls-grid">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="skeleton skeleton-card" />
                ))}
              </div>
            ) : urls.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.5">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                  </svg>
                </div>
                <p className="empty-state-title">No URLs yet</p>
                <p className="empty-state-text">Shorten your first URL to see it here</p>
              </div>
            ) : (
              <div className="urls-grid">
                {urls.slice(0, 10).map((item, index) => (
                  <motion.article
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="url-item"
                  >
                    <div className="url-item-header">
                      <a
                        href={item.shortUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="url-short"
                      >
                        {item.shortUrl}
                      </a>
                      <button
                        onClick={() => deleteUrl(item.short_code)}
                        className="delete-button"
                        title="Delete URL"
                        aria-label="Delete URL"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                    <p className="url-original" title={item.original_url}>
                      {item.original_url}
                    </p>
                    <div className="url-meta">
                      <span className="url-stat">
                        <svg className="url-stat-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                          <polyline points="10 17 15 12 10 7" />
                          <line x1="15" y1="12" x2="3" y2="12" />
                        </svg>
                        <span className="url-stat-value">{item.clicks}</span> clicks
                      </span>
                      <span className="url-stat">
                        <svg className="url-stat-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        {formatDate(item.created_at)}
                      </span>
                      <div className="url-actions">
                        <button
                          onClick={() => copyToClipboard(item.shortUrl, item.id)}
                          className={`action-button ${copiedId === item.id ? 'action-button-primary' : ''}`}
                        >
                          {copiedId === item.id ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>
            )}
          </motion.section>
        )}

        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="footer"
        >
          <p>Developed by Aadi, 2025</p>
        </motion.footer>

        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className={`toast ${toast.type === 'error' ? 'toast-error' : 'toast-success'}`}
              role="status"
              aria-live="polite"
            >
              {toast.type === 'error' ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
              {toast.message}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;
