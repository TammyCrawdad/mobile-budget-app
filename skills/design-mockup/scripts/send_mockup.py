#!/usr/bin/env python3
"""
Design Mockup Skill - Render HTML mockup and send to Telegram
Usage: python3 send_mockup.py --html /path/to/mockup.html [--width 1400] [--height 1200] [--caption "..."]
"""

import argparse
import json
import os
import subprocess
import sys
import tempfile
import time
from pathlib import Path

def start_http_server(port=8889):
    """Start a simple HTTP server in /tmp"""
    try:
        subprocess.run(
            f"cd /tmp && python3 -m http.server {port} > /dev/null 2>&1 &",
            shell=True,
            check=True
        )
        time.sleep(1)
        return port
    except Exception as e:
        print(f"Error starting HTTP server: {e}", file=sys.stderr)
        return None

def take_screenshot(html_path, width=1400, height=1200):
    """Take screenshot of HTML mockup using Playwright"""
    
    # Determine the filename from the HTML path
    html_name = Path(html_path).name
    
    # Create Playwright screenshot script
    script = f"""
const {{ chromium }} = require('/home/fei/vibebudgeting/node_modules/playwright');

(async () => {{
  try {{
    const browser = await chromium.launch({{ 
      executablePath: '/home/fei/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome', 
      args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    }});
    const page = await browser.newPage();
    await page.setViewportSize({{ width: {width}, height: {height} }});
    
    await page.goto('http://localhost:8889/{html_name}');
    await page.waitForLoadState('networkidle');
    await page.screenshot({{ path: '/tmp/mockup_screenshot.png', fullPage: true }});
    
    await browser.close();
    console.log('Screenshot saved to /tmp/mockup_screenshot.png');
  }} catch (e) {{
    console.error('Screenshot failed:', e.message);
    process.exit(1);
  }}
}})();
"""
    
    # Write and run the script
    script_path = "/tmp/screenshot_mockup.js"
    with open(script_path, "w") as f:
        f.write(script)
    
    try:
        result = subprocess.run(
            ["node", script_path],
            capture_output=True,
            text=True,
            timeout=30,
            check=True
        )
        print(result.stdout)
        
        # Check if screenshot was created
        if os.path.exists("/tmp/mockup_screenshot.png"):
            return "/tmp/mockup_screenshot.png"
        else:
            print("Error: Screenshot file was not created", file=sys.stderr)
            return None
    except subprocess.TimeoutExpired:
        print("Screenshot timed out", file=sys.stderr)
        return None
    except Exception as e:
        print(f"Error taking screenshot: {e}", file=sys.stderr)
        print(f"stderr: {e.stderr if hasattr(e, 'stderr') else 'N/A'}", file=sys.stderr)
        return None

def send_to_telegram(image_path, caption=None, telegram_target=None):
    """Send screenshot to Telegram using message tool"""
    
    # Get telegram target from MEMORY.md if not provided
    if not telegram_target:
        try:
            memory_file = Path.home() / ".openclaw/workspace/MEMORY.md"
            with open(memory_file, "r") as f:
                content = f.read()
                # Look for Telegram chat ID
                for line in content.split("\n"):
                    if "Hung's Telegram chat ID:" in line:
                        # Extract the ID
                        parts = line.split(": ")
                        if len(parts) > 1:
                            telegram_target = parts[1].strip()
                            break
        except:
            pass
    
    # Default fallback
    if not telegram_target:
        telegram_target = "8202583853"
    
    # Prepare message
    message = caption or "Design Mockup"
    
    try:
        import shutil
        # Copy image to workspace
        dest_path = Path.home() / ".openclaw/workspace" / Path(image_path).name
        shutil.copy(image_path, dest_path)
        
        # Use openclaw message tool to send
        cmd = [
            "openclaw",
            "message",
            "send",
            f"--channel=telegram",
            f"--target={telegram_target}",
            f"--message={message}",
            f"--media={dest_path}"
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=10)
        
        if result.returncode == 0:
            print(f"✓ Screenshot sent to Telegram!")
            return True
        else:
            print(f"⚠ Could not send via openclaw message tool")
            print(f"  Image saved to: {dest_path}")
            print(f"  Run manually: openclaw message send --channel=telegram --target={telegram_target} --message='{message}' --media={dest_path}")
            return False
    except Exception as e:
        print(f"⚠ Error sending to Telegram: {e}", file=sys.stderr)
        print(f"  Image is prepared at: {dest_path}", file=sys.stderr)
        return False

def main():
    parser = argparse.ArgumentParser(description="Render HTML mockup and send to Telegram")
    parser.add_argument("--html", required=True, help="Path to HTML mockup file")
    parser.add_argument("--width", type=int, default=1400, help="Viewport width (default: 1400)")
    parser.add_argument("--height", type=int, default=1200, help="Viewport height (default: 1200)")
    parser.add_argument("--caption", help="Caption for Telegram message")
    parser.add_argument("--telegram-target", help="Telegram user/chat ID (default from MEMORY.md)")
    
    args = parser.parse_args()
    
    # Verify HTML file exists
    if not os.path.exists(args.html):
        print(f"Error: HTML file not found: {args.html}", file=sys.stderr)
        sys.exit(1)
    
    print(f"📐 Rendering mockup: {args.html}")
    print(f"   Size: {args.width}x{args.height}")
    
    # Start HTTP server
    print("🌐 Starting HTTP server...")
    port = start_http_server()
    if not port:
        sys.exit(1)
    
    # Copy HTML to /tmp (where HTTP server runs from)
    import shutil
    html_name = Path(args.html).name
    tmp_html = f"/tmp/{html_name}"
    # Only copy if source and dest are different files
    try:
        if not os.path.samefile(args.html, tmp_html):
            shutil.copy(args.html, tmp_html)
    except (FileNotFoundError, ValueError):
        shutil.copy(args.html, tmp_html)
    print(f"   Server running on http://localhost:{port}")
    
    # Take screenshot
    print("📸 Taking screenshot...")
    screenshot = take_screenshot(tmp_html, args.width, args.height)
    
    if not screenshot:
        print("Failed to take screenshot", file=sys.stderr)
        sys.exit(1)
    
    # Copy to workspace for easy access
    import shutil
    dest_path = Path.home() / ".openclaw/workspace" / f"mockup_{int(time.time())}.png"
    dest_path.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy(screenshot, dest_path)
    
    print(f"✓ Screenshot ready")
    
    # Output result in format that assistant can parse
    result = {
        "success": True,
        "image_path": str(dest_path),
        "caption": args.caption or "Design Mockup",
        "telegram_target": args.telegram_target or "8202583853"
    }
    
    print(f"\n🎉 MOCKUP_READY: {json.dumps(result)}\n")
    
    # Cleanup HTTP server
    subprocess.run("killall -9 python3 2>/dev/null || true", shell=True)

if __name__ == "__main__":
    main()
