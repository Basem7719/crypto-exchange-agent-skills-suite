---
name: exchange-pair-finder
description: Check whether a coin or trading pair is listed on Binance, OKX, Bybit, or HTX, on which markets (spot, perpetual, futures), and with what trading status (live, suspended, delisted). Use this skill whenever the user asks "is X listed on", "where can I trade X", "does Binance have BILL", "find PLAY on OKX", "is SOL/USDT spot or perp", "what pairs exist for ARB", "compare listings for X". Always run this skill FIRST when the user mentions an unfamiliar or small-cap token, before any market scan or analysis. Returns a structured listing report per exchange, with the canonical symbol/instId format for each venue.
version: 1.0.0
category: data
compatible_with: [claude-code, openclaw, cursor, hermes]
exchanges: [binance, okx]
mode: analysis
license: MIT
---

# Exchange Pair Finder

Check whether a coin or trading pair exists on Binance and OKX (and optionally Bybit/HTX), on which markets, and in what status. Read-only, public endpoints, no auth.

## Purpose

Check whether a coin or trading pair is listed on Binance, OKX, Bybit, or HTX, on which markets (spot, perpetual, futures), and with what trading status (live, suspended, delisted). Use this skill whenever the user asks "is X listed on", "where can I trade X", "does Binance have BILL", "find PLAY on OKX", "is SOL/USDT spot or perp", "what pairs exist for ARB", "compare listings for X". Always run this skill FIRST when the user mentions an unfamiliar or small-cap token, before any market scan or analysis. Returns a structured listing report per exchange, with the canonical symbol/instId format for each venue.

This skill is part of the **crypto-exchange-agent-skills-suite**. See [`../../docs/architecture.md`](../../docs/architecture.md) for how it fits with the other 20 skills.

---

> **Why this skill matters:** Many small-cap or new tokens (BILL, PLAY, niche memes) may only be on one venue, may be in pre-market, may be already delisted, or may use a non-obvious symbol. Running this skill first prevents a downstream market-scan from failing with `Invalid symbol`.

---

## When to Use

- "is BILL on Binance"
- "does OKX have PLAY/USDT"
- "where can I buy ARB"
- "find SOL pairs"
- "is BTC perp listed on both Binance and OKX"
- "what's the canonical symbol for X on OKX"
- ANY time the user mentions a token you (or downstream skills) aren't 100% sure is listed on the named exchange

---

## Required Inputs

| Input | Required? | Example | Notes |
|-------|-----------|---------|-------|
| `coin` or `base` | yes | `BILL`, `PLAY`, `BTC` | Uppercase ticker |
| `quote` | optional | `USDT`, `USDC`, `BTC` | Default check `USDT` first, then `USDC` |
| `exchanges` | optional | `binance,okx` | Default `binance,okx` |
| `markets` | optional | `spot,perp,futures` | Default check all |

---

## Workflow

### Step 1 — Normalize the ticker
- Uppercase: `bill` → `BILL`
- Strip the quote if the user passed `BILL/USDT` — keep base = `BILL`, quote = `USDT`.

### Step 2 — For each exchange, fetch the instrument list

#### Binance
| Market | Endpoint | Filter |
|--------|----------|--------|
| Spot | `GET https://api.binance.com/api/v3/exchangeInfo` | `symbols[].baseAsset == "BILL" && status == "TRADING"` |
| USDS-M Futures | `GET https://fapi.binance.com/fapi/v1/exchangeInfo` | `symbols[].baseAsset == "BILL" && status == "TRADING" && contractType == "PERPETUAL"` |
| COIN-M Futures | `GET https://dapi.binance.com/dapi/v1/exchangeInfo` | `symbols[].baseAsset == "BILL"` |

#### OKX
| Market | Endpoint | Filter |
|--------|----------|--------|
| Spot | `GET https://www.okx.com/api/v5/public/instruments?instType=SPOT` | `baseCcy == "BILL" && state == "live"` |
| Perp | `GET https://www.okx.com/api/v5/public/instruments?instType=SWAP` | `instFamily == "BILL-USDT" \|\| baseCcy=="BILL"` |
| Futures | `GET .../instruments?instType=FUTURES` | same |

**Optimization:** these instrument lists are large but stable. Cache the response per session.

### Step 3 — Build the listing matrix

For each `(exchange, market)`, record:
- exists: `yes/no`
- canonical_symbol (Binance: `BILLUSDT`; OKX: `BILL-USDT-SWAP`)
- status: `TRADING` / `live` / `suspended` / `break` / `delisted`
- contract_type (futures only): `perpetual` / `delivery`
- min_size, tick_size, lot_size (useful downstream)
- onboard_date (if exposed) — flag if listed in the last 30 days

### Step 4 — Cross-check

If the token is only on one venue → flag it. If both venues list it but one is suspended → flag. If neither has it → suggest the user check the spelling or look at lower-tier venues (HTX/Bybit/Gate.io).

---

## Output Format

```
Pair Finder Report — <COIN>

Binance:
  · Spot BILL/USDT      → BILLUSDT       status=TRADING   minQty=0.1   tickSize=0.0001
  · USDS Perp           → not listed
  · COIN-M              → not listed

OKX:
  · Spot BILL/USDT      → BILL-USDT      state=live       lotSz=0.01   tickSz=0.0001
  · Perp BILL/USDT      → BILL-USDT-SWAP state=live       ctVal=10
  · Futures             → none

Summary: BILL trades on both Binance (spot only) and OKX (spot + perp).
Recommendation:
  - For pure spot, both work — compare liquidity with /exchange-liquidity-check.
  - For leveraged exposure, OKX perp BILL-USDT-SWAP is the only option.
```

If nothing found:

```
Pair Finder Report — XYZ
No active listings found on Binance or OKX. Suggestions:
  - Verify the ticker (some tokens use suffixes like XYZ2.0 or XYZ-OLD).
  - Check Bybit / HTX / Gate.io.
  - For on-chain-only tokens, the dex-microcap path is required (out of scope here).
```

---

## Edge Cases

- **Same ticker, different tokens:** `LUNA` (Terra Classic), `LUNA2` (new Luna). Always show the full canonical name from `baseAssetName` if available, plus the chain.
- **Stable vs non-stable quote:** A user asking "find BILL" may mean `BILL/USDT` or `BILL/USDC` or `BILL/BTC`. Default to USDT, list other quotes if found.
- **Suspended / break / non-trading status:** Don't show as "available." Mark explicitly as suspended.
- **Pre-market on Binance Alpha or OKX:** Sometimes a token is on OKX "pre-market" before regular spot. Note this.
- **Wrapped versions:** `WBTC` ≠ `BTC`, `WETH` ≠ `ETH`. Don't auto-resolve.
- **Geo-restricted markets:** Binance may list a pair globally but block it for some regions. Out of scope to check IP-level restrictions here.

---

## Handoff

- `crypto-exchange-master` calls this FIRST when the symbol is ambiguous or small-cap.
- Downstream skills (`binance-market-scan`, `okx-market-scan`, `crypto-technical-analysis`) consume the canonical symbol from this skill's output.
- `crypto-compare-pairs` uses this to filter pairs that exist on both venues.

---

## Example Commands

```
/exchange-pair-finder BILL
/exchange-pair-finder PLAY USDT
/exchange-pair-finder SOL exchanges=binance,okx markets=spot,perp
/exchange-pair-finder BTC/USDT
/exchange-pair-finder XYZ                     # likely returns "not found"
```

Arabic:
```
/exchange-pair-finder ابحث BILL على Binance و OKX
/exchange-pair-finder هل PLAY/USDT موجود على OKX
```

---

## Optional Inputs

| Input | Default | Example |
|-------|---------|---------|
| `timeframe` | `1h` | `15m`, `4h`, `1d` |
| `verbose` | `false` | `true` for raw endpoint dumps |

The full list of inputs is documented under [`## Required Inputs`](#required-inputs) above. Anything not marked required is optional with sensible defaults.

---

## Exchange-Specific Handling

### Binance
- Endpoints, symbol formats, and quirks are documented in [`../../docs/binance-guide.md`](../../docs/binance-guide.md).
- Symbol format: `BTCUSDT` (no separator). Perp uses USDM endpoints (`fapi.binance.com`).

### OKX
- Endpoints, bar values, and quirks are documented in [`../../docs/okx-guide.md`](../../docs/okx-guide.md).
- Symbol format: `BTC-USDT` (spot), `BTC-USDT-SWAP` (perp), `BTC-USDT-251226` (futures).
- Bar values are uppercase from `1H` upward.

---

## Quality Checks

- All required fields populated; no `null` in required positions.
- Numeric outputs within expected ranges (no negative volumes, RSI in [0,100], etc.).
- Data timestamp within last 5 minutes when the request is real-time.
- For multi-exchange outputs, both Binance and OKX figures use the same time window.
- If an endpoint returns an error, the skill surfaces it explicitly rather than inventing values.
