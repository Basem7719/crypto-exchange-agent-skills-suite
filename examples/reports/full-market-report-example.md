# Example — Full Research Report on BTC/USDT (Binance Spot)

## Command
```
/crypto-report-generator pair=BTC/USDT exchange=binance market=spot timeframe=1h capital=5000
```

## Output

```
================================================================
  BTC/USDT — Full Research Report
  Generated: 2026-05-21 09:00 UTC
  Exchange:  Binance | Market: spot | Timeframe: 1h
================================================================

1. SNAPSHOT
   price ............ 64,180 USDT
   24h Δ ............ +1.8%
   vol_24h .......... 28.4 B USDT
   spread ........... 0.8 bps
   range 24h ........ 63,150 - 64,420

2. TECHNICAL ANALYSIS (1h)
   trend ............ up (EMA20=64,000 > EMA50=63,400 > EMA200=61,800)
   RSI(14) .......... 58 (room to run)
   MACD ............. bullish, hist +
   BB (20,2) ........ width 1.6%, price mid-band
   S1=63,800  S2=63,200
   R1=64,800  R2=65,400
   ATR(14) .......... 420
   TA_score ......... 72/100

3. SPOT VIEW
   buyer aggression .. 54% (taker buy/sell vol, 24h)
   recent listing .... no
   spot_score ....... 70/100

4. FUTURES VIEW
   n/a — spot market

5. LIQUIDITY & MICROSTRUCTURE
   spread ........... 0.8 bps
   depth ±0.05% ..... 8.4 M USDT
   depth ±0.1% ...... 14.8 M USDT
   slippage @ 3k .... ~0.15 bps
   liquidity_score .. 88/100

6. SENTIMENT
   n/a — spot context; for sentiment switch to USDM market_type

7. RISK SIZING (5,000 USDT, 1.0% risk, balanced profile)
   entry zone ....... 64,050 - 64,150
   stop ............. 63,650
   position size .... 0.099 BTC
   notional ......... 6,365 USDT  ← 127% of cash → reduce risk_pct
   ...risk_pct=0.5 instead:
   position size .... 0.049 BTC
   notional ......... 3,153 USDT  ← OK
   R:R to TP1 ....... 1.8
   fees share ....... 12% of risk
   GO

8. ENTRY & EXIT PLAN
   entry zone ....... 64,050 - 64,150 (limit)
   stop ............. 63,650
   TP1 .............. 64,750  (R=1.8, close 40%)
   TP2 .............. 65,300  (R=2.9, close 30%, move stop to BE)
   TP3 .............. 66,000  (R=4.1, close 30%)
   time stop ........ 24h
   invalidation ..... 1h close below 63,700

9. COMPOSITE SCORE
   72 (TA) × 0.30 + 70 (spot) × 0.25 + 88 (liq) × 0.20 + n/a (sent) + 75 (risk) × 0.10 = 75/100

10. FINAL VERDICT & CAVEATS
    VERDICT: BUY (composite 75, all gates passing)
    Caveats:
      - Volume below 30-day average; conviction is medium not high
      - 4h trend still above S2 = 63,200; broader structure intact
      - No major news scheduled in next 12h (per crypto-news-impact pre-check)

> Not financial advice. Verify all numbers before any action.
```
