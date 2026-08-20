export type Bookmaker = {
  id: string
  name: string
  icon: string
  fallbackLabel: string
  fallbackColor: string
}

/** Bookmakers + icons from Trader Dashboard (`public/bookmakers`). */
export const BOOKMAKERS: Bookmaker[] = [
  {
    id: '1xbet',
    name: '1xBet',
    icon: '/bookmakers/1xbet.png',
    fallbackLabel: '1x',
    fallbackColor: '#1a5276',
  },
  {
    id: '10bet',
    name: '10Bet',
    icon: '/bookmakers/10bet.png',
    fallbackLabel: '10',
    fallbackColor: '#111827',
  },
  {
    id: '188bet',
    name: '188Bet',
    icon: '/bookmakers/188bet.png',
    fallbackLabel: '188',
    fallbackColor: '#1f2937',
  },
  {
    id: 'bet365',
    name: 'bet365',
    icon: '/bookmakers/bet365.png',
    fallbackLabel: '365',
    fallbackColor: '#027b5b',
  },
  {
    id: 'betonline',
    name: 'BetOnline',
    icon: '/bookmakers/betonline.png',
    fallbackLabel: 'BO',
    fallbackColor: '#c8102e',
  },
  {
    id: 'bettsson',
    name: 'Bettsson',
    icon: '/bookmakers/bettsson.png',
    fallbackLabel: 'BS',
    fallbackColor: '#f97316',
  },
  {
    id: 'boylesports',
    name: 'BoyleSports',
    icon: '/bookmakers/boylesports.png',
    fallbackLabel: 'BY',
    fallbackColor: '#6b21a8',
  },
  {
    id: 'bovada',
    name: 'Bovada',
    icon: '/bookmakers/bovada.png',
    fallbackLabel: 'BV',
    fallbackColor: '#cc0000',
  },
  {
    id: 'bwin',
    name: 'bwin',
    icon: '/bookmakers/bwin.png',
    fallbackLabel: 'bw',
    fallbackColor: '#f59e0b',
  },
  {
    id: 'caeserspalace',
    name: 'Caesars Palace',
    icon: '/bookmakers/caeserspalace.png',
    fallbackLabel: 'CP',
    fallbackColor: '#991b1b',
  },
  {
    id: 'coral',
    name: 'Coral',
    icon: '/bookmakers/coral.png',
    fallbackLabel: 'CR',
    fallbackColor: '#0046a0',
  },
  {
    id: 'dafasports',
    name: 'Dafabet',
    icon: '/bookmakers/dafasports.png',
    fallbackLabel: 'DF',
    fallbackColor: '#a6935c',
  },
  {
    id: 'fanduel',
    name: 'FanDuel',
    icon: '/bookmakers/fanduel.png',
    fallbackLabel: 'FD',
    fallbackColor: '#1493ff',
  },
  {
    id: 'fonbet',
    name: 'Fonbet',
    icon: '/bookmakers/fonbet.png',
    fallbackLabel: 'FB',
    fallbackColor: '#dc2626',
  },
  {
    id: 'ladbrokes',
    name: 'Ladbrokes',
    icon: '/bookmakers/ladbrokes.png',
    fallbackLabel: 'L',
    fallbackColor: '#e20a17',
  },
  {
    id: 'paddypower',
    name: 'Paddy Power',
    icon: '/bookmakers/paddypower.png',
    fallbackLabel: 'PP',
    fallbackColor: '#004833',
  },
  {
    id: 'sbobet',
    name: 'SBOBET',
    icon: '/bookmakers/sbobet.png',
    fallbackLabel: 'SB',
    fallbackColor: '#1e3a5f',
  },
  {
    id: 'sportsbetau',
    name: 'Sportsbet',
    icon: '/bookmakers/sportsbetau.png',
    fallbackLabel: 'SA',
    fallbackColor: '#2563eb',
  },
  {
    id: 'spreadex',
    name: 'Spreadex',
    icon: '/bookmakers/spreadex.png',
    fallbackLabel: 'SX',
    fallbackColor: '#111827',
  },
  {
    id: 'unibet',
    name: 'Unibet',
    icon: '/bookmakers/unibet.png',
    fallbackLabel: 'U',
    fallbackColor: '#111827',
  },
  {
    id: 'williamhill',
    name: 'William Hill',
    icon: '/bookmakers/williamhill.png',
    fallbackLabel: 'WH',
    fallbackColor: '#003580',
  },
]

/** @deprecated Use BOOKMAKERS */
export const CUSTOMERS = BOOKMAKERS

const STORAGE_KEY = 'multibet.selected.bookmaker.v1'
const LEGACY_STORAGE_KEY = 'multibet.selected.customer.v1'

export function getBookmaker(id: string): Bookmaker | undefined {
  return BOOKMAKERS.find((bookmaker) => bookmaker.id === id)
}

export function readSelectedBookmakerId(): string {
  try {
    const raw =
      localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY)
    if (raw && BOOKMAKERS.some((bookmaker) => bookmaker.id === raw)) return raw
  } catch {
    /* ignore */
  }
  return BOOKMAKERS.find((b) => b.id === 'bet365')?.id ?? BOOKMAKERS[0]?.id ?? ''
}

export function writeSelectedBookmakerId(id: string) {
  if (!BOOKMAKERS.some((bookmaker) => bookmaker.id === id)) return
  localStorage.setItem(STORAGE_KEY, id)
}
