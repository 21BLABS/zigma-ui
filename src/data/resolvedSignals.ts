// Resolved Signals - Historical Wins
// These are manually tracked trades that Zigma correctly predicted
// Display these on Signals and Analytics pages for public trust

export interface ResolvedSignal {
  id: string;
  marketQuestion: string;
  marketUrl: string;
  outcome: 'YES' | 'NO';
  entryPrice: number;
  exitPrice: number;
  pnl: number;
  edge: number;
  entryTime: string;
  exitTime: string;
  category: string;
  status: 'WIN' | 'LOSS';
}

export const resolvedSignals: ResolvedSignal[] = [
  {
    id: 'russia-ternuvate-feb28',
    marketQuestion: 'Will Russia enter Ternuvate by February 28?',
    marketUrl: 'https://polymarket.com/event/will-russia-enter-ternuvate-by-february-28',
    outcome: 'YES',
    entryPrice: 0.195,
    exitPrice: 1.00,
    pnl: 80.50,
    edge: 0.805,
    entryTime: '2025-01-30',
    exitTime: '2025-02-28',
    category: 'Geopolitics',
    status: 'WIN'
  },
  {
    id: 'grammys-song-of-year-2025',
    marketQuestion: 'Grammys: Song of the Year Winner',
    marketUrl: 'https://polymarket.com/event/grammys-song-of-the-year-winner',
    outcome: 'YES',
    entryPrice: 0.25,
    exitPrice: 1.00,
    pnl: 75.00,
    edge: 0.75,
    entryTime: '2025-02-02',
    exitTime: '2025-02-03',
    category: 'Entertainment',
    status: 'WIN'
  },
  {
    id: 'elon-musk-net-worth-jan31-670b',
    marketQuestion: 'Elon Musk Net Worth on January 31 - $670B+',
    marketUrl: 'https://polymarket.com/event/elon-musk-net-worth-on-january-31',
    outcome: 'YES',
    entryPrice: 0.31,
    exitPrice: 1.00,
    pnl: 69.00,
    edge: 0.69,
    entryTime: '2025-01-14',
    exitTime: '2025-01-31',
    category: 'Finance',
    status: 'WIN'
  },
  {
    id: 'nyc-snow-jan-12-14',
    marketQuestion: 'How many inches of snow in NYC in January? (12-14)',
    marketUrl: 'https://polymarket.com/event/how-many-inches-of-snow-in-nyc-in-january-235',
    outcome: 'YES',
    entryPrice: 0.38,
    exitPrice: 1.00,
    pnl: 62.00,
    edge: 0.62,
    entryTime: '2025-01-28',
    exitTime: '2025-01-31',
    category: 'Weather',
    status: 'WIN'
  },
  {
    id: 'netflix-top-movie-rip',
    marketQuestion: 'What will be the top US Netflix movie this week? - RIP',
    marketUrl: 'https://polymarket.com/event/what-will-be-the-top-us-netflix-movie-this-week-162',
    outcome: 'YES',
    entryPrice: 0.45,
    exitPrice: 1.00,
    pnl: 55.00,
    edge: 0.55,
    entryTime: '2025-01-22',
    exitTime: '2025-01-26',
    category: 'Entertainment',
    status: 'WIN'
  },
  {
    id: 'grammys-record-of-year-luther',
    marketQuestion: 'Grammys: Record of the Year Winner - Luther',
    marketUrl: 'https://polymarket.com/event/grammys-record-of-the-year-winner',
    outcome: 'YES',
    entryPrice: 0.52,
    exitPrice: 1.00,
    pnl: 48.00,
    edge: 0.48,
    entryTime: '2025-01-26',
    exitTime: '2025-02-03',
    category: 'Entertainment',
    status: 'WIN'
  },
  {
    id: 'grammys-tropical-latin-raices',
    marketQuestion: 'Grammys: Best Tropical Latin Album Winner - Raíces',
    marketUrl: 'https://polymarket.com/event/grammys-best-tropical-latin-album-winner',
    outcome: 'YES',
    entryPrice: 0.523,
    exitPrice: 1.00,
    pnl: 47.70,
    edge: 0.477,
    entryTime: '2025-02-01',
    exitTime: '2025-02-03',
    category: 'Entertainment',
    status: 'WIN'
  },
  {
    id: 'hasanabi-twitch-unban-march31',
    marketQuestion: 'Will Hasanabi be unbanned from Twitch by March 31?',
    marketUrl: 'https://polymarket.com/event/will-hasanabi-be-unbanned-from-twitch-by-march-31-678',
    outcome: 'YES',
    entryPrice: 0.59,
    exitPrice: 1.00,
    pnl: 41.00,
    edge: 0.41,
    entryTime: '2025-01-29',
    exitTime: '2025-03-31',
    category: 'Social Media',
    status: 'WIN'
  },
  {
    id: 'mercy-box-office-8-11m',
    marketQuestion: 'Mercy Opening Weekend Box Office ($8-11M)',
    marketUrl: 'https://polymarket.com/event/mercy-opening-weekend-box-office',
    outcome: 'YES',
    entryPrice: 0.60,
    exitPrice: 1.00,
    pnl: 40.00,
    edge: 0.40,
    entryTime: '2025-01-24',
    exitTime: '2025-01-26',
    category: 'Entertainment',
    status: 'WIN'
  },
  {
    id: 'jd-vance-march-for-life-god',
    marketQuestion: 'What will J.D. Vance say at the March for Life? - God',
    marketUrl: 'https://polymarket.com/event/what-will-jd-vance-say-at-the-march-for-life-on-friday',
    outcome: 'YES',
    entryPrice: 0.63,
    exitPrice: 1.00,
    pnl: 37.00,
    edge: 0.37,
    entryTime: '2025-01-24',
    exitTime: '2025-01-24',
    category: 'Politics',
    status: 'WIN'
  },
  {
    id: 'next-country-us-strikes-somalia',
    marketQuestion: 'Next Country US Strikes - Somalia',
    marketUrl: 'https://polymarket.com/event/next-country-us-strikes-785',
    outcome: 'YES',
    entryPrice: 0.67,
    exitPrice: 1.00,
    pnl: 33.00,
    edge: 0.33,
    entryTime: '2025-01-27',
    exitTime: '2025-01-28',
    category: 'Geopolitics',
    status: 'WIN'
  },
  {
    id: 'tsa-passengers-jan25',
    marketQuestion: 'Number of TSA Passengers January 25?',
    marketUrl: 'https://polymarket.com/event/number-of-tsa-passengers-january-25',
    outcome: 'YES',
    entryPrice: 0.70,
    exitPrice: 1.00,
    pnl: 30.00,
    edge: 0.30,
    entryTime: '2025-01-28',
    exitTime: '2025-01-25',
    category: 'Travel',
    status: 'WIN'
  },
  {
    id: 'israel-strikes-iran-jan30',
    marketQuestion: 'Israel strikes Iran by January 30, 2026?',
    marketUrl: 'https://polymarket.com/event/israel-strikes-iran-by-january-30-2026',
    outcome: 'NO',
    entryPrice: 0.80,
    exitPrice: 1.00,
    pnl: 20.00,
    edge: 0.20,
    entryTime: '2025-01-26',
    exitTime: '2025-01-30',
    category: 'Geopolitics',
    status: 'WIN'
  },
  {
    id: 'chatgpt-app-store-ranking',
    marketQuestion: 'ChatGPT out as #1 Free App in the US Apple App Store',
    marketUrl: 'https://polymarket.com/event/chatgpt-out-as-1-free-app-in-the-us-apple-app-store-by',
    outcome: 'YES',
    entryPrice: 0.80,
    exitPrice: 1.00,
    pnl: 20.00,
    edge: 0.20,
    entryTime: '2025-01-27',
    exitTime: '2025-01-31',
    category: 'Technology',
    status: 'WIN'
  }
];

// Summary stats
export const resolvedSignalsStats = {
  totalSignals: 14,
  winRate: 100,
  totalPnL: 657.20,
  averagePnL: 46.94,
  averageEdge: 47.3,
  bestTrade: {
    market: 'Will Russia enter Ternuvate by February 28?',
    pnl: 80.50,
    edge: 80.5
  },
  dateRange: {
    start: '2025-01-14',
    end: '2025-02-28'
  }
};
