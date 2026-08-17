<div align="center">

# 🔐 ShareVault

### Premium file sharing at the speed of thought.

Drag, drop, and get a beautiful shareable link in under a second.
Password-protect, set expiry dates, generate QR codes — all wrapped in a cinematic Midnight Indigo UI.

**Crafted by [Shivam Rai](https://techwithshivam.in/)**

![Made with React](https://img.shields.io/badge/React-18-61dafb?style=for-the-badge&logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646cff?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-3-06b6d4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Node](https://img.shields.io/badge/Node-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47a248?style=for-the-badge&logo=mongodb&logoColor=white)
![AWS S3](https://img.shields.io/badge/AWS-S3-ff9900?style=for-the-badge&logo=amazonaws&logoColor=white)

</div>

---

## ✨ Features

- ⚡ **Lightning uploads** — multi-file drag & drop with animated progress
- 🔒 **Password protected** — lock any link, set expiry dates
- 🔗 **Beautiful share links** — short URLs + instant QR codes
- 🌍 **Works anywhere** — guest mode, no signup required to share
- 📊 **Track everything** — downloads, expiry countdowns, file status
- ✨ **Premium by default** — Midnight Indigo glassmorphic UI with cinematic motion
- 🎨 **Animated everything** — SVG logo, animated feature icons, premium toasts
- 🔐 **JWT auth** — sign up / login with persistent sessions

## 🏗 Tech Stack

**Frontend** (`client/`)
- React 18 + Vite 7
- Redux Toolkit for state
- Tailwind CSS + custom design tokens
- React Router v6
- Space Grotesk + DM Sans typography
- react-toastify with custom animated theme

**Backend** (`server/`) — *do not modify*
- Node.js + Express
- MongoDB (Mongoose)
- AWS S3 for file storage
- JWT authentication
- Multer for uploads

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB instance (local or Atlas)
- AWS S3 bucket + credentials

### Frontend

```bash
npm install           # installs client deps via prefix
npm run dev           # starts Vite on http://localhost:8080
npm run build         # production build → /dist
```

### Backend

```bash
cd server
npm install
npm run dev           # starts API on http://localhost:6600
```

Create `server/.env`:

```env
PORT=6600
MONGO_URI=your_mongo_connection_string
JWT_SECRET=your_jwt_secret
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=...
AWS_BUCKET_NAME=...
```

## 📁 Project Structure

```
sharevault/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Guest/         # Public upload/download flows
│   │   │   ├── Dashboard/     # Authenticated user area
│   │   │   ├── Auth/          # Route guards
│   │   │   ├── Logo.jsx       # Animated SVG mark
│   │   │   ├── FeatureIcon.jsx
│   │   │   ├── Header/Footer/Login/Signup
│   │   ├── redux/             # Store + slices (auth, file)
│   │   ├── index.css          # Midnight Indigo design system
│   │   └── toast.css          # Premium animated toasts
│   └── vite.config.js
├── server/                    # Express API (do not modify)
├── package.json               # Root proxy scripts
└── README.md
```

## 🎨 Design System

- **Palette**: Midnight Indigo — deep navy backgrounds with electric violet accents
- **Typography**: Space Grotesk (display) + DM Sans (body)
- **Motion**: GPU-only transforms, respects `prefers-reduced-motion`
- **Surfaces**: Glassmorphism with aurora blobs and subtle grid textures

## 🛣 Routes

| Path | Description |
|------|-------------|
| `/` | Landing / guest upload |
| `/login` | Sign in |
| `/signup` | Create account |
| `/dashboard` | Authenticated file manager |
| `/f/:shortCode` | Authenticated download |
| `/g/:shortCode` | Guest download |

## 📜 License

MIT © [Shivam Rai](https://techwithshivam.in/)

---

<div align="center">
<sub>Built with ❤️ and a lot of gradient glow.</sub>
</div>
