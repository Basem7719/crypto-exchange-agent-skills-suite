# Example — Cross-Exchange Arbitrage Watch (info only)

## User prompt
```
/crypto-exchange-master "watch BTC/USDT spot spread between Binance and OKX, alert if > 20 bps"
```

## Skills called
1. `binance-market-scan` (every minute)
2. `okx-market-scan` (every minute)
3. `crypto-compare-pairs` (computes spread, emits alert if threshold breached)

## Sample output

```
=== Arbitrage Watch — BTC/USDT — Binance vs OKX ===

10:00 UTC   Binance 64,180   OKX 64,192   diff 12.0 USDT  (1.9 bps)   below threshold
10:01 UTC   Binance 64,175   OKX 64,182   diff  7.0 USDT  (1.1 bps)   below
10:02 UTC   Binance 64,210   OKX 64,275   diff 65.0 USDT (10.1 bps)   below
10:03 UTC   Binance 64,205   OKX 64,340   diff 135  USDT (21.0 bps)   ⚡ ALERT — threshold breached

⚠ NOTE: this is NOT a recommendation to arbitrage.
   Real arbitrage requires:
     - simultaneous fills on both venues (latency-sensitive)
     - cross-exchange capital pre-positioned (else withdraw/deposit cost dominates)
     - both legs filled within the latency budget
   Most retail "arb" attempts lose money on fees + slippage + transfer time.
```

## Reality check
For information only. This suite does **not** auto-arb; the executor is single-venue and gated. For genuine arbitrage you'd need a separate, latency-optimized system out of scope here.
