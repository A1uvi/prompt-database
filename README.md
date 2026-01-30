# AI Prompt Database

A production-ready system for managing, sharing, and discovering AI prompts and conversations across private teams.

## Tech Stack

- **Framework**: Next.js 14+ (App Router) with React 18+ and TypeScript
- **Styling**: Tailwind CSS + Radix UI
- **State Management**: Zustand (UI state) + TanStack Query (server state)
- **API**: tRPC (end-to-end type safety)
- **Authentication**: NextAuth.js v5 (Auth.js)
- **Database**: PostgreSQL 15+ with Prisma ORM
- **Hosting**: Vercel (frontend/API) + Neon or Supabase (database)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (local or hosted)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd prompt-database
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your database URL and NextAuth secret.

4. Generate Prisma Client and push schema to database:
```bash
npm run db:push
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `NEXTAUTH_URL` | Application URL (e.g., http://localhost:3000) | Yes |
| `NEXTAUTH_SECRET` | Random secret for session encryption | Yes |
| `MEILISEARCH_HOST` | Meilisearch host URL (Phase 3) | No |
| `MEILISEARCH_API_KEY` | Meilisearch API key (Phase 3) | No |
| `SENTRY_DSN` | Sentry DSN for error tracking (Phase 4) | No |

### Generating NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

## Authentication

This application uses username/password authentication with NextAuth.js (Auth.js).

### First-Time Setup

1. Start the application: `npm run dev`
2. Navigate to [http://localhost:3000/signup](http://localhost:3000/signup)
3. Create an account with:
   - Username (3-20 characters, alphanumeric and underscores only)
   - Password (minimum 8 characters)
   - Optional: Name and Email
4. You'll be automatically signed in and redirected to the dashboard

### Security Features

- Passwords are hashed using bcrypt (10 rounds)
- JWT-based sessions for scalability
- Input validation with Zod
- Username uniqueness enforced at database level

## Database Setup

### Using Neon (Recommended for development)

1. Sign up at [neon.tech](https://neon.tech/)
2. Create a new project
3. Copy the connection string to `DATABASE_URL` in `.env.local`

### Using Supabase

1. Sign up at [supabase.com](https://supabase.com/)
2. Create a new project
3. Go to Settings > Database
4. Copy the connection string (use "Connection pooling" for production)

### Local PostgreSQL

```bash
# Install PostgreSQL (macOS)
brew install postgresql

# Start PostgreSQL
brew services start postgresql

# Create database
createdb prompt_database

# Set DATABASE_URL
DATABASE_URL="postgresql://localhost:5432/prompt_database"
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:push` - Push Prisma schema to database
- `npm run db:studio` - Open Prisma Studio
- `npm run db:migrate` - Create and apply migrations
- `npm run db:generate` - Generate Prisma Client

## Project Structure

```
/prompt-database
├── /app                    # Next.js App Router
│   ├── (auth)             # Auth routes (login, signup)
│   ├── (dashboard)        # Main app routes (protected)
│   └── /api               # API routes (tRPC, NextAuth)
├── /components
│   ├── /ui                # Radix UI components
│   ├── /prompts           # Prompt-related components
│   ├── /folders           # Folder components
│   ├── /teams             # Team components
│   └── /layout            # Layout components
├── /lib
│   ├── /trpc              # tRPC setup
│   ├── /auth              # NextAuth config
│   ├── /permissions       # Permission checking
│   └── /utils             # Utility functions
├── /server
│   └── /routers           # tRPC routers
├── /prisma
│   └── schema.prisma      # Database schema
└── /public                # Static assets
```

## Features

### Phase 1: MVP (Current)
- ✅ User authentication (username/password)
- ✅ Create/edit/delete prompts
- ✅ Folder organization
- ✅ Basic search (PostgreSQL full-text)
- ✅ Private/public visibility
- ✅ Permission system
- ✅ tRPC API with type safety

### Phase 2: Sharing & Teams (In Progress)
- 🚧 Create teams
- 🚧 Team-based permissions
- 🚧 Co-creator system
- 🚧 Share modal
- 🚧 Email notifications

### Phase 3: Advanced Features
- ⏳ Meilisearch integration
- ⏳ Version history
- ⏳ Activity tracking
- ⏳ Template variables

### Phase 4: Polish & Production
- ⏳ Performance optimization
- ⏳ Accessibility (WCAG AA)
- ⏳ Error monitoring (Sentry)
- ⏳ Analytics

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Deploy

Vercel will automatically:
- Build the Next.js application
- Set up serverless functions for API routes
- Configure custom domains and SSL

### Database Hosting

For production, use:
- **Neon**: Serverless PostgreSQL with generous free tier
- **Supabase**: PostgreSQL + additional features (auth, storage, realtime)
- **Railway**: Simple PostgreSQL deployment

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
