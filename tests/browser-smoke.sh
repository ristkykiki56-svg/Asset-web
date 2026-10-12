#!/usr/bin/env bash
set -euo pipefail

PORT=8765
mkdir -p /tmp/twinshooter-qa
python3 -m http.server "$PORT" --bind 127.0.0.1 >/tmp/twinshooter-qa/server.log 2>&1 &
server_pid=$!
trap 'kill "$server_pid" 2>/dev/null || true' EXIT

for attempt in 1 2 3 4 5 6 7 8 9 10; do
  if curl -fsS "http://127.0.0.1:$PORT/" >/dev/null; then break; fi
  sleep 1
done
curl -fsS "http://127.0.0.1:$PORT/" >/dev/null
CHROME="$(command -v google-chrome || command -v chromium || command -v chromium-browser || true)"
if [[ -z "$CHROME" ]]; then
  echo "No headless Chrome found; browser QA must run on a Chrome-enabled runner" >&2
  exit 1
fi

"$CHROME" --headless=new --no-sandbox --disable-dev-shm-usage --disable-gpu \
  --window-size=1500,1000 --virtual-time-budget=8000 --dump-dom \
  "http://127.0.0.1:$PORT/tests/viewport-smoke.html" \
  >/tmp/twinshooter-qa/viewport-result.html 2>/tmp/twinshooter-qa/chrome.log

if ! grep -Fq 'data-status="pass"' /tmp/twinshooter-qa/viewport-result.html; then
  grep -E 'data-status="fail"|EXCEPTION|overflow' /tmp/twinshooter-qa/viewport-result.html || true
  echo 'Chrome viewport smoke failed' >&2
  exit 1
fi
echo 'Chrome viewport smoke PASS (320px–1440px)'
"$CHROME" --headless=new --no-sandbox --disable-dev-shm-usage --disable-gpu \
  --hide-scrollbars --window-size=1440,1000 --virtual-time-budget=1400 \
  --screenshot=/tmp/twinshooter-qa/desktop.png "http://127.0.0.1:$PORT/" \
  >/dev/null 2>/dev/null
"$CHROME" --headless=new --no-sandbox --disable-dev-shm-usage --disable-gpu \
  --hide-scrollbars --window-size=390,900 --virtual-time-budget=1400 \
  --screenshot=/tmp/twinshooter-qa/mobile.png "http://127.0.0.1:$PORT/" \
  >/dev/null 2>/dev/null
test -s /tmp/twinshooter-qa/desktop.png
test -s /tmp/twinshooter-qa/mobile.png
echo 'Captured desktop/mobile homepage screenshots'
