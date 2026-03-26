# Mid-Cap Scanner Output Format

## Template

```
🔍 Mid-Cap Mover Scan — [Day, Month DD, YYYY]

**[TICKER]** — [Company] | $[Market Cap] | [Sector]
⚡ Score: [X]/5 — [signal1], [signal2], [signal3]
• [Key insight or catalyst from news/data]
• [Options or sentiment detail if notable]

**[TICKER]** — [Company] | $[Market Cap] | [Sector]
⚡ Score: [X]/5 — [signal1], [signal2]
• [Key insight]

---
_[N] candidates scanned. Showing top [N] by signal score._

— Tammy 🌸
```

## Rules

- Lead with highest-scoring candidates
- Only include score ≥ 2 in full detail; mention score-1 briefly if interesting
- Signal line: use short labels (e.g. "high volume", "short squeeze", "earnings Mar 14", "2.7x calls", "100% bullish")
- Bullets: 1–2 max per ticker — the most actionable thing to know
- End with scan summary line

## Example Entry

```
**IOVA** — Iovance Biotherapeutics | $2.2B | Biotech
⚡ Score: 3/5 — high volume, 9.2x calls, 100% bullish sentiment
• Up 5.5% on heavy volume, call/put ratio 9x — someone is very aggressive on upside
• No obvious news catalyst yet — watch for FDA/trial update
```
