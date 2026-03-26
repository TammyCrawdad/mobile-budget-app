---
name: market-briefing
description: "Prepare a daily pre-market stock briefing for Hung's watchlist (AAPL, PLTR, RKLB, GOOGL, SNOW, AMZN, NVDA, AMD, APLD). Use when generating the morning market report — overnight news, unusual options activity, and social sentiment per ticker. Deliver as a concise bullet-point Telegram message. Triggered by the daily 7:30 AM ET cron job or when Hung asks for a market update."
---

# Market Briefing Skill

## Overview

Produce a tight, signal-rich pre-market briefing for Hung's options watchlist. Only surface what's actionable — skip quiet tickers.

## Watchlist

See `references/watchlist.md` for ticker context and Hung's strategy.

## Workflow

### Step 1 — Fetch structured data

Run the data script to pull real price, options, news, and sentiment data:

```bash
python3 ~/.openclaw/workspace/skills/market-briefing/scripts/fetch_market_data.py 2>/dev/null
```

This returns JSON with:
- **Broad market** (_broad_market key): SPY, QQQ, DIA, VIX — last price, prev close, % change, pre-market price/% (if available)
- **Per ticker**: 
  - **price**: last price, previous close, % change, pre-market price/% (if available)
  - **options**: top calls and puts by volume for nearest expiry (strike, volume, IV)
  - **news**: 4 most recent headlines with publish date
  - **sentiment**: StockTwits bull/bear count + 3 recent posts

### Step 2 — Supplement with web search (targeted)

Use `web_search` only for gaps the script can't fill:
- Earnings dates: `[TICKER] earnings date`
- Big macro events: `pre-market movers today [DATE]`
- Anything the news headlines suggest needs more context

### Step 3 — Filter ruthlessly

Only flag a ticker if it has at least one of:
- Pre-market move > 2%
- Options volume spike (calls or puts with unusually high volume)
- Material news (earnings, guidance, product launch, macro impact)
- Lopsided sentiment (>70% bull or bear on StockTwits)

### Step 4 — Format and deliver

Format per `references/format.md`:
- Start with **Broad Market** section (SPY, QQQ, DIA, VIX) to set context
- Then list individual tickers by signal strength
- End with quiet tickers line

Send the briefing using the message tool (channel=telegram, target=8202583853), then reply NO_REPLY.

## Interpreting the Data

**Options volume**: High call volume = bullish bets; high put volume = bearish or hedging. Compare top strike volumes to gauge conviction.

**IV**: Very low IV (< 5%) in yfinance data is a known artifact — treat as unreliable. Focus on volume and open interest instead.

**StockTwits**: 10-post sample. Use as a directional signal, not gospel. Strong bull/bear skew (8+/10) is meaningful.

**Pre-market price**: Only available during pre-market hours (4–9:30 AM ET). Will be null outside those hours.
