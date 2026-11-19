# 🎓 Mentora - School Management & Session Booking Frontend
### Production Next.js 16 (App Router) + Material UI (MUI v6) + TypeScript Client

A high-performance web client built with **Next.js 16, TypeScript, and Material UI (MUI v6)** featuring **Role-Based Access Control (RBAC)**, dedicated dashboards for **Students, Teachers, and Administrators**, and real-time integration with the Mentora REST API backend.

---

## 🚀 Key Features

- **Role-Based Dashboards**:
  - 🎓 **Student Dashboard**: Live stats, upcoming schedule, completed session history, direct 1-click booking.
  - 👨‍🏫 **Teacher Dashboard**: Real-time confirmed student bookings, 1-click session completion (API 5), open availability manager.
  - 🛡️ **Admin Command Center**: System-wide platform metrics, full session audit roster, user accounts directory.
- **Enterprise Material-UI (MUI v6) Architecture**:
  - Clean SaaS aesthetic (no generic AI look).
  - Debounced search queries for instant typing without API throttling.
  - MUI TablePagination with backend and frontend slicing.
- **1-Click Quick Demo Sign-In**:
  - 🎓 Student: `saurabh.agnihotri@example.com`
  - 👩‍🎓 Student: `anjali.verma@example.com`
  - 👨‍🏫 Teacher: `abhishek.singh@example.com`
  - 👨‍🏫 Teacher: `manas.tiwari@example.com`
  - 🛡️ Admin: `prince.agnihotri@example.com`
  - Password for all: `Password@123`

---

## 🛠 Local Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
# Copy .env.example to .env.local
cp .env.example .env.local

# 3. Start development server
npm run dev
```

Visit `http://localhost:3000`.

---

## ☁️ Deployment to Vercel

1. Push this repository to GitHub: `https://github.com/Saurabh-183/school-management-system-frontend.git`
2. Go to [Vercel Dashboard](https://vercel.com/new).
3. Import the `school-management-system-frontend` repository.
4. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_API_URL`: Your deployed Render backend URL (e.g. `https://school-management-system-backend.onrender.com`).
5. Click **Deploy**! Vercel will auto-detect Next.js and build the production bundle in seconds.
