# IMSSU Air Rifle .177 Rules Site

Standalone static site untuk halaman peraturan pertandingan IMSSU Air Rifle .177.

## Pemisahan

Repo ini berdiri sendiri dan tidak menggunakan kode maupun runtime Kingdom WarHub bot/dashboard.

## Arsitektur

- GitHub repo: source halaman statis.
- Google Drive: penyimpanan PDF.
- Vercel: hosting halaman publik.
- QR banner: diarahkan ke URL Vercel.

## Preview PDF

Preview menggunakan Google Drive viewer dan dibungkus area scroll dengan kontrol zoom 75%–175%, tombol reset, serta tautan layar penuh. Pada perangkat mobile, viewer juga dapat memakai pinch-to-zoom jika didukung browser.

## Google Drive PDF

File ID: `1KOkHDMheZ7-PYl_6c6C7Iz4fCdDQvkWl`

Akses publik: **Anyone with the link — Viewer**.

Website hanya menyediakan dua aksi dokumen utama: **Baca PDF penuh** dan **Download PDF**, keduanya melalui Google Drive.

## Deploy

Project Vercel berdiri terpisah dan tidak membutuhkan database, Supabase, environment variable, atau runtime bot.
