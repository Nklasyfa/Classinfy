# CLASSIFY - Academic Room Scheduling & Booking System

CLASSIFY is a comprehensive web-based platform designed to streamline and manage classroom scheduling, room bookings, and schedule conflict resolution for academic institutions. The system supports multiple user roles, a document approval cycle, conflict detection, and a real-time notification system.

## 🔗 Live Demo
Akses aplikasi yang sudah di-deploy di sini: **[Live Demo CLASSIFY](https://classinfy.vercel.app)** *(Sesuaikan jika link-nya berbeda)*

## 🌟 Key Features

- **Role-Based Access Control**: Different dashboards and permissions for Admin, Lecturers (Dosen), Students (Mahasiswa), and Project Leaders / Persons in Charge (PJ).
- **Automated Conflict Detection**: Prevents double-booking by intelligently detecting schedule and room conflicts.
- **Document Approval Workflow**: Built-in state machine for booking requests (Submitted, Approved, Rejected, Negotiated).
- **Real-Time Notifications**: Instant updates to users regarding their booking status.
- **Priority-Based Scheduling**: Supports preemption for higher-priority bookings.
- **Interactive Chat System**: In-app messaging with user profile pictures to facilitate negotiation and communication.

## 🛠️ Technology Stack

- **Frontend**: Vue.js
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL with Sequelize ORM
- **Authentication**: JWT & bcrypt

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- PostgreSQL (pgAdmin recommended)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/classify.git
   cd classify
   ```

2. **Backend Setup**
   ```bash
   # Install dependencies
   npm install

   # Configure environment variables
   # Create a .env file and configure your database and JWT secrets
   cp .env.example .env 

   # Run database migrations and seeders (if any)
   npm run seed

   # Start the development server
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## 🔐 Demo Accounts

Use the following default credentials to explore the different user roles in the system. Make sure the database is seeded correctly before using these accounts.

### 1. Administrator
Has full access to manage users, rooms, approve/reject schedules, and view system logs.
- **Email**: `admin@classify.com`
- **Password**: `password123`

### 2. Dosen (Lecturer)
Can view schedules, propose alternative times, and communicate via the chat system.
- **Email**: `dosen@classify.com`
- **Password**: `password123`

### 3. Penanggung Jawab / PJ (Project Leader)
Responsible for specific classes, can request schedules, negotiate conflicts, and view detailed schedule statuses.
- **Email**: `pj@classify.com`
- **Password**: `password123`

### 4. Mahasiswa (Student)
Can view general schedules and room availability.
- **Email**: `mahasiswa@classify.com`
- **Password**: `password123`

*(Note: If these accounts do not exist in your local setup, you may need to register them manually through the application or run the database seeder.)*

## 👨‍💻 Tim Pengembang (Kelompok 2)
Aplikasi ini dikembangkan dengan bangga oleh Kelompok 2 sebagai solusi inovatif untuk memantau ketersediaan ruang kampus di Lingkungan Kampus 5 UNESA.

- **Nakula Syafa Saputra** (25051204374) — *Programmer* | [GitHub](https://github.com/Nklasyfa)
- **Nabila Pasha Hamidah** (25051204318) — *System Analyst* | [GitHub](https://github.com/NabilaPasha16)
- **Fathan Orvala** (25051204271) — *Scrum Master* | [GitHub](https://github.com/atangorp)
- **Aurora Ilmannafia** (25051204276) — *UI/UX Designer* | [GitHub](https://github.com/auroranafia)
- **Faiz Ramadhani** (25051204372) — *Quality Assurance* | [GitHub](https://github.com/faizramadhani01)

## 📝 License

This project is licensed under the ISC License.
