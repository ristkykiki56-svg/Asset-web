import * as pdfjsLib from '/assets/pdfjs/pdf.min.mjs';

pdfjsLib.GlobalWorkerOptions.workerSrc = '/assets/pdfjs/pdf.worker.min.mjs';

const DOCUMENTS = Object.freeze({
  rules: {
    title: 'IMSSU Sporting Rules 2025',
    subtitle: '110 halaman · Bahasa Inggris dan terjemahan Indonesia',
    pages: 110,
    url: '/assets/documents/imssu-sporting-rules-2025-bilingual.pdf',
    filename: 'IMSSU-Sporting-Rules-2025.pdf',
    context: '<strong>Peraturan 2025.</strong> Dokumen ini memuat peraturan dan bagian terjemahannya. Untuk ketentuan resmi, periksa redaksi asli dan perkembangan keputusan IMSSU berikutnya.'
  },
  minutes: {
    title: 'IMSSU General Assembly 2026',
    subtitle: '45 halaman · Risalah rapat 13 Juli 2026',
    pages: 45,
    url: '/assets/documents/imssu-oga-minutes-2026.pdf',
    filename: 'IMSSU-General-Assembly-2026.pdf',
    context: '<strong>Risalah rapat 2026.</strong> Dokumen mencatat keputusan, pembahasan, dan usulan. Usulan yang tercantum tidak otomatis menjadi aturan yang berlaku.'
  }
});

const el = id => document.getElementById(id);
const ui = {
  choiceRules: el('docChoiceRules'),
  choiceMinutes: el('docChoiceMinutes'),
  title: el('viewer-title'),
  description: el('viewer-description'),
  context: el('document-context'),
  total: el('pageTotal'),
  page: el('pageNumber'),
  prev: el('pagePrev'),
  next: el('pageNext'),
  zoomOut: el('zoomOut'),
  zoomIn: el('zoomIn'),
  zoomReset: el('zoomReset'),
  zoomLabel: el('zoomLabel'),
  full: el('fullscreen'),
  viewport: el('pdfViewport'),
  shell: el('pdfViewerShell'),
  container: el('pdfPageContainer'),
  canvas: el('pdfCanvas'),
  pageText: el('pdfPageText'),
  loading: el('pdfLoading'),
  error: el('pdfError'),
  open: el('openPdf'),
  download: el('downloadPdf'),
  searchForm: el('pdfSearchForm'),
  searchInput: el('pdfSearchInput'),
  searchButton: el('pdfSearchButton'),
  searchStatus: el('searchStatus'),
  searchPrev: el('searchPrevious'),
  searchNext: el('searchNext')
};

const documents = new Map();
const extractedText = new Map();
let activeKey = 'rules';
let pdf = null;
let pageNumber = 1;
let zoom = 1;
let renderTask = null;
let renderingId = 0;
let loadingId = 0;
let searchId = 0;
let matchedPages = [];
let matchCursor = 0;
let lastViewportWidth = 0;

function clamp(number, lo, hi) {
  return Math.min(hi, Math.max(lo, number));
}

function requestedLocation() {
  const params = new URLSearchParams(location.search);
  const key = Object.hasOwn(DOCUMENTS, params.get('doc')) ? params.get('doc') : 'rules';
  const desiredPage = Number(params.get('page') ?? 1);
  const page = Number.isInteger(desiredPage) ? clamp(desiredPage, 1, DOCUMENTS[key].pages) : 1;
  return {key, page};
}

function updateAddress(replace = false) {
  const params = new URLSearchParams();
  if (activeKey !== 'rules') params.set('doc', activeKey);
  if (pageNumber > 1) params.set('page', String(pageNumber));
  const suffix = params.toString();
  const url = location.pathname + (suffix ? '?' + suffix : '') + location.hash;
  history[replace ? 'replaceState' : 'pushState']({doc: activeKey, page: pageNumber}, '', url);
}

function setLoading(message, hasError = false) {
  ui.loading.textContent = message;
  ui.loading.hidden = hasError || !message;
  ui.error.hidden = !hasError;
  if (hasError) ui.error.querySelector('p').textContent =
    'Coba gunakan tautan "Buka PDF asli" di bawah. File tetap tersedia tanpa pembaca ini.';
}

function setControls(enabled) {
  for (const button of [ui.prev, ui.next, ui.page, ui.zoomIn, ui.zoomOut, ui.zoomReset, ui.full, ui.searchButton]) {
    button.disabled = !enabled;
  }
  if (enabled) {
    ui.prev.disabled = pageNumber <= 1;
    ui.next.disabled = pageNumber >= pdf.numPages;
    ui.zoomOut.disabled = zoom <= .75;
    ui.zoomIn.disabled = zoom >= 2.5;
  }
}

function showDocumentHeader(key) {
  const data = DOCUMENTS[key];
  ui.title.textContent = data.title;
  ui.description.textContent = data.subtitle;
  ui.context.innerHTML = data.context; // All values are static literals defined above.
  ui.total.textContent = String(data.pages);
  ui.page.max = String(data.pages);
  ui.page.value = String(pageNumber);
  ui.open.href = data.url;
  ui.download.href = data.url;
  ui.download.download = data.filename;
  for (const [doc, node] of [['rules', ui.choiceRules], ['minutes', ui.choiceMinutes]]) {
    const selected = doc === key;
    node.classList.toggle('is-selected', selected);
    if (selected) node.setAttribute('aria-current', 'true');
    else node.removeAttribute('aria-current');
  }
}

function updateZoomLabel() {
  ui.zoomLabel.textContent = zoom === 1 ? 'Lebar' : Math.round(zoom * 100) + '%';
}

async function renderPage() {
  if (!pdf) return;
  const currentRendering = ++renderingId;
  const oldTask = renderTask;
  if (oldTask) {
    oldTask.cancel();
    try { await oldTask.promise; } catch (_) { /* Expected cancellation. */ }
  }
  if (currentRendering !== renderingId) return;
  renderTask = null;
  const localPdf = pdf;
  const target = pageNumber;
  try {
    const page = await localPdf.getPage(target);
    if (currentRendering !== renderingId || localPdf !== pdf) return;
    const natural = page.getViewport({scale: 1});
    const available = Math.max(200, ui.viewport.clientWidth - 30);
    const fitScale = available / natural.width;
    const display = page.getViewport({scale: fitScale * zoom});
    const deviceScale = Math.min(2, window.devicePixelRatio || 1);
    const canvas = ui.canvas;
    const ctx = canvas.getContext('2d', {alpha: false});
    if (!ctx) throw new Error('Canvas tidak tersedia');
    canvas.width = Math.max(1, Math.round(display.width * deviceScale));
    canvas.height = Math.max(1, Math.round(display.height * deviceScale));
    canvas.style.width = Math.round(display.width) + 'px';
    canvas.style.height = Math.round(display.height) + 'px';
    ui.container.style.width = Math.round(display.width) + 'px';
    ui.container.style.height = Math.round(display.height) + 'px';
    const task = page.render({
      canvasContext: ctx,
      viewport: display,
      transform: [deviceScale, 0, 0, deviceScale, 0, 0]
    });
    renderTask = task;
    await task.promise;
    if (currentRendering !== renderingId || localPdf !== pdf) return;
    renderTask = null;
    ui.canvas.setAttribute('aria-label', dataForCanvas(pageNumber));
    // Provide page text for assistive reading without changing the PDF canvas.
    try {
      const textPage = await page.getTextContent();
      if (currentRendering !== renderingId || localPdf !== pdf) return;
      ui.pageText.textContent = textPage.items.map(item => item.str ?? '').join(' ').trim()
        || 'Halaman ini tidak memiliki lapisan teks yang dapat dibaca. Buka PDF asli untuk melihat konten visual.';
    } catch (_) {
      ui.pageText.textContent = 'Teks halaman belum dapat diekstrak dari PDF.';
    }
    ui.viewport.scrollTop = 0;
    ui.viewport.scrollLeft = 0;
    setLoading('');
    document.documentElement.dataset.pdfRendered = activeKey + ':' + pageNumber;
  } catch (error) {
    if (currentRendering !== renderingId || error?.name === 'RenderingCancelledException') return;
    console.error('Gagal menggambar halaman PDF', error);
    setLoading('Halaman gagal digambar. Coba buka PDF asli.', true);
  }
  setControls(true);
}

function dataForCanvas(page) {
  return 'Halaman ' + page + ' dari ' + (pdf?.numPages ?? DOCUMENTS[activeKey].pages)
    + ' — ' + DOCUMENTS[activeKey].title;
}

async function loadDocument(key, requestedPage = 1, {record = true} = {}) {
  if (!Object.hasOwn(DOCUMENTS, key)) return;
  const currentLoad = ++loadingId;
  searchId++;
  renderingId++;
  if (renderTask) renderTask.cancel();
  renderTask = null;
  activeKey = key;
  pageNumber = clamp(requestedPage, 1, DOCUMENTS[key].pages);
  zoom = 1;
  pdf = null;
  matchedPages = [];
  matchCursor = 0;
  ui.searchInput.value = '';
  ui.searchPrev.disabled = true;
  ui.searchNext.disabled = true;
  ui.searchStatus.textContent = 'Cari kata atau frasa. Hasil menunjukkan halaman yang memuat teks.';
  ui.canvas.width = 0;
  ui.canvas.height = 0;
  ui.pageText.textContent = '';
  ui.container.style.width = '';
  ui.container.style.height = '';
  updateZoomLabel();
  showDocumentHeader(key);
  setControls(false);
  setLoading('Memuat ' + DOCUMENTS[key].title + '…');
  if (record) updateAddress(false);
  try {
    if (!documents.has(key)) {
      const doc = await pdfjsLib.getDocument({url: DOCUMENTS[key].url}).promise;
      documents.set(key, doc);
    }
    if (currentLoad !== loadingId) return;
    pdf = documents.get(key);
    pageNumber = clamp(pageNumber, 1, pdf.numPages);
    ui.total.textContent = String(pdf.numPages);
    ui.page.max = String(pdf.numPages);
    ui.page.value = String(pageNumber);
    setControls(true);
    await renderPage();
  } catch (err) {
    if (currentLoad !== loadingId) return;
    console.error('PDF gagal dimuat:', err);
    setControls(false);
    setLoading('', true);
  }
}

async function goToPage(number, {replace = false} = {}) {
  if (!pdf || !Number.isFinite(number)) return;
  const next = clamp(Math.trunc(number), 1, pdf.numPages);
  if (next === pageNumber) return;
  pageNumber = next;
  ui.page.value = String(next);
  setLoading('Menampilkan halaman ' + next + '…');
  setControls(true);
  updateAddress(replace);
  await renderPage();
}

async function setZoom(next) {
  if (!pdf) return;
  zoom = clamp(next, .75, 2.5);
  updateZoomLabel();
  setControls(true);
  setLoading('Memperbarui tampilan…');
  await renderPage();
}

function normalizeSearch(text) {
  return text.toLocaleLowerCase('id-ID').replace(/\s+/g, ' ').trim();
}

async function textForPage(doc, key, index) {
  const cacheKey = key + ':' + index;
  if (extractedText.has(cacheKey)) return extractedText.get(cacheKey);
  const p = await doc.getPage(index);
  const content = await p.getTextContent();
  const text = normalizeSearch(content.items.map(item => item.str ?? '').join(' '));
  extractedText.set(cacheKey, text);
  return text;
}

async function searchDocument(event) {
  event?.preventDefault();
  if (!pdf) return;
  const query = normalizeSearch(ui.searchInput.value);
  searchId++;
  const localSearch = searchId;
  const key = activeKey;
  const doc = pdf;
  matchedPages = [];
  matchCursor = 0;
  ui.searchPrev.disabled = true;
  ui.searchNext.disabled = true;
  if (!query) {
    ui.searchStatus.textContent = 'Masukkan kata atau frasa yang ingin dicari.';
    return;
  }
  ui.searchButton.disabled = true;
  ui.searchStatus.textContent = 'Mencari di ' + doc.numPages + ' halaman…';
  try {
    for (let index = 1; index <= doc.numPages; index++) {
      if (localSearch !== searchId || doc !== pdf) return;
      if ((await textForPage(doc, key, index)).includes(query)) matchedPages.push(index);
      if (index % 8 === 0) {
        ui.searchStatus.textContent = 'Memeriksa halaman ' + index + ' dari ' + doc.numPages + '…';
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }
    if (localSearch !== searchId || doc !== pdf) return;
    if (!matchedPages.length) {
      ui.searchStatus.textContent = 'Tidak ada halaman dengan teks tersebut. Halaman gambar mungkin tidak bisa dicari.';
    } else {
      ui.searchStatus.textContent = matchedPages.length + ' halaman ditemukan. Hasil 1 dari ' + matchedPages.length + '.';
      ui.searchPrev.disabled = matchedPages.length < 2;
      ui.searchNext.disabled = matchedPages.length < 2;
      await goToPage(matchedPages[0]);
    }
  } catch (err) {
    if (localSearch !== searchId) return;
    console.error('Pencarian PDF gagal:', err);
    ui.searchStatus.textContent = 'Pencarian belum berhasil. Coba kembali atau buka PDF asli.';
  } finally {
    if (localSearch === searchId) ui.searchButton.disabled = !pdf;
  }
}

function advanceResult(direction) {
  if (!matchedPages.length || !pdf) return;
  matchCursor = (matchCursor + direction + matchedPages.length) % matchedPages.length;
  ui.searchStatus.textContent = matchedPages.length + ' halaman ditemukan. Hasil ' + (matchCursor + 1)
    + ' dari ' + matchedPages.length + '.';
  goToPage(matchedPages[matchCursor]);
}

for (const node of [ui.choiceRules, ui.choiceMinutes]) {
  node.addEventListener('click', event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const key = node.dataset.document;
    if (key === activeKey) return;
    loadDocument(key);
  });
}
ui.prev.addEventListener('click', () => goToPage(pageNumber - 1));
ui.next.addEventListener('click', () => goToPage(pageNumber + 1));
ui.page.addEventListener('change', () => {
  const proposed = Number(ui.page.value);
  if (Number.isFinite(proposed)) goToPage(proposed);
  ui.page.value = String(pageNumber);
});
ui.zoomOut.addEventListener('click', () => setZoom(zoom - .25));
ui.zoomIn.addEventListener('click', () => setZoom(zoom + .25));
ui.zoomReset.addEventListener('click', () => setZoom(1));
ui.searchForm.addEventListener('submit', searchDocument);
ui.searchInput.addEventListener('input', () => {
  searchId++;
  matchedPages = [];
  ui.searchPrev.disabled = true;
  ui.searchNext.disabled = true;
  ui.searchButton.disabled = !pdf;
});
ui.searchPrev.addEventListener('click', () => advanceResult(-1));
ui.searchNext.addEventListener('click', () => advanceResult(1));
ui.full.addEventListener('click', async () => {
  if (!document.fullscreenElement && ui.shell.requestFullscreen) {
    try { await ui.shell.requestFullscreen(); } catch (_) {
      ui.searchStatus.textContent = 'Layar penuh tidak didukung di browser ini. Gunakan Buka PDF asli.';
    }
  } else if (document.fullscreenElement && document.exitFullscreen) {
    await document.exitFullscreen();
  }
});
ui.viewport.addEventListener('keydown', event => {
  if (event.altKey || event.ctrlKey || event.metaKey) return;
  if (event.key === 'ArrowRight') { event.preventDefault(); goToPage(pageNumber + 1); }
  if (event.key === 'ArrowLeft') { event.preventDefault(); goToPage(pageNumber - 1); }
});
window.addEventListener('popstate', () => {
  const {key, page} = requestedLocation();
  if (key !== activeKey) loadDocument(key, page, {record: false});
  else goToPage(page, {replace: true});
});
let pendingResize;
const resizeWatcher = new ResizeObserver(() => {
  if (!pdf) return;
  const available = Math.round(ui.viewport.clientWidth);
  if (available === lastViewportWidth) return;
  lastViewportWidth = available;
  clearTimeout(pendingResize);
  pendingResize = setTimeout(() => renderPage(), 120);
});
resizeWatcher.observe(ui.viewport);
const initial = requestedLocation();
loadDocument(initial.key, initial.page, {record: false});
