# Twin Shooter — Motion direction

Motion harus mendukung keterbacaan profil dan prestasi atlet, bukan tampil sebagai efek dekoratif.

## Keputusan
- **Hero:** judul dan teks utama masuk sekali saat halaman dimuat, dengan perpindahan vertikal 10 px dan durasi 380–480 ms. Foto Clarisa dan Aurellia masuk terpisah dengan perubahan opacity yang ringan, durasi 580 ms.
- **Timeline:** hanya garis warna yang bergerak sekali saat terlihat melalui IntersectionObserver (850 ms). Tahun dan seluruh deskripsi tetap terlihat sepanjang waktu. Garis abu-abu statis menjadi fallback.
- **Filter prestasi:** state tombol bertransisi 160 ms; kartu hasil langsung diperbarui tanpa fade atau delay dan status pembaca layar tetap diumumkan.
- **Statik:** header, navigasi, fakta tahun, profil, nomor pertandingan, kartu prestasi, tautan rules, PDF reader, dan footer.
- **Aksesibilitas:** animasi dibatasi pada `prefers-reduced-motion: no-preference`. Konten tetap terbaca saat JavaScript tidak aktif atau IntersectionObserver tidak tersedia.

## Aset
Menggunakan dua foto atlet WebP yang sudah ada; motion ini tidak membutuhkan aset tambahan. Tidak membuat ikon, video, audio, atau gambar generatif agar identitas dan profil atlet tetap autentik.

## Verifikasi
Jalankan `node --test tests/motion-smoke.test.mjs`, lalu uji secara manual:
1. Desktop dan mobile (lebar 320, 375, 768, 1280 px): hero dan gambar tidak menabrak navigasi atau menggeser posisi halaman.
2. Refresh: hero hanya bergerak satu kali; tidak ada gerakan terus-menerus.
3. Scroll ke riwayat: garis terisi sekali, tahun/deskripsi langsung terbaca sebelum dan sesudah animasi.
4. Ganti filter semua/atlet/tahun dengan mouse, sentuhan, dan keyboard: hasil muncul langsung, `aria-pressed` berubah, dan status diumumkan.
5. Aktifkan Reduce Motion pada perangkat: tidak ada hero entrance, timeline progress, ataupun transisi filter.
6. Nonaktifkan JavaScript: profil dan semua kartu hasil tetap terlihat.
7. Kunjungi `/rules`: preview PDF, tautan baca, unduh, dan kontrol tetap seperti semula.

Pemeriksaan manual browser diperlukan sebelum menganggap regresi visual/performa sudah lulus.
