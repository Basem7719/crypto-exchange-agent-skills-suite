import { BinanceClient } from '../clients/binance-client.js';
import { OKXClient } from '../clients/okx-client.js';
import { AccountSnapshot, AccountBalance, Position, Exchange } from '../types/trading.js';

export class AccountService {
  constructor(
    private readonly binance: BinanceClient,
    private readonly okx: OKXClient,
  ) {}

  async getSnapshot(exchange: Exchange): Promise<AccountSnapshot> {
    if (exchange === 'binance') return this.getBinanceSnapshot();
    return this.getOKXSnapshot();
  }

  private async getBinanceSnapshot(): Promise<AccountSnapshot> {
    const raw = (await this.binance.getAccountInfo()) as {
      balances: { asset: string; free: string; locked: string }[];
    };

    const balances: AccountBalance[] = raw.balances
      .map((b) => ({
        asset: b.asset,
        free: parseFloat(b.free),
        locked: parseFloat(b.locked),
        total: parseFloat(b.free) + parseFloat(b.locked),
      }))
      .filter((b) => b.total > 0);

    return {
      exchange: 'binance',
      timestamp: new Date().toISOString(),
      total_equity_usdt: 0, // requires price lookup for accurate value
      balances,
      open_positions: [],
    };
  }

  private async getOKXSnapshot(): Promise<AccountSnapshot> {
    const raw = (await this.okx.getAccountBalance()) as {
      data: { details: { ccy: string; availBal: string; frozenBal: string }[]; totalEq: string }[];
    };

    const account = raw.data[0];
    const balances: AccountBalance[] = account.details
      .map((d) => ({
        asset: d.ccy,
        free: parseFloat(d.availBal),
        locked: parseFloat(d.frozenBal),
        total: parseFloat(d.availBal) + parseFloat(d.frozenBal),
      }))
      .filter((b) => b.total > 0);

    const posRaw = (await this.okx.getPositions()) as {
      data: {
        instId: string;
        posSide: string;
        pos: string;
        avgPx: string;
        markPx: string;
        upl: string;
        lever: string;
      }[];
    };

    const open_positions: Position[] = posRaw.data.map((p) => ({
      symbol: p.instId,
      side: p.posSide === 'long' ? 'long' : 'short',
      size: parseFloat(p.pos),
      entry_price: parseFloat(p.avgPx),
      mark_price: parseFloat(p.markPx),
      unrealized_pnl: parseFloat(p.upl),
      leverage: parseFloat(p.lever),
    }));

    return {
      exchange: 'okx',
      timestamp: new Date().toISOString(),
      total_equity_usdt: parseFloat(account.totalEq),
      balances,
      open_positions,
    };
  }
}
