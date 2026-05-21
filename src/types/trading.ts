export type Exchange = 'binance' | 'okx';
export type MarketType = 'spot' | 'usdm' | 'coinm' | 'swap' | 'futures';
export type OrderSide = 'BUY' | 'SELL';
export type OrderType =
  | 'MARKET'
  | 'LIMIT'
  | 'STOP'
  | 'STOP_MARKET'
  | 'TAKE_PROFIT'
  | 'TAKE_PROFIT_MARKET';
export type OrderStatus =
  | 'NEW'
  | 'PARTIALLY_FILLED'
  | 'FILLED'
  | 'CANCELED'
  | 'REJECTED'
  | 'EXPIRED';
export type TradingMode = 'analysis_only' | 'paper_trading' | 'execution_ready';

export interface OrderSpec {
  exchange: Exchange;
  market_type: MarketType;
  symbol: string;
  side: OrderSide;
  type: OrderType;
  quantity: number;
  price?: number;
  stop_price?: number;
  take_profit?: number;
  stop_loss?: number;
  leverage?: number;
  reduce_only?: boolean;
  post_only?: boolean;
  client_order_id: string;
  generated_at: string;
}

export interface OrderResult {
  order_id: string;
  client_order_id: string;
  status: OrderStatus;
  symbol: string;
  side: OrderSide;
  type: OrderType;
  quantity: number;
  price?: number;
  filled_quantity: number;
  avg_fill_price?: number;
  timestamp: string;
  exchange: Exchange;
  dry_run: boolean;
}

export interface AccountBalance {
  asset: string;
  free: number;
  locked: number;
  total: number;
}

export interface Position {
  symbol: string;
  side: 'long' | 'short';
  size: number;
  entry_price: number;
  mark_price: number;
  unrealized_pnl: number;
  leverage: number;
}

export interface AccountSnapshot {
  exchange: Exchange;
  timestamp: string;
  total_equity_usdt: number;
  balances: AccountBalance[];
  open_positions: Position[];
}

export interface MarketTicker {
  symbol: string;
  exchange: Exchange;
  price: number;
  change_24h_pct: number;
  volume_24h_usdt: number;
  high_24h: number;
  low_24h: number;
  timestamp: string;
}

export interface RiskCheckResult {
  approved: boolean;
  reasons: string[];
  risk_pct: number;
  reward_risk_ratio?: number;
  max_loss_usdt: number;
}

export interface PaperTrade {
  id: string;
  timestamp: string;
  exchange: Exchange;
  symbol: string;
  side: OrderSide;
  type: OrderType;
  quantity: number;
  price: number;
  notional: number;
  pnl?: number;
  status: 'open' | 'closed' | 'cancelled';
}
