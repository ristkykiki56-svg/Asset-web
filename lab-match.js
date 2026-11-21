/* Twin Shooter Lab — Tab 06: Authentic IMSSU Air Rifle Silhouette Mini-Game
 * Integrates all 5 Lab concepts (Posture Sway & Breath, 2-Stage Trigger,
 * Optical Scope & Vignette, 4 IMSSU Distances 18/27/33/41m, Elevation Turret)
 * with official IMSSU left-to-right sequence, 5-target banks, knockdown physics,
 * and procedural Web Audio API sound effects (no external audio files needed).
 */
(() => {
  'use strict';

  const BANKS = [
    { key: 'chicken', name: 'AYAM', en: 'Chicken', dist: 18, scale: 1.05, dropPx: 0,  recClicks: 0, flightMs: 95,  windMul: 0.20 },
    { key: 'pig',     name: 'BABI', en: 'Pig',     dist: 27, scale: 1.00, dropPx: 14, recClicks: 2, flightMs: 145, windMul: 0.50 },
    { key: 'turkey',  name: 'KALKUN', en: 'Turkey',dist: 33, scale: 0.96, dropPx: 28, recClicks: 4, flightMs: 185, windMul: 0.75 },
    { key: 'ram',     name: 'DOMBA', en: 'Ram',    dist: 41, scale: 0.98, dropPx: 49, recClicks: 7, flightMs: 235, windMul: 1.00 }
  ];

  const ASSET_URLS = {
    bg: 'assets/match/range-bg.webp',
    chicken: 'assets/silhouettes/chicken.webp',
    pig: 'assets/silhouettes/pig.webp',
    turkey: 'assets/silhouettes/turkey.webp',
    ram: 'assets/silhouettes/ram.webp',
    pellet: 'assets/silhouettes/diabolo-pellet.webp'
  };

  const imgs = {};
  const hitMasks = {};
  let assetsReady = false;
  let audioCtx = null;
  let soundOn = true;

  function ensureAudio() {
    if (!soundOn) return null;
    if (!audioCtx && (window.AudioContext || window.webkitAudioContext)) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  }

  function playClick() {
    const ctx = ensureAudio();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.exponentialRampToValueAtTime(420, now + 0.025);
    g.gain.setValueAtTime(0.14, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
    osc.connect(g).connect(ctx.destination);
    osc.start(now); osc.stop(now + 0.032);
  }

  function playAirShot() {
    const ctx = ensureAudio();
    if (!ctx) return;
    const now = ctx.currentTime;
    // Short pneumatic PCP burst (filtered white noise + soft mechanical pop)
    const bufSize = Math.floor(ctx.sampleRate * 0.09);
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufSize * 0.24));
    const noise = ctx.createBufferSource();
    noise.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1650, now);
    filter.Q.setValueAtTime(1.1, now);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.32, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.088);
    noise.connect(filter).connect(g).connect(ctx.destination);
    noise.start(now);
  }

  function playSteelPing(isKnockdown) {
    const ctx = ensureAudio();
    if (!ctx) return;
    const now = ctx.currentTime;
    const freqs = isKnockdown ? [2380, 3620, 5140] : [1750, 2610];
    freqs.forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now);
      const amp = (isKnockdown ? 0.16 : 0.08) / (idx + 1);
      const dur = isKnockdown ? 0.42 : 0.16;
      g.gain.setValueAtTime(amp, now);
      g.gain.exponentialRampToValueAtTime(0.0008, now + dur);
      osc.connect(g).connect(ctx.destination);
      osc.start(now); osc.stop(now + dur + 0.02);
    });
  }

  function playDirtThud() {
    const ctx = ensureAudio();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(130, now);
    osc.frequency.exponentialRampToValueAtTime(48, now + 0.09);
    g.gain.setValueAtTime(0.18, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.095);
    osc.connect(g).connect(ctx.destination);
    osc.start(now); osc.stop(now + 0.1);
  }

  // Game State
  const G = {
    runId: 0,
    mode: 20, // 20 (Half Match: 4x5) or 40 (Full Match: 8x5)
    phase: 'lobby', // lobby | ready | fire | bank_end | finished
    bankIdx: 0,
    bankSeq: [], // list of BANKS indices
    targets: [], // 5 targets: { x, y, w, h, state: 'up'|'falling'|'down', fall: 0, wobble: 0 }
    shotIdx: 0, // 0..4 (mandatory left-to-right target index)
    shotsLeft: 5,
    timer: 120,
    readyTimer: 0,
    scores: { chicken: 0, pig: 0, turkey: 0, ram: 0 },
    totalHits: 0,
    totalFired: 0,
    // Aim & Physics
    aimX: 0, // world offset (-240..+240)
    aimY: 0, // world offset (-90..+90)
    velX: 0,
    velY: 0,
    swayT: 0,
    holdingBreath: false,
    breathStamina: 1.0, // 1.0 -> 0.0 while holding
    breathCooldown: false,
    swayDamp: 1.0,
    hasDraggedAim: false,
    turretClicks: 0, // 0..10 (each click = 7px elevation compensation)
    wind: 0, // -1.5 .. +1.5 m/s
    // 2-Stage Trigger
    triggerHeld: false,
    triggerProg: 0, // 0..1 (0..0.35 Take-up, 0.35..0.72 Creep, 0.72..0.94 Break zone!)
    triggerFiredThisHold: false,
    // Visual FX
    particles: [],
    impactMarkers: [],
    feedbackText: '',
    feedbackKind: '', // hit | ring | miss | info
    feedbackTimer: 0,
    recoilX: 0,
    recoilY: 0,
    rafId: null,
    lastTs: 0
  };

  function currentBank() {
    const bIdx = G.bankSeq[G.bankIdx] ?? 0;
    return BANKS[bIdx];
  }

  function loadAssets() {
    const entries = Object.entries(ASSET_URLS);
    let loaded = 0;
    entries.forEach(([k, url]) => {
      const im = new Image();
      im.onload = () => {
        if (['chicken', 'pig', 'turkey', 'ram'].includes(k) && im.naturalWidth > 0) {
          const c = document.createElement('canvas');
          c.width = im.naturalWidth;
          c.height = im.naturalHeight;
          const cctx = c.getContext('2d', { willReadFrequently: true });
          cctx.drawImage(im, 0, 0);
          try {
            hitMasks[k] = { w: c.width, h: c.height, data: cctx.getImageData(0, 0, c.width, c.height).data };
          } catch (_) {}
        }
        loaded++;
        if (loaded === entries.length) { assetsReady = true; renderMatchFrame(0.016); }
      };
      im.onerror = () => {
        loaded++;
        if (loaded === entries.length) { assetsReady = true; renderMatchFrame(0.016); }
      };
      im.src = url;
      imgs[k] = im;
    });
  }

  function startMatch(modeShots) {
    G.runId++;
    G.mode = modeShots;
    G.bankSeq = modeShots === 40 ? [0, 0, 1, 1, 2, 2, 3, 3] : [0, 1, 2, 3];
    G.bankIdx = 0;
    G.scores = { chicken: 0, pig: 0, turkey: 0, ram: 0 };
    G.totalHits = 0;
    G.totalFired = 0;
    G.turretClicks = 0;
    document.getElementById('matchLobbyOverlay').hidden = true;
    document.getElementById('matchSummaryOverlay').hidden = true;
    G.hasDraggedAim = false;
    const dh = document.getElementById('matchDragHint');
    if (dh) dh.hidden = false;
    setCoachTip('Tahan Nafas untuk menenangkan bidikan, lalu tahan Pelatuk hingga tombol hijau.', 'info');
    setupBank();
    startLoop();
  }

  function setupBank() {
    const bank = currentBank();
    G.phase = 'ready';
    G.readyTimer = 2.2;
    G.timer = 120;
    G.shotIdx = 0;
    G.shotsLeft = 5;
    G.aimX = -155; // Start aimed near target #1 (leftmost!)
    G.aimY = 0;
    G.breathStamina = 1.0;
    G.breathCooldown = false;
    G.swayDamp = 1.0;
    G.holdingBreath = false;
    G.triggerHeld = false;
    G.triggerProg = 0;
    G.particles = [];
    G.impactMarkers = [];
    // Mild authentic outdoor wind (-1.4 to +1.4 m/s, calmer at 18m)
    G.wind = Number(((Math.random() * 2.4 - 1.2) * (bank.dist >= 27 ? 1 : 0.45)).toFixed(1));

    // 5 targets evenly spaced left-to-right on the steel rail
    const spacing = 78;
    const baseW = 54 * bank.scale;
    const baseH = 44 * bank.scale;
    G.targets = [];
    for (let i = 0; i < 5; i++) {
      G.targets.push({
        idx: i,
        x: (i - 2) * spacing, // -156, -78, 0, +78, +156
        y: 8,
        w: baseW,
        h: baseH,
        state: 'up',
        fall: 0,
        wobble: 0
      });
    }
    showFeedback(`READY · ${bank.name} ${bank.dist}M (SARAN TURRET: +${bank.recClicks} KLIK)`, 'info', 2.4);
    updateHudDom();
  }

  function showFeedback(text, kind = 'info', duration = 1.8) {
    G.feedbackText = text;
    G.feedbackKind = kind;
    G.feedbackTimer = duration;
    const el = document.getElementById('matchFeedbackBanner');
    if (el) {
      el.textContent = text || 'GESER LAYAR UNTUK MEMBIDIK · URUTAN KIRI → KANAN';
      el.className = 'match-feedback is-' + (text ? kind : 'idle');
    }
  }

  function setCoachTip(text, kind = 'info') {
    const el = document.getElementById('matchCoachTip');
    if (!el) return;
    if (!text) { el.hidden = true; return; }
    el.textContent = text;
    el.className = 'match-coach-tip is-' + kind;
    el.hidden = false;
  }

  function adjustTurret(delta) {
    const next = Math.max(0, Math.min(10, G.turretClicks + delta));
    if (next !== G.turretClicks) {
      G.turretClicks = next;
      playClick();
      updateHudDom();
    }
  }

  function fireShot(jerking = false) {
    if (G.phase !== 'fire' || G.shotsLeft <= 0) return;
    const bank = currentBank();
    // Compute exact reticle position BEFORE applying post-shot recoil!
    const sway = getSwayOffset();
    const crosshairWorldX = G.aimX + sway.x;
    const crosshairWorldY = G.aimY + sway.y;

    playAirShot();
    G.recoilX = jerking ? 15 : 0;
    G.recoilY = jerking ? 13 : 6;
    G.shotsLeft--;
    G.totalFired++;

    const elevationComp = G.turretClicks * 7; // 7px per turret click
    const netDropY = bank.dropPx - elevationComp;
    const windDriftX = G.wind * 3.8 * bank.windMul;
    const jerkDir = Math.random() < 0.5 ? 1 : -1;
    const jerkX = jerking ? jerkDir * (19 + Math.random() * 11) : 0;
    const jerkY = jerking ? (13 + Math.random() * 9) : 0;

    const impactX = crosshairWorldX + windDriftX + jerkX;
    const impactY = crosshairWorldY + netDropY + jerkY;
    const activeTargetIndex = G.shotIdx;

    // Advance mandatory IMSSU left-to-right sequence immediately
    G.shotIdx++;
    updateHudDom();

    const shotRunId = G.runId;
    const shotBankIdx = G.bankIdx;
    const diag = {
      netDropY,
      windDriftX,
      wasHoldingBreath: G.holdingBreath && !G.breathCooldown,
      swayMag: Math.hypot(sway.x, sway.y)
    };
    // Delayed impact matching 4.5mm pellet flight time for distance (18m..41m)
    setTimeout(() => {
      if (shotRunId !== G.runId || shotBankIdx !== G.bankIdx) return;
      resolveImpact(impactX, impactY, activeTargetIndex, jerking, bank, diag);
    }, bank.flightMs);
  }

  function resolveImpact(ix, iy, expectedIdx, jerking, bank, diag = {}) {
    const { netDropY = 0, windDriftX = 0, wasHoldingBreath = false, swayMag = 0 } = diag;
    // Check if pellet hit any standing target
    let hitTarget = null;
    let isCenterMass = false;
    const mask = hitMasks[bank.key];
    const alphaAt = (mx, my) => {
      if (!mask) return 255;
      const x = Math.round(mx), y = Math.round(my);
      if (x < 0 || y < 0 || x >= mask.w || y >= mask.h) return 0;
      return mask.data[(y * mask.w + x) * 4 + 3];
    };

    for (const t of G.targets) {
      if (t.state !== 'up') continue;
      const leftX = t.x - t.w / 2;
      const topY = t.y - t.h;
      if (ix >= leftX - 2 && ix <= leftX + t.w + 2 && iy >= topY - 2 && iy <= t.y + 2) {
        if (mask) {
          const u = ((ix - leftX) / t.w) * mask.w;
          const v = ((iy - topY) / t.h) * mask.h;
          // Sample 4.5mm pellet radius (~5px in 232px sprite space)
          const r = 5;
          let solidSamples = 0;
          const probes = [[0,0],[r,0],[-r,0],[0,r],[0,-r],[r,r],[-r,-r],[r,-r],[-r,r]];
          for (const [ox, oy] of probes) {
            if (alphaAt(u + ox, v + oy) > 40) solidSamples++;
          }
          if (solidSamples >= 1) {
            hitTarget = t;
            // Solid body hit (>= 4 of 9 probes on metal) knocks target down; extreme tip graze (1-3) rings!
            isCenterMass = solidSamples >= 4;
            break;
          }
        } else {
          hitTarget = t;
          const dx = Math.abs(ix - t.x) / (t.w * 0.5);
          const dy = Math.abs(iy - (topY + t.h * 0.5)) / (t.h * 0.5);
          isCenterMass = (dx <= 0.85 && dy <= 0.85);
          break;
        }
      }
    }
    G.impactMarkers.push({
      x: ix, y: iy, life: 1.15,
      color: hitTarget ? (hitTarget.idx === expectedIdx && isCenterMass ? '#10B981' : '#F59E0B') : '#EF4444'
    });

    if (hitTarget) {
      if (hitTarget.idx !== expectedIdx) {
        hitTarget.wobble = 1.0;
        playSteelPing(false);
        spawnParticles(ix, iy, '#FF9466', 7);
        showFeedback(`SALAH URUTAN (#${hitTarget.idx + 1}) · MISS`, 'miss', 2.1);
        setCoachTip(`Aturan IMSSU: tembak target #${expectedIdx + 1} yang bertanda panah oranye (kiri → kanan).`, 'warn');
      } else if (isCenterMass) {
        hitTarget.state = 'falling';
        G.scores[bank.key]++;
        G.totalHits++;
        playSteelPing(true);
        spawnParticles(ix, iy, '#FFB020', 14);
        showFeedback(jerking ? `JATUH (+1) · TARIKAN TERLALU CEPAT` : `PING! TARGET #${expectedIdx + 1} JATUH (+1)`, 'hit', 1.7);
        if (jerking) {
          setCoachTip('Beruntung kena, tapi tahan pelatuk sampai tombol hijau (BREAK) agar tetap akurat.', 'warn');
        } else {
          setCoachTip(G.shotsLeft > 0 ? 'Tembakan bersih! Geser ke target berikutnya di sebelah kanan.' : 'Bank selesai! Bersiap pindah jarak berikutnya.', 'ok');
        }
      } else {
        hitTarget.wobble = 1.0;
        playSteelPing(false);
        spawnParticles(ix, iy, '#CBD5E1', 8);
        showFeedback(`RINGING (TERSEREMPET) · TIDAK JATUH (0)`, 'ring', 1.8);
        setCoachTip('Terserempet tepi—arahkan titik merah ke tengah badan siluet agar target jatuh.', 'warn');
      }
    } else {
      playDirtThud();
      spawnParticles(ix, iy, '#8B7355', 10);
      let missMsg = 'MISS · PERIKSA TITIK JATUH';
      let tip = 'Amati titik bekas jatuh peluru lalu koreksi arah bidikanmu.';
      if (jerking) {
        missMsg = 'MISS · TARIKAN KAGET!';
        tip = 'Tahan pelatuk sampai tombol berubah hijau (BREAK), jangan dilepas terlalu cepat.';
      } else if (netDropY >= 10) {
        missMsg = `MISS · PELURU JATUH RENDAH`;
        tip = `Jarak ${bank.dist} m: naikkan Turret ke +${bank.recClicks} klik agar peluru tidak jatuh rendah.`;
      } else if (netDropY <= -10) {
        missMsg = `MISS · PELURU KETINGGIAN`;
        tip = `Jarak ${bank.dist} m: turunkan Turret ke +${bank.recClicks} klik agar bidikan pas.`;
      } else if (!wasHoldingBreath && swayMag >= 5.5) {
        missMsg = 'MISS · AYUNAN MASIH BESAR';
        tip = 'Tahan tombol Nafas sejenak untuk meredam ayunan posisi berdiri.';
      } else if (Math.abs(windDriftX) >= 3.2) {
        missMsg = 'MISS · TERBAWA ANGIN';
        tip = `Angin ke ${G.wind > 0 ? 'kanan (→)' : 'kiri (←)'}: geser bidikan sedikit ke ${G.wind > 0 ? 'kiri' : 'kanan'} pusat target.`;
      }
      showFeedback(missMsg, 'miss', 2.2);
      setCoachTip(tip, 'warn');
    }

    updateHudDom();

    // Check if bank is finished
    if (G.shotsLeft <= 0 && G.phase === 'fire') {
      G.phase = 'bank_end';
      const endRunId = G.runId;
      const endBankIdx = G.bankIdx;
      setTimeout(() => {
        if (endRunId !== G.runId || endBankIdx !== G.bankIdx) return;
        if (G.bankIdx + 1 < G.bankSeq.length) {
          G.bankIdx++;
          setupBank();
        } else {
          finishMatch();
        }
      }, 1450);
    }
  }

  function finishMatch() {
    G.phase = 'finished';
    const maxScore = G.mode;
    const pct = Math.round((G.totalHits / maxScore) * 100);
    let rank = 'Pemula IMSSU';
    if (pct >= 85) rank = 'Master / AAA';
    else if (pct >= 70) rank = 'AA · Penembak Tangguh';
    else if (pct >= 50) rank = 'A · Konsisten';
    else if (pct >= 30) rank = 'B · Berkembang';

    document.getElementById('matchFinalScore').textContent = `${G.totalHits} / ${maxScore}`;
    document.getElementById('matchFinalRank').textContent = `${rank} · Akurasi ${pct}%`;
    document.getElementById('matchBreakdown').innerHTML = BANKS.map(b => {
      const perAnimalMax = G.mode === 40 ? 10 : 5;
      return `<div class="ms-cell"><span>${b.name} (${b.dist}m)</span><strong>${G.scores[b.key]} / ${perAnimalMax}</strong></div>`;
    }).join('');
    document.getElementById('matchSummaryOverlay').hidden = false;
  }

  function spawnParticles(x, y, color, count) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const spd = 25 + Math.random() * 85;
      G.particles.push({ x, y, vx: Math.cos(a) * spd, vy: Math.sin(a) * spd - 20, life: 0.45 + Math.random() * 0.25, color });
    }
  }

  function getSwayOffset() {
    const bank = currentBank();
    const amp = (8.0 + bank.dist * 0.12) * G.swayDamp;
    return {
      x: Math.sin(G.swayT * 1.45) * amp + G.recoilX,
      y: Math.sin(G.swayT * 2.9) * (amp * 0.62) - G.recoilY
    };
  }

  function updateHudDom() {
    const bank = currentBank();
    const bankNum = G.bankIdx + 1;
    const bankTotal = G.bankSeq.length;
    const elDist = document.getElementById('matchBankBadge');
    if (elDist) elDist.textContent = `${bank.name} · ${bank.dist}m (${bankNum}/${bankTotal})`;
    const elScore = document.getElementById('matchScoreBadge');
    if (elScore) elScore.textContent = `${String(G.totalHits).padStart(2, '0')} / ${G.mode}`;
    const elTimer = document.getElementById('matchTimerBadge');
    if (elTimer) {
      const m = Math.floor(G.timer / 60);
      const s = Math.floor(G.timer % 60);
      elTimer.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
    const elWind = document.getElementById('matchWindBadge');
    if (elWind) {
      const dir = G.wind > 0.1 ? '→' : G.wind < -0.1 ? '←' : '·';
      elWind.textContent = `ANGIN ${Math.abs(G.wind).toFixed(1)} m/s ${dir}`;
    }
    const elTurret = document.getElementById('matchTurretVal');
    if (elTurret) elTurret.textContent = `+${G.turretClicks} KLIK`;
    const elHint = document.getElementById('matchTurretHint');
    if (elHint) elHint.textContent = `ELEVASI ${bank.dist}m (SARAN +${bank.recClicks})`;

    // 5 Diabolo pellet ammo icons
    const ammoWrap = document.getElementById('matchAmmoIcons');
    if (ammoWrap) {
      const pelletSrc = imgs.pellet?.src || ASSET_URLS.pellet;
      if (ammoWrap.children.length !== 5) {
        ammoWrap.innerHTML = Array.from({ length: 5 }, (_, i) =>
          `<img src="${pelletSrc}" alt="Peluru ${i + 1}" class="ammo-pellet">`
        ).join('');
      }
      Array.from(ammoWrap.children).forEach((img, idx) => {
        img.classList.toggle('is-spent', idx >= G.shotsLeft);
      });
    }
  }

  function syncCanvasSize(canvas) {
    const wrap = canvas.parentElement;
    if (!wrap) return;
    const rect = wrap.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const targetW = Math.round(rect.width * dpr);
    const targetH = Math.round(rect.height * dpr);
    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }
  }

  function renderMatchFrame(dt) {
    const canvas = document.getElementById('matchScopeCanvas');
    if (!canvas) return;
    syncCanvasSize(canvas);
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = canvas.width / dpr, H = canvas.height / dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const cx = W / 2, cy = H / 2;
    const scopeR = Math.max(80, Math.min(W * 0.465, (H - 58) * 0.485));

    // Update timers & physics
    G.swayT += dt;
    G.recoilX *= Math.pow(0.01, dt);
    G.recoilY = Math.max(0, G.recoilY - dt * 36);
    G.velX *= Math.pow(0.04, dt);
    G.velY *= Math.pow(0.04, dt);

    if (G.phase === 'ready') {
      G.readyTimer -= dt;
      if (G.readyTimer <= 0) {
        G.phase = 'fire';
        showFeedback('FIRE! TEMBAK URUT KIRI → KANAN', 'info', 1.6);
      }
    } else if (G.phase === 'fire') {
      G.timer = Math.max(0, G.timer - dt);
      if (G.timer <= 0) {
        G.phase = 'bank_end';
        showFeedback('CEASE FIRE · WAKTU HABIS', 'miss', 1.8);
        const endRunId = G.runId;
        const endBankIdx = G.bankIdx;
        setTimeout(() => {
          if (endRunId !== G.runId || endBankIdx !== G.bankIdx) return;
          if (G.bankIdx + 1 < G.bankSeq.length) { G.bankIdx++; setupBank(); }
          else finishMatch();
        }, 1600);
      }
      const m = Math.floor(G.timer / 60), s = Math.floor(G.timer % 60);
      const elTimer = document.getElementById('matchTimerBadge');
      if (elTimer) elTimer.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }

    // Breath stamina + smooth sway transition (zero instant reticle jump!)
    if (G.holdingBreath && !G.breathCooldown && G.phase === 'fire') {
      G.breathStamina = Math.max(0, G.breathStamina - dt / 3.5);
      if (G.breathStamina <= 0) { G.breathCooldown = true; G.holdingBreath = false; }
    } else {
      G.breathStamina = Math.min(1, G.breathStamina + dt / 2.4);
      if (G.breathStamina >= 0.40) G.breathCooldown = false;
    }
    const targetDamp = G.breathCooldown ? 1.35 : (G.holdingBreath ? 0.22 : 1.0);
    G.swayDamp += (targetDamp - G.swayDamp) * Math.min(1, dt * 6.5);
    const breathBar = document.getElementById('matchBreathFill');
    if (breathBar) {
      breathBar.style.width = Math.round(G.breathStamina * 100) + '%';
      breathBar.classList.toggle('is-low', G.breathCooldown || G.breathStamina < 0.25);
    }

    // 2-Stage Trigger Progression
    if (G.triggerHeld && !G.triggerFiredThisHold && G.phase === 'fire') {
      G.triggerProg = Math.min(1, G.triggerProg + dt * 1.15);
      if (G.triggerProg >= 0.92) {
        // Clean automatic break at peak of creep!
        G.triggerFiredThisHold = true;
        fireShot(false);
      }
    } else if (!G.triggerHeld) {
      G.triggerProg = Math.max(0, G.triggerProg - dt * 5.0);
    }
    const trigFill = document.getElementById('matchTriggerFill');
    if (trigFill) trigFill.style.width = Math.round(G.triggerProg * 100) + '%';
    const trigBtnEl = document.getElementById('matchTriggerBtn');
    if (trigBtnEl) {
      const inBreak = G.triggerHeld && !G.triggerFiredThisHold && G.triggerProg >= 0.72;
      trigBtnEl.classList.toggle('is-break-ready', inBreak);
      trigBtnEl.textContent = inBreak ? 'LEPAS · BREAK!' : 'TAHAN PELATUK';
    }

    // Update targets & particles
    G.targets.forEach(t => {
      if (t.state === 'falling') {
        t.fall = Math.min(1, t.fall + dt * 3.8);
        if (t.fall >= 1) t.state = 'down';
      }
      if (t.wobble > 0) t.wobble = Math.max(0, t.wobble - dt * 2.8);
    });
    G.particles = G.particles.filter(p => {
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 180 * dt;
      return p.life > 0;
    });
    G.impactMarkers = G.impactMarkers.filter(m => {
      m.life -= dt;
      return m.life > 0;
    });

    if (G.feedbackTimer > 0) {
      G.feedbackTimer -= dt;
      if (G.feedbackTimer <= 0 && G.phase === 'fire') {
        const el = document.getElementById('matchFeedbackBanner');
        if (el) {
          el.textContent = `GILIRAN TARGET #${Math.min(5, G.shotIdx + 1)} (KIRI → KANAN)`;
          el.className = 'match-feedback is-idle';
        }
      }
    }

    // --- DRAW SCENE ---
    ctx.fillStyle = '#090C10';
    ctx.fillRect(0, 0, W, H);

    const sway = getSwayOffset();
    const camX = G.aimX + sway.x;
    const camY = G.aimY + sway.y;

    // Scope clip
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, scopeR, 0, Math.PI * 2);
    ctx.clip();

    // 1. Photorealistic Outdoor Range Backdrop with smooth parallax
    if (imgs.bg && imgs.bg.complete && imgs.bg.naturalWidth > 0) {
      const bgW = W * 1.48;
      const bgH = H * 1.48;
      const bgX = cx - bgW / 2 - camX * 0.55;
      const bgY = cy - bgH / 2 - camY * 0.55 - 12;
      ctx.drawImage(imgs.bg, bgX, bgY, bgW, bgH);
    } else {
      const sky = ctx.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, '#B9CCD6'); sky.addColorStop(0.55, '#6D8C5B'); sky.addColorStop(1, '#3D5634');
      ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
    }

    // 2. Steel Target Rail (anchored in world coordinates)
    const bank = currentBank();
    const railY = cy + (8 - camY);
    const railLeft = cx + (-210 - camX);
    const railWidth = 420;
    ctx.fillStyle = '#1B2027';
    ctx.fillRect(railLeft, railY, railWidth, 14);
    ctx.fillStyle = '#38414D';
    ctx.fillRect(railLeft, railY, railWidth, 3);
    // Rail support posts
    ctx.fillStyle = '#11151A';
    ctx.fillRect(railLeft + 26, railY + 14, 10, 90);
    ctx.fillRect(railLeft + railWidth - 36, railY + 14, 10, 90);

    // 3. Draw 5 Textured Metallic Silhouettes
    const sprite = imgs[bank.key];
    G.targets.forEach(t => {
      if (t.state === 'down') return;
      const sx = cx + (t.x - camX);
      const sy = cy + (t.y - camY);

      ctx.save();
      ctx.translate(sx, sy);
      // Wobble on glancing hit or 3D perspective knockdown
      if (t.wobble > 0) {
        ctx.rotate(Math.sin(t.wobble * 24) * 0.12 * t.wobble);
      }
      if (t.state === 'falling') {
        const syScale = Math.max(0.05, 1 - t.fall * 0.92);
        ctx.scale(1, syScale);
        ctx.globalAlpha = Math.max(0.15, 1 - t.fall * 0.85);
      }

      if (sprite && sprite.complete && sprite.naturalWidth > 0) {
        ctx.drawImage(sprite, -t.w / 2, -t.h, t.w, t.h);
      } else {
        ctx.fillStyle = '#FF4800';
        ctx.fillRect(-t.w / 2, -t.h, t.w, t.h);
      }

      // Subtle active IMSSU left-to-right target chevron indicator above active target
      if (G.phase === 'fire' && t.idx === G.shotIdx && t.state === 'up') {
        const bob = Math.sin(G.swayT * 6) * 3;
        ctx.fillStyle = '#FF4800';
        ctx.beginPath();
        ctx.moveTo(0, -t.h - 8 + bob);
        ctx.lineTo(-6, -t.h - 17 + bob);
        ctx.lineTo(6, -t.h - 17 + bob);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    });

    // 4. Impact Particles & Exact Point-of-Impact Marker
    G.particles.forEach(p => {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, p.life * 2);
      ctx.beginPath();
      ctx.arc(cx + (p.x - camX), cy + (p.y - camY), 2.5, 0, Math.PI * 2);
      ctx.fill();
    });
    G.impactMarkers.forEach(m => {
      const mx = cx + (m.x - camX), my = cy + (m.y - camY);
      ctx.globalAlpha = Math.min(1, m.life);
      ctx.strokeStyle = m.color;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(mx, my, 5, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath(); ctx.arc(mx, my, 2, 0, Math.PI * 2); ctx.fill();
    });
    ctx.globalAlpha = 1;

    // 5. Crisp Precision Mil-Dot Reticle + Center Glowing Red Dot
    ctx.strokeStyle = 'rgba(12, 15, 19, 0.86)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(cx - scopeR, cy); ctx.lineTo(cx + scopeR, cy);
    ctx.moveTo(cx, cy - scopeR); ctx.lineTo(cx, cy + scopeR);
    ctx.stroke();

    // Thick outer duplex posts
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(cx - scopeR, cy); ctx.lineTo(cx - scopeR * 0.52, cy);
    ctx.moveTo(cx + scopeR * 0.52, cy); ctx.lineTo(cx + scopeR, cy);
    ctx.moveTo(cx, cy + scopeR * 0.52); ctx.lineTo(cx, cy + scopeR);
    ctx.stroke();

    // Subtle mil-hash ticks
    ctx.lineWidth = 1.2;
    for (let k = -3; k <= 3; k++) {
      if (k === 0) continue;
      const d = k * 24;
      ctx.beginPath();
      ctx.moveTo(cx + d, cy - 4); ctx.lineTo(cx + d, cy + 4);
      ctx.moveTo(cx - 4, cy + d); ctx.lineTo(cx + 4, cy + d);
      ctx.stroke();
    }

    // Glowing red center dot
    ctx.fillStyle = '#FF3B1F';
    ctx.beginPath(); ctx.arc(cx, cy, 2.8, 0, Math.PI * 2); ctx.fill();

    // 6. Dynamic Eye-Relief Scope Shadow (subtly shifts when whipping aim fast!)
    const lagX = Math.max(-28, Math.min(28, G.velX * 0.35));
    const lagY = Math.max(-28, Math.min(28, G.velY * 0.35));
    const vig = ctx.createRadialGradient(cx - lagX, cy - lagY, scopeR * 0.72, cx, cy, scopeR * 1.03);
    vig.addColorStop(0, 'rgba(0,0,0,0)');
    vig.addColorStop(0.84, 'rgba(9,12,16,0.45)');
    vig.addColorStop(1, 'rgba(9,12,16,0.96)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, W, H);

    ctx.restore();

    // 7. Outer Knurled Matte Scope Bezel Ring
    ctx.strokeStyle = '#252E39';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.arc(cx, cy, scopeR + 2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(cx, cy, scopeR + 5.5, 0, Math.PI * 2);
    ctx.stroke();
  }

  function startLoop() {
    if (G.rafId) return;
    G.lastTs = performance.now();
    function tick(ts) {
      const dt = Math.min(0.05, (ts - G.lastTs) / 1000);
      G.lastTs = ts;
      const panel = document.getElementById('sec-match');
      if (panel && panel.classList.contains('is-active')) {
        renderMatchFrame(dt);
      }
      G.rafId = requestAnimationFrame(tick);
    }
    G.rafId = requestAnimationFrame(tick);
  }

  function bindMatchControls() {
    const canvas = document.getElementById('matchScopeCanvas');
    if (!canvas) return;

    // Multi-touch safe relative aiming (thumb 1 aims while thumb 2 holds breath or trigger!)
    let dragPointerId = null;
    let lastPx = 0, lastPy = 0;

    canvas.addEventListener('pointerdown', ev => {
      if (G.phase !== 'fire' && G.phase !== 'ready') return;
      if (dragPointerId !== null) return;
      dragPointerId = ev.pointerId;
      lastPx = ev.clientX;
      lastPy = ev.clientY;
      canvas.setPointerCapture(ev.pointerId);
    });

    canvas.addEventListener('pointermove', ev => {
      if (ev.pointerId !== dragPointerId) return;
      const rect = canvas.getBoundingClientRect();
      const sens = rect.width ? (420 / rect.width) * 0.58 : 0.72;
      const dx = (ev.clientX - lastPx) * sens;
      const dy = (ev.clientY - lastPy) * sens;
      lastPx = ev.clientX;
      lastPy = ev.clientY;
      G.velX = dx * 8;
      G.velY = dy * 8;
      if (!G.hasDraggedAim) { G.hasDraggedAim = true; const dh = document.getElementById('matchDragHint'); if (dh) dh.hidden = true; }
      G.aimX = Math.max(-210, Math.min(210, G.aimX + dx));
      G.aimY = Math.max(-85, Math.min(85, G.aimY + dy));
    });

    const stopDrag = ev => {
      if (ev.pointerId === dragPointerId) dragPointerId = null;
    };
    canvas.addEventListener('pointerup', stopDrag);
    canvas.addEventListener('pointercancel', stopDrag);

    // 2-Stage Trigger Button
    const trigBtn = document.getElementById('matchTriggerBtn');
    if (trigBtn) {
      trigBtn.addEventListener('pointerdown', ev => {
        ev.preventDefault();
        ensureAudio();
        if (G.phase !== 'fire') return;
        trigBtn.setPointerCapture(ev.pointerId);
        trigBtn.setAttribute('aria-pressed', 'true');
        G.triggerHeld = true;
        G.triggerProg = 0.05;
        G.triggerFiredThisHold = false;
      });
      const releaseTrigger = () => {
        if (!G.triggerHeld) return;
        G.triggerHeld = false;
        trigBtn.setAttribute('aria-pressed', 'false');
        if (!G.triggerFiredThisHold && G.phase === 'fire') {
          if (G.triggerProg >= 0.72) {
            // Clean release inside break zone!
            G.triggerFiredThisHold = true;
            fireShot(false);
          } else if (G.triggerProg >= 0.12) {
            // Released too early / jerked trigger
            G.triggerFiredThisHold = true;
            fireShot(true);
          }
        }
      };
      trigBtn.addEventListener('pointerup', releaseTrigger);
      trigBtn.addEventListener('pointercancel', releaseTrigger);
    }

    // Hold Breath Button
    const breathBtn = document.getElementById('matchBreathBtn');
    if (breathBtn) {
      breathBtn.addEventListener('pointerdown', ev => {
        ev.preventDefault();
        breathBtn.setPointerCapture(ev.pointerId);
        G.holdingBreath = true;
        breathBtn.setAttribute('aria-pressed', 'true');
      });
      const releaseBreath = () => {
        G.holdingBreath = false;
        breathBtn.setAttribute('aria-pressed', 'false');
      };
      breathBtn.addEventListener('pointerup', releaseBreath);
      breathBtn.addEventListener('pointercancel', releaseBreath);
      breathBtn.addEventListener('blur', releaseBreath);
    }

    // Keyboard support for Desktop (Space = Breath, Arrows = Turret)
    window.addEventListener('keydown', ev => {
      if (!document.getElementById('sec-match')?.classList.contains('is-active')) return;
      if (ev.code === 'Space' && !ev.repeat) { ev.preventDefault(); G.holdingBreath = true; }
      if (ev.code === 'ArrowUp') { ev.preventDefault(); adjustTurret(1); }
      if (ev.code === 'ArrowDown') { ev.preventDefault(); adjustTurret(-1); }
    });
    window.addEventListener('keyup', ev => {
      if (ev.code === 'Space') G.holdingBreath = false;
    });

    // Sound toggle
    document.getElementById('matchSoundBtn')?.addEventListener('click', ev => {
      soundOn = !soundOn;
      ev.currentTarget.textContent = soundOn ? '🔊' : '🔇';
      ev.currentTarget.setAttribute('aria-pressed', String(soundOn));
    });

    // Restart / Menu button
    document.getElementById('matchMenuBtn')?.addEventListener('click', () => {
      G.runId++;
      G.phase = 'lobby';
      G.triggerHeld = false;
      G.holdingBreath = false;
      document.getElementById('matchSummaryOverlay').hidden = true;
      document.getElementById('matchLobbyOverlay').hidden = false;
      const dh = document.getElementById('matchDragHint'); if (dh) dh.hidden = true;
      const ct = document.getElementById('matchCoachTip'); if (ct) ct.hidden = true;
      showFeedback('SIAP MEMULAI MATCH IMSSU · PILIH MODE DI BAWAH', 'idle', 99);
    });
  }

  window.startImssuMatch = startMatch;
  window.adjustMatchTurret = adjustTurret;

  function bootMatch() {
    loadAssets();
    bindMatchControls();
    startLoop();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bootMatch, { once: true });
  else bootMatch();
})();
