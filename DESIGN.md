# PadosiPro Technical Design Document (`DESIGN.md`)

## 🎯 Architecture Overview

PadosiPro is structured as a clean, modular monorepo prioritizing developer velocity, type safety, and maintainability for full-stack mobile applications.

```
+-------------------------------------------------------------+
|                      React Native Mobile                    |
|  (AuthContext -> RootNavigator -> OnboardingManager -> UI)  |
+------------------------------+------------------------------+
                               | REST HTTP (JSON / JWT)
+------------------------------v------------------------------+
|                    Express / Node.js Backend                |
|  (Routes -> Middleware -> Controllers -> Services -> DB)    |
+--------------------+-------------------+--------------------+
                     |                   |
        PostgreSQL DB|                   |SMTP (Mailpit)
+--------------------v----+         +----v--------------------+
| Database Storage        |         | Local Mail Catcher      |
| (Users, OTPs, Profiles, |         | (HTML OTP Emails at     |
|  Tasks, UserSelections) |         |  http://localhost:8025) |
+-------------------------+         +-------------------------+
```

### Stack Choices
1. **Backend**: Node.js + TypeScript + Express.
   - **Rationale**: Minimal execution overhead, high type consistency with the React Native frontend, clean middleware chain for JWT validation and request validation.
2. **Database**: PostgreSQL with raw SQL queries via `pg.Pool`.
   - **Rationale**: Relational integrity for user accounts, hashed OTP attempt tracking, profiles, and user task selections.
3. **Local Email Integration**: Mailpit via Docker Compose.
   - **Rationale**: Captures real Nodemailer SMTP emails at `http://localhost:8025` without third-party email API key dependencies.
4. **Mobile**: React Native with Expo (TypeScript).
   - **Rationale**: Cross-platform mobile development with clean native UI rendering without WebViews.

---

## 🔒 Important Technical Decisions

### 1. Security & OTP Handling
- **Password Security**: Passwords hashed using `bcrypt` (10 salt rounds). Plaintext passwords are never stored or logged.
- **OTP Protection**: 6-digit numeric OTP valid for 10 minutes. Only the bcrypt hash of the OTP code is stored in the database. Rate limited to max 5 failed attempts per OTP session with a 30-second resend cooldown timer.
- **Session Persistence**: JWTs stored securely using `AsyncStorage`. `AuthContext` restores sessions seamlessly on app restart.

### 2. State Guard & Onboarding Flow Control (`OnboardingManager`)
- Rather than exposing all routes globally, `OnboardingManager` queries `/profile` and `/user-tasks` on auth initialization:
  - **New Users**: Guided through `Register` -> `OTP Verification` -> `Login` -> `Profile Setup` -> `Task Selection` -> `Home`.
  - **Returning Verified Users**: Evaluated instantly and landed **directly on the Home Screen**.

---

## ⚖️ Trade-Offs

1. **Raw SQL Query Builder vs. Heavy ORM**: Used PostgreSQL pool query functions instead of ORMs like Prisma or TypeORM to keep bundle size small and SQL queries predictable.
2. **Context API vs. Global State Library**: Used React `AuthContext` instead of Redux/Zustand since session state is compact and self-contained.

---

## 🚫 What Was Intentionally Left Out

- **Monorepo Build Tools (e.g. Turborepo)**: Standard npm commands keep execution straightforward without additional CLI tool dependencies.
- **Biometric / OAuth Login**: Kept scope focused on email/password and OTP verification flows.
- **WebViews / Embedded Assets**: Built 100% native mobile UI components for maximum responsiveness and visual quality.

---

## 🚀 What Would Be Improved With Another Week

1. **Real-Time Task Updates**: Implement Socket.io/WebSockets for live task status notifications between neighbors.
2. **Interactive Neighbor Chat**: Enable direct messaging between task requester and service provider.
3. **Automated E2E Testing**: Add Detox or Appium automated mobile test suites alongside backend Integration tests.
