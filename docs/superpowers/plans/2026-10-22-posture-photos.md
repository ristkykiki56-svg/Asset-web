# Foto poster sebagai visual utama Postur

Permintaan disetujui melalui tindak lanjut rekomendasi foto poster dengan titik dan pembesaran. Perubahan dibatasi pada materi Postur.

1. Tambahkan tes bahwa adaptor memuat foto asli poster, tidak mencerminkan foto, menghasilkan anchor yang berada dalam area foto, serta pembesaran berpusat pada titik. Jalankan sebelum implementasi.
2. Simpan poster asli tanpa perubahan sebagai satu aset sumber. Tampilkan area foto melalui viewport/clip SVG sehingga piksel foto dan identitas atlet tetap asli; tidak membuat ulang foto. Perlu dicatat ukuran unduhan sumber sekitar10,7MB. Foto yang sama dipakai bersama oleh seluruh pilihan.
3. Ganti pilihan karakter menjadi Clarisa/Aurellia dan pilihan gambar menjadi belakang, depan/serong, detail kepala, detail tangan. Koordinat setiap foto/atlet terpisah. Hubungkan sepuluh titik dan keterangan gambar ke foto yang sesuai. Tidak ada tampilan cermin.
4. Tambahkan dialog detail foto pada titik terpilih, dengan tombol tutup native dan label aksesibel. Atur penanda mobile agar tidak bertumpuk.
5. Jalankan tes fungsi, render SVG sebagai artefak untuk pemeriksaan visual foto/anchor, syntax check dan pemeriksaan diff. Minta review independen, perbaiki temuan, catat batas browser yang masih dinonaktifkan. Perbarui draft PR26 dan pertahankan server lokal.
