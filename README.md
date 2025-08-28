# Soundy Dashboard

A modern, responsive music dashboard built with Next.js for controlling Discord music bots and managing playlists. Features real-time player controls, Apple Music-like lyrics display, and seamless music discovery.

![Soundy Dashboard](https://img.shields.io/badge/Next.js-15.5.0-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1.12-38bdf8?logo=tailwindcss)

## ✨ Features

- 🎵 **Real-time Music Control**: Play, pause, skip, seek, and volume control
- 🎤 **Apple Music-style Lyrics**: Synchronized lyrics display with PIXI.js animations
- 🔍 **Smart Search**: Browse and search music with category filters
- 📱 **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- 🎨 **Modern UI**: Dark/light theme with Spotify-inspired design
- 📊 **Analytics**: Built-in Vercel Analytics integration
- 🔄 **Real-time Updates**: WebSocket connection for live player state
- 🎧 **Queue Management**: View and manage music queue
- ❤️ **Liked Songs**: Save and manage favorite tracks
- 📋 **Playlists**: Create and manage custom playlists

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ or Bun
- Discord Bot with music capabilities
- Discord Application with OAuth2 setup

### 1. Clone the Repository

```bash
git clone https://github.com/idMJA/Soundy-Dashboard.git
cd Soundy-Dashboard
```

### 2. Install Dependencies

```bash
# Using bun (recommended)
bun install

# Or using npm
npm install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```env
# Discord OAuth2
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
DISCORD_REDIRECT_URI=http://localhost:3000/api/auth/discord

# API Configuration
API_PROTOCOL=https
API_URL=your-soundy-api-domain.com

# WebSocket Configuration (see WebSocket Setup section)
NEXT_PUBLIC_WS_URL=ws://your-websocket-server:port

# Recommendation API (deploy your own - see below)
RECOMMENDATION_API_URL=https://your-soundy-api.vercel.app
```

### 4. Deploy Recommendation API

This dashboard requires the Soundy API for music recommendations and search:

1. Fork and deploy: [Soundy API Repository](https://github.com/idMJA/Soundy-API)
2. Deploy to Vercel with one click
3. Update `RECOMMENDATION_API_URL` in your `.env.local`

### 5. WebSocket Configuration

#### For Vercel Deployment (Production)
Use WSS (secure WebSocket) for HTTPS domains:
```env
NEXT_PUBLIC_WS_URL=wss://your-websocket-server:port
```

#### For Self-Hosted/Local Development
Use standard WebSocket:
```env
NEXT_PUBLIC_WS_URL=ws://your-websocket-server:port
```

### 6. Run Development Server

```bash
bun dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔧 Configuration

### Discord Application Setup

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Navigate to OAuth2 → General
4. Add redirect URI: `http://localhost:3000/api/auth/discord` (or your domain)
5. Copy Client ID and Client Secret to your `.env.local`

### WebSocket Server

This dashboard connects to a WebSocket server for real-time music control. The server should handle:

- Player state updates
- Queue management
- Music control commands
- User authentication

See the [Soundy Repository](https://github.com/idMJA/Soundy) for WebSocket server implementation.

## 🎨 UI Components

Built with modern, accessible components:

- **Radix UI**: Headless UI primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Beautiful icons
- **shadcn/ui**: High-quality component library

## 📱 Features Overview

### Music Control
- Real-time playback control
- Volume adjustment
- Seek functionality
- Queue management

### Lyrics Display
- Apple Music-style synchronized lyrics
- Smooth animations with PIXI.js
- Auto-scroll and manual navigation
- Full-screen lyrics mode

### Search & Discovery
- Browse by categories (Trending, Chill, Party, Focus)
- Real-time search with debouncing
- Recent searches
- Smart recommendations

### User Management
- Discord OAuth2 authentication
- User preferences
- Liked songs synchronization
- Playlist management

## 🚀 Deployment

### Deploy on Vercel (Recommended)

1. Fork this repository
2. Connect to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/idMJA/Soundy-Dashboard)

### Self-Hosting

1. Build the application:
```bash
bun build
```

2. Start the production server:
```bash
bun start
```

3. Configure reverse proxy (nginx, Apache) if needed

## 🔒 Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `DISCORD_CLIENT_ID` | Discord application client ID | ✅ | `1168385371294420992` |
| `DISCORD_CLIENT_SECRET` | Discord application client secret | ✅ | `your_secret_here` |
| `DISCORD_REDIRECT_URI` | OAuth2 redirect URI | ✅ | `https://yourdomain.com/api/auth/discord` |
| `API_PROTOCOL` | API protocol (http/https) | ✅ | `https` |
| `API_URL` | API base URL | ✅ | `api.yourdomain.com` |
| `NEXT_PUBLIC_WS_URL` | WebSocket server URL | ✅ | `wss://ws.yourdomain.com:8080` |
| `RECOMMENDATION_API_URL` | Soundy API URL | ✅ | `https://your-api.vercel.app` |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Apple Music](https://music.apple.com) - Lyrics UI inspiration
- [Spotify](https://spotify.com) - Design inspiration
- [shadcn/ui](https://ui.shadcn.com) - Component library
- [Radix UI](https://radix-ui.com) - Headless UI primitives

## 📞 Support

- 📧 Email: kiyomi@mjba.my
- 🐛 Issues: [GitHub Issues](https://github.com/idMJA/Soundy/issues)
- 💬 Discord: [Join our server](https://dc.gg/tx)

