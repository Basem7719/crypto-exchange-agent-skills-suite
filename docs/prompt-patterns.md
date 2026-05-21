# Prompt Patterns

How to phrase requests so the suite routes correctly.

## The Three Phrasing Levels

### 1. Imperative (best)
```
/crypto-report-generator pair=BTC/USDT exchange=binance market=spot timeframe=1h capital=5000
```
Direct skill call with explicit args. Always works.

### 2. Routed natural language
```
/crypto-exchange-master "full report on BTC/USDT on Binance spot, 1h, 5000 USDT capital"
```
Master parses intent and dispatches. Works for any English or Arabic phrasing.

### 3. Bare natural language
```
Give me a full report on BTC.
```
Master fills in defaults: exchange=binance, market=spot, timeframe=1h, capital from `configs/risk-profiles.json`. May ask one clarifying question.

## Useful Patterns by Goal

### "I'm exploring a new coin"
```
/exchange-pair-finder <COIN> USDT on Binance and OKX
/exchange-liquidity-depth pair=<COIN>/USDT exchange=<best_one>
/crypto-spot-analysis pair=<COIN>/USDT exchange=<best_one> timeframe=1h
```

### "I have a futures idea"
```
/crypto-futures-analysis pair=BTC/USDT exchange=binance market=usdm
/crypto-sentiment-scan pair=BTC/USDT exchange=binance market=usdm
/crypto-risk-manager pair=BTC/USDT capital=... exchange=binance market=usdm leverage=...
/crypto-entry-exit-planner ...
```

### "I want to scan my watchlist"
```
/crypto-watchlist-manager scan
```
Returns composite scores for every pair; if any pair triggered an alert rule, the master auto-suggests `crypto-report-generator` on it.

### "I want to compare exchanges"
```
/crypto-compare-pairs BTC/USDT exchange=binance
/crypto-compare-pairs BTC/USDT exchange=okx
```
Or use the cross-exchange example: [examples/cross-exchange/compare-binance-okx.md](../examples/cross-exchange/compare-binance-okx.md).

## Patterns to Avoid

| Bad | Why | Better |
|-----|-----|--------|
| "Should I buy?" | Advice request | `/crypto-report-generator …` (skill returns verdict, not advice) |
| "Trade BTC now" | Ambiguous; no plan | `/crypto-entry-exit-planner …` then `/exchange-order-planner …` |
| "Use all my money" | Risk-manager will refuse | specify `risk_pct` and `capital` explicitly |
| "Submit live without confirm" | Executor refuses | provide `confirm=CONFIRM` and `dry_run=false` |

## Arabic Phrasing

The master understands common Arabic verb forms:

| Arabic | Maps to |
|--------|--------|
| حلل لي / احلل / حلل | analyze → analysis skill |
| ابحث عن / فين | search → pair-finder |
| تقرير كامل / تقرير شامل | full report → report-generator |
| خطة دخول / خطة خروج | entry/exit plan → entry-exit-planner |
| كم حجم المركز | position size → risk-manager |
| ايش الشعور / مزاج السوق | sentiment → sentiment-scan |
| أثر الخبر / تأثير الخبر | news impact → news-impact |
| اضف للقائمة / احذف من القائمة | watchlist add/remove |
| قارن / مقارنة | compare → compare-pairs |
| نفذ الأمر / نفذ مباشرة | execute → trading-executor (with safety) |

If a request is ambiguous, the master asks **one** clarifying question.
