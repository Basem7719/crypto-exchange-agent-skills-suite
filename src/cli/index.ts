#!/usr/bin/env node
import { BinanceClient } from '../clients/binance-client.js';
import { OKXClient } from '../clients/okx-client.js';
import { MarketDataService } from '../services/market-data-service.js';
import { AccountService } from '../services/account-service.js';
import { RiskGateService } from '../services/risk-gate-service.js';
import { PaperTradingService } from '../services/paper-trading-service.js';
import { join } from 'path';
import { homedir } from 'os';

const cmd = process.argv[2];

function buildClients() {
  const binance = new BinanceClient({
    apiKey: process.env['BINANCE_API_KEY'] ?? '',
    apiSecret: process.env['BINANCE_API_SECRET'] ?? '',
  });
  const okx = new OKXClient({
    apiKey: process.env['OKX_API_KEY'] ?? '',
    apiSecret: process.env['OKX_API_SECRET'] ?? '',
    passphrase: process.env['OKX_API_PASSPHRASE'] ?? '',
    testnet: process.env['DRY_RUN'] === 'true',
  });
  return { binance, okx };
}

async function checkBinance() {
  const { binance, okx } = buildClients();
  const svc = new MarketDataService(binance, okx);
  const result = await svc.checkConnectivity('binance');
  console.log(result.ok
    ? `✅ Binance reachable — ${result.latency_ms}ms`
    : `❌ Binance unreachable (${result.latency_ms}ms)`);
}

async function checkOKX() {
  const { binance, okx } = buildClients();
  const svc = new MarketDataService(binance, okx);
  const result = await svc.checkConnectivity('okx');
  console.log(result.ok
    ? `✅ OKX reachable — ${result.latency_ms}ms`
    : `❌ OKX unreachable (${result.latency_ms}ms)`);
}

async function marketTest() {
  const { binance, okx } = buildClients();
  const svc = new MarketDataService(binance, okx);
  const [btcB, btcO] = await Promise.all([
    svc.getTicker('binance', 'BTCUSDT'),
    svc.getTicker('okx', 'BTC-USDT'),
  ]);
  console.log('Binance BTC/USDT:', btcB.price, `(${btcB.change_24h_pct.toFixed(2)}%)`);
  console.log('OKX BTC/USDT:    ', btcO.price, `(${btcO.change_24h_pct.toFixed(2)}%)`);
}

async function accountRead() {
  const { binance, okx } = buildClients();
  const svc = new AccountService(binance, okx);
  const exchange = (process.argv[3] ?? 'binance') as 'binance' | 'okx';
  const snapshot = await svc.getSnapshot(exchange);
  console.log(JSON.stringify(snapshot, null, 2));
}

async function orderDryRun() {
  const maxUsdt = Number(process.env['MAX_TRADE_USDT'] ?? 500);
  const riskGate = new RiskGateService({
    maxOrderNotionalUsdt: maxUsdt,
    maxDailyLossUsdt: Number(process.env['MAX_DAILY_LOSS_USDT'] ?? 100),
    maxLeverage: 20,
    maxRiskPctPerTrade: 5,
    dryRun: true,
  });

  const spec = {
    exchange: 'binance' as const,
    market_type: 'spot' as const,
    symbol: 'BTCUSDT',
    side: 'BUY' as const,
    type: 'LIMIT' as const,
    quantity: 0.001,
    price: 65000,
    client_order_id: 'dry-test-001',
    generated_at: new Date().toISOString(),
  };

  const result = riskGate.check(spec, 10000);
  console.log(riskGate.summarize(result));
}

async function tradePaper() {
  const ledgerPath = join(homedir(), '.crypto-skills', 'paper-trades.jsonl');
  const svc = new PaperTradingService(ledgerPath);
  console.log(svc.summary());
}

const commands: Record<string, () => Promise<void>> = {
  'check:binance': checkBinance,
  'check:okx': checkOKX,
  'market:test': marketTest,
  'account:read': accountRead,
  'order:dry-run': orderDryRun,
  'trade:paper': tradePaper,
};

if (!cmd || !commands[cmd]) {
  console.log('Available commands:', Object.keys(commands).join(', '));
  process.exit(0);
}

commands[cmd]!().catch((err: Error) => {
  console.error('Error:', err.message);
  process.exit(1);
});
