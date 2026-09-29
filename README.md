# IMSSU Air Rifle .177 Rules Site

Standalone static site untuk halaman peraturan pertandingan IMSSU Air Rifle .177.

## Pemisahan

Repo ini berdiri sendiri dan tidak menggunakan kode maupun runtime Kingdom WarHub bot/dashboard.

## Arsitektur

- GitHub repo: source halaman statis.
- Google Drive: penyimpanan PDF.
- Vercel: hosting halaman publik.
- QR banner: diarahkan ke URL Vercel, bukan langsung ke PDF.

## Google Drive PDF

File ID: `1KOkHDMheZ7-PYl_6c6C7Iz4fCdDQvkWl`

Sebelum website dipakai publik, ubah akses PDF di Google Drive menjadi **Anyone with the link — Viewer**.

## Update PDF

Untuk menjaga QR tetap sama, idealnya pertahankan URL halaman Vercel. Jika file PDF di Drive diganti dan File ID berubah, update tiga URL Google Drive di `index.html`.

## Deploy

Import repo ini sebagai project Vercel terpisah. Tidak membutuhkan database, Supabase, environment variable, atau runtime bot.
