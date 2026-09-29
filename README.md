# IMSSU Air Rifle .177 Rules Site

Standalone static site untuk halaman peraturan pertandingan IMSSU Air Rifle .177.

## Pemisahan

Repo ini berdiri sendiri dan tidak menggunakan kode maupun runtime Kingdom WarHub bot/dashboard.

## Arsitektur

- GitHub repo: source halaman statis.
- Google Drive: penyimpanan PDF ringkasan.
- Vercel: hosting halaman publik.
- QR banner: diarahkan ke URL Vercel.
- Rulebook IMSSU lengkap dibuka sebagai sumber eksternal terpisah.

## Preview PDF

Preview menggunakan Google Drive viewer dan dibungkus area scroll dengan kontrol zoom 75%–175%, tombol reset, serta tautan layar penuh. Pada perangkat mobile, viewer juga dapat memakai pinch-to-zoom jika didukung browser.

## Google Drive PDF

File ID: `1KOkHDMheZ7-PYl_6c6C7Iz4fCdDQvkWl`

Akses publik: **Anyone with the link — Viewer**.

## Rulebook sumber

Rulebook IMSSU lengkap:
`https://www.metallsilhuett.no/wp-content/uploads/2025/05/IMSSU-Rules-English-2025.pdf`

## Deploy

Import repo ini sebagai project Vercel terpisah. Tidak membutuhkan database, Supabase, environment variable, atau runtime bot.
