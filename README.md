[README.md](https://github.com/user-attachments/files/28949137/README.md)
# ♻️ SwapMarket — Clothing Exchange & Swap Marketplace

A full-stack platform that lets users **swap clothes directly with each other** instead of buying or selling — promoting a barter economy, reducing textile waste, and making sustainable fashion accessible.

---

## 🌍 Problem Statement

- Many people have unused, wearable clothes but no easy way to exchange them
- Traditional e-commerce platforms focus only on buying and selling
- Clothing resale platforms involve complicated pricing
- There's a lack of platforms dedicated specifically to clothing swapping
- Sustainable fashion options remain limited for most users

## ✨ Solution

SwapMarket lets users list clothes they no longer wear, browse items from others, and send **swap requests** — offering one of their own items in exchange. The platform adds:

- **Value-based swap suggestions** — matches items of similar estimated value
- **Location-based matching** — prioritizes nearby users for easier handoffs
- **Reputation & trust badges** — builds confidence between swappers
- **Real-time chat** — negotiate and finalize swaps in-app

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Tailwind CSS, Context API |
| Backend | Node.js, Express |
| Database | MongoDB (Mongoose) + 2dsphere geospatial indexing |
| Auth | JWT, Google OAuth (`google-auth-library`), bcrypt |
| Real-time | Socket.io |
| Media storage | Cloudinary |
| Email | Nodemailer |

---

## 📁 Project Structure

```
swap-marketplace/
├── client/                          # React frontend
│   └── src/
│       ├── api/                     # Axios instances & API calls
│       ├── components/
│       │   ├── auth/                # Login, Register forms
│       │   ├── profile/             # Profile view/edit, reviews
│       │   ├── listings/            # ListingCard, ListingForm, ListingGrid
│       │   ├── swap/                # SwapRequestModal, SwapStatus
│       │   └── chat/                # ChatWindow, MessageBubble
│       ├── context/                 # AuthContext, SocketContext
│       ├── hooks/                   # useAuth, useSwap, useListings
│       ├── pages/                   # Home, Browse, ItemDetail, Dashboard, Profile
│       └── routes/                  # ProtectedRoute, AppRouter
│
├── server/                          # Express backend
│   ├── config/                      # db.js, cloudinary.js, passport.js
│   ├── controllers/
│   ├── middleware/                  # authMiddleware, uploadMiddleware
│   ├── models/                      # User, ClothingListing, SwapRequest, Review, Notification
│   ├── routes/                      # auth, users, listings, swaps, reviews, notifications
│   ├── services/                    # emailService, matchingService
│   ├── sockets/                     # chatSocket.js, notificationSocket.js
│   └── server.js
│
├── .env.example
└── package.json
```

---

## 🗄 Database Schema (MongoDB)

| Collection | Key Fields |
|---|---|
| **Users** | `name`, `email`, `passwordHash`, `googleId`, `location` (2dsphere), `sizePreferences`, `wishlist`, `avgRating`, `swapCount`, `trustBadge` |
| **ClothingListings** | `userId`, `title`, `description`, `category`, `size`, `condition`, `photos[]`, `estimatedValue`, `status` |
| **SwapRequests** | `requesterId`, `ownerId`, `offeredItemId`, `requestedItemId`, `status`, `messages[]` |
| **Reviews** | `swapRequestId`, `reviewerId`, `revieweeId`, `rating`, `comment` |
| **Notifications** | `userId`, `type`, `message`, `refId`, `read` |

**Key indexes:**
- `users.location` → `2dsphere` (location-based matching)
- `users.email` → unique
- `clothing_listings` → `userId`, `status`, `category`, `size`, `estimatedValue`
- `swap_requests` → `requesterId`, `ownerId`, `status`

---

## 🚀 Core Features

### 1. Authentication & Profiles
- JWT-based register/login with email verification
- Google OAuth sign-in
- Profile management: name, city, pincode, bio, clothing size preferences

### 2. Reputation & Trust System
- 1–5 star ratings + written reviews after each completed swap
- Auto-calculated trust badges based on swap count & average rating:

| Badge | Requirement |
|---|---|
| New Swapper | ≥ 1 swap |
| Verified Swapper | ≥ 3 swaps, avg ≥ 3.5★ |
| Trusted Trader | ≥ 10 swaps, avg ≥ 4.0★ |
| Top Trader | ≥ 20 swaps, avg ≥ 4.5★ |
| Elite Swapper | ≥ 50 swaps, avg ≥ 4.8★ |

### 3. Clothing Listings
- Create listings with photos, category, size, condition, estimated value
- Browse with filters (category, size, gender, condition, distance) + search + sort
- Item detail page with photo carousel and wishlist

### 4. Swap Engine
- Send a swap request offering one of your own items
- Owner can accept / counter-offer / decline
- **Smart Match**: suggests items within ±25% estimated value
- **Location Match**: sorts/filters listings by proximity using `$near`

### 5. Real-Time Chat & Notifications
- Per-swap chat rooms via Socket.io with read receipts
- In-app notification bell + optional email alerts (Nodemailer)

### 6. AI-Powered Recommendations
- "Best offers from your wardrobe" — Claude API suggests the strongest items to offer for a given swap

---

## ⚙️ Getting Started

### Prerequisites
- Node.js ≥ 18
- MongoDB (local or Atlas)
- Cloudinary account (for image uploads)
- Google OAuth credentials (optional, for Google sign-in)
- SMTP credentials (for email verification/notifications)

### 1. Clone & install

```bash
git clone https://github.com/<your-username>/swap-marketplace.git
cd swap-marketplace

# Backend
cd server && npm install

# Frontend
cd ../client && npm install
```

### 2. Environment variables

Create a `.env` file inside `server/`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

GOOGLE_CLIENT_ID=your_google_oauth_client_id

SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_email@example.com
SMTP_PASS=your_email_password

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

CLIENT_URL=http://localhost:5173
```

Create a `.env` file inside `client/`:

```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Run the app

```bash
# Terminal 1 — backend
cd server && npm run dev

# Terminal 2 — frontend
cd client && npm run dev
```

The app will be available at `http://localhost:5173`, with the API running on `http://localhost:5000/api`.

---

## 📡 API Overview

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register with email & password |
| POST | `/api/auth/verify-email` | Verify email via token |
| POST | `/api/auth/login` | Login, returns JWT |
| POST | `/api/auth/google` | Google OAuth login |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password via token |
| GET | `/api/auth/me` | Get current user |
| PATCH | `/api/users/me` | Update own profile |
| GET | `/api/users/:id` | Get public profile |
| POST | `/api/users/:id/reviews` | Submit a review |
| GET | `/api/users/:id/reviews` | Get user's reviews |
| GET / POST | `/api/listings` | Browse / create listings |
| GET | `/api/listings/:id` | Listing detail |
| POST | `/api/swaps` | Send a swap request |
| PATCH | `/api/swaps/:id` | Accept / decline / counter |

---

## 🌱 Sustainability Impact

Every completed swap means one less item manufactured, shipped, and eventually discarded. SwapMarket aims to extend the life cycle of clothing and make circular fashion the easiest choice — not the inconvenient one.

---

## 📄 License

MIT — feel free to fork, modify, and build on this project.

---

## 🤝 Contributing

Contributions are welcome! Please open an issue first to discuss what you'd like to change, then submit a pull request.
