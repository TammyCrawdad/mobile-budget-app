---
name: design-mockup
description: "Generate and send visual design mockups to Telegram. Use when creating visual design proposals, UI layouts, or mockups that need to be shown to the user. Supports HTML-based designs rendered to PNG screenshots and sent directly to Telegram chat."
---

# Design Mockup Skill

Quickly create, render, and send visual design mockups to Telegram.

⚠️ **IMPORTANT:** Always spawn this as a **sub-agent** to keep the main session responsive. The screenshot and Telegram delivery can take time.

## Workflow

1. **Write HTML mockup** — Create an HTML file with embedded CSS and design
2. **Serve locally** — Start a simple HTTP server
3. **Screenshot** — Use Playwright to render and capture the design
4. **Send to Telegram** — Deliver the screenshot directly to the user's chat

## How to Use (with Sub-Agent)

```python
sessions_spawn(
  runtime="subagent",
  mode="run",
  task="Use the design-mockup skill to create a mockup. [describe what you want]"
)
sessions_yield()  # Wait for sub-agent to complete
```

Then respond with the result when the sub-agent finishes.

## How It Works

```bash
# I create HTML mockup
cat > /tmp/design.html << 'EOF'
...design HTML...
EOF

# I run the script
python3 /home/fei/.openclaw/workspace/skills/design-mockup/scripts/send_mockup.py \
  --html /tmp/design.html \
  --caption "Dashboard Option 4"

# Script outputs: MOCKUP_READY: {"success": true, "image_path": "...", "caption": "..."}
# I parse output and send to Telegram automatically
```

## Script Parameters

- `--html` (required): Path to HTML mockup file
- `--width` (optional, default 1400): Viewport width in pixels
- `--height` (optional, default 1200): Viewport height in pixels
- `--caption` (optional): Caption/message to send with image to Telegram
- `--telegram-target` (optional, default from MEMORY.md): Telegram user/chat ID

## Requirements

The script uses:
- Playwright (from vibebudgeting node_modules)
- Chromium browser (cached at ~/.cache/ms-playwright/...)
- JSON parsing to extract image path and caption from script output
- Message tool to send to Telegram automatically

## Notes

- **Always spawn as a sub-agent** — The skill takes 10-30 seconds (HTTP server + Playwright + screenshot)
- The script handles all the heavy lifting: HTTP server, Playwright screenshot, Telegram delivery
- Viewport size affects the final image (default 1400x1200 is good for desktop layouts)
- For responsive designs, create separate mockups or adjust viewport size
- CSS is fully supported (no external stylesheets needed, use embedded `<style>` tags)
- The script outputs JSON when complete — parse it and confirm delivery to the user
