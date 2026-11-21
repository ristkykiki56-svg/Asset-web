// Shared mobile drawer toggle for the Porprov and Rules pages. Same
// behaviour as the menu block in homepage-motion.js (the homepage keeps
// its own copy); kept separate so these pages do not load the homepage's
// scorebook, reveal and P 70 logic.
(function () {
  var menuBtn = document.getElementById('menuToggle');
  var mobileDrawer = document.getElementById('mobileDrawer');
  if (!menuBtn || !mobileDrawer) return;

  function setMenuOpen(open) {
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Tutup menu navigasi' : 'Buka menu navigasi');
    mobileDrawer.hidden = !open;
  }

  menuBtn.addEventListener('click', function () {
    var isOpen = menuBtn.getAttribute('aria-expanded') === 'true';
    setMenuOpen(!isOpen);
  });
  mobileDrawer.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () { setMenuOpen(false); });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menuBtn.getAttribute('aria-expanded') === 'true') setMenuOpen(false);
  });
  document.addEventListener('click', function (e) {
    if (menuBtn.getAttribute('aria-expanded') === 'true' && !e.target.closest('.site-header')) {
      setMenuOpen(false);
    }
  });
})();
