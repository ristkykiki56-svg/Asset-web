# Shooting Lab: karakter postur ilustratif

Enam sprite WebP di folder ini merupakan **karakter animasi generik** untuk materi Postur Tubuh Shooting Lab. Varian biru dan merah dipakai sebagai pembeda visual saja. **Bukan foto, rekonstruksi wajah, identitas biometrik, data anatomi terukur, atau dokumentasi posisi atlet.**

## Keputusan visual

Pada 20 Oktober 2026 pemilik proyek menyetujui penggunaan karakter stylized/non-likeness sebagaimana terlihat pada matriks preview PR #12. Karakter sengaja **tidak dibuat menyerupai wajah dan pakaian asli atlet** untuk mengurangi risiko penyalahgunaan likeness. Pose **statis**: tidak ada ekspresi wajah, gerakan bernapas, animasi idle, atau animasi hidup. Interaksi hanya pergantian sudut pandang dan sorotan penanda edukatif.

## Berkas produksi

- `blue-front.webp`, `blue-side.webp`, `blue-back.webp`
- `red-front.webp`, `red-side.webp`, `red-back.webp`

Semua enam berkas sudah disimpan di repositori. Jangan menyisipkan sheet anotasi, gambar dari foto wajah asli, atau file berlabel teks bawaan.

## Perilaku aplikasi

- `posture-art.js` memilih sprite dengan warna biru/merah dan sudut depan/samping/belakang.
- Tampak samping kanan adalah **cerminan ilustrasi kiri**, bukan pose kanan yang didokumentasikan.
- Sepuluh hotspot mengikuti posisi gambar sebagai **perkiraan visual**, bukan pengukuran tubuh.
- Bila berkas tidak dapat dimuat, aplikasi beralih ke diagram SVG lama tanpa merusak pembelajaran.
- Slider siku dan lengkungan merupakan contoh visual di mode SVG lama, bukan mekanisme yang menggerakkan karakter statis.

## Validasi

```bash
REQUIRE_POSTURE_ASSETS=1 node --test tests/lab-smoke.test.mjs
bash tests/browser-smoke.sh
```

Pengujian PR #12 melalui GitHub Actions run **39450877831** berhasil, termasuk pergantian enam gambar, anotasi dan fallback SVG di desktop/mobile. QA tambahan mengecek penanda pada area piksel gambar yang tidak transparan, serta menghasilkan screenshot 12 kombinasi warna/sudut/viewport.

### Batasan yang tetap berlaku

Karakter dirender dari ilustrasi, bukan dari foto atlet. Detail minor dari sumber generatif dapat terlihat ketika gambar diperbesar; kualitas aset dapat diperbaiki terpisah tanpa perlu mengganti wajah dengan wajah asli. Jangan menafsirkan gambar, posisi hotspot, atau pencerminan sudut samping sebagai aturan IMSSU maupun rekomendasi teknik personal yang terukur.
