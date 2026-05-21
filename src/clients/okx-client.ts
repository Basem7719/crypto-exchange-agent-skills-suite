import crypto from 'crypto';

export interface OKXConfig {
  apiKey: string;
  apiSecret: string;
  passphrase: string;
  testnet?: boolean;
}

export class OKXClient {
  private readonly baseUrl: string;
  private readonly config: OKXConfig;

  constructor(config: OKXConfig) {
    this.config = config;
    this.baseUrl = 'https://www.okx.com';
  }

  private sign(timestamp: string, method: string, path: string, body: string): string {
    const prehash = `${timestamp}${method}${path}${body}`;
    return crypto
      .createHmac('sha256', this.config.apiSecret)
      .update(prehash)
      .digest('base64');
  }

  private headers(method: string, path: string, body = ''): HeadersInit {
    const timestamp = new Date().toISOString();
    return {
      'OK-ACCESS-KEY': this.config.apiKey,
      'OK-ACCESS-SIGN': this.sign(timestamp, method, path, body),
      'OK-ACCESS-TIMESTAMP': timestamp,
      'OK-ACCESS-PASSPHRASE': this.config.passphrase,
      'Content-Type': 'application/json',
      ...(this.config.testnet ? { 'x-simulated-trading': '1' } : {}),
    };
  }

  async getSystemStatus(): Promise<unknown> {
    const path = '/api/v5/system/status';
    const res = await fetch(`${this.baseUrl}${path}`, {
      headers: this.headers('GET', path),
    });
    if (!res.ok) throw new Error(`OKX status error: ${res.status}`);
    return res.json();
  }

  async getAccountBalance(): Promise<unknown> {
    const path = '/api/v5/account/balance';
    const res = await fetch(`${this.baseUrl}${path}`, {
      headers: this.headers('GET', path),
    });
    if (!res.ok) throw new Error(`OKX balance error: ${res.status}`);
    return res.json();
  }

  async getTicker(instId: string): Promise<unknown> {
    const path = `/api/v5/market/ticker?instId=${instId}`;
    const res = await fetch(`${this.baseUrl}${path}`);
    if (!res.ok) throw new Error(`OKX ticker error: ${res.status}`);
    return res.json();
  }

  async getInstruments(instType: string, instId?: string): Promise<unknown> {
    const qs = instId ? `?instType=${instType}&instId=${instId}` : `?instType=${instType}`;
    const path = `/api/v5/public/instruments${qs}`;
    const res = await fetch(`${this.baseUrl}${path}`);
    if (!res.ok) throw new Error(`OKX instruments error: ${res.status}`);
    return res.json();
  }

  async placeOrder(params: Record<string, unknown>): Promise<unknown> {
    const path = '/api/v5/trade/order';
    const body = JSON.stringify(params);
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: this.headers('POST', path, body),
      body,
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(`OKX order error ${res.status}: ${JSON.stringify(err)}`);
    }
    return res.json();
  }

  async cancelOrder(instId: string, ordId: string): Promise<unknown> {
    const path = '/api/v5/trade/cancel-order';
    const body = JSON.stringify({ instId, ordId });
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: this.headers('POST', path, body),
      body,
    });
    if (!res.ok) throw new Error(`OKX cancel error: ${res.status}`);
    return res.json();
  }

  async getPositions(instType = 'SWAP'): Promise<unknown> {
    const path = `/api/v5/account/positions?instType=${instType}`;
    const res = await fetch(`${this.baseUrl}${path}`, {
      headers: this.headers('GET', path),
    });
    if (!res.ok) throw new Error(`OKX positions error: ${res.status}`);
    return res.json();
  }
}
