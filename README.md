# 🎓 Classinfy

> **Sistem Manajemen Peminjaman Fasilitas Kampus Terpadu**

Classinfy adalah solusi digital modern yang dirancang untuk mengelola ekosistem fasilitas kampus secara efisien. Proyek ini bertujuan untuk mendigitalisasi proses reservasi ruangan, pemantauan jadwal, dan manajemen aset kampus dalam satu platform yang terintegrasi.

---

## 🏛️ Konsep Final
**Classinfy** (Class & Industry) adalah platform manajemen fasilitas akademik yang menghubungkan kebutuhan infrastruktur pengajaran dengan efisiensi operasional. Konsep utamanya adalah menciptakan transparansi dalam penggunaan sumber daya kampus, mengurangi konflik penjadwalan, dan memberikan aksesibilitas yang lebih baik bagi seluruh civitas akademika.

Melalui sistem ini, mahasiswa dan dosen dapat dengan mudah melakukan reservasi ruangan, sementara pihak administrasi dapat mengawasi penggunaan aset dan memberikan persetujuan secara instan.

---

## ✨ Fitur Utama

- **🔐 Multi-Role Authentication**: Sistem login terenkripsi untuk Admin, Dosen, dan Mahasiswa.
- **🏢 Smart Room Management**: Kelola data ruangan, kapasitas, dan fasilitas pendukung dengan mudah.
- **📅 Interactive Scheduling**: Visualisasi jadwal penggunaan ruangan secara real-time untuk menghindari bentrokan.
- **📝 Automated Booking System**: Proses reservasi kamar yang mulus dengan status persetujuan yang transparan (Pending, Approved, Rejected).
- **🚀 API Architecture**: Dibangun dengan RESTful API yang kuat untuk integritas data yang optimal.

---

## 🛠️ Tech Stack

### Backend
- **Framework**: [Express.js](https://expressjs.com/)
- **ORM**: [Sequelize](https://sequelize.org/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **Security**: JSON Web Token (JWT) & BcryptJS

### Frontend
- **Framework**: [Vue 3](https://vuejs.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)

---

## 🚀 Instalasi & Menjalankan

1. **Clone Repository**
   ```bash
   git clone https://github.com/nklasyfa/classinfy.git
   ```

2. **Setup Backend**
   ```bash
   cd classinfy
   npm install
   # Sesuaikan .env dengan kredensial database Anda
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---

## 📬 Kontak
Untuk pertanyaan lebih lanjut atau kontribusi, silakan hubungi tim pengembang Classinfy.

---
*Dibuat dengan ❤️ untuk kemajuan pendidikan.*
