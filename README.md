# CLASSIFY - Academic Room Scheduling & Booking System

CLASSIFY is a comprehensive web-based platform designed to streamline and manage classroom scheduling, room bookings, and schedule conflict resolution for academic institutions. The system supports multiple user roles, a document approval cycle, conflict detection, and a real-time notification system.

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

## 📝 License

This project is licensed under the ISC License.
