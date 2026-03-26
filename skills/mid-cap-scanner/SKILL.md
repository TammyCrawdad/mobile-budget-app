---
name: mid-cap-scanner
description: "Scan for mid-cap stocks ($1B-$10B market cap) showing multiple bullish signals — high relative volume, short squeeze setups, upcoming earnings, heavy call options flow, and bullish social sentiment. Use when Hung asks for new trade ideas, potential movers, or mid-cap opportunities outside his regular watchlist. Produces a ranked list of candidates with signal scores."
---

# Mid-Cap Scanner Skill

## Overview

Find mid-cap stocks building momentum across multiple signals before they make a large move. Stocks scoring 3+ signals are the strongest candidates.

## Signals Scored (1 point each)

1. **High relative volume** — trading >1.5x average (momentum building, unusual interest)
2. **Short squeeze setup** — short float >15% + rising price (fuel for explosive moves)
3. **Upcoming earnings** — catalyst within 7 days (options plays, gap potential)
4. **Bullish options flow** — call/put volume ratio ≥1.5x (smart money positioning)
5. **Bullish sentiment** — StockTwits >60% bull (crowd leaning in)

## Workflow

### Step 1 — Run the scanner

```bash
python3 ~/.openclaw/workspace/skills/mid-cap-scanner/scripts/scan_movers.py --top 8 2>/dev/null
```

Takes ~60–90 seconds. Returns JSON: list of candidates ranked by score (highest first).

### Step 2 — Enrich top candidates (score ≥ 2)

For each candidate scoring 2+, run a quick `web_search`:
- `[TICKER] stock news today` — any catalyst driving the move?
- Skip if news is already obvious from the data

### Step 3 — Format and deliver

See `references/format.md` for output format.

Send the formatted report using the message tool (channel=telegram, target=8202583853), then reply NO_REPLY.

## Interpreting the Data

- **Score 4–5**: Strong multi-signal conviction — lead with these
- **Score 3**: Solid setup — worth flagging
- **Score 1–2**: Weak signal — mention briefly or skip
- **Call/put ratio**: 2x+ is notable; 5x+ is very aggressive bullish positioning
- **Short float >20%**: Significant squeeze fuel — small catalyst can produce outsized move
- **Earnings within 3 days**: Highest urgency for options plays
