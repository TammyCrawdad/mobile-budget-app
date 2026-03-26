#!/usr/bin/env python3
"""
scan_movers.py — Scan for mid-cap stocks ($1B-$10B) showing bullish signals.

Data source: yfinance built-in screener (no scraping required).

Signals scored (1 point each):
  1. High relative volume  (>1.5x 3-month avg) — unusual interest
  2. Short squeeze candidate (most_shorted_stocks list + rising price)
  3. Upcoming earnings within 7 days — catalyst event
  4. Heavy call options activity (call/put ratio >= 1.5)
  5. Bullish StockTwits sentiment (>60% bull)

Usage:
    python3 scan_movers.py
    python3 scan_movers.py --top 10

Outputs JSON to stdout: top candidates ranked by signal score.
"""

import sys
import json
import argparse
import requests
import yfinance as yf
from datetime import datetime, timezone, timedelta

HEADERS = {"User-Agent": "TammyScanner/1.0"}
STOCKTWITS_URL = "https://api.stocktwits.com/api/2/streams/symbol/{}.json"
MID_CAP_MIN = 1_000_000_000   # $1B
MID_CAP_MAX = 10_000_000_000  # $10B


def fetch_screener(query):
    """Run a yfinance predefined screener query and return quotes."""
    try:
        result = yf.screen(query)
        return result.get("quotes", [])
    except Exception as e:
        print(f"  Screener error ({query}): {e}", file=sys.stderr)
        return []


def is_mid_cap(quote):
    mc = quote.get("marketCap") or 0
    return MID_CAP_MIN <= mc <= MID_CAP_MAX


def relative_volume(quote):
    vol = quote.get("regularMarketVolume") or 0
    avg = quote.get("averageDailyVolume3Month") or 0
    if avg == 0:
        return None
    return round(vol / avg, 2)


def earnings_within_days(quote, days=7):
    """Return earnings date string if within next `days` days, else None."""
    ts = quote.get("earningsTimestamp")
    if not ts:
        return None
    try:
        earn_dt = datetime.fromtimestamp(ts, tz=timezone.utc)
        now = datetime.now(tz=timezone.utc)
        diff = (earn_dt - now).days
        if 0 <= diff <= days:
            return earn_dt.strftime("%b %d")
    except Exception:
        pass
    return None


def get_options_signal(ticker):
    """Return call/put volume ratio for nearest expiry. >1.5 = bullish signal."""
    try:
        t = yf.Ticker(ticker)
        if not t.options:
            return None
        exp = t.options[0]
        chain = t.option_chain(exp)
        call_vol = chain.calls["volume"].sum()
        put_vol = chain.puts["volume"].sum()
        if put_vol == 0:
            return None
        ratio = round(call_vol / put_vol, 2)
        return {"call_vol": int(call_vol), "put_vol": int(put_vol), "ratio": ratio, "expiry": exp}
    except Exception:
        return None


def get_sentiment(ticker):
    """Return StockTwits bull/bear breakdown."""
    try:
        r = requests.get(STOCKTWITS_URL.format(ticker), headers=HEADERS, timeout=6)
        if r.status_code != 200:
            return None
        messages = r.json().get("messages", [])[:15]

        def sent(m):
            return ((m.get("entities") or {}).get("sentiment") or {}).get("basic")

        bull = sum(1 for m in messages if sent(m) == "Bullish")
        bear = sum(1 for m in messages if sent(m) == "Bearish")
        total = bull + bear
        if total == 0:
            return None
        return {"bull": bull, "bear": bear, "bull_pct": round(bull / total * 100)}
    except Exception:
        return None


def build_candidate(quote, from_gainers=False, from_actives=False, from_shorted=False):
    ticker = quote.get("symbol", "")
    mc = quote.get("marketCap", 0) or 0
    chg = quote.get("regularMarketChangePercent", 0) or 0
    rel_vol = relative_volume(quote)
    earn = earnings_within_days(quote)

    return {
        "ticker": ticker,
        "company": quote.get("shortName", ""),
        "sector": quote.get("sector", ""),
        "market_cap_b": round(mc / 1e9, 2),
        "price": quote.get("regularMarketPrice"),
        "change_pct": round(chg, 2),
        "rel_volume": rel_vol,
        "earnings_date": earn,
        "from_gainers": from_gainers,
        "from_actives": from_actives,
        "from_shorted": from_shorted,
        "options": None,
        "sentiment": None,
        "score": 0,
        "signals": [],
    }


def score_candidate(data):
    signals = []

    # Signal 1: High relative volume
    rv = data.get("rel_volume") or 0
    if rv >= 1.5:
        signals.append(f"high_volume_{rv}x")

    # Signal 2: Short squeeze (on shorted list + positive price action)
    if data.get("from_shorted") and data.get("change_pct", 0) > 0:
        signals.append("short_squeeze_setup")

    # Signal 3: Earnings catalyst
    if data.get("earnings_date"):
        signals.append(f"earnings_{data['earnings_date']}")

    # Signal 4: Bullish options flow
    opts = data.get("options")
    if opts and opts.get("ratio", 0) >= 1.5:
        signals.append(f"bullish_options_{opts['ratio']}x_calls")

    # Signal 5: Bullish sentiment
    sent = data.get("sentiment")
    if sent and sent.get("bull_pct", 0) >= 60:
        signals.append(f"bullish_sentiment_{sent['bull_pct']}pct")

    return len(signals), signals


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--top", type=int, default=8)
    args = parser.parse_args()

    print("Fetching screener data from yfinance...", file=sys.stderr)

    gainers  = {q["symbol"]: q for q in fetch_screener("day_gainers")   if is_mid_cap(q)}
    actives  = {q["symbol"]: q for q in fetch_screener("most_actives")  if is_mid_cap(q)}
    shorted  = {q["symbol"]: q for q in fetch_screener("most_shorted_stocks") if is_mid_cap(q)}

    all_tickers = set(gainers) | set(actives) | set(shorted)
    print(f"Mid-cap candidates: {len(all_tickers)}", file=sys.stderr)

    candidates = []
    for ticker in all_tickers:
        quote = gainers.get(ticker) or actives.get(ticker) or shorted.get(ticker)
        data = build_candidate(
            quote,
            from_gainers=(ticker in gainers),
            from_actives=(ticker in actives),
            from_shorted=(ticker in shorted),
        )
        candidates.append(data)

    # Enrich with options + sentiment (only candidates with some initial signal)
    for data in candidates:
        ticker = data["ticker"]
        rv = data.get("rel_volume") or 0
        chg = abs(data.get("change_pct") or 0)
        # Only enrich if there's at least some activity
        if rv >= 1.2 or chg >= 3 or data["from_shorted"]:
            print(f"  Enriching {ticker}...", file=sys.stderr)
            data["options"] = get_options_signal(ticker)
            data["sentiment"] = get_sentiment(ticker)

        score, signals = score_candidate(data)
        data["score"] = score
        data["signals"] = signals

    candidates.sort(key=lambda x: (x["score"], x.get("change_pct") or 0), reverse=True)
    print(json.dumps(candidates[:args.top], indent=2, default=str))


if __name__ == "__main__":
    main()
