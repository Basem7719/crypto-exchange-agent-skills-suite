# USAGE — Full Usage Guide

How to use **crypto-exchange-agent-skills-suite** in practice.

---

## 1. Mental Model

The suite is organized as **routing layer → data layer → analysis layer → decision layer → execution layer**.

```
┌────────────────────┐
│  USER INTENT       │
└─────────┬──────────┘
          │
          ▼
┌────────────────────────────────┐
│  crypto-exchange-master        │  ← routing layer (1)
└─────────┬──────────────────────┘
          │
          ▼
┌────────────────────────────────┐
│  binance-market-scan           │  ← data layer (5)
│  okx-market-scan               │
│  exchange-pair-finder          │
│  exchange-liquidity-depth      │
│  exchange-account-review       │
└─────────┬──────────────────────┘
          │
          ▼
┌────────────────────────────────┐
│  crypto-technical-analysis     │  ← analysis layer (7)
│  crypto-spot-analysis          │
│  crypto-futures-analysis       │
│  crypto-compare-pairs          │
│  crypto-watchlist-manager      │
│  crypto-sentiment-scan         │
│  crypto-news-impact            │
└─────────┬──────────────────────┘
          │
          ▼
┌────────────────────────────────┐
│  crypto-risk-manager           │  ← decision layer (3)
│  crypto-entry-exit-planner     │
│  exchange-order-planner        │
└─────────┬──────────────────────┘
          │
          ▼
┌────────────────────────────────┐
│  exchange-paper-trading        │  ← execution layer (2)
│  exchange-trading-executor     │
└─────────┬──────────────────────┘
          │
          ▼
┌────────────────────────────────┐
│  crypto-report-generator       │  ← report layer (1)
│  strategy-backtest-planner     │  ← strategy layer (1)
│  crypto-skill-builder          │  ← meta layer (1)
└────────────────────────────────┘
```

---

## 2. Calling Patterns

### Direct (you know the skill)
```
/crypto-futures-analysis pair=BTC/USDT exchange=binance market=usdm
```

### Routed (let the master pick)
```
/crypto-exchange-master "analyze BTC futures on Binance"
```

The master parses the intent, identifies `crypto-futures-analysis` is the right next step, and either runs it or asks for clarification.

### Pipelined (multiple skills in sequence)
The master can chain skills:
```
/crypto-exchange-master "give me a full report on ETH/USDT on OKX"
→ okx-market-scan → crypto-technical-analysis → crypto-spot-analysis
→ exchange-liquidity-depth → crypto-risk-manager → crypto-entry-exit-planner
→ crypto-report-generator (synthesis)
```

---

## 3. By Use Case

### 3.1 "Is this coin available?"
```
/exchange-pair-finder COIN USDT on Binance and OKX
```
Returns canonical symbol per exchange and a quick liquidity hint.

### 3.2 "Snapshot a pair"
```
/binance-market-scan BTC/USDT
/okx-market-scan BTC-USDT
```

### 3.3 "Spot analysis"
```
/crypto-spot-analysis pair=SOL/USDT exchange=binance timeframe=1h
```

### 3.4 "Futures analysis"
```
/crypto-futures-analysis pair=BTC/USDT exchange=binance market=usdm timeframe=4h
/crypto-futures-analysis pair=ETH/USDT exchange=okx market=swap timeframe=1h
```

### 3.5 "Technical only"
```
/crypto-technical-analysis pair=BTC/USDT exchange=binance timeframe=1h
```

### 3.6 "Compare pairs"
```
/crypto-compare-pairs BTC/USDT ETH/USDT SOL/USDT exchange=binance timeframe=4h
```

### 3.7 "Sentiment / mood"
```
/crypto-sentiment-scan pair=BTC/USDT exchange=binance market=usdm window=24h
```

### 3.8 "News impact"
```
/crypto-news-impact headline="ETF approved" pair=ETH/USDT exchange=binance
```

### 3.9 "Watchlist"
```
/crypto-watchlist-manager add BTC ETH SOL XRP exchange=binance
/crypto-watchlist-manager scan
```

### 3.10 "Plan a trade"
```
/crypto-risk-manager pair=BTC/USDT capital=5000 risk_pct=1 exchange=binance
/crypto-entry-exit-planner pair=BTC/USDT exchange=binance timeframe=1h
/exchange-order-planner pair=BTC/USDT exchange=binance market=spot side=buy order_type=limit qty=0.01 price=64250
```

### 3.11 "Paper trade"
```
/exchange-paper-trading start pair=BTC/USDT exchange=binance capital=10000
/exchange-paper-trading apply_plan last
/exchange-paper-trading status
/exchange-paper-trading close pair=BTC/USDT
```

### 3.12 "Live trade (advanced)"
```
/exchange-account-review exchange=binance   # confirm read-only
/exchange-trading-executor spec=last_plan dry_run=true
/exchange-trading-executor spec=last_plan dry_run=false confirm=CONFIRM
```

### 3.13 "Account review"
```
/exchange-account-review exchange=binance market=spot
/exchange-account-review exchange=okx market=swap
```

### 3.14 "Full report"
```
/crypto-report-generator pair=BTC/USDT exchange=binance market=spot timeframe=1h capital=5000
/crypto-report-generator pair=ETH/USDT exchange=okx market=swap timeframe=4h include_pdf=true
```

### 3.15 "Backtest a strategy idea"
```
/strategy-backtest-planner "EMA20/50 cross with RSI filter" pair=BTC/USDT exchange=binance market=usdm timeframe=1h direction=long_only
```

### 3.16 "Extend the suite"
```
/crypto-skill-builder skill_name=binance-margin-analyzer purpose="..." category=analysis mode=analysis
```

---

## 4. Arabic Triggers

Every skill recognizes Arabic trigger phrases. See each skill's `examples.md`. Some quick ones:

```
/crypto-exchange-master حلل لي BTC/USDT على Binance
/crypto-exchange-master تقرير كامل عن ETH في OKX
/exchange-pair-finder ابحث عن BILL/USDT في Binance و OKX
/crypto-risk-manager احسب حجم المركز على BTC براس مال 5000
/crypto-watchlist-manager اضف BTC و ETH للقائمة
```

---

## 5. Agent Modes

The agent has four configurable modes (defined in `configs/agent-modes.json`):

| Mode | Account access | Live trades | Use case |
|------|----------------|-------------|----------|
| `analysis_only` (default) | none | no | research, learning |
| `planning` | read-only | no | full planning, no execution |
| `paper_trading` | read-only | no | paper ledger only |
| `execution_ready` | trade+read | yes (gated) | live trading, with all 12 gates |

Set the mode via:
```
/crypto-exchange-master set_mode planning
```

---

## 6. Tips

- Always run with the **smaller** account first. Even at 100 USDT, the math has to work.
- Run a pair through `exchange-paper-trading` for at least 10 trades before considering it for live.
- If you only ever use `crypto-report-generator`, you've already got 80% of the value of the suite.
- The 12 executor gates are **not optional**. If one fails, there is a real reason.
