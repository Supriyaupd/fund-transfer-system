# Fund Transfer & Transaction Tracking System

A fullstack web application that handles secure money transfers between users. Built to understand how real payment systems work under the hood not just the interface, but the actual transaction logic that keeps money safe.

## What This Project Is About

Most tutorials teach you how to build a login system or a CRUD app. This project goes deeper it simulates the core engine of a digital wallet. The focus is on what happens after a user clicks "Send". How does the system make sure money reaches the receiver? What happens if it doesn't? How do you prevent someone from sending the same money twice? How do you confirm identity before moving funds?

These are the problems this project solves.

## Features

**Authentication**
- Register with name, email and phone number
- Login with JWT tokens
- Passwords hashed with bcrypt

**Wallet**
- Every user gets a wallet with a balance
- Top up your wallet (PIN required)
- Balance updates after every transaction

**Fund Transfer**
- Send money to any user by phone number
- 4-digit transaction PIN required
- Cannot send to yourself or overdraft
- Every transfer creates a permanent record

**Transaction History**
- View all sent, received and top-up transactions
- Each transaction shows amount, type, status, date and reference ID
- Balance before and after every transaction is recorded

## What Makes This Different

### Atomic Transactions
When User A sends NPR 500 to User B, two things must happen  deduct from A and add to B. If the server crashes between these two steps, money disappears.

To prevent this, both operations run inside a MongoDB session. If either step fails, everything rolls back automatically. The sender keeps their money and no partial state is saved.

### PIN Before Database Queries
The transaction PIN is verified first before checking the receiver or the balance. Wrong PIN means immediate rejection with zero database queries wasted.

### Audit Trail
Every transaction stores `balanceBefore` and `balanceAfter`. You can reconstruct exactly what happened at any point. No guessing.

### PIN Not OTP
OTP means waiting for a message every time you transfer. A PIN is instant and still requires something only the user knows. OTP is better for high risk actions like resetting a PIN not for routine transfers.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, Tailwind CSS, TypeScript |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas |
| Auth | JWT, bcrypt |

## Project Structure

```
fund-transfer-system/
├── backend/
│   ├── config/        # Database connection
│   ├── middleware/    # JWT auth middleware
│   ├── models/        # User and Transaction schemas
│   ├── routes/        # Auth and transaction routes
│   └── server.js
└── frontend/
    └── app/
        ├── dashboard/ # Main wallet dashboard
        ├── send/      # Send money page
        ├── topup/     # Top up page
        ├── pin/       # Set PIN page
        └── lib/       # Axios API config
```


## How to Run

### Backend

```bash
cd backend
npm install
```

Create `.env`:

PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secret_key
EMAIL_USER=your_email
EMAIL_PASS=your_email_password


```bash
npm run dev
```

### Frontend

```bash
cd frontend
npm install
```

Create `.env.local`:

NEXT_PUBLIC_API_URL=http://localhost:5000/api


```bash
npm run dev
```

Open `http://localhost:3000`

## API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | No | Register new user |
| POST | /api/auth/login | No | Login |
| GET | /api/auth/me | Yes | Get current user |
| POST | /api/auth/set-pin | Yes | Set transaction PIN |
| POST | /api/transactions/send | Yes | Send money (PIN required) |
| POST | /api/transactions/topup | Yes | Top up wallet (PIN required) |
| GET | /api/transactions/history | Yes | Transaction history |

## What I Learned
The biggest lesson was that data integrity in financial systems is not optional. Building this taught me that the order of operations matters, partial writes are dangerous, and every failure scenario needs a defined outcome. Atomic transactions are not an advanced feature they are the minimum requirement for moving money safely.


