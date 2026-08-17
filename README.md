<div align="center">

# 🔐 ShareVault

### Premium file sharing at the speed of thought.

Drag, drop, and get a beautiful shareable link in under a second.  
Now with AI-powered document analysis and grounded Q&A.

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
- 🤖 **AI Document Analysis** — one-click summary, document type, keywords, security risk & sensitive data scan
- 💬 **Grounded Q&A** — ask questions directly from an uploaded document's content
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

**Backend** (`server/`)
- Node.js + Express
- MongoDB (Mongoose)
- AWS S3 for file storage
- OpenRouter for AI document analysis
- JWT authentication
- Multer for uploads

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB instance (local or Atlas)
- AWS S3 bucket + credentials
- OpenRouter API key (for AI features)

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
NODE_ENV=development
CLIENT_URL=http://localhost:8080

MONGODB_URI=your_mongo_connection_string
JWT_SECRET=your_jwt_secret

AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=...
AWS_BUCKET_NAME=...

# Optional: Mail
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...

# Required for AI Document Analysis
OPENROUTER_API_KEY=your_openrouter_key_here
OPENROUTER_MODEL=deepseek/deepseek-chat-v3-0324:free

# Optional: Vault Assistant chat
LOVABLE_API_KEY=your_lovable_api_key_here
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
│   │   ├── redux/             # Store + slices (auth, file, ai)
│   │   ├── index.css          # Midnight Indigo design system
│   │   └── toast.css          # Premium animated toasts
│   └── vite.config.js
├── server/                    # Express API
│   ├── src/
│   │   ├── controllers/       # Route handlers (ai, file, user)
│   │   ├── models/            # Mongoose schemas (AIAnalysis, File, User)
│   │   ├── routes/            # Express routes (ai, file, user)
│   │   ├── services/          # AI + PDF/DOCX text extraction service
│   │   └── config/            # AWS S3, DB config
│   └── package.json
├── package.json               # Root proxy scripts
└── README.md
```

## 🤖 AI Document Analysis

Upload a supported document (PDF, DOCX, TXT) and click the **AI** button on any file in the dashboard to get:

| Field | Description |
|-------|-------------|
| `Summary` | Concise document summary |
| `Document Type` | academic, code, legal, invoice, image or other |
| `Keywords` | Top relevant keywords extracted from the text |
| `Security Risk` | LOW, MEDIUM or HIGH based on sensitive data found |
| `Sensitive Data` | Detected emails, phone numbers, passwords, API keys, PII, etc. |
| `Q&A` | Ask follow-up questions answered strictly from the document |

**AI endpoints** (authenticated):

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/analyze/:fileId` | Analyze or fetch cached analysis |
| GET | `/api/ai/analysis/:fileId` | Get existing analysis |
| POST | `/api/ai/ask/:fileId` | Ask a question about the document |

Results are cached in MongoDB so the same file is never analyzed twice.

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
