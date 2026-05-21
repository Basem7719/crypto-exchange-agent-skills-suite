import { readFileSync, writeFileSync, existsSync } from 'fs';
import { OrderSpec, PaperTrade } from '../types/trading.js';
import { randomUUID } from 'crypto';

export class PaperTradingService {
  private trades: PaperTrade[] = [];

  constructor(private readonly ledgerPath: string) {
    if (existsSync(ledgerPath)) {
      try {
        this.trades = JSON.parse(readFileSync(ledgerPath, 'utf-8'));
      } catch {
        this.trades = [];
      }
    }
  }

  open(spec: OrderSpec, fillPrice: number): PaperTrade {
    const trade: PaperTrade = {
      id: randomUUID(),
      timestamp: new Date().toISOString(),
      exchange: spec.exchange,
      symbol: spec.symbol,
      side: spec.side,
      type: spec.type,
      quantity: spec.quantity,
      price: fillPrice,
      notional: fillPrice * spec.quantity,
      status: 'open',
    };
    this.trades.push(trade);
    this.persist();
    return trade;
  }

  close(id: string, exitPrice: number): PaperTrade {
    const trade = this.trades.find((t) => t.id === id);
    if (!trade) throw new Error(`Paper trade ${id} not found`);
    if (trade.status !== 'open') throw new Error(`Trade ${id} is already ${trade.status}`);

    const direction = trade.side === 'BUY' ? 1 : -1;
    trade.pnl = (exitPrice - trade.price) * trade.quantity * direction;
    trade.status = 'closed';
    this.persist();
    return trade;
  }

  cancel(id: string): PaperTrade {
    const trade = this.trades.find((t) => t.id === id);
    if (!trade) throw new Error(`Paper trade ${id} not found`);
    trade.status = 'cancelled';
    this.persist();
    return trade;
  }

  summary(): string {
    const closed = this.trades.filter((t) => t.status === 'closed');
    const open = this.trades.filter((t) => t.status === 'open');
    const totalPnl = closed.reduce((acc, t) => acc + (t.pnl ?? 0), 0);
    const wins = closed.filter((t) => (t.pnl ?? 0) > 0).length;
    const winRate = closed.length > 0 ? ((wins / closed.length) * 100).toFixed(1) : 'n/a';

    return [
      '=== Paper Trading Summary ===',
      `Open trades:   ${open.length}`,
      `Closed trades: ${closed.length}`,
      `Win rate:      ${winRate}%`,
      `Total PnL:     ${totalPnl.toFixed(2)} USDT`,
    ].join('\n');
  }

  list(): PaperTrade[] {
    return [...this.trades];
  }

  private persist(): void {
    writeFileSync(this.ledgerPath, JSON.stringify(this.trades, null, 2));
  }
}
