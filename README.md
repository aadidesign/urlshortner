# ShortURL

A modern, secure URL shortener built with React and Express.js.

**Developed by Aadi, 2025**

## Screenshots

![ShortURL Homepage](assets/Screenshot%202025-12-27%20204737.png)
*Clean, modern interface for shortening URLs*

![URL Shortened Result](assets/Screenshot%202025-12-27%20204802.png)
*Result view with copy functionality*

## Features

- **URL Shortening** - Convert long URLs into short, memorable links
- **Custom Codes** - Create personalized short codes
- **Analytics** - Track click counts and access times
- **Responsive Design** - Optimized for desktop and mobile
- **Security** - Rate limiting, input validation, and security headers

## Quick Start

### Prerequisites

- Node.js v14 or higher
- npm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd urlshortner
```

2. Install dependencies:
```bash
npm run install-all
```

3. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your settings (see Environment Variables section below).

4. Start the development servers:
```bash
npm run dev
```

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`

## Environment Variables

Create a `.env` file in the root directory:

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `BASE_URL` | Base URL for generated short links | `http://localhost:5000` |
| `REACT_APP_API_URL` | Frontend API endpoint | `http://localhost:5000/api` |

**Important:** Never commit `.env` files to version control.

## Project Structure

```
urlshortner/
├── assets/             # Screenshots and images
├── server/
│   ├── index.js        # Express server
│   └── database.js     # SQLite operations
├── client/
│   ├── public/
│   └── src/
│       ├── App.js      # Main component
│       └── App.css     # Styles
└── package.json
```

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/shorten` | Create short URL |
| `GET` | `/api/urls` | List all URLs |
| `GET` | `/api/stats/:code` | Get URL statistics |
| `DELETE` | `/api/urls/:code` | Delete a URL |
| `GET` | `/:code` | Redirect to original URL |

## Tech Stack

- **Backend:** Express.js, SQLite, Helmet, Rate Limiting
- **Frontend:** React, Framer Motion, Axios

## Security

This application includes:
- Helmet.js for security headers
- Rate limiting (100 requests/15 min per IP)
- Input validation and sanitization
- SQL injection prevention via parameterized queries

For production deployment, ensure you:
- Use HTTPS
- Configure CORS to allow only your domain
- Set secure environment variables
- Use a reverse proxy (nginx/Apache)

## Roadmap

Planned features and improvements for future releases:

- [ ] User authentication and personal dashboards
- [ ] QR code generation for short URLs
- [ ] Custom expiration dates for links
- [ ] API key support for developers

## License

MIT

---

**Developed by Aadi, 2025**
