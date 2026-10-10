# Twin Shooter

Static website untuk profil Clarisa Azalia dan Aurellia Cassandra (arsip 2021–2023).

- `/` — profil, riwayat, kemampuan, dan hasil pertandingan.
- `/rules` — referensi PDF IMSSU Air Rifle .177 melalui Google Drive.

## Implementasi

HTML statis, CSS, dan JavaScript ringan tanpa build step. Kartu hasil pertandingan dirender dalam HTML, lalu filter bekerja pada kartu yang sudah ada. Halaman tetap terbaca tanpa JavaScript. Aset foto disimpan terpisah sebagai WebP yang dapat di-cache. SEO memakai canonical, Open Graph, Twitter Card, JSON-LD, sitemap, robots.txt, serta gambar berbagi sosial.

## Data dan privasi

Data atlet mengikuti dua profil PDF periode 2021–2023. Usia lama, identitas administratif, dan hasil pertandingan yang tidak didokumentasikan tidak ditampilkan sebagai fakta baru. Konflik tanggal dalam PDF tidak ditebak. Halaman Rules tetap terpisah.

## Motion

Motion dibatasi pada entrance hero/foto, progresi garis timeline, dan feedback tombol filter. Informasi dan kartu prestasi tetap statis dan terbaca tanpa JavaScript. Tidak menggunakan video autoplay atau aset dekoratif tambahan. Detail dan cara pengujian: [`docs/motion-direction.md`](docs/motion-direction.md).
