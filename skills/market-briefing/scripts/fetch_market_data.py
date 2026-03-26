#!/usr/bin/env python3
"""
fetch_market_data.py — Pull pre-market briefing data for a watchlist.

Usage:
    python3 fetch_market_data.py [TICKER1 TICKER2 ...]
    python3 fetch_market_data.py  # uses default watchlist

Outputs JSON to stdout with price, options activity, news, and sentiment per ticker.
"""

import sys
import json
import requests
import yfinance as yf
from datetime import datetime, timezone

DEFAULT_TICKERS = ["AAPL", "PLTR", "RKLB", "GOOGL", "SNOW", "AMZN", "NVDA", "AMD"]
STOCKTWITS_URL = "https://api.stocktwits.com/api/2/streams/symbol/{}.json"
HEADERS = {"User-Agent": "TammyMarketBriefing/1.0"}


def pct_change(current, previous):
    if not current or not previous:
        return None
    return round(((current - previous) / previous) * 100, 2)


def get_price_data(ticker):
    try:
        t = yf.Ticker(ticker)
        fi = t.fast_info
        last = getattr(fi, "last_price", None)
        prev_close = getattr(fi, "previous_close", None)
        pre_market = getattr(fi, "pre_market_price", None)

        change_pct = pct_change(last, prev_close)
        pre_market_pct = pct_change(pre_market, prev_close)

        return {
            "last_price": round(last, 2) if last else None,
            "prev_close": round(prev_close, 2) if prev_close else None,
            "pre_market_price": round(pre_market, 2) if pre_market else None,
            "change_pct": change_pct,
            "pre_market_change_pct": pre_market_pct,
        }
    except Exception as e:
        return {"error": str(e)}


def get_news(ticker, limit=4):
    try:
        t = yf.Ticker(ticker)
        news = t.news or []
        results = []
        for n in news[:limit]:
            content = n.get("content", {})
            title = content.get("title") or n.get("title", "")
            pub = content.get("pubDate") or n.get("providerPublishTime", "")
            results.append({"title": title, "published": str(pub)})
        return results
    except Exception as e:
        return [{"error": str(e)}]


def get_options_activity(ticker, top_n=3):
    """Return top call and put strikes by volume for nearest expiry."""
    try:
        t = yf.Ticker(ticker)
        if not t.options:
            return {}
        exp = t.options[0]
        chain = t.option_chain(exp)

        def top_by_volume(df):
            df = df[df["volume"] > 0].sort_values("volume", ascending=False).head(top_n)
            return [
                {
                    "strike": float(row["strike"]),
                    "last_price": float(row["lastPrice"]),
                    "volume": int(row["volume"]),
                    "open_interest": int(row["openInterest"]),
                    "iv": round(float(row["impliedVolatility"]) * 100, 1),
                }
                for _, row in df.iterrows()
            ]

        return {
            "expiry": exp,
            "top_calls": top_by_volume(chain.calls),
            "top_puts": top_by_volume(chain.puts),
        }
    except Exception as e:
        return {"error": str(e)}


def get_stocktwits_sentiment(ticker, limit=10):
    """Return bull/bear ratio and recent messages from StockTwits."""
    try:
        r = requests.get(
            STOCKTWITS_URL.format(ticker),
            headers=HEADERS,
            timeout=8,
        )
        if r.status_code != 200:
            return {"error": f"HTTP {r.status_code}"}
        data = r.json()
        messages = data.get("messages", [])[:limit]

        def get_sentiment(m):
            entities = m.get("entities") or {}
            sentiment = entities.get("sentiment") or {}
            return sentiment.get("basic")

        bull = sum(1 for m in messages if get_sentiment(m) == "Bullish")
        bear = sum(1 for m in messages if get_sentiment(m) == "Bearish")
        neutral = len(messages) - bull - bear

        snippets = [m["body"][:120] for m in messages[:3]]

        return {
            "bull": bull,
            "bear": bear,
            "neutral": neutral,
            "total_sampled": len(messages),
            "recent_posts": snippets,
        }
    except Exception as e:
        return {"error": str(e)}


def get_broad_market():
    """Fetch SPY, QQQ, DIA, VIX for market context."""
    indices = {}
    for ticker in ["SPY", "QQQ", "DIA", "VIX"]:
        indices[ticker] = get_price_data(ticker)
    return indices


def main():
    tickers = sys.argv[1:] if len(sys.argv) > 1 else DEFAULT_TICKERS
    results = {
        "_broad_market": get_broad_market()
    }

    for ticker in tickers:
        ticker = ticker.upper()
        results[ticker] = {
            "price": get_price_data(ticker),
            "news": get_news(ticker),
            "options": get_options_activity(ticker),
            "sentiment": get_stocktwits_sentiment(ticker),
        }

    print(json.dumps(results, indent=2, default=str))


if __name__ == "__main__":
    main()
