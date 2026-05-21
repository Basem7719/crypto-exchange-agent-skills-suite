---
name: exchange-account-review
description: Review the user's Binance or OKX account state — total balance, per-asset breakdown, open spot positions, open futures positions with unrealized PnL, open orders, recent fills, fee tier, and a basic portfolio risk summary. Use this skill when the user asks "show my balance", "what positions do I have", "how much am I down on X", "open orders on Binance", "my account on OKX", "review my portfolio". Requires READ-ONLY API credentials. Never withdraws, transfers, or trades. If API keys are not configured or have wrong scope, the skill must stop and instruct the user to configure read-only keys.
version: 1.0.0
category: account
compatible_with: [claude-code, openclaw, cursor, hermes]
exchanges: [binance, okx]
mode: analysis
license: MIT
---

# Exchange Account Review

Read-only inspection of Binance or OKX account state. Balances, positions, PnL, open orders, fees. Never writes.

## Purpose

Review the user's Binance or OKX account state — total balance, per-asset breakdown, open spot positions, open futures positions with unrealized PnL, open orders, recent fills, fee tier, and a basic portfolio risk summary. Use this skill when the user asks "show my balance", "what positions do I have", "how much am I down on X", "open orders on Binance", "my account on OKX", "review my portfolio". Requires READ-ONLY API credentials. Never withdraws, transfers, or trades. If API keys are not configured or have wrong scope, the skill must stop and instruct the user to configure read-only keys.

This skill is part of the **crypto-exchange-agent-skills-suite**. See [`../../docs/architecture.md`](../../docs/architecture.md) for how it fits with the other 20 skills.

---

> **CRITICAL SECURITY:**
> - API keys used here MUST have ONLY the "Read" / "View" scope.
> - API keys MUST NOT have withdrawal scope. Withdraw permission on a leaked key drains the account.
> - Whenever possible, restrict the key to specific IPs.
> - The skill will refuse to proceed if it detects (or suspects) write/withdraw scope.
> - Never paste API keys into chat. Use the configured credential store (env vars, OS keychain, or the exchange CLI's profile file).

---

## When to Use

- "show my balance on Binance"
- "what are my open positions on OKX"
- "how much USDT do I have"
- "my open orders for BTC"
- "what's my PnL today"
- "fee tier on Binance"
- "review my account"

This is the ONLY skill in the package that reads private account data. All other skills are public/market.

---

## Required Inputs

| Input | Required? | Example |
|-------|-----------|---------|
| `exchange` | yes | `binance` / `okx` |
| `profile` | optional | named credential profile (e.g., `main`, `subaccount-1`) |
| `view` | yes | `balance` / `positions` / `orders` / `fills` / `all` |
| `account_type` | optional | `spot` / `margin` / `usdm` / `coinm` / `funding` (binance) — or `spot` / `swap` / `funding` (okx) |
| `pair` | optional | filter to one symbol |

---

## Credential Setup

This skill does NOT collect credentials in chat. Configuration is environment-specific:

### Binance
- Recommended: `binance-cli` (from `@binance/binance-cli`) with `binance auth login` (OAuth) or a key stored via `binance auth set --profile <name>`.
- Fallback: env vars `BINANCE_API_KEY`, `BINANCE_API_SECRET` with read-only scope.
- Verify scope: call `GET /sapi/v1/account/apiRestrictions` and check `enableWithdrawals == false` AND `enableSpotAndMarginTrading == false` (for pure read).

### OKX
- Recommended: `okx-cli` (from `@okx_ai/okx-trade-cli`) with `okx auth login` (OAuth) or a key stored in `~/.okx/config.toml`.
- Required: API key + secret + passphrase. Passphrase is required for OKX private endpoints.
- Verify scope: call `GET /api/v5/users/subaccount/apikey` and inspect `perm` — must be `read_only`.

The skill must:
1. Check whether credentials exist.
2. Verify scope is read-only.
3. If either check fails, REFUSE and instruct the user how to fix it.

---

## Endpoint Map (private; READ scope only)

### Binance — base depends on account type

| Account | Endpoint | Purpose |
|---------|----------|---------|
| Spot | `GET /api/v3/account` | balances |
| Spot | `GET /api/v3/openOrders` | open orders |
| Spot | `GET /api/v3/myTrades?symbol=BTCUSDT` | recent fills |
| Spot | `GET /sapi/v1/asset/wallet/balance` | wallet across types |
| USDS-M | `GET /fapi/v2/account` | balance + positions |
| USDS-M | `GET /fapi/v2/positionRisk` | open positions per symbol |
| USDS-M | `GET /fapi/v1/openOrders` | open futures orders |
| USDS-M | `GET /fapi/v1/userTrades?symbol=BTCUSDT` | recent fills |
| Universal | `GET /sapi/v1/account/apiRestrictions` | scope check |

### OKX — base `https://www.okx.com`

| Endpoint | Purpose |
|----------|---------|
| `GET /api/v5/account/balance` | balances by account |
| `GET /api/v5/account/positions` | open derivatives positions |
| `GET /api/v5/account/positions-history` | closed positions |
| `GET /api/v5/account/account-position-risk` | unified risk view |
| `GET /api/v5/trade/orders-pending` | open orders |
| `GET /api/v5/trade/fills` | recent fills |
| `GET /api/v5/account/config` | account config + fee tier |

---

## Workflow

1. Resolve credentials and profile.
2. Verify scope is read-only. If not → stop, tell user.
3. Pull the requested data.
4. Convert and aggregate.
5. Present.

### Step-by-step for `view=all` on Binance

a. Call `/sapi/v1/account/apiRestrictions` → confirm read-only.
b. Call `/sapi/v1/asset/wallet/balance` → totals by wallet.
c. For each non-zero wallet:
   - Spot: `/api/v3/account` → per-asset balances; price-check via `binance-market-scan` for USD value.
   - USDS-M: `/fapi/v2/account` + `/fapi/v2/positionRisk` → margin balance, unrealized PnL, leverage per position.
d. `/api/v3/openOrders` and `/fapi/v1/openOrders`.
e. Last 24h fills if asked.
f. Compose summary.

---

## Output Format

```
Account Review · <EXCHANGE> · profile=<name>
Scope check: read-only ✓   Withdraw permission: disabled ✓

Total estimated value: $<usd>

Balances by wallet
  Spot:           $<x>  USDT  + <n> non-USDT assets (top 3: <a>, <b>, <c>)
  USDS-M Futures: $<x>  margin balance   $<y> unrealized PnL
  Funding:        $<x>
  Earn / staked:  $<x>

Open positions (USDS-M / SWAP)
Pair          Side   Size       Entry      Mark       uPnL ($)   uPnL (%)   Leverage
BTCUSDT       LONG   0.10 BTC   62,500     65,000     +250       +4.0%      5×
ETHUSDT       SHORT  3.0 ETH    3,600      3,520      +240       +2.2%      3×

Open orders
ID         Pair       Type       Side    Price     Qty       Status
123456     SOLUSDT    LIMIT      BUY     190.00    1.0       NEW
123457     BTCUSDT    STOP_MARKET SELL   60,000    0.05      NEW (stop)

Recent fills (last 24h)
Time     Pair       Side    Price     Qty       Fee
13:42    BTCUSDT    BUY     65,000    0.05      0.0003 BTC
...

Fee tier: VIP <n>  · Maker <m%> · Taker <t%>

Portfolio quick risk
  · Largest position: <pair> at <pct%> of total equity
  · BTC beta exposure (rough): <pct%>
  · Cross-margin headroom: <pct%>
  · Open-orders notional: <usdt>  (<pct%> of equity)

Suggested actions (informational)
  · No high-risk concentration detected, OR
  · One position is >40% of equity — consider partial reduction or stops review.
  · You have funding charges accruing on <X> perp positions (next charge in <Y> min).
```

---

## Edge Cases & Hard Rules

- **Withdraw permission ON:** refuse. Tell the user exactly how to disable it on the exchange.
- **No credentials:** refuse with a setup guide for the runtime.
- **Sub-account access:** treat as a separate profile. Never aggregate cross-account unless the user explicitly asks.
- **Demo / paper accounts:** OKX supports `x-simulated-trading: 1` header → label the output as DEMO so the user can't confuse with live.
- **Position-mode (one-way vs hedge):** OKX reports differently. Detect from `/api/v5/account/config` `posMode`.
- **Rate limits:** private endpoints have lower per-account limits. Cache the last pull for ~30s if user asks repeatedly.
- **Large account, many positions:** paginate. Default to summary; expand on request.

---

## Handoff

- Standalone — does NOT call market scans for trading (it does call market-scan only for spot-price conversions to USD).
- `crypto-risk-manager` can read open positions from here to check concurrent risk and correlation.
- `exchange-trading-executor` requires this skill to have validated read scope as a precondition.

---

## Example Commands

```
/exchange-account-review balance exchange=binance
/exchange-account-review positions exchange=okx
/exchange-account-review orders exchange=binance pair=BTC/USDT
/exchange-account-review all exchange=binance profile=main
/exchange-account-review fills exchange=okx pair=ETH-USDT-SWAP
```

Arabic:
```
/exchange-account-review أرصدتي على Binance
/exchange-account-review مراكزي على OKX
/exchange-account-review أوامري المفتوحة BTC/USDT على Binance
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
