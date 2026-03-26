# MEMORY.md - Long-Term Memory

## Identity
- I am Tammy, Chen Family Assistant based in Longwood, FL
- To the outside world: a real person
- 5th iteration assistant for Hung — make it the last

## About Hung
- Very private person — never share info without explicit approval
- Eastern US timezone (Longwood, FL area)
- Expects polite, concierge-style service
- High standards, high trust
- Email: hung.chen.ucf@gmail.com (personal)

## Standing Rules
- Privacy first. Always.
- If asked externally: "I'm the Chen Family Assistant"
- Keep Chen family backstory simple; fill in details as needed
- **Always warn Hung before doing anything that will restart the gateway or disconnect the session**
- **Never restart gateway without explicit approval from Hung**
- **Skills: Only use the 6 pre-installed skills. ClawhHub is OK to browse for ideas, but NEVER install an external skill without explicitly telling Hung which one and getting approval first. New skills can also be created together from scratch.**
- **SUDO ACCESS (as of Mar 24, 2026):** Hung granted full sudo. If I break the system, he can't easily fix it remotely. Ask before any system-level changes (kernel, services, major configs). Use `trash` instead of `rm`. Test with --dry-run first when possible.
- **ARCHITECTURE RULE (as of Mar 25, 2026):** **Always spawn sub-agents for any background/long-running work.** Main session (agent:main:main) must remain responsive to user messages at all times. Never block it with task processing. Use `sessions_spawn(mode="run"|"session")` for all non-trivial work.

## Infrastructure (Setup on 2026-02-22)
- VPS: AWS us-east-1, IP 44.212.220.208, user: fei
- OS: Ubuntu 24.04 LTS
- Gateway: loopback only (18789), no open ports except SSH (22)
- Heartbeat: set to every 4h (was 30m, caused rate limit issues) — needs gateway restart to apply
- Browser: Chromium headless via Playwright at /home/fei/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome

## Telegram
- Hung's Telegram chat ID: 8202583853
- Use this as target for message tool with channel=telegram

## Email
- Tammy's Gmail: chenfamilyassistant221@gmail.com
- IMAP/SMTP: working via app password
- Credentials in 1Password: op://TammyShareVault/Google app password/
- username field: chenfamilyassistant221@gmail.com (note: use full email, not just username field)
- Daily email summary cron: 8 AM ET, deleteAfterRun=true (currently enabled)

## 1Password
- Service account token in ~/.bashrc as OP_SERVICE_ACCOUNT_TOKEN
- Vault: TammyShareVault
- Access: READ ONLY (cannot create/modify items)
- To read: export OP_SERVICE_ACCOUNT_TOKEN=$(grep OP_SERVICE_ACCOUNT_TOKEN ~/.bashrc | cut -d'"' -f2)
- **Credit Card**: stored as "Credit Card" in TammyShareVault — assigned by Hung for bookings/purchases on my behalf

## Brave Search
- Configured in openclaw.json under tools.web.search.apiKey
- Working as of 2026-02-22

## Coding Agent
- Codex CLI installed at /usr/bin/codex (v0.104.0)
- OpenAI API key configured, working
- Test confirmed: responds correctly
- Needs git repo to run (use mktemp -d && git init for scratch)

## Claude Code Management (CRITICAL)
- **Claude Code requires ACTIVE participation** - it constantly asks for approvals/decisions
- **Check in EVERY 60-90 seconds** when Claude Code is running, not every 2-3 minutes
- Claude Code will ask before:
  - Creating new files (show preview, wait for yes/no)
  - Making edits to existing files (show diffs, wait for approval)
  - Running commands (wait for yes/no)
  - Installing dependencies (wait for yes/no)
- **If you don't respond within ~2 minutes, it may timeout/get killed**
- Setup: Have token in ~/.bashrc, run with `pty:true` and `background:true`
- **CRITICAL:** Always review Claude Code's proposals and make informed decisions:
  - Don't just auto-approve everything (option 1 or 2)
  - Read the preview/diff and think: "Is this the right approach?"
  - Say "No" (option 3) if the approach is wrong or needs adjustment
  - Ask clarifying questions via /btw if you're unsure
- Can approve "Yes, allow all edits during this session" (option 2) IF the approach looks solid and you want faster iteration
- **Better approach:** Keep constant polling at 30-45 second intervals to catch all prompts

## Model Configuration (Haiku as of 2026-03-13)
- Current primary model: **anthropic/claude-haiku-4-5** (not @20251001 — that suffix breaks it)
- Correct model identifier: `anthropic/claude-haiku-4-5`
- To switch models: need to stop gateway, edit `/home/fei/.openclaw/openclaw.json` (agents.defaults.model.primary), update sessions.json for all active sessions, then restart
- `openclaw config` command may not persist changes properly — direct file edit is more reliable
- Gateway writes config backups but doesn't persist edits if changed while running — always stop first

## Rate Limit Notes (Anthropic Tier 1)
- 30k tokens per minute (cached tokens excluded from limit)
- Context is large (~107k tokens) — cold cache requests can hit limit
- Cache expires after 5 minutes of inactivity
- Gateway restarts clear the cache → first message after restart may hit rate limit
- Orphaned cron sessions caused concurrent API calls → rate limits (resolved)
- Sessions to keep clean: check /home/fei/.openclaw/agents/main/sessions/sessions.json
- Only keep agent:main:main, remove any cron:* entries if they linger

## Cron Jobs (as of 2026-03-24 — FIXED system hangs)
- **daily-email-summary**: 12 AM ET (midnight), deleteAfterRun=true, enabled
  - **FIX (Mar 24)**: Changed delivery from "announce" to "none" + uses message tool (was hanging with 19 consecutive failures)
  - Now sends via message tool directly: channel=telegram, target=8202583853
- **daily-market-briefing**: 7:30 AM ET (weekdays), delivery=none, uses message tool
- **mid-cap-scanner**: 9:30 AM ET (weekdays), delivery=none, uses message tool
- **cleanup-orphaned-sessions**: 3 AM ET daily (NEW)
  - Runs `/home/fei/.openclaw/scripts/cleanup-orphaned-sessions.py`
  - Removes cron run sessions >24h old to prevent accumulation and hangs
  - Created Mar 24 to prevent future orphaning issues
- **launch-1hr-reminder**: disabled (removed from service)
- All launch reminder crons removed (caused rate limit issues in Feb)
- Future launch reminders: use lightweight shell scripts, not agent cron jobs

## System Stability (Mar 23-24 Issues — PARTIALLY FIXED)
**Cron/Session Hangs (FIXED):**
- Root cause: Email cron delivery failure — "announce" mode tried to route through main session, failed 19x
- Also: Orphaned cron run sessions accumulated, consuming resources
- Fixes applied Mar 24, 12:16 UTC:
  - ✅ Changed email cron to `message` tool delivery (was "announce")
  - ✅ Updated all cron payloads to use `message` tool (channel=telegram, target=8202583853)
  - ✅ Cleaned up 3 orphaned cron run sessions (8→5 remaining)
  - ✅ Added daily cleanup job at 3 AM ET

**CPU Spikes (INVESTIGATING):**
- Happened Mar 23 at 9 PM ET, Mar 24 at 3 AM ET, and again during mid-day
- Timing doesn't match cron jobs (7:30 AM, 9:30 AM, midnight)
- Likely cause: **Ubuntu auto-upgrades (unattended-upgrades)** running in background
- Impact: Gateway becomes unresponsive, SSH hangs, CPU bursts past 20%
- Status: Recovered each time on its own; waiting for pattern confirmation
- If happens again: Check `/var/log/apt/history.log` and `/var/log/unattended-upgrades/unattended-upgrades.log`

**If CPU spike repeats (Mar 25+):**
- Capture: `top -b -n 5 -d 1`, `ps aux`, `journalctl -n 100`, gateway logs
- Check if unattended-upgrades or other system process running
- Consider: Disable auto-upgrades or schedule them off-hours

## Session Health (CRITICAL — Mar 25, 2026 Incident)
**What happened:** Sessions.json became corrupted with orphaned cron run entries (`:run:` suffixes) and duplicate sessions, causing the gateway to hang/loop and stop responding to messages.
**Fix applied:** Hung manually renamed sessions.json → sessions_bak.json, which reset the gateway to a clean state.
**Going forward:** NEVER let sessions.json accumulate. Follow these rules:
1. **Always spawn sub-agents for background work** — keep main session (agent:main:main) responsive to user messages
2. **Check sessions health regularly:** `python3 -c "import json; d=json.load(open('/home/fei/.openclaw/agents/main/sessions/sessions.json')); print(len(d), list(d.keys()))"`
3. **Automated cleanup:** `/home/fei/.openclaw/scripts/cleanup-orphaned-sessions.py` runs daily at 3 AM ET
4. **Keep only:** agent:main:main + agent:main:cron:* (top-level) + recent agent:main:subagent:*
5. **If sessions.json grows beyond ~10 entries or has orphaned entries:** Alert Hung immediately, don't keep working

## VibeBudgeting App
- **Deploy workflow:** feature branch → PR → merge to main → deploy to Heroku (NEVER commit directly to main)
- Repo: loahou04/vibebudgeting (Tammy = collaborator, push access)
- Local: /home/fei/vibebudgeting
- Stack: React 19 + TypeScript + Tailwind 4 + D3 + Vite + Express/MongoDB
- Deployed on Heroku (MFA-protected account)
- Full app redesign merged to main 2026-02-28 (PR #19, commit 495c94bf3b)
- **Latest:** Monthly Budget Dashboard tab added 2026-03-25 (primary tab, Transactions second)
- Design system: indigo/violet accents, Inter font, slate tones, rounded-xl cards
- Heroku app: vibe-budgeting → https://vibe-budgeting-a9d022d54052.herokuapp.com/

### Heroku Deployment (CRITICAL — Mar 25 Fix - ALL HEROKU APPS)
- **Heroku deprecated HTTP git auth** (API key won't work directly in git push URLs)
- **STANDARD METHOD FOR ALL HEROKU DEPLOYMENTS:** Use Heroku CLI, NOT git URLs with API keys
  - CLI is pre-installed and auto-authenticates via cached credentials
  - No need to pass API key manually
  - Command: `cd <repo> && git push heroku main`
  - Works for: vibe-budgeting, vibe-flashcards, chainventory-app, any Heroku app
- HEROKU_API_KEY + HEROKU_EMAIL in ~/.bashrc (credentials stored there)
- Heroku remotes already set for all apps (`heroku git:remote -a <app-name>` was run previously)
- Also has: vibe-flashcards and chainventory-app on same account
- Heroku creds: op://TammyShareVault/Heroku/ (email=hung.chen.ucf@gmail.com, has MFA)
- Screenshot workflow: node /tmp/spa-server.js (port 7799) for SPA, mock API intercepts in Playwright for dashboard
- Codex agent rule: always pty:true + background:true, no & in command, workdir set explicitly

## GitHub
- Account: TammyCrawdad
- PAT in 1Password: op://TammyShareVault/GitHub/password (classic token, repo scope)
- Username in 1Password: op://TammyShareVault/GitHub/username
- Created: 2026-02-23
- git config: user.name "Tammy Crawdad", user.email chenfamilyassistant221@gmail.com
- Credentials stored in ~/.git-credentials
- Collaborator on: loahou04/vibebudgeting (push + pull)

## The Barber Cave (Haircuts)
- Shop: The Barber Cave LLC, 900 Fox Valley Dr Suite 105, Longwood, FL 32779
- Barber: Philip (owner, sole barber)
- Hung's phone for reservations: 407-484-1499
- Booking URL: https://book.squareup.com/appointments/9ursk2zemrslxy/location/LNG000DE9S0A3/services?rwg_token=AFd1xnF86bpNxbHnxAhev8cV1gaN5uVx7VnePoFkMqvpqUxa07686QqnwTU2seJx5KbVg-ARuz__SxvBQwTWwfCiMIeJBpTSKQ%3D%3D
- Process: Select service → Add → Next → pick date → pick time → enter phone 407-484-1499 to book
- Hours: Tue–Sun 9:30 AM–7 PM (closed Mondays)
- Usual service: Men's Haircut ($30, 30 min)

## Chainventory (Inventory Management App)
- Repo: TammyCrawdad/Chainventory (private)
- Local: /home/fei/chainventory
- Stack: React + TypeScript + Tailwind v3 + Vite (client), Node.js + Express + MongoDB (server)
- Auth: JWT + bcrypt (email/password)
- Features: inventory CRUD, QR code labels, print (react-to-print), dashboard, types/locations
- Seed: node server/src/seed.js (creates admin@chainventory.com / admin123 + sample data)
- Run: cp .env.example server/.env → edit MongoDB URI → npm run dev
- Deploy workflow: feature branch → PR → merge to main (never commit directly to main)
- Heroku app: chainventory-app → https://chainventory-app-3174e139e463.herokuapp.com/
- Heroku status: LIVE ✅ — using MongoDB Atlas (chainventory database on Cluster0)
- MONGODB_URI set on Heroku: mongodb+srv://hungadmin:...@cluster0.nv7jki2.mongodb.net/chainventory
- Atlas DB is empty — need to register fresh user or run seed script with MONGODB_URI env set
- 1Password item: "Mongodb Connection String" (notesPlain field) — Atlas URI for vibebudgeting cluster, db swapped to chainventory
- 1Password note: GitHub item "password" field is PAT, NOT web login password

## Open Trades
- **APLD** — 3x $29 calls, exp. Apr 17, 2026. Opened Mar 10, 2026. Thesis: short squeeze (31.25% float) + Babcock & Wilcox 1.2GW data center deal + AI narrative. Logged in /home/fei/chainventory/trades.json

## Stock Watchlist
Hung's trading watchlist (wheel strategy + options plays):
- **AAPL** — Apple
- **PLTR** — Palantir
- **RKLB** — Rocket Lab
- **GOOGL** — Google
- **SNOW** — Snowflake
- **AMZN** — Amazon
- **NVDA** — Nvidia
- **AMD** — AMD
- **APLD** — Applied Digital (active position: 3x $29 calls exp. Apr 17, 2026)

Use these for daily market briefings: trending sentiment, unusual options activity, key news.

## Launch Schedule (Cape Canaveral)
Stored in /home/fei/.openclaw/workspace/launches.json
- Feb 24: Falcon 9 Starlink 6-110, 3:56 PM ET, Go
- Feb 27: Falcon 9 Starlink 6-108, 4:52 AM ET, Go
- Mar 1: Falcon 9 Starlink 10-41, 7:07 PM ET, Go
- Mar 7: Falcon 9 EchoStar 25, 7:00 PM ET, TBD
- Mar 30: Vulcan GPS III SV09/SV10, 8:00 PM ET, TBD
- Apr 1: SLS Artemis II, 6:24 PM ET, TBC
