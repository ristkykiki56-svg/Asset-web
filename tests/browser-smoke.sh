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

# Lab route, viewport and interaction checks (production CSS, no Tailwind Play CDN).
"$CHROME" --headless=new --no-sandbox --disable-dev-shm-usage --disable-gpu \
  --window-size=1500,1000 --virtual-time-budget=8000 --dump-dom \
  "http://127.0.0.1:$PORT/tests/lab-viewport-smoke.html" \
  >/tmp/twinshooter-qa/lab-viewport-result.html 2>/tmp/twinshooter-qa/lab-chrome.log
if ! grep -Fq 'data-status="pass"' /tmp/twinshooter-qa/lab-viewport-result.html; then
  grep -E 'data-status="fail"|exception|overflow' /tmp/twinshooter-qa/lab-viewport-result.html || true
  echo 'Lab viewport/interactions smoke failed' >&2
  exit 1
fi
echo 'Lab browser QA PASS (320px–1440px)'
"$CHROME" --headless=new --no-sandbox --disable-dev-shm-usage --disable-gpu \
  --hide-scrollbars --window-size=1440,1000 --virtual-time-budget=1200 \
  --screenshot=/tmp/twinshooter-qa/lab-desktop.png "http://127.0.0.1:$PORT/lab.html" \
  >/dev/null 2>/dev/null
"$CHROME" --headless=new --no-sandbox --disable-dev-shm-usage --disable-gpu \
  --hide-scrollbars --window-size=390,900 --virtual-time-budget=1200 \
  --screenshot=/tmp/twinshooter-qa/lab-mobile.png "http://127.0.0.1:$PORT/lab.html" \
  >/dev/null 2>/dev/null
test -s /tmp/twinshooter-qa/lab-desktop.png
test -s /tmp/twinshooter-qa/lab-mobile.png

# Inspect the redesigned equipment illustration, not just the Lab introduction.
"$CHROME" --headless=new --no-sandbox --disable-dev-shm-usage --disable-gpu \
  --hide-scrollbars --window-size=1440,1050 --virtual-time-budget=2200 \
  --screenshot=/tmp/twinshooter-qa/lab-hardware-desktop.png "http://127.0.0.1:$PORT/tests/lab-hardware-visual-qa.html" \
  >/dev/null 2>/dev/null
"$CHROME" --headless=new --no-sandbox --disable-dev-shm-usage --disable-gpu \
  --hide-scrollbars --window-size=390,900 --virtual-time-budget=2200 \
  --screenshot=/tmp/twinshooter-qa/lab-hardware-mobile.png "http://127.0.0.1:$PORT/tests/lab-hardware-visual-qa.html" \
  >/dev/null 2>/dev/null
test -s /tmp/twinshooter-qa/lab-hardware-desktop.png
test -s /tmp/twinshooter-qa/lab-hardware-mobile.png
echo 'Captured Hardware illustration screenshots for visual QA'

# Isolated screenshots avoid deep-scroll limitations of headless Chrome.
for lesson in posture trigger optics silhouette; do
  "$CHROME" --headless=new --no-sandbox --disable-dev-shm-usage --disable-gpu \
    --hide-scrollbars --window-size=1440,1060 --virtual-time-budget=1800 \
    --screenshot="/tmp/twinshooter-qa/lab-${lesson}-desktop.png" \
    "http://127.0.0.1:$PORT/tests/lab-four-visual-qa.html?lesson=${lesson}" \
    >/dev/null 2>/dev/null
  "$CHROME" --headless=new --no-sandbox --disable-dev-shm-usage --disable-gpu \
    --hide-scrollbars --window-size=390,900 --virtual-time-budget=1800 \
    --screenshot="/tmp/twinshooter-qa/lab-${lesson}-mobile.png" \
    "http://127.0.0.1:$PORT/tests/lab-four-visual-qa.html?lesson=${lesson}" \
    >/dev/null 2>/dev/null
  test -s "/tmp/twinshooter-qa/lab-${lesson}-desktop.png"
  test -s "/tmp/twinshooter-qa/lab-${lesson}-mobile.png"
done
echo 'Captured focused desktop/mobile screenshots for four Lab illustrations'


# Capture the six simultaneous front-view anatomy hotspots (the reported defect).
for size in desktop mobile; do
  if [[ "$size" == desktop ]]; then dimensions="1440,1060"; else dimensions="390,900"; fi
  "$CHROME" --headless=new --no-sandbox --disable-dev-shm-usage --disable-gpu \
    --hide-scrollbars --window-size="$dimensions" --virtual-time-budget=2100 \
    --screenshot="/tmp/twinshooter-qa/lab-anatomy-front-${size}.png" \
    "http://127.0.0.1:$PORT/tests/lab-four-visual-qa.html?lesson=posture&pose=front" \
    >/dev/null 2>/dev/null
  test -s "/tmp/twinshooter-qa/lab-anatomy-front-${size}.png"
done
echo 'Captured front-view anatomy visual QA for desktop/mobile'

# Complete screenshot matrix: two illustrated uniforms, three distinct views, two viewports.
# The standing artwork intentionally has no idle animation.
for color in blue red; do
  for pose in front sideLeft back; do
    for size in desktop mobile; do
      if [[ "$size" == desktop ]]; then dimensions="1440,1060"; else dimensions="390,900"; fi
      artifact="/tmp/twinshooter-qa/posture-${color}-${pose}-${size}.png"
      "$CHROME" --headless=new --no-sandbox --disable-dev-shm-usage --disable-gpu \
        --hide-scrollbars --window-size="$dimensions" --virtual-time-budget=3500 \
        --screenshot="$artifact" \
        "http://127.0.0.1:$PORT/tests/lab-posture-sprite-qa.html?color=${color}&pose=${pose}" \
        >/dev/null 2>/dev/null
      test -s "$artifact"
    done
  done
done
# One DOM-level check prevents a screenshot of an error banner from passing as image QA.
"$CHROME" --headless=new --no-sandbox --disable-dev-shm-usage --disable-gpu \
  --window-size=1440,1050 --virtual-time-budget=3500 --dump-dom \
  "http://127.0.0.1:$PORT/tests/lab-posture-sprite-qa.html?color=red&pose=sideLeft" \
  >/tmp/twinshooter-qa/posture-sprite-result.html 2>/dev/null
grep -Fq 'data-snapshot="ready"' /tmp/twinshooter-qa/posture-sprite-result.html
echo 'Captured 12 real sprite viewports with DOM readiness verification'
