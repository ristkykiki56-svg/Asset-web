# Shooting Lab: gambar postur statis (review)

Folder ini menampung enam gambar WebP transparan untuk modul **Postur Tubuh**. Karakter dibuat dalam gaya animasi yang terinspirasi warna kostum pada poster Clarisa dan Aurellia. Ilustrasi **bukan** potret wajah kedua atlet, bukan data pengukuran, dan tidak dijadikan pedoman posisi menembak.

## Berkas wajib

- `blue-front.webp`
- `blue-side.webp`
- `blue-back.webp`
- `red-front.webp`
- `red-side.webp`
- `red-back.webp`

Sumber siap di paket `twinshooter-posture-assets-integration-review-v3.zip`, folder `assets/posture/`. **Jangan** commit berkas kontak QA, sprite sheet berlabel, atau gambar yang masih berisi teks anotasi ke dalam folder ini. Jangan menambahkan sebagian saja.

### Cara memasukkan aset

Ekstrak ZIP, salin enam WebP dari `assets/posture/` ke lokasi folder ini, commit pada branch `feature/posture-static-variants-review`, lalu jalankan CI. Metode unggah lewat antarmuka GitHub atau `git add assets/posture/*.webp` dapat dipakai. README tidak menggantikan keenam gambar.

Verifikasi semua file:
```bash
REQUIRE_POSTURE_ASSETS=1 node --test tests/lab-smoke.test.mjs
```

Jika satu berkas gagal dimuat, adaptor `posture-art.js` mempertahankan SVG lama agar modul Postur tetap berfungsi. Empat sudut pandang UI lama tetap tersedia; tampak samping kanan merupakan cerminan gambar samping untuk **ilustrasi saja**, bukan foto pose atlet dari kanan.

## QA wajib sebelum merge

1. Pastikan enam varian termuat dengan benar tanpa fragmen terpisah, garis sisa, atau crop senapan/sepatu.
2. Uji semua tombol Biru/Merah dan sudut depan/samping kiri/samping kanan/belakang di desktop dan mobile 320, 390, 768, 1440 px.
3. Uji semua sepuluh penanda anatomi: sorotan harus berada pada bagian yang dijelaskan (perkiraan visual), serta selektor dan teks sesuai.
4. Periksa mode Garis postur, keyboard focus, status `aria-pressed`, dan kembali ke skema SVG.
5. Matikan jaringan atau hilangkan satu gambar secara sementara: fallback SVG harus bekerja tanpa error uncaught.
6. Pastikan modul Pelatuk, Optik, Siluet, Peralatan, homepage, dan rules tidak berubah atau regresi.
7. Periksa bahwa kata-kata di UI tidak menyiratkan wajah atau data atlet yang terukur.

CI tanpa WebP hanya menguji **fallback**. CI PASS tidak berarti pemeriksaan keenam gambar selesai. Jangan merge sampai QA gambar nyata dinyatakan lulus.
