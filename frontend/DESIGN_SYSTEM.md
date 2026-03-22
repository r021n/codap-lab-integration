# Sistem Desain, UI, dan UX - EcoDataLearn Frontend

Dokumen ini mendeskripsikan fondasi desain, antarmuka pengguna (UI), dan pengalaman pengguna (UX) yang diterapkan pada frontend proyek ini (berbasis React, Vite, dan TypeScript).

## 1. Teknologi dan Perangkat Utama
Sistem desain dibangun di atas ekosistem modern yang memastikan performa, aksesibilitas, dan kemudahan pengembangan:
- **Tailwind CSS v4:** Digunakan sebagai sistem utilitas utama untuk *styling*. CSS Variables disematkan untuk kustomisasi tema secara menyeluruh.
- **Shadcn UI & Radix UI Primitives:** Menyediakan fondasi komponen yang *accessible*, dapat disesuaikan (*customizable*), dan tidak terikat pada gaya bawaan yang kaku secara asali.
- **Lucide React:** Pustaka ikon yang konsisten, berbobot ringan, dan bersih (contoh: digunakan pada fungsionalitas sembunyikan/perlihatkan kata sandi).

## 2. Sistem Desain (Design System)

### A. Palet Warna (Color Palette)
Sistem warna menggunakan format HSL (Hue, Saturation, Lightness) dan diatur melalui variabel CSS (`index.css`), yang memungkinkan penerapan mode terang (*light mode*) dan gelap (*dark mode*) secara mulus.

- **Primary:** Biru terang yang energik (menunjukkan tindakan utama seperti tombol "Sign In").
- **Background & Foreground:** 
  - *Light Mode:* Latar belakang putih dan sekitarnya (seperti `slate-50` untuk halaman) dengan teks gelap pekat untuk rasio kontras yang optimal.
  - *Dark Mode:* Latar belakang sangat gelap (`222.2 84% 4.9%`) dengan teks putih cerah.
- **Destructive/Error:** Warna merah hati untuk indikator kesalahan (seperti pesan validasi yang gagal saat masuk atau mendaftar).
- **Muted & Accent:** Warna abu-abu netral untuk elemen sekunder seperti garis batas (border), placeholder input, dan teks *footer*.

### B. Tipografi dan Layout
- **Tipografi:** Menggunakan font *sans-serif* bawaan modern (diwarisi dari Tailwind), ukuran judul yang tegas (`text-2xl`), dan *helper text* yang ramping (`text-sm`).
- **Layout & Spacing:** Memanfaatkan sistem *spacing* 4-point dari Tailwind (`space-y-4`, `p-3`). Pemusatan elemen krusial seperti form dilakukan secara absolut ke tengah layar (`min-h-screen items-center justify-center`).

## 3. Komponen Antarmuka Pengguna (UI)

Sistem merancang komponen yang seragam dan dapat digunakan ulang (*reusable*):
- **Card (`Card`, `CardHeader`, `CardContent`, dsb.):** Digunakan sebagai wadah utama untuk mengelompokkan elemen terkait agar terlihat fokus dan terisolasi dari *background* utama.
- **Form Elements (`Input`, `Label`):** Bersih, dengan batas (*border*) tipis dan pendar interaktif (`ring`/outlines) saat pengguna memfokuskan kursor.
- **Button:**
  - **Primary:** Merupakan tombol Call-to-Action. Memiliki fitur visual penonaktifan secara otomatis saat proses *loading*.
  - Menyesuaikan lebar kontainer secara penuh untuk kenyamanan *tap/click* (terutama di layar sentuh perangkat seluler).

## 4. Pengalaman Pengguna (UX)

Pendekatan UX difokuskan pada kejelasan konteks, pencegahan galat, dan kelancaran alur navigasi:

- **Bebas Gesekan (*Frictionless Context*):**
  - **Fitur Tampil/Sembunyi Password:** Pengguna tidak dibiarkan menebak apakah sandi yang mereka tik sudah benar. Terdapat fitur mata (`Eye` / `EyeOff` ikon) untuk secara langsung memverifikasi ketikan tanpa harus mengulangi dari awal.
- **Umpan Balik Visual yang Intuitif:**
  - **Status Memuat (*Loading States*):** Saat antarmuka sedang berbicara dengan server (seperti saat masuk atau mendaftar), tombol *submit* dilumpuhkan (*disabled*) dan teks berubah (contoh: "Signing in..."). Ini mencegah pengalaman klik ganda (double-submit) secara tidak sengaja oleh pengguna.
  - **Penanganan Eror:** Jika autentikasi atau permintaan server gagal, pesan eror disajikan dengan kotak pesan merah yang jelas dalam formulir (bukan notifikasi *popup* peramban bawaan yang mengganggu).
- **Perlindungan Alur (*Flow Guarding*):**
  - Menghindari langkah redundansi yang membuang waktu. Pengguna yang sudah pernah login dan masih menyimpan token memori lokal (*local storage*) akan secara otomatis diarahkan ke *Dashboard* jika mencoba membuka halaman *Login/Register*, berkat implementasi `useRedirectIfAuthenticated`. Hal ini memastikan pengguna tetap berada dalam alur aplikasi yang benar.
- **Responsivitas Layar:** Desain bersifat membaur dan dapat menyesuaikan ukuran secara fluid untuk aplikasi multi-perangkat. Container dirancang terpusat dengan ukuran maksimum yang rasional (`max-w-md` pada layar desktop) agar tidak terasa melebar secara aneh pada monitor besar.
