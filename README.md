# Twin Shooter

Situs profil Clarisa Azalia dan Aurellia Cassandra, atlet menembak
PERBAKIN Kota Depok. Arsip profil dan pertandingan 2021–2023.

- Situs live: <https://twinshooter.vercel.app/>
- Repo ini: `ristkykiki56-svg/Asset-web` (nama repo tidak sama dengan nama
  situs; situsnya Twin Shooter, repo-nya Asset-web).

## Halaman

| Rute | File | Isi |
| --- | --- | --- |
| `/` | `index.html` | Profil atlet, sorotan hasil 2023, kemampuan, riwayat 2020–2023, 25 kartu prestasi dengan filter atlet/tahun, kartu peraturan. |
| `/rules` | `rules.html` + `rules-reader.js` | Pembaca PDF: IMSSU Sporting Rules 2025 (110 halaman, Inggris + Indonesia) dan risalah IMSSU General Assembly 2026 (45 halaman, 13 Juli 2026). PDF tersimpan lokal, bukan Google Drive. |
| `/lab` | `lab.html` + `lab.js` | Laboratorium interaktif: 01 Postur tubuh, 02 Pelatuk, 03 Optik, 04 Sasaran siluet, 05 Peralatan. |

Konten berhenti di 2023. Belum ada bagian Porprov 2026 dan belum ada
bagian latihan/pendaftaran.

## Cara kerja

HTML statis, CSS, dan JavaScript ringan, tanpa build step. Tidak ada
`package.json`, tidak ada framework. Pengecualian:

- Pembaca PDF memakai PDF.js 4.10.38 yang di-host sendiri di
  `assets/pdfjs/` (`pdf.min.mjs` + `pdf.worker.min.mjs`).
- Halaman `/lab` memakai Google Fonts (Cormorant Garamond, IBM Plex Mono,
  Plus Jakarta Sans). Halaman lain memakai font sistem.
- `vercel.json`: `cleanUrls: true`, jadi `lab.html` dilayani sebagai
  `/lab` dan `rules.html` sebagai `/rules`. Header keamanan
  `X-Content-Type-Options: nosniff` dan `Referrer-Policy:
  strict-origin-when-cross-origin`.

SEO sudah ada di `/` dan `/rules`: deskripsi, canonical, Open Graph,
Twitter Card, dan JSON-LD (WebSite, AboutPage, 2 Person). `/lab` punya
canonical dan deskripsi sendiri. `robots.txt` mengizinkan semua dan
menunjuk ke sitemap. `sitemap.xml` berisi 2 URL (`/` dan `/rules`);
`/lab` hidup tapi belum tercantum di sitemap.

Motion dibatasi: entrance hero/foto sekali saat dimuat, garis timeline
bergerak sekali saat terlihat, transisi tombol filter 160 ms. Semua
konten tetap terbaca tanpa JavaScript dan saat `prefers-reduced-motion`
aktif. Ada skip link, label aksesibel, dan target sentuh minimum 44 px.

## Struktur repo

```text
.
├── index.html            # halaman utama (290 baris)
├── rules.html            # halaman peraturan (134 baris)
├── rules-reader.js       # logika pembaca PDF + metadata 2 dokumen
├── rules-reader.css
├── lab.html              # laboratorium interaktif (904 baris)
├── lab.js                # logika lab (962 baris)
├── lab.css               # gaya lab desktop
├── lab-workspace.js      # adaptor mobile lab (< 768 px)
├── lab-workspace.css
├── lab-utilities.css     # utilitas lab (precompiled)
├── optics-poster-artwork.js
├── posture-art.js
├── site.css              # token dasar (warna, font, fokus, skip link)
├── profile.css           # gaya halaman profil
├── styles.css            # TIDAK dirujuk halaman mana pun (sisa lama)
├── favicon.svg
├── robots.txt
├── sitemap.xml           # 2 URL: / dan /rules
├── vercel.json
├── assets/
│   ├── clarisa.webp, aurellia.webp      # foto atlet halaman utama
│   ├── twin-shooter-og.png             # gambar berbagi sosial 1200x630
│   ├── documents/                       # PDF asli + README (cek SHA-256)
│   │   ├── imssu-sporting-rules-2025-bilingual.pdf
│   │   └── imssu-oga-minutes-2026.pdf
│   ├── pdfjs/                           # runtime PDF.js 4.10.38
│   ├── posture/                         # sprite karakter + poster-v15.png
│   ├── silhouettes/                     # ayam, babi, kalkun, domba
│   ├── optics/                          # lapisan gambar optik
│   └── hardware/                        # poster senapan merah
├── docs/
│   ├── lab-integration.md               # routing, batasan, dan verifikasi lab
│   ├── motion-direction.md              # keputusan motion
│   ├── precision-editorial.md           # arah editorial halaman utama
│   └── superpowers/plans|specs/         # rencana dan spesifikasi mobile lab
├── scripts/                             # 3 script Python sekali pakai
│                                        # (siapkan aset poster/optik)
├── tests/                               # 13 file *.test.mjs + fixture HTML
│                                        # + browser-smoke.sh
├── anti-slop/                           # followup-001 s.d. 010, 22–23 Okt 2026
│                                        # (catatan perbaikan audit)
└── .github/workflows/static-smoke.yml   # CI: tes Node + smoke browser
```

## Halaman `/lab`, lebih detail

Lima pelajaran, dipilih lewat menu "Pilih materi":

1. **Postur tubuh** — 10 penanda pada foto poster asli
   (`assets/posture/poster-v15.png`, sekitar 10,7 MB). Penanda bisa
   dibuka sebagai dialog detail foto dengan pembesaran berpusat pada titik.
2. **Pelatuk** — 3 tahap: A Tarikan awal (Take-up), B Sebelum pelepasan
   (Creep), C Setelah pelepasan (Over-travel), plus kurva pergerakan.
3. **Optik** — jarak mata ke okuler, tinggi sandaran pipi, dan posisi
   lateral; tampilan lensa hanya saat terlihat di layar.
4. **Sasaran siluet** — rak 4 hewan (ayam 18 m, babi 27 m, kalkun 33 m,
   domba 41 m), target bisa dijatuhkan, ada penghitung per kelompok.
5. **Peralatan** — 10 komponen senapan dan teleskop yang bisa dipilih:
   Popor dan Bantalan Bahu, Sandaran Pipi, Pegangan dan Pelatuk,
   Penopang Depan, Tabung Udara, Laras, Lensa Objektif, Turret Elevasi
   dan Windage, Cincin Pembesaran, dan Lensa Okuler.

Di bawah 768 px, `lab-workspace.js` memindahkan DOM asli ke workspace
mobile (satu pelajaran aktif, visual dan kontrol terlihat bersama),
lalu mengembalikannya di desktop. ID dan handler asli dipertahankan,
tidak ada duplikasi ID.

Tema Lab hanya satu: Kertas Cetak. Pengaturan, tema gelap, dan audio
sudah dihapus (followup-010, 23 Okt 2026).

## Data dan batasan — baca sebelum mengubah

- **Data atlet mengikuti dua profil PDF periode 2021–2023.** Usia lama,
  identitas administratif, dan hasil yang tidak didokumentasikan tidak
  ditampilkan sebagai fakta baru. Konflik tanggal dalam PDF tidak ditebak.
  Jangan tambah fakta atlet tanpa dokumen pendukung.
- **Lab bersifat ilustratif.** Bukan edisi aturan IMSSU, bukan alat ukur
  latihan, bukan model biomekanik tervalidasi, bukan kalkulator balistik.
  Angka simulasi dan diagram dinyatakan ilustratif di halaman itu sendiri.
- **Risalah 2026 bukan aturan baru.** Dokumen General Assembly 2026
  mencatat keputusan DAN usulan. Usulan yang tercantum tidak otomatis
  menjadi aturan berlaku. Jangan klaim ada edisi aturan resmi 2026
  tanpa sumber resmi yang lebih baru.
- **PDF jangan diganti sembarangan.** Ganti PDF hanya setelah verifikasi
  asal, jumlah halaman, dan checksum; perbarui metadata di
  `rules-reader.js`, `assets/documents/README.md`, dan tes terkait
  secara bersamaan. SHA-256 kedua PDF tercatat di
  `assets/documents/README.md`.
- **Identitas atlet.** Foto asli dipakai apa adanya. Karakter postur di
  Lab sengaja stylized (biru/merah, bukan wajah dan pakaian asli atlet)
  untuk mengurangi risiko penyalahgunaan likeness — keputusan pemilik
  20 Okt 2026, lihat `assets/posture/README.md`. Jangan sisipkan foto
  wajah asli ke karakter postur.
- **Foto poster asli tidak diubah.** `assets/posture/poster-v15.png`
  disimpan sebagai aset sumber; tampilan memakai viewport/clip SVG.

## Menjalankan dan menguji

```bash
# Jalankan lokal (butuh server HTTP, mis. untuk PDF.js)
python3 -m http.server 8765
# lalu buka http://127.0.0.1:8765/

# Tes Node (13 file, 67 tes — terakhir lulus semua di main)
node --test tests/*.test.mjs

# Smoke browser (butuh headless Chrome di runner)
bash tests/browser-smoke.sh
```

CI (`.github/workflows/static-smoke.yml`) berjalan di setiap push dan
pull request ke `main`: tes Node, lalu smoke browser, lalu unggah
screenshot QA sebagai artefak `twinshooter-pages-qa`.

## Mengubah konten

- **Tambah prestasi:** tambah satu `<article class="achievement">` di
  `#grid` pada `index.html` dengan `data-athlete` (`clarisa` /
  `aurellia`) dan `data-year` yang benar, lalu jalankan tes.
- **Tambah bagian baru di halaman utama:** sisipkan `<section>` baru
  di `index.html` sebelum kartu peraturan, dengan gaya yang sudah ada
  (`site.css` + `profile.css`).
- **Ganti PDF peraturan:** lihat aturan di "Data dan batasan" di atas.
- **Ubah teks Lab:** periksa juga `tests/lab-copy-gate.test.mjs`
  dan `tests/lab-explanations.test.mjs` — ada teks yang dijaga tes.

## Yang belum ada

- Bagian Porprov XV Jawa Barat 2026 (IMSSU 2 emas 1 perunggu; total
  tim Depok 3 emas 1 perunggu).
- Bagian "Apa itu IMSSU" dan bagian latihan IMSSU Depok (tempat,
  jadwal, WA pendaftaran, biaya — detailnya masih menunggu).
- `/lab` belum tercantum di `sitemap.xml`.
- `styles.css` tidak dipakai halaman mana pun; hapus hanya kalau sudah
  dipastikan tidak ada yang merujuknya.
