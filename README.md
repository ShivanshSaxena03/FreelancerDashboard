# Freelancer OS - Freelancer Dashboard

## 📝 Project Description

**Freelancer OS** is a modern, premium, and highly secure Progressive Web Application (PWA) designed specifically for independent freelancers, contractors, and agency owners. It serves as a unified workspace dashboard to manage client relationships, build dynamic and legally compliant contracts/invoices on-the-fly, keep tracks of project iterations, and audit active workspace logs.

The goal of the project is to replace disconnected tools (like external PDF editors, spreadsheet trackers, and basic client managers) with a single, fast, offline-capable dashboard. It enforces strict data constraints, secure verification protocols, and real-time security protections to ensure client data remains isolated and safe.

## ✨ Features

- **📊 Dashboard & Metrics**: Track active clients, pending payments, compiled documents, and real-time login statistics.
- **📄 Document Builder**: Dynamically design invoices and contracts. Zero server-side file footprints; all PDFs are built dynamically on the client side using `@react-pdf/renderer`.
- **👥 Clients Directory**: Store client contact details securely with strict 10-digit contact number limits.
- **🔒 Security & Protections**:
  - **Verification Flow**: OTP-based authentication for registration and logins.
  - **Rate Limiting**: Custom in-memory rate limiting restricted to 60 API requests/min per IP to prevent DDoS and brute-force attacks.
  - **Session Isolation**: Expiring sessions (1-hour absolute duration) with isolated local storage timers per user ID.
  - **IDOR Protection**: Strict database ownership checks on client/document queries.
  - **Email Alerts**: Automatic SMTP/Email notifications for logins and deactivations.
- **📱 Progressive Web App (PWA)**:
  - Valid manifest configuration and high-resolution PWA app icons.
  - Custom service worker (`sw.js`) supporting caching strategies and an offline fallback route.
  - Custom "Install App" prompt capability integrated directly into the layout headers and landing page.
- **🎨 Modern Premium UI**:
  - Built with highly responsive, sleek Tailwind-inspired CSS styling.
  - Interactive background canvas particle animation powered by WebGL/OGL.
  - Interactive modal views and smooth transitions.

---

## 🛠️ Technology Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Turbopack)
- **Database**: PostgreSQL (pg pool client)
- **Authentication**: NextAuth.js (JWT Strategy)
- **Styling**: Tailwind CSS & Vanilla CSS (with custom utility rules)
- **PDF Generation**: `@react-pdf/renderer` (on-the-fly client generation)
- **Animations**: OGL (WebGL framework for particles canvas)

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18 or higher recommended)
- **PostgreSQL** instance

### 2. Environment Configuration
Create a `.env.local` file in the root directory and populate the following keys:
```env
# Database Credentials
DATABASE_URL=postgresql://username:password@localhost:5432/freelancer_db

# NextAuth Configs
NEXTAUTH_SECRET=your_jwt_signing_secret_here
NEXTAUTH_URL=http://localhost:3000

# SMTP / Email Settings
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
NOTIFY_EMAIL=admin_notifications@example.com
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Running the App
Run the local dev server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) on your browser to view the application.

### 5. Production Build
To build and optimize the project for deployment:
```bash
npm run build
npm run start
```

---

## 📜 Database Schema Init
The schema will automatically self-initialize on the first connection using the automated setup script (`src/lib/init-db.ts`). It configures:
- `users`: Standard profiles and Roles (`admin` vs. `user`).
- `clients` & `documents`: Cascaded records with `ON DELETE SET NULL` mapping to preserve data integrity when users are deactivated.
- `otps`: Expiration-tracked verification codes.
- `activity_logs`: Logs tracking login alerts and modifications.
