# Workflow — Analysis Only

> Pure research, no account access, no execution. Default workflow.

## Pre-conditions
- Suite installed.
- No API keys required (only public endpoints used).
- Mode: `analysis_only`.

## Trigger phrases
- "analyze BTC/USDT"
- "what's the technical picture for ETH"
- "give me an overview of SOL on OKX"
- "حلل BTC/USDT"

## Skill chain
```
user intent
  ↓
crypto-exchange-master
  ↓
binance-market-scan OR okx-market-scan        (snapshot)
  ↓
crypto-technical-analysis                     (TA score)
  ↓
crypto-spot-analysis OR crypto-futures-analysis (market-specific)
  ↓
exchange-liquidity-depth                       (microstructure)
  ↓
final synthesis → reply
```

## Expected output
A short, structured summary (1 screen):
- snapshot (price, 24h Δ, vol)
- technical view (trend, RSI, MACD, S/R)
- liquidity (spread, depth)
- one-line read on the setup

## Stop conditions
- Pair not listed on the chosen exchange → suggest `exchange-pair-finder`.
- Spread > 0.5% → flag thin book, lower confidence.
- All sub-skills succeed → synthesis proceeds.

## Reference example
[examples/binance/btc-usdt-spot-analysis.md](../examples/binance/btc-usdt-spot-analysis.md)
