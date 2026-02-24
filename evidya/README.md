# EVIDYA - Build Proof of Thinking

A production-ready MVP for a thinking-first innovation platform where students record their thinking, growth, and practice over time.

## Features

- **Landing Page** - Clear value proposition and CTAs
- **Authentication** - Email-based signup and signin
- **Dashboard** - Personal growth summary with quick stats
- **Innovation (Ideas)** - Submit and view ideas with problem statements and approach
- **Practice (Coding Challenges)** - Solve coding problems and track submissions
- **My Profile** - View personal profile and growth timeline
- **Explore** - Discover other students' profiles and ideas
- **Aptitude** - Placeholder for future expansion

## Tech Stack

- **Frontend**: Next.js 16 with TypeScript and React
- **Styling**: Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (via Prisma ORM)
- **Authentication**: NextAuth.js

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 12+

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   Create `.env.local` with:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/evidya"
   NEXTAUTH_SECRET="your-secret-here"
   NEXTAUTH_URL="http://localhost:3000"
   ```

3. **Set up the database**
   ```bash
   npx prisma migrate dev --name init
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```
   Open http://localhost:3000

### Building for Production
```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── dashboard/            # User dashboard
│   ├── profile/              # User profile
│   ├── innovation/           # Idea submission
│   ├── practice/             # Coding challenges
│   ├── explore/              # Browse profiles
│   ├── auth/                 # Authentication
│   └── api/                  # Backend APIs
├── components/
│   ├── Nav.tsx               # Navigation
│   └── SessionProvider.tsx   # Auth provider
└── lib/
    ├── auth.ts               # NextAuth config
    └── prisma.ts             # Database client
```

## Database Schema

### Key Tables
- **User** - User profiles with interests and goals
- **Idea** - Submitted ideas and innovations
- **CodingChallenge** - Programming problems
- **Submission** - Code submissions for challenges
- **ActivityLog** - User activity tracking

## API Endpoints

### Auth
- `POST /api/auth/signup` - Create account
- `GET/POST /api/auth/[...nextauth]` - NextAuth routes

### User & Profiles
- `GET /api/user/stats` - User statistics
- `GET /api/user/activity` - Activity timeline
- `GET /api/profiles` - List profiles
- `GET /api/profiles/[id]` - Profile details

### Ideas
- `POST /api/ideas` - Submit idea
- `GET /api/ideas/[id]` - Idea details

### Challenges
- `GET /api/challenges` - List challenges
- `GET /api/challenges/[id]` - Challenge details
- `POST /api/submissions` - Submit code

## Pages & Routes

| Page | Route | Description |
|------|-------|-------------|
| Landing | `/` | Homepage with CTAs |
| Signup | `/auth/signup` | Create account |
| Signin | `/auth/signin` | Login |
| Dashboard | `/dashboard` | User home |
| My Profile | `/profile` | Own profile |
| Submit Idea | `/innovation/submit` | Create idea |
| View Idea | `/idea/[id]` | Idea details |
| Challenges | `/practice` | Browse problems |
| Challenge | `/practice/[id]` | Solve problem |
| Explore | `/explore` | Browse users |
| Public Profile | `/profile/[id]` | Other user's profile |
| Aptitude | `/aptitude` | Future feature |

## MVP Scope

✓ Email-based authentication
✓ Idea submission and viewing
✓ Coding challenge platform
✓ User profiles and discovery
✓ Activity tracking
✓ Clean, professional UI

✗ OAuth/Google login
✗ Code evaluation/execution
✗ Payments
✗ Company accounts
✗ Direct messaging

## Troubleshooting

**Database connection error**
```bash
# Check PostgreSQL is running
# Verify DATABASE_URL in .env.local
npx prisma db push
```

**Port 3000 in use**
```bash
npm run dev -- -p 3001
```

**Prisma issues**
```bash
npx prisma generate
npx prisma migrate reset  # WARNING: deletes data
```

## Database Management

Browse database with Prisma Studio:
```bash
npx prisma studio
```

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run start` - Run production build

## Learn More

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs/)
- [NextAuth.js](https://next-auth.js.org/)
- [Tailwind CSS](https://tailwindcss.com/)
