import { BinanceClient } from '../clients/binance-client.js';
import { OKXClient } from '../clients/okx-client.js';
import { RiskGateService } from './risk-gate-service.js';
import { OrderSpec, OrderResult } from '../types/trading.js';
import { appendFileSync, existsSync, mkdirSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

const LEDGER_DIR = join(homedir(), '.crypto-skills');
const LEDGER_FILE = join(LEDGER_DIR, 'executor-ledger.jsonl');

export class OrderService {
  constructor(
    private readonly binance: BinanceClient,
    private readonly okx: OKXClient,
    private readonly riskGate: RiskGateService,
  ) {}

  async dryRun(spec: OrderSpec, accountEquityUsdt: number): Promise<string> {
    const risk = this.riskGate.check(spec, accountEquityUsdt);
    const notional = (spec.price ?? 0) * spec.quantity;
    const lines = [
      '=== DRY RUN — no order submitted ===',
      `Exchange:        ${spec.exchange} (${spec.market_type})`,
      `Symbol:          ${spec.symbol}`,
      `Action:          ${spec.type} ${spec.side}  ${spec.quantity} @ ${spec.price ?? 'MARKET'}`,
      `Notional:        ${notional.toFixed(2)} USDT`,
      `clientOrderId:   ${spec.client_order_id}`,
      '',
      risk.approved
        ? 'Pre-flight:      ALL GATES PASS ✓'
        : `Pre-flight:      REJECTED\n${risk.reasons.map((r) => '  • ' + r).join('\n')}`,
      '',
      'To go live: set dry_run=false and confirm=CONFIRM',
    ];
    return lines.join('\n');
  }

  async submit(
    spec: OrderSpec,
    confirm: string,
    accountEquityUsdt: number,
    killSwitchPath?: string,
  ): Promise<OrderResult> {
    if (confirm !== 'CONFIRM') {
      throw new Error('Execution refused: confirm must equal exactly "CONFIRM"');
    }

    if (killSwitchPath && existsSync(killSwitchPath)) {
      throw new Error(`Kill switch active at ${killSwitchPath} — all submissions aborted`);
    }

    const risk = this.riskGate.check(spec, accountEquityUsdt);
    if (!risk.approved) {
      throw new Error(`Risk gate REJECTED:\n${risk.reasons.join('\n')}`);
    }

    let raw: Record<string, unknown>;

    if (spec.exchange === 'binance') {
      raw = (await this.binance.placeOrder({
        symbol: spec.symbol,
        side: spec.side,
        type: spec.type,
        quantity: spec.quantity,
        ...(spec.price ? { price: spec.price, timeInForce: 'GTC' } : {}),
        newClientOrderId: spec.client_order_id,
      })) as Record<string, unknown>;

      return this.mapBinanceResult(raw, spec);
    } else {
      raw = (await this.okx.placeOrder({
        instId: spec.symbol,
        tdMode: spec.market_type === 'spot' ? 'cash' : 'cross',
        side: spec.side.toLowerCase(),
        ordType: spec.type.toLowerCase().replace('_', '-'),
        sz: String(spec.quantity),
        ...(spec.price ? { px: String(spec.price) } : {}),
        clOrdId: spec.client_order_id,
      })) as Record<string, unknown>;

      return this.mapOKXResult(raw, spec);
    }
  }

  private mapBinanceResult(raw: Record<string, unknown>, spec: OrderSpec): OrderResult {
    const result: OrderResult = {
      order_id: String(raw['orderId']),
      client_order_id: String(raw['clientOrderId']),
      status: raw['status'] as OrderResult['status'],
      symbol: String(raw['symbol']),
      side: spec.side,
      type: spec.type,
      quantity: Number(raw['origQty']),
      price: raw['price'] ? Number(raw['price']) : undefined,
      filled_quantity: Number(raw['executedQty']),
      avg_fill_price: raw['cummulativeQuoteQty'] && Number(raw['executedQty']) > 0
        ? Number(raw['cummulativeQuoteQty']) / Number(raw['executedQty'])
        : undefined,
      timestamp: new Date(Number(raw['transactTime'])).toISOString(),
      exchange: 'binance',
      dry_run: false,
    };
    this.record(result);
    return result;
  }

  private mapOKXResult(raw: Record<string, unknown>, spec: OrderSpec): OrderResult {
    const data = (raw['data'] as Record<string, string>[])[0];
    const result: OrderResult = {
      order_id: data['ordId'],
      client_order_id: data['clOrdId'],
      status: 'NEW',
      symbol: spec.symbol,
      side: spec.side,
      type: spec.type,
      quantity: spec.quantity,
      price: spec.price,
      filled_quantity: 0,
      timestamp: new Date().toISOString(),
      exchange: 'okx',
      dry_run: false,
    };
    this.record(result);
    return result;
  }

  private record(result: OrderResult): void {
    try {
      if (!existsSync(LEDGER_DIR)) mkdirSync(LEDGER_DIR, { recursive: true });
      appendFileSync(LEDGER_FILE, JSON.stringify(result) + '\n');
    } catch {
      // non-fatal — ledger write failure doesn't block the order
    }
  }
}
