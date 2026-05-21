# Workflow — Cross-Exchange Comparison

> Compare the same pair on Binance vs OKX.

## Trigger phrases
- "compare BTC/USDT between Binance and OKX"
- "where's better liquidity for SOL?"
- "قارن BTC بين Binance و OKX"

## Skill chain
```
1. crypto-exchange-master           (parse pair, both exchanges)
2. binance-market-scan              (snapshot Binance)
3. okx-market-scan                  (snapshot OKX)
4. exchange-liquidity-depth         (Binance side)
5. exchange-liquidity-depth         (OKX side)
6. (if perp) crypto-futures-analysis (Binance)
7. (if perp) crypto-futures-analysis (OKX)
8. crypto-compare-pairs             (synthesize the table)
```

## Output
A comparison table:
| Metric | Binance | OKX |
|--------|---------|-----|
| Price | ... | ... |
| 24h Volume (USDT) | ... | ... |
| Spread (bps) | ... | ... |
| Depth ±0.1% (USDT) | ... | ... |
| Funding (perp) | ... | ... |
| OI Δ 24h | ... | ... |
| Recommended exchange for this size | ... | ... |

## Use cases
- Choose where to enter for best price/slippage.
- Detect arbitrage candidates (when divergence > fees + slippage).
- Compare funding for a perp carry.

## Reference
[examples/cross-exchange/compare-binance-okx.md](../examples/cross-exchange/compare-binance-okx.md)
[examples/cross-exchange/liquidity-comparison.md](../examples/cross-exchange/liquidity-comparison.md)
[examples/cross-exchange/arbitrage-watch-example.md](../examples/cross-exchange/arbitrage-watch-example.md)
