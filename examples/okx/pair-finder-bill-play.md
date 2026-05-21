# Example — Pair Finder BILL and PLAY on OKX (focused)

## User prompt
```
/exchange-pair-finder BILL PLAY on OKX
```

## Output

```
=== Pair Finder — OKX ===

BILL/USDT
  spot ......... BILL-USDT     ✓ listed
              spot 24h vol ~ 2.1 M USDT, spread ~ 18 bps
  swap ......... NOT LISTED   (no BILL-USDT-SWAP)
  futures ...... NOT LISTED

PLAY/USDT
  spot ......... PLAY-USDT     ✓ listed
              spot 24h vol ~ 3.1 M USDT, spread ~ 15 bps
  swap ......... NOT LISTED
  futures ...... NOT LISTED

NEXT STEPS
  /okx-market-scan BILL-USDT
  /okx-market-scan PLAY-USDT
  /exchange-liquidity-depth pair=BILL-USDT exchange=okx
```

## Notes
Low-cap pairs frequently have a spot listing but no perp/futures. For derivatives, restrict to high-volume pairs.
