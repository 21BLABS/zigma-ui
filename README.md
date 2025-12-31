# Zigma Oracle Console

A terminal-style web interface for the Zigma AI-Powered Polymarket Intelligence Agent. Built for traders who demand transparency, precision, and real-time insights.

## Overview

Zigma Oracle Console provides a real-time dashboard to monitor the Zigma agent's autonomous trading cycles, signal generation, and market analysis. The interface connects directly to the Zigma backend API to display:

- System health and uptime
- Latest trading signals with full transparency
- Operational audit logs
- Market analysis summaries
- Real-time cycle status

## Features

### Real-Time Monitoring
- Live system status and health metrics
- Automatic data refresh every 30 seconds
- Terminal-style CRT aesthetic for authentic trading environment

### Signal Transparency
- Complete audit trail of signal generation process
- Effective edge calculations with entropy adjustments
- Confidence scoring and exposure recommendations
- Historical cycle analysis

### Market Intelligence
- Deep evaluation of selected markets
- Multi-stage analysis including LLM reasoning
- Group competition resolution for correlated markets
- Risk-adjusted signal filtering

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: React Query for API state
- **Deployment**: Static site ready for Netlify/Vercel

## Prerequisites

- Node.js 18+
- npm or yarn
- Zigma backend server running on localhost:3001

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd zigmaui

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:8080`

## Development

```bash
# Start dev server with hot reload
npm run dev

# Build for production
npm run build

```

## Architecture

### Component Structure
- `Index.tsx` - Main dashboard layout
- `LatestSignal.tsx` - Latest signal display with detailed metrics
- `LogsDisplay.tsx` - Operational logs with collapsible audit trails
- `Hero.tsx` - Landing section
- `OracleLogic.tsx` - System philosophy and methodology

### API Integration
- `/status` - System health and cycle metadata
- `/logs` - Raw operational logs for parsing
- Auto-refresh every 30 seconds
- Error handling with fallback states

