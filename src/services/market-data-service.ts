import { BinanceClient } from '../clients/binance-client.js';
import { OKXClient } from '../clients/okx-client.js';
import { Exchange, MarketTicker } from '../types/trading.js';

export class MarketDataService {
  constructor(
    private readonly binance: BinanceClient,
    private readonly okx: OKXClient,
  ) {}

  async getTicker(exchange: Exchange, symbol: string): Promise<MarketTicker> {
    if (exchange === 'binance') {
      return this.getBinanceTicker(symbol);
    }
    return this.getOKXTicker(symbol);
  }

  private async getBinanceTicker(symbol: string): Promise<MarketTicker> {
    const raw = (await this.binance.getTicker(symbol)) as Record<string, string>;
    return {
      symbol: raw['symbol'],
      exchange: 'binance',
      price: parseFloat(raw['lastPrice']),
      change_24h_pct: parseFloat(raw['priceChangePercent']),
      volume_24h_usdt: parseFloat(raw['quoteVolume']),
      high_24h: parseFloat(raw['highPrice']),
      low_24h: parseFloat(raw['lowPrice']),
      timestamp: new Date(Number(raw['closeTime'])).toISOString(),
    };
  }

  private async getOKXTicker(instId: string): Promise<MarketTicker> {
    const res = (await this.okx.getTicker(instId)) as { data: Record<string, string>[] };
    const raw = res.data[0];
    return {
      symbol: raw['instId'],
      exchange: 'okx',
      price: parseFloat(raw['last']),
      change_24h_pct: parseFloat(raw['change24h'] ?? '0') * 100,
      volume_24h_usdt: parseFloat(raw['volCcy24h']),
      high_24h: parseFloat(raw['high24h']),
      low_24h: parseFloat(raw['low24h']),
      timestamp: new Date(Number(raw['ts'])).toISOString(),
    };
  }

  async checkConnectivity(exchange: Exchange): Promise<{ ok: boolean; latency_ms: number }> {
    const start = Date.now();
    try {
      if (exchange === 'binance') {
        await this.binance.ping();
      } else {
        await this.okx.getSystemStatus();
      }
      return { ok: true, latency_ms: Date.now() - start };
    } catch {
      return { ok: false, latency_ms: Date.now() - start };
    }
  }
}
