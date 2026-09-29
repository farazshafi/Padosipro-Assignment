# PadosiPro Database Schema Documentation (DATABASE.md)

This document explains the database design, entity relationships, security constraints, and field choices for the PadosiPro full-stack application.

---

## 📊 Entity Relationship Summary

```
                      +-------------------+
                      |       users       |
                      +-------------------+
                      | id (PK)           |
                      | email (UQ)        |
                      | password_hash     |
                      | is_verified       |
                      +---------+---------+
                                |
      +-------------------------+-------------------------+
      | 1:N (Cascade)           | 1:1 (Cascade)           | 1:N (Cascade)
      v                         v                         v
+--------------+        +---------------+        +----------------------+
|  email_otps  |        |   profiles    |        | user_selected_tasks  |
+--------------+        +---------------+        +----------------------+
| id (PK)      |        | id (PK)       |        | id (PK)              |
| user_id (FK) |        | user_id (FK)  |        | user_id (FK)         |
| otp_hash     |        | name          |        | task_id (FK)         |
| attempts     |        | mobile_number |        +----------+-----------+
| expires_at   |        | address       |                   | N:1
+--------------+        | business_name |                   v
                        +---------------+           +---------------+
                                                    |     tasks     |
                                                    +---------------+
                                                    | id (PK)       |
                                                    | category_id   |
                                                    | name          |
                                                    +-------+-------+
                                                            | N:1
                                                            v
                                                    +---------------+
                                                    |task_categories|
                                                    +---------------+
                                                    | id (PK)       |
                                                    | name (UQ)     |
                                                    +---------------+
```

---

## 🗄️ Tables Breakdown & Rationale

### 1. `users`
- **Purpose**: Stores core user authentication credentials and email verification state.
- **Fields**:
  - `id` (`UUID`): Primary key.
  - `email` (`VARCHAR(255)`): Unique user login identifier. Indexed for fast lookup.
  - `password_hash` (`VARCHAR(255)`): Bcrypt hash of user password. Plaintext passwords are never stored.
  - `is_verified` (`BOOLEAN`): Set to `true` once email OTP verification succeeds. Login is restricted to verified users only.

### 2. `email_otps`
- **Purpose**: Manages 6-digit email OTPs, expiry timers, and attempt counters.
- **Fields**:
  - `user_id` (`UUID`): Foreign key referencing `users.id` with `ON DELETE CASCADE`.
  - `otp_hash` (`VARCHAR(255)`): Only a hash of the 6-digit OTP code is stored.
  - `attempts` (`INT`): Tracks wrong verification attempts (max 5 allowed per OTP).
  - `expires_at` (`TIMESTAMP`): Set to 10 minutes from creation.
  - `resend_available_at` (`TIMESTAMP`): Implements 30-second resend cooldown.

### 3. `profiles`
- **Purpose**: Holds first-login user profile information.
- **Fields**:
  - `user_id` (`UUID`): Foreign key referencing `users.id` (`UNIQUE`, 1-to-1 relationship).
  - `name` (`VARCHAR(255)`): Full user name.
  - `mobile_number` (`VARCHAR(15)`): Indian mobile number (+91 followed by 10 digits).
  - `address` (`TEXT`): User's primary residential or service delivery address.
  - `business_name` (`VARCHAR(255)`): **Nullable/Optional**. 
    - *Rationale*: PadosiPro serves both household consumers and small business owners/freelancers. Making `business_name` optional ensures individual home users are not forced to enter a business name.

### 4. `task_categories`
- **Purpose**: Grouping categories for lifestyle tasks.
- **Fields**:
  - `id` (`UUID`): Primary key.
  - `name` (`VARCHAR(100)`): Category display name (e.g., "Home & Maintenance").
  - `slug` (`VARCHAR(100)`): URL-safe slug for clean API querying.

### 5. `tasks`
- **Purpose**: Seeded catalog of lifestyle management services offered by PadosiPro.
- **Fields**:
  - `category_id` (`UUID`): Foreign key to `task_categories.id`.
  - `name` (`VARCHAR(255)`): Service title.
  - `description` (`TEXT`): Short summary of what the Lifestyle Manager executes.

### 6. `user_selected_tasks`
- **Purpose**: Junction table recording the tasks selected by a user during or after onboarding.
- **Fields**:
  - `user_id` (`UUID`): Foreign key referencing `users.id`.
  - `task_id` (`UUID`): Foreign key referencing `tasks.id`.
  - `UNIQUE(user_id, task_id)`: Prevents duplicate task selections per user.

---

## ⚡ Seed Data Overview

The seed script (`backend/src/db/seeds.sql`) pre-populates **4 categories** and **20 tasks**:
1. **Home & Maintenance** (5 tasks: AC Service, Plumbing, Electrical Repair, Pest Control, Deep Cleaning)
2. **Errands & Delivery** (5 tasks: Grocery Run, Pharmacy Pickup, Dry Cleaning, Parcel Courier, Pet Supplies)
3. **Senior & Family Care** (5 tasks: Elder Hospital Escort, Senior Welfare Check, Kids Bus Pickup, Physiotherapy Escort, Emergency Care)
4. **Admin & Documentation** (5 tasks: Aadhaar/Passport Queueing, Utility Bill Payment, Bank DD/Cheque Deposit, Notary Attestation, Society Maintenance Collection)
