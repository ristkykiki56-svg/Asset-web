/* Twin Shooter Homepage — Precision Motion JS Engine (60fps, zero external libraries)
 * Features:
 * 1. Top Optical Scroll-Progress Reticle Bar
 * 2. Hero Optical Lock-On & Dual-Identity Opposite Scroll Parallax
 * 3. Scroll-Driven Real-Time Timeline Growth (2020 -> 2023)
 * 4. Smooth Eased Count-Up for Medal Tally & Milestones
 * 5. Staggered Scroll Reveals & Scorebook Filter Cascade
 */
(() => {
  'use strict';

  document.documentElement.classList.add('js-anim');

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function animateNumber(el, target, duration = 420) {
    if (!el) return;
    const end = Number(target);
    if (reduced || Number.isNaN(end)) {
      el.textContent = String(target);
      return;
    }
    const start = Number(el.textContent) || 0;
    if (start === end) {
      el.textContent = String(end);
      return;
    }
    const t0 = performance.now();
    function step(now) {
      const p = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(start + (end - start) * eased));
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = String(end);
    }
    requestAnimationFrame(step);
  }

  function bootMotion() {

    // 0. Mobile Hamburger Menu Drawer
    const menuBtn = document.getElementById('menuToggle');
    const mobileDrawer = document.getElementById('mobileDrawer');
    if (menuBtn && mobileDrawer) {
      function setMenuOpen(open) {
        menuBtn.setAttribute('aria-expanded', String(open));
        menuBtn.setAttribute('aria-label', open ? 'Tutup menu navigasi' : 'Buka menu navigasi');
        mobileDrawer.hidden = !open;
      }
      menuBtn.addEventListener('click', () => {
        const isOpen = menuBtn.getAttribute('aria-expanded') === 'true';
        setMenuOpen(!isOpen);
      });
      mobileDrawer.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenuOpen(false)));
      document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && menuBtn.getAttribute('aria-expanded') === 'true') setMenuOpen(false);
      });
      document.addEventListener('click', e => {
        if (menuBtn.getAttribute('aria-expanded') === 'true' && !e.target.closest('.site-header')) {
          setMenuOpen(false);
        }
      });
    }

    // 1. Trigger Hero Lock-On Reveal
    requestAnimationFrame(() => {
      document.documentElement.classList.add('motion-ready');
    });

    // 2. Scorebook Filter with Animated Count-Up & Stagger Cascade
    const rows = Array.from(document.querySelectorAll('#grid .sb-row'));
    const buttons = Array.from(document.querySelectorAll('.filter'));
    const status = document.getElementById('results-status');
    const elGold = document.getElementById('tallyGold');
    const elSilver = document.getElementById('tallySilver');
    const elBronze = document.getElementById('tallyBronze');
    const elTotal = document.getElementById('tallyTotal');

    function applyFilter(filter, animate = true) {
      let visible = 0, gold = 0, silver = 0, bronze = 0;
      for (const row of rows) {
        const match = filter === 'all' || row.dataset.athlete === filter || row.dataset.year === filter;
        row.hidden = !match;
        if (match) {
          if (animate && !reduced) {
            row.classList.remove('sb-pop');
            row.style.setProperty('--stagger', Math.min(visible, 14) * 22 + 'ms');
            void row.offsetWidth;
            row.classList.add('sb-pop');
          }
          visible++;
          if (row.dataset.medal === 'gold') gold++;
          else if (row.dataset.medal === 'silver') silver++;
          else if (row.dataset.medal === 'bronze') bronze++;
        }
      }
      for (const btn of buttons) {
        const active = btn.dataset.filter === filter;
        btn.classList.toggle('active', active);
        btn.setAttribute('aria-pressed', String(active));
      }
      if (animate) {
        animateNumber(elGold, gold, 360);
        animateNumber(elSilver, silver, 360);
        animateNumber(elBronze, bronze, 360);
        animateNumber(elTotal, visible, 360);
      } else {
        if (elGold) elGold.textContent = String(gold);
        if (elSilver) elSilver.textContent = String(silver);
        if (elBronze) elBronze.textContent = String(bronze);
        if (elTotal) elTotal.textContent = String(visible);
      }
      if (status) status.textContent = visible + ' hasil pertandingan ditampilkan.';
    }

    buttons.forEach(btn => btn.addEventListener('click', () => applyFilter(btn.dataset.filter, true)));
    applyFilter('all', false);

    if (reduced) {
      document.querySelectorAll('[data-reveal]').forEach(el => el.classList.add('is-in'));
      const fill = document.getElementById('timelineFill');
      if (fill) fill.style.transform = 'scaleY(1)';
      document.querySelectorAll('.tl-step').forEach(s => s.classList.add('is-lit'));
      return;
    }

    // 3. Staggered Scroll Reveal Observer
    const revealEls = document.querySelectorAll('[data-reveal]');
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        });
      }, { threshold: 0.02, rootMargin: '0px 0px -8px 0px' });
      revealEls.forEach(el => io.observe(el));
    } else {
      revealEls.forEach(el => el.classList.add('is-in'));
    }

    // 4. Medal Tally Count-Up on First Scroll Into Achievements
    const tallyBar = document.querySelector('.tally-bar');
    if (tallyBar && 'IntersectionObserver' in window) {
      const tio = new IntersectionObserver(entries => {
        if (!entries.some(e => e.isIntersecting)) return;
        tio.disconnect();
        const g = elGold?.textContent || 0;
        const s = elSilver?.textContent || 0;
        const b = elBronze?.textContent || 0;
        const t = elTotal?.textContent || 25;
        if (elGold) elGold.textContent = '0';
        if (elSilver) elSilver.textContent = '0';
        if (elBronze) elBronze.textContent = '0';
        if (elTotal) elTotal.textContent = '0';
        animateNumber(elGold, g, 650);
        animateNumber(elSilver, s, 650);
        animateNumber(elBronze, b, 650);
        animateNumber(elTotal, t, 750);
      }, { threshold: 0.35 });
      tio.observe(tallyBar);
    }

    // 5. Scroll-Linked Loop: Reticle Progress Bar + Hero Twin Parallax + Live Timeline Growth
    const progressFill = document.getElementById('scrollReticleFill');
    const timeline = document.querySelector('.timeline');
    const timelineFill = document.getElementById('timelineFill');
    const tlSteps = Array.from(document.querySelectorAll('.tl-step'));

    let ticking = false;
    function onScrollFrame() {
      ticking = false;
      const scrollY = window.scrollY || window.pageYOffset;
      const docH = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const pct = Math.max(0, Math.min(1, scrollY / docH));

      // Top optical progress bar
      if (progressFill) {
        progressFill.style.transform = `scaleX(${pct.toFixed(4)})`;
      }

      // Live Scroll-Driven Timeline Line (2020 -> 2023)
      if (timeline && timelineFill) {
        const tRect = timeline.getBoundingClientRect();
        const triggerY = window.innerHeight * 0.68;
        const raw = (triggerY - tRect.top) / Math.max(1, tRect.height);
        const tProg = Math.max(0, Math.min(1, raw));
        timelineFill.style.transform = `scaleY(${tProg.toFixed(4)})`;

        tlSteps.forEach(step => {
          const sRect = step.getBoundingClientRect();
          step.classList.toggle('is-lit', sRect.top <= triggerY + 12);
        });
      }
    }

    function requestScroll() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(onScrollFrame);
      }
    }


    // 6. Feinwerkbau P 70 Direct Breakdown + Gliding Corner-Bracket Focus Frame
    const p70Frame = document.getElementById('p70Frame');
    const p70FrameTag = document.getElementById('p70FrameTag');
    const p70Zones = Array.from(document.querySelectorAll('.p70-zone'));
    const p70Tabs = Array.from(document.querySelectorAll('.p70-tab'));

    const P70_PARTS = [
      {
        tag: '01 · OPTIK',
        box: { l: 26.5, t: 23.5, w: 31.5, h: 14.5, bottom: false },
        code: 'MODUL 01 / 05',
        title: 'Optik & Mounting Rel Receiver',
        desc: 'Bagian atas receiver P 70 beralur rel untuk dudukan cincin teleskop. Di nomor IMSSU Multi Range, turret elevasi disetel guna mengompensasi lintasan peluru 4,5 mm di jarak 18 m, 27 m, 33 m, dan 41 m.',
        s1l: 'DUDUKAN', s1v: 'Alur Rel Receiver Atas',
        s2l: 'JARAK BIDIK', s2v: '18 · 27 · 33 · 41 m',
        s3l: 'SIMULASI', s3v: '<a href="https://twinshooter.vercel.app/lab">Uji Optik di Lab ↗</a>'
      },
      {
        tag: '02 · LARAS 425 MM',
        box: { l: 31.0, t: 35.0, w: 65.5, h: 16.0, bottom: false },
        code: 'MODUL 02 / 05',
        title: 'Laras 425 mm & Receiver Single-Shot',
        desc: 'Laras baja presisi kaliber 4,5 mm (.177) sepanjang 425 mm dengan mekanisme single-shot tuas kokang samping (side lever) dan ruang muat langsung untuk peluru diabolo timah. Diproduksi di Oberndorf, Jerman (1995–2004).',
        s1l: 'KALIBER / LARAS', s1v: '4,5 mm (.177) · 425 mm',
        s2l: 'AKSI', s2v: 'Single-Shot Side Lever',
        s3l: 'PABRIKAN', s3v: 'Feinwerkbau, Jerman'
      },
      {
        tag: '03 · TABUNG 200 BAR',
        box: { l: 50.5, t: 47.5, w: 36.0, h: 7.5, bottom: true },
        code: 'MODUL 03 / 05',
        title: 'Tabung Udara Tekan 200 Bar (PCP)',
        desc: 'P 70 adalah seri senapan angin udara tekan pertama Feinwerkbau. Tabung aluminium di bawah laras dapat dilepas-pasang dengan tekanan isi maksimal 200 bar, lalu diturunkan regulator internal ke tekanan kerja stabil tiap tembakan.',
        s1l: 'TEKANAN MAKS', s1v: '200 Bar (Udara Tekan)',
        s2l: 'SISTEM', s2v: 'Regulator Internal PCP',
        s3l: 'TABUNG', s3v: 'Aluminium Lepas-Pasang'
      },
      {
        tag: '04 · PELATUK',
        box: { l: 34.5, t: 67.5, w: 10.5, h: 15.0, bottom: true },
        code: 'MODUL 04 / 05',
        title: 'Unit Pelatuk Match 2-Tahap',
        desc: 'Mekanisme pelatuk match mekanis yang dapat disetel penuh—mulai dari panjang tarikan tahap pertama (first stage), titik henti (breakpoint), bobot tarik, hingga posisi bilah—agar tembakan lepas bersih tanpa hentakan jari.',
        s1l: 'MEKANISME', s1v: 'Match 2-Tahap',
        s2l: 'PENYETELAN', s2v: 'Bobot, Travel & Bilah',
        s3l: 'SIMULASI', s3v: '<a href="https://twinshooter.vercel.app/lab">Uji Pelatuk di Lab ↗</a>'
      },
      {
        tag: '05 · POPOR',
        box: { l: 3.5, t: 49.5, w: 70.0, h: 32.0, bottom: false },
        code: 'MODUL 05 / 05',
        title: 'Popor, Cheekpiece & Buttplate',
        desc: 'Popor target dengan sandaran pipi (cheekpiece) dan bantalan bahu (buttplate) yang dapat diatur ketinggian serta sudutnya, ditambah rel bawah untuk menyeimbangkan bobot unit (±4,9 kg versi standar; 3,55 kg versi Junior).',
        s1l: 'ERGONOMI', s1v: 'Cheekpiece & Buttplate',
        s2l: 'BOBOT UNIT', s2v: '±4,9 kg (3,55 kg Junior)',
        s3l: 'SIMULASI', s3v: '<a href="https://twinshooter.vercel.app/lab">Cek Postur di Lab ↗</a>'
      }
    ];

    function selectP70Part(idx) {
      const part = P70_PARTS[idx];
      if (!part) return;
      p70Tabs.forEach((tb, i) => {
        tb.classList.toggle('is-active', i === idx);
        tb.setAttribute('aria-selected', String(i === idx));
      });
      if (p70Frame) {
        p70Frame.style.left = part.box.l + '%';
        p70Frame.style.top = part.box.t + '%';
        p70Frame.style.width = part.box.w + '%';
        p70Frame.style.height = part.box.h + '%';
        p70Frame.classList.toggle('tag-bottom', Boolean(part.box.bottom));
      }
      if (p70FrameTag) p70FrameTag.textContent = part.tag;
      const setTxt = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
      setTxt('p70PartCode', part.code);
      setTxt('p70PartTitle', part.title);
      setTxt('p70PartDesc', part.desc);
      setTxt('p70Spec1L', part.s1l); setTxt('p70Spec1V', part.s1v);
      setTxt('p70Spec2L', part.s2l); setTxt('p70Spec2V', part.s2v);
      setTxt('p70Spec3L', part.s3l);
      const s3v = document.getElementById('p70Spec3V');
      if (s3v) s3v.innerHTML = part.s3v;
    }

    if (p70Tabs.length) {
      p70Tabs.forEach(tb => tb.addEventListener('click', () => selectP70Part(Number(tb.dataset.part))));
      p70Zones.forEach(zn => zn.addEventListener('click', () => selectP70Part(Number(zn.dataset.part))));
      selectP70Part(0);
    }

    window.addEventListener('scroll', requestScroll, { passive: true });
    onScrollFrame();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bootMotion, { once: true });
  else bootMotion();
})();
