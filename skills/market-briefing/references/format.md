# Market Briefing Format

## Template

```
📊 Morning Market Briefing — [Day, Month DD, YYYY]

**Broad Market**
• [S&P 500 pre-market move, sentiment]
• [Nasdaq pre-market move, sentiment]
• [VIX level, direction]

**[TICKER]** — [one-line headline]
• [bullet]
• [bullet]
• [bullet max]

**[TICKER]** — [one-line headline]
• [bullet]
• [bullet]

---
_Nothing notable on: [comma-separated quiet tickers]_

— Tammy 🌸
```

## Rules

- **Only include tickers with something worth flagging** — 1 to 8 tickers, whatever is relevant
- **2–4 bullets per ticker max** — no walls of text
- **One-line headline** is the most important thing to know in plain English
- **Quiet tickers**: list them at the bottom in the "Nothing notable" line so Hung knows they were checked
- **No sign-off paragraphs** — end with `— Tammy 🌸`

## Broad Market Section

**Always include as first section.** Pull from `_broad_market` JSON key:

```
**Broad Market**
• SPY [PRICE] ([%CHANGE]) — [sentiment/direction]
• QQQ [PRICE] ([%CHANGE]) — [sentiment/direction]
• DIA [PRICE] ([%CHANGE]) — [sentiment/direction]
• VIX [PRICE] — [volatility context]
```

**Example:**
```
**Broad Market**
• SPY 495.50 (+0.3%) — resilient on tech strength, macro supportive
• QQQ 18250 (+1.1%) — AI rally carrying mega-caps, growth momentum
• DIA 40120 (+0.15%) — defensive, banks flat on rate hold
• VIX 15.8 — contracting, risk-on sentiment intact
```

## Example Ticker Entry

```
**NVDA** — Big call sweep ahead of earnings
• $2.1M call sweep at $950 strike, exp. this Friday — bullish bet
• Pre-market +1.8% on positive AI infrastructure comments from MSFT
• Earnings Thursday after close — IV elevated, premium is juicy
```

## Example Quiet Line

```
_Nothing notable on: AAPL, GOOGL, AMZN_
```
