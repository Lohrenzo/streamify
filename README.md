# 🎥 Next.js Live Streaming Platform

A **modern full-stack TypeScript application** built with **Next.js 15**, providing live video streaming, user authentication, and video management — all in one unified project.  
The app leverages **WebRTC** for real-time broadcasting, **Next.js API routes** for backend logic, and **NextAuth.js** for secure authentication.

---

## 🚀 Features

### 🔴 Live Streaming (WebRTC)
- Start a live broadcast directly from your browser (`/live/start`)
- Viewers can watch streams in real-time (`/watch/[id]`)
- Automatic handling of ICE candidates, signaling, and peer connections
- Real-time updates on stream status (Connected / Disconnected / Ended)

### 👥 Authentication
- Secure login, signup, and session management using **NextAuth**
- OAuth and credential-based login support
- Persistent user sessions and profile data

### 🎞️ Video Management
- Upload, list, and manage videos via `/api/videos`
- Support for comments and likes through dynamic API routes (`/api/videos/[id]/comments`, `/api/videos/[id]/likes`)
- View profiles of broadcasters via `/profile/[id]`

### 💬 Chat Integration
- Real-time chat system via WebSocket channels (`/chat/[id]`)
- Enables user-to-user or stream-related discussions

### 🧠 TypeScript End-to-End
- Strong typing across both frontend and backend
- Reusable interfaces for API responses and entities

### ⚙️ Unified Backend with Next.js API Routes
- Server-side logic lives under `app/api`
- No need for a separate Node.js/Express backend
- Includes endpoints for:
  - Authentication (`app/api/auth/[...nextauth]/route.ts`)
  - Upload handling (`app/api/upload/route.ts`)
  - Video management (`app/api/videos`)
  - User data (`app/api/users/[id]/route.ts`)
  - WebSocket signaling server for WebRTC (`app/api/ws`)

---

## 📁 Project Structure

```
app/
├── actions/
│   └── auth.ts
│
├── api/
│   ├── auth/[...nextauth]/route.ts
│   ├── upload/route.ts
│   ├── users/[id]/route.ts
│   ├── videos/
│   │   ├── [id]/comments/
│   │   ├── [id]/likes/
│   │   └── [id]/route.ts
│   │   └── route.ts
│   └── ws/route.ts
│
├── auth/
│   ├── error/page.tsx
│   ├── signin/page.tsx
│   └── signup/page.tsx
│
├── chat/
│   ├── [id]/page.tsx
│   └── page.tsx
│
├── live/
│   ├── start/page.tsx
│   └── page.tsx
│
├── profile/[id]/page.tsx
├── search/page.tsx
├── videos/[id]/page.tsx
│
├── layout.tsx
├── providers.tsx
└── globals.css
```

---

## 🧩 Key Files and Responsibilities

### `app/live/start/page.tsx`
Handles **live broadcasting** via WebRTC.

### `app/watch/[id]/page.tsx`
Handles **viewing live streams** in real-time.

### `app/api/ws/route.ts`
Implements **WebSocket signaling** for peer-to-peer communication.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-------------|
| **Frontend** | React 19 + Next.js 15 (App Router) |
| **Backend** | Next.js API Routes |
| **Auth** | NextAuth.js |
| **Database** | Optional (Prisma, PostgreSQL, etc.) |
| **Real-Time** | WebRTC + WebSocket |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS |
| **Deployment** | Vercel / Node.js |

---

## ⚡ Getting Started

```bash
git clone https://github.com/yourusername/live-stream-app.git
cd live-stream-app
npm install
```

Create `.env.local`:
```env
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=http://localhost:3000
DATABASE_URL=your_database_url
```

Run development server:
```bash
npm run dev
```

Access at: http://localhost:3000

---

## 🎬 Using the Live Streaming Feature

1. Start broadcast: `/live/start`
2. Share watch URL: `/watch/[id]`
3. Viewers connect automatically
4. Close tab to end stream

---

## 🧰 Scripts

| Command | Description |
|----------|-------------|
| `npm run dev` | Run development server |
| `npm run build` | Build production bundle |
| `npm start` | Run production build |
| `npm run lint` | Lint TypeScript code |

---

## 🧠 Future Enhancements
- Add TURN server support
- Integrate Prisma DB
- Live chat overlay
- Viewer count tracking
- Recording support

---

## 👨‍💻 Author

**Your Name**  
Built with ❤️ using Next.js + TypeScript

---

## 📝 License

MIT License
