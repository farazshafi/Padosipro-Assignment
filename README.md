**# PadosiPro - Full-Stack Mobile & Backend Assignment

PadosiPro is a neighborhood lifestyle management service application. It enables users to register, verify their email via OTP, set up their household profile, choose tasks/services they need or offer, and manage their active tasks on a personalized home dashboard.

This monorepo contains:
- **Backend API**: Node.js + Express + TypeScript + PostgreSQL.
- **Mobile Native Application**: React Native + Expo + TypeScript.
- **Infrastructure Services**: Docker Compose (PostgreSQL & Mailpit SMTP server).

---

## 📋 Prerequisites

Before running the application, ensure you have the following installed:
- **Node.js**: v18.x or v20.x recommended
- **npm**: v9.x or higher
- **Docker** and **Docker Compose**: For running PostgreSQL database and Mailpit SMTP server locally
- **Expo Go** app (iOS/Android) OR an **Android Emulator** / **iOS Simulator**
- **EAS CLI** (Optional, for building production Android APK): `npm install -g eas-cli`

---

## 🛠️ Project Setup & Infrastructure

### 1. Start Docker Services (PostgreSQL & Mailpit)

Start PostgreSQL and Mailpit using Docker Compose:

```bash
docker compose up -d
```

Service URLs & Credentials:
- **PostgreSQL Database**: `localhost:5432`
  - Database: `padosipro_db`
  - Username: `padosi_user`
  - Password: `padosi_password`
- **Mailpit Web UI (Email Catcher)**: [http://localhost:8025](http://localhost:8025)
  - Inspect generated 6-digit OTP emails sent by the backend server.
- **Mailpit SMTP Server**: `localhost:1025`

---

## ⚙️ Environment Variables & `.env.example`

### Backend Environment Configuration (`backend/.env`)

Copy the example configuration file:

```bash
cp backend/.env.example backend/.env
```

Here is the exact contents of `backend/.env.example`:

```env
PORT=4000
NODE_ENV=development

DATABASE_URL=postgresql://padosi_user:padosi_password@localhost:5432/padosipro_db

SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_SECURE=false
EMAIL_FROM="PadosiPro <no-reply@padosipro.com>"

JWT_SECRET=super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d
OTP_EXPIRY_MINUTES=10
OTP_MAX_ATTEMPTS=5
OTP_RESEND_COOLDOWN_SECONDS=30
```

### Mobile Environment Configuration (`mobile/src/config/env.ts`)

The mobile application automatically detects the target platform:
- **Android Emulator**: Uses `http://10.0.2.2:4000/api`
- **iOS Simulator / Web**: Uses `http://localhost:4000/api`

If running on a physical mobile device via Expo Go, replace `localhost` in `mobile/src/config/env.ts` with your computer's local IP address (e.g. `http://192.168.1.5:4000/api`).

---

## 🚀 Backend Startup

1. Navigate to the `backend` directory and install dependencies:
   ```bash
   cd backend
   npm install
   ```

2. Run database migrations & seed catalogue data:
   ```bash
   npm run migrate
   npm run seed
   ```

3. Start the backend development server:
   ```bash
   npm run dev
   ```

The backend server will run on `http://localhost:4000`. You can verify API health:
```bash
curl http://localhost:4000/health
```

---

## 📱 Mobile Application Startup

1. Navigate to the `mobile` directory and install dependencies:
   ```bash
   cd mobile
   npm install
   ```

2. Start the Expo development server:
   ```bash
   npm start
   ```

3. Launch on device or emulator:
   - Press `a` to launch on connected **Android Emulator**.
   - Press `i` to launch on **iOS Simulator**.
   - Scan the QR code using the **Expo Go** app on your physical device.

---

## 🧪 How to Run Tests & Type Checks

### Backend Tests

Run unit and API integration tests:

```bash
cd backend
npm test
```

### Mobile Static Type Check

Run strict TypeScript type verification:

```bash
cd mobile
npx tsc --noEmit
```

---

## 📦 How to Build the Android APK

To build a standalone Android APK for distribution:

### Method 1: EAS Build (Recommended for Expo)

1. Install EAS CLI and log in:
   ```bash
   npm install -g eas-cli
   eas login
   ```

2. Configure EAS project:
   ```bash
   cd mobile
   eas build:configure
   ```

3. Build the Android APK preview:
   ```bash
   eas build -p android --profile preview
   ```

### Method 2: Local Standalone Android Build

If Android Studio and NDK are installed locally:

```bash
cd mobile
npx expo run:android --variant release
```

---

## 🔄 Complete App Flow Instructions

Follow these step-by-step instructions to test the complete user journey:

1. **Register**:
   - Open the app. You will see the **Sign In** screen. Tap **Register**.
   - Enter `email` (e.g. `user@example.com`), `password` (e.g. `Pass1234`), and `confirmPassword`.
   - Tap **Register & Continue**.

2. **Email Verification (OTP)**:
   - You will be navigated to the **Verify Email** screen.
   - Open Mailpit in your browser at [http://localhost:8025](http://localhost:8025).
   - Find the OTP verification email sent to `user@example.com` and copy the 6-digit code.
   - Enter the 6-digit OTP code in the app and tap **Verify OTP Code**.

3. **Login**:
   - Upon successful OTP verification, you are redirected to **Login** with a green verification notice and prefilled email.
   - Enter your password and tap **Sign In**.

4. **First-Login Profile Setup**:
   - New users are automatically presented with the **Complete Your Profile** screen.
   - Enter Full Name, Indian Mobile Number (format `+919876543210`), Address, and optional Business Name.
   - Tap **Save Profile & Continue**.

5. **Task Selection**:
   - Next, the **Select Your Services** screen appears with category tabs and a search bar.
   - Select one or more tasks (e.g., *Plumbing Repair*, *Grocery Drop-off*).
   - Tap **Save Tasks**.

6. **Home Screen**:
   - You land on the authenticated **Home** screen displaying your selected active services, category badges, and user greeting.

7. **Logout & Login Again**:
   - Tap **Log Out** in the top header. You return to the **Sign In** screen.
   - Sign in again with your credentials.
   - As a returning verified user with complete profile & task preferences, you land **directly on the Home screen**!
**