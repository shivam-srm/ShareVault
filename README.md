<div align="center">

# 🔐 ShareVault

### Premium file sharing with built-in AI intelligence.

Drag, drop, and get a beautiful shareable link in under a second. Ask questions about your documents, chat with an AI assistant, and scan files for sensitive data — all wrapped in a cinematic Midnight Indigo UI.

**Crafted by [Shivam Rai](https://techwithshivam.in/)**

![Made with React](https://img.shields.io/badge/React-18-61dafb?style=for-the-badge&logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646cff?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-3-06b6d4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Node](https://img.shields.io/badge/Node-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47a248?style=for-the-badge&logo=mongodb&logoColor=white)
![AWS S3](https://img.shields.io/badge/AWS-S3-ff9900?style=for-the-badge&logo=amazonaws&logoColor=white)
![OpenRouter](https://img.shields.io/badge/OpenRouter-AI-5a3ee0?style=for-the-badge)

</div>

---

## ✨ What is ShareVault?

ShareVault is a full-stack file sharing platform with a modern React frontend, an Express + MongoDB backend, and AWS S3 storage. It supports both guest mode (no sign-up required) and authenticated user accounts, with AI features powered entirely by OpenRouter.

## ✨ Features

- ⚡ **Lightning uploads** — multi-file drag & drop with animated progress
- 🔒 **Password protected links** — lock any file, set expiry dates
- 🔗 **Beautiful share links** — short URLs + instant QR codes
- 🌍 **Guest mode** — no signup required to share or download
- 📊 **Track everything** — downloads, expiry countdowns, file status
- 🤖 **AI Document Analysis** — one-click summary, document type, keywords, security risk & sensitive data scan
- 💬 **Grounded Q&A** — ask questions answered strictly from an uploaded document
- 🧠 **Vault Assistant** — AI chat inside the dashboard (supports screenshots, PDFs, DOCX and text attachments)
- 🏠 **Public Landing Assistant** — AI chat widget on the home page for visitors
- ✨ **Premium by default** — Midnight Indigo glassmorphic UI with cinematic motion
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
- OpenRouter for all AI features (chat, document analysis, vision)
- JWT authentication
- Multer for uploads

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB instance (local or Atlas)
- AWS S3 bucket + credentials
- OpenRouter API key (for all AI features)

### 1. Install dependencies

Install both the client and server dependencies in one command from the project root:

```bash
npm install
```

This runs `npm install` in both `client/` and `server/` because of the `postinstall` script.

### 2. Configure environment variables

Create `server/.env`:

```env
# ---------- Server ----------
PORT=6600
NODE_ENV=development
CLIENT_URL=http://localhost:8080

# ---------- Database ----------
MONGODB_URI=your_mongodb_connection_string

# ---------- Auth ----------
JWT_SECRET=change_me_to_a_long_random_string

# ---------- AWS S3 ----------
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=ap-south-1
AWS_BUCKET_NAME=your_bucket_name

# ---------- OpenRouter AI (required for all AI features) ----------
OPENROUTER_API_KEY=your_openrouter_key_here
OPENROUTER_MODEL=deepseek/deepseek-chat-v3-0324:free
# Optional: vision model for image/screenshot attachments in Vault Assistant
OPENROUTER_VISION_MODEL=google/gemini-2.0-flash-exp:free
```

The frontend already proxies `/api` requests to the backend at `http://localhost:6600` via the `VITE_API_PROXY_TARGET` defined in `client/.env`. If you change the backend port, update that value too.

### 3. Run the app

**Run both frontend and backend at once:**

```bash
npm run dev:all
```

- Frontend: http://localhost:8080
- Backend: http://localhost:6600

**Run separately:**

```bash
# Terminal 1 — server
npm run dev:server

# Terminal 2 — client
npm run dev:client
```

### 4. Build for production

```bash
npm run build
```

This builds the React app into `/dist` and can be served by the Express backend (static hosting is configured in `server/src/index.js`).

## 📁 Project Structure

```
sharevault/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Guest/         # Public upload, download, and assistant flows
│   │   │   ├── Dashboard/     # Authenticated user area
│   │   │   ├── Auth/          # Route guards (RequireAuth, NotRequireAuth)
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
│   │   ├── models/            # Mongoose schemas (AIAnalysis, File, GuestFile, User)
│   │   ├── routes/            # Express routes (ai, file, user)
│   │   ├── services/          # AI + PDF/DOCX text extraction service
│   │   ├── middlewares/       # Auth, upload, validation
│   │   └── config/            # AWS S3, DB config
│   └── package.json
├── package.json               # Root scripts that run both workspaces
└── README.md
```

## 🤖 AI Features

All AI features use **OpenRouter** only. Set `OPENROUTER_API_KEY` in `server/.env` to enable them.

### AI Document Analysis (authenticated)

Upload a supported document (PDF, DOCX, TXT) in the dashboard and click the **AI** button on any file to get:

| Field | Description |
|-------|-------------|
| `Summary` | Concise document summary |
| `Document Type` | academic, code, legal, invoice, image or other |
| `Keywords` | Top relevant keywords extracted from the text |
| `Security Risk` | LOW, MEDIUM or HIGH based on sensitive data found |
| `Sensitive Data` | Detected emails, phone numbers, passwords, API keys, PII, etc. |
| `Q&A` | Ask follow-up questions answered strictly from the document |

Results are cached in MongoDB so the same file is never analyzed twice.

### Vault Assistant (authenticated)

A floating chat widget in the dashboard. You can:
- Ask general questions
- Attach screenshots for image analysis
- Attach PDFs, DOCX, or TXT files to extract text and ask questions

Attachment size limit: 8 MB.

### Public Landing Assistant (guest)

A chat widget on the home page for visitors. Useful for answering questions about ShareVault without requiring a login.

### AI API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/public-chat` | Public chat on the landing page |
| POST | `/api/ai/chat` | Authenticated Vault Assistant chat |
| POST | `/api/ai/chat-attachment` | Chat with a file/screenshot attached |
| POST | `/api/ai/analyze/:fileId` | Analyze or fetch cached analysis |
| GET | `/api/ai/analysis/:fileId` | Get existing analysis |
| POST | `/api/ai/ask/:fileId` | Ask a question about a document |

## 🎨 Design System

- **Palette**: Midnight Indigo — deep navy backgrounds with electric violet accents
- **Typography**: Space Grotesk (display) + DM Sans (body)
- **Motion**: GPU-only transforms, respects `prefers-reduced-motion`
- **Surfaces**: Glassmorphism with aurora blobs and subtle grid textures

## 🛣 Routes

| Path | Description |
|------|-------------|
| `/` | Landing / guest upload + public assistant |
| `/login` | Sign in |
| `/signup` | Create account |
| `/dashboard` | Authenticated file manager + Vault Assistant |
| `/download/:shortCode` | Download a shared file |
| `/g/:shortCode` | Guest download route |

## 📜 License

MIT © [Shivam Rai](https://techwithshivam.in/)

---

<div align="center">
<sub>Built with ❤️ and a lot of gradient glow.</sub>
</div>
