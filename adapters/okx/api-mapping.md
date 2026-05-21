# OKX API Mapping

Endpoint mapping from suite concepts to OKX v5 endpoints. Base: `https://www.okx.com`.

| Suite concept | Endpoint | Auth |
|---------------|----------|------|
| system status | `GET /api/v5/system/status` | none |
| instruments | `GET /api/v5/public/instruments?instType=SPOT/SWAP/FUTURES/OPTION` | none |
| ticker | `GET /api/v5/market/ticker?instId=` | none |
| candles | `GET /api/v5/market/candles?instId=&bar=` | none |
| history candles | `GET /api/v5/market/history-candles` | none |
| order book | `GET /api/v5/market/books?instId=&sz=` | none |
| funding rate | `GET /api/v5/public/funding-rate?instId=` | none |
| funding history | `GET /api/v5/public/funding-rate-history` | none |
| open interest | `GET /api/v5/public/open-interest?instType=SWAP` | none |
| Rubik LSR (account) | `GET /api/v5/rubik/stat/contracts/long-short-account-ratio` | none |
| Rubik LSR (volume) | `GET /api/v5/rubik/stat/taker-volume` | none |
| account balance | `GET /api/v5/account/balance` | signed |
| positions | `GET /api/v5/account/positions` | signed |
| api key info | `GET /api/v5/users/subaccount/apikey` | signed |
| new order | `POST /api/v5/trade/order` | signed |
| cancel order | `POST /api/v5/trade/cancel-order` | signed |
| order info | `GET /api/v5/trade/order?instId=&ordId=` | signed |
| open orders | `GET /api/v5/trade/orders-pending` | signed |
| set leverage | `POST /api/v5/account/set-leverage` | signed |
| set position mode | `POST /api/v5/account/set-position-mode` | signed |

## New order body example (swap with attached TP/SL)

```json
{
  "instId": "BTC-USDT-SWAP",
  "tdMode": "isolated",
  "side": "buy",
  "posSide": "long",
  "ordType": "post_only",
  "px": "64200",
  "sz": "50",
  "clOrdId": "cs2026052100001",
  "attachAlgoOrds": [
    {"algoOrdType":"tp", "tpTriggerPx":"66000", "tpOrdPx":"-1"},
    {"algoOrdType":"sl", "slTriggerPx":"63500", "slOrdPx":"-1"}
  ]
}
```

`tpOrdPx=-1` means market order on trigger; for a limit TP, set the actual price.

## Signing (Python sample)

```python
import time, base64, hmac, hashlib
ts = time.strftime("%Y-%m-%dT%H:%M:%S", time.gmtime()) + f".{int(time.time()*1000)%1000:03d}Z"
prehash = ts + "POST" + "/api/v5/trade/order" + body_json
sign = base64.b64encode(hmac.new(secret.encode(), prehash.encode(), hashlib.sha256).digest()).decode()
headers = {
  "OK-ACCESS-KEY": key,
  "OK-ACCESS-SIGN": sign,
  "OK-ACCESS-TIMESTAMP": ts,
  "OK-ACCESS-PASSPHRASE": passphrase,
  "Content-Type": "application/json"
}
```
