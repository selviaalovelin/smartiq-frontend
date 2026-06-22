# SMARTQ Quiz App

SMARTQ adalah rancangan aplikasi kuis interaktif berbasis web. Aplikasi ini menyediakan tampilan untuk peserta yang ingin masuk ke kuis menggunakan PIN dan tampilan pengajar untuk membuat serta mengelola soal kuis.

## Fitur Utama

- Halaman masuk PIN kuis
- Halaman login dan daftar pengajar
- Dashboard pengajar
- Daftar kuis / pustaka
- Laporan pengelolaan kuis
- Modal buat kuis
- Halaman pembuatan soal
- Halaman pengerjaan soal
- Halaman hasil kuis

## Teknologi

- React JS
- Vite
- CSS

## Koneksi API

Frontend menggunakan API backend untuk akun pengajar, data kuis, soal, peserta, tugas, dan hasil kuis. Saat dijalankan dengan Vite, permintaan `/api` akan diteruskan ke backend pada `http://localhost:8000`.

## Menjalankan Frontend

Pastikan backend SMARTQ sudah berjalan di port `8000`, lalu jalankan:

```bash
npm install
npm run dev
```

Buka alamat yang ditampilkan Vite, biasanya `http://localhost:5173`.
