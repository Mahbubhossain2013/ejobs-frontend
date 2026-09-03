# eJobs Frontend

**Version:** 2.0.0  
**Framework:** Next.js 16 (App Router, Turbopack)  
**UI:** Tailwind CSS 4, shadcn/ui, Radix UI, Lucide icons  
**State:** Zustand (persist), React Query (TanStack Query v5)  
**Auth:** Laravel Sanctum (Bearer tokens)  
**Language:** TypeScript 6

## Tech Stack

- **Framework:** Next.js 16 with App Router
- **Styling:** Tailwind CSS 4 with custom design tokens
- **UI Components:** shadcn/ui + Radix UI primitives
- **Icons:** Lucide React
- **State Management:** Zustand (client state), TanStack Query (server state)
- **HTTP Client:** Axios with interceptors
- **Realtime:** Laravel Echo + Pusher/Reverb
- **Forms:** React Hook Form + Zod validation
- **Rich Text:** TipTap editor
- **PDF Export:** jsPDF + AutoTable
- **Security:** DOMPurify for HTML sanitization

## Getting Started

### Prerequisites

- Node.js >= 22.13.0
- npm >= 10.0.0
- Backend server running at configured `NEXT_PUBLIC_API_URL`

### Installation

```bash
# Clone repository
git clone https://github.com/beingniloy/eJobs.git
cd eJobs/frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your API URL

# Start development server
npm run dev
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Laravel backend API URL | `http://127.0.0.1:8000` |
| `NEXT_PUBLIC_APP_NAME` | Application name | `eJobs` |
| `NEXT_PUBLIC_APP_URL` | Frontend URL | `http://localhost:3000` |

### Build for Production

```bash
# Install production dependencies
npm ci --production=false

# Build
npm run build

# Start
npm start
```

**Note:** The build script uses `cross-env NODE_OPTIONS='--max-old-space-size=8192'` to prevent OOM errors during TypeScript compilation.

### Docker Deployment

```bash
docker build -t ejobs-frontend .
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=https://admin.ejobs.bd \
  -e NEXT_PUBLIC_APP_NAME=eJobs \
  -e NEXT_PUBLIC_APP_URL=https://ejobs.bd \
  ejobs-frontend
```

The Dockerfile uses multi-stage build with `node:22-alpine` and `output: standalone`.

## Project Structure

```
src/
├── app/                        # Next.js App Router
│   ├── (auth)/                 # Authentication pages
│   │   ├── login/
│   │   ├── register/
│   │   ├── forgot-password/
│   │   └── callback/           # OAuth callbacks
│   ├── (dashboard)/            # Candidate dashboard
│   │   ├── dashboard/
│   │   ├── wallet/
│   │   ├── settings/
│   │   ├── verify/
│   │   └── ...
│   ├── (employer)/             # Employer dashboard
│   │   ├── dashboard/
│   │   ├── wallet/
│   │   ├── jobs/
│   │   ├── applicants/
│   │   └── ...
│   ├── ai-assistant/           # AI career chat
│   ├── companies/              # Company listings
│   ├── jobs/                   # Job listings & detail
│   ├── cv/                     # CV preview & builder
│   ├── messages/               # Real-time chat
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Homepage
│   └── globals.css             # Global styles
├── components/
│   ├── auth/                   # Social login, auth forms
│   ├── cv/                     # CV builder components
│   ├── jobs/                   # Job cards, filters
│   ├── layout/                 # Navbar, Footer, Sidebar
│   ├── dashboard/              # Dashboard widgets
│   ├── ui/                     # shadcn/ui primitives
│   └── ...
├── hooks/                      # Custom React hooks
├── lib/
│   ├── api-client.ts           # Axios instance with interceptors
│   ├── utils.ts                # Utility functions
│   ├── currency.ts             # Currency conversion
│   └── bd-data.ts              # Bangladesh-specific data
├── providers/                  # Context providers
│   ├── auth-provider.tsx
│   ├── query-provider.tsx
│   └── theme-provider.tsx
├── services/                   # API service layer
│   ├── auth.service.ts
│   ├── jobs.service.ts
│   └── ...
├── store/                      # Zustand stores
│   ├── auth-store.ts
│   ├── theme-store.ts
│   └── notification-store.ts
└── types/                      # TypeScript interfaces
```

## Key Routes

| Route | Description |
|-------|-------------|
| `/` | Homepage with job search, categories, companies |
| `/jobs` | Job listings with filters |
| `/jobs/[id]` | Job detail with JSON-LD structured data |
| `/companies` | Company directory |
| `/resume-builder` | AI-powered CV builder with templates |
| `/ai-assistant` | AI career chat assistant |
| `/pricing` | Subscription plans |
| `/dashboard/*` | Candidate dashboard (wallet, profile, applications) |
| `/employer/*` | Employer dashboard (post jobs, applicants, wallet) |
| `/payment/eps/callback` | EPS payment callback |

## Features

- **Authentication:** Email/password, Google, Facebook
- **Job Board:** Search, filter, apply, save jobs
- **CV Builder:** AI-powered with multiple templates, PDF export
- **Wallet:** Deposit via bKash/Nagad/Rocket/SSLCommerz/EPS, withdrawal
- **Escrow:** Secure payment holding for freelance projects
- **Real-time Chat:** Between employers and candidates
- **AI Assistant:** Career guidance, job matching
- **Admin Panel:** Filament v3 at `/admin`
- **Responsive:** Mobile-first design with dark mode

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (Turbopack) |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run type-check` | TypeScript type checking |

## Deployment Notes

1. Set `NODE_ENV=production`
2. Configure `NEXT_PUBLIC_API_URL` to point to backend
3. Build with `npm run build`
4. Start with `npm start`
5. For production, use process manager like PM2 or Docker

## License

Proprietary — [Nextin BD](https://nextinbd.com)
