# CLASSIFY - Sistem Penjadwalan & Peminjaman Ruangan Akademik

CLASSIFY adalah platform berbasis web komprehensif yang dirancang untuk menyederhanakan dan mengelola penjadwalan kelas, peminjaman ruangan, dan resolusi konflik jadwal untuk institusi akademik. Sistem ini mendukung berbagai peran pengguna, siklus persetujuan dokumen, deteksi konflik, dan sistem notifikasi *real-time*.

## 🔗 Live Demo
Akses aplikasi yang sudah di-deploy di sini: **[Live Demo CLASSIFY](https://classinfy.vercel.app)** *(Sesuaikan jika link-nya berbeda)*

## 🌟 Fitur Utama

- **Kontrol Akses Berbasis Peran**: Dashboard dan hak akses yang disesuaikan untuk Admin, Dosen, Mahasiswa, dan Penanggung Jawab (PJ).
- **Deteksi Konflik Otomatis**: Mencegah peminjaman ganda dengan mendeteksi bentrokan jadwal dan ruangan secara cerdas.
- **Alur Persetujuan Dokumen**: Memiliki alur status (*state machine*) bawaan untuk permohonan peminjaman (Diajukan, Disetujui, Ditolak, Negosiasi).
- **Notifikasi Real-Time**: Pembaruan instan kepada pengguna mengenai status permohonan mereka.
- **Penjadwalan Berbasis Prioritas**: Mendukung pengambilalihan (*preemption*) jadwal untuk peminjaman dengan prioritas lebih tinggi.
- **Sistem Chat Interaktif**: Fitur pesan di dalam aplikasi yang dilengkapi dengan foto profil pengguna untuk memfasilitasi negosiasi dan komunikasi.

## 🛠️ Teknologi yang Digunakan

- **Frontend**: Vue.js
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL dengan Sequelize ORM
- **Autentikasi**: JWT & bcrypt

## 🚀 Mulai Menggunakan

### Prasyarat
- Node.js (v16+)
- PostgreSQL (disarankan menggunakan pgAdmin)

### Instalasi

1. **Clone repositori**
   ```bash
   git clone https://github.com/yourusername/classify.git
   cd classify
   ```

2. **Setup Backend**
   ```bash
   # Instal dependensi
   npm install

   # Konfigurasi variabel lingkungan
   # Buat file .env dan atur konfigurasi database serta secret JWT Anda
   cp .env.example .env 

   # Jalankan migrasi database dan seeder (jika ada)
   npm run seed

   # Jalankan server development
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## 🔐 Akun Demo

Gunakan kredensial default berikut untuk menjelajahi berbagai peran pengguna di dalam sistem. Pastikan database sudah di-*seed* dengan benar sebelum menggunakan akun-akun ini.

### 1. Administrator
Memiliki akses penuh untuk mengelola pengguna, ruangan, menyetujui/menolak permohonan jadwal, dan melihat log sistem.
- **Email**: `admin@classify.com`
- **Password**: `password123`

### 2. Dosen (Lecturer)
Dapat melihat jadwal, mengusulkan waktu alternatif, dan berkomunikasi melalui sistem chat.
- **Email**: `dosen@classify.com`
- **Password**: `password123`

### 3. Penanggung Jawab / PJ (Project Leader)
Bertanggung jawab atas kelas tertentu, dapat mengajukan jadwal pengganti/peminjaman, menegosiasikan konflik, dan melihat detail status jadwal.
- **Email**: `pj@classify.com`
- **Password**: `password123`

### 4. Mahasiswa (Student)
Dapat melihat jadwal umum dan mengecek ketersediaan ruangan.
- **Email**: `mahasiswa@classify.com`
- **Password**: `password123`

*(Catatan: Jika akun-akun ini belum tersedia di *environment* lokal Anda, Anda mungkin perlu mendaftarkannya secara manual melalui aplikasi atau menjalankan *database seeder*.)*

## 👨‍💻 Tim Pengembang (Kelompok 2)
Aplikasi ini dikembangkan dengan bangga oleh Kelompok 2 sebagai solusi inovatif untuk memantau ketersediaan ruang kampus di Lingkungan Kampus 5 UNESA.

- **Nakula Syafa Saputra** (25051204374) — *Programmer* | [GitHub](https://github.com/Nklasyfa)
- **Nabila Pasha Hamidah** (25051204318) — *System Analyst* | [GitHub](https://github.com/NabilaPasha16)
- **Fathan Orvala** (25051204271) — *Scrum Master* | [GitHub](https://github.com/atangorp)
- **Aurora Ilmannafia** (25051204276) — *UI/UX Designer* | [GitHub](https://github.com/auroranafia)
- **Faiz Ramadhani** (25051204372) — *Quality Assurance* | [GitHub](https://github.com/faizramadhani01)

## 📝 Lisensi

Proyek ini dilisensikan di bawah Lisensi ISC.
