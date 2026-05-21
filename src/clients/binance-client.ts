import crypto from 'crypto';

export interface BinanceConfig {
  apiKey: string;
  apiSecret: string;
  recvWindow?: number;
  testnet?: boolean;
}

export class BinanceClient {
  private readonly baseUrl: string;
  private readonly config: BinanceConfig;

  constructor(config: BinanceConfig) {
    this.config = config;
    this.baseUrl = config.testnet
      ? 'https://testnet.binance.vision'
      : 'https://api.binance.com';
  }

  private sign(queryString: string): string {
    return crypto
      .createHmac('sha256', this.config.apiSecret)
      .update(queryString)
      .digest('hex');
  }

  private buildParams(params: Record<string, string | number | boolean>): string {
    const timestamp = Date.now();
    const recvWindow = this.config.recvWindow ?? 5000;
    const base = new URLSearchParams({
      ...Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])),
      timestamp: String(timestamp),
      recvWindow: String(recvWindow),
    }).toString();
    return `${base}&signature=${this.sign(base)}`;
  }

  private headers(): HeadersInit {
    return {
      'X-MBX-APIKEY': this.config.apiKey,
      'Content-Type': 'application/x-www-form-urlencoded',
    };
  }

  async ping(): Promise<boolean> {
    const res = await fetch(`${this.baseUrl}/api/v3/ping`);
    return res.ok;
  }

  async getAccountInfo(): Promise<unknown> {
    const qs = this.buildParams({});
    const res = await fetch(`${this.baseUrl}/api/v3/account?${qs}`, {
      headers: this.headers(),
    });
    if (!res.ok) throw new Error(`Binance account error: ${res.status}`);
    return res.json();
  }

  async getTicker(symbol: string): Promise<unknown> {
    const res = await fetch(`${this.baseUrl}/api/v3/ticker/24hr?symbol=${symbol}`);
    if (!res.ok) throw new Error(`Binance ticker error: ${res.status}`);
    return res.json();
  }

  async getExchangeInfo(symbol?: string): Promise<unknown> {
    const url = symbol
      ? `${this.baseUrl}/api/v3/exchangeInfo?symbol=${symbol}`
      : `${this.baseUrl}/api/v3/exchangeInfo`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Binance exchangeInfo error: ${res.status}`);
    return res.json();
  }

  async placeOrder(params: Record<string, string | number | boolean>): Promise<unknown> {
    const body = this.buildParams(params);
    const res = await fetch(`${this.baseUrl}/api/v3/order`, {
      method: 'POST',
      headers: this.headers(),
      body,
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(`Binance order error ${res.status}: ${JSON.stringify(err)}`);
    }
    return res.json();
  }

  async cancelOrder(symbol: string, orderId: string): Promise<unknown> {
    const body = this.buildParams({ symbol, orderId });
    const res = await fetch(`${this.baseUrl}/api/v3/order`, {
      method: 'DELETE',
      headers: this.headers(),
      body,
    });
    if (!res.ok) throw new Error(`Binance cancel error: ${res.status}`);
    return res.json();
  }

  async getOrderStatus(symbol: string, clientOrderId: string): Promise<unknown> {
    const qs = this.buildParams({ symbol, origClientOrderId: clientOrderId });
    const res = await fetch(`${this.baseUrl}/api/v3/order?${qs}`, {
      headers: this.headers(),
    });
    if (!res.ok) throw new Error(`Binance order status error: ${res.status}`);
    return res.json();
  }
}
