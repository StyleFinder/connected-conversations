# Project Structure

## Directory Tree

```
connected-conversations/app/
├── app/                          # Next.js App Router
│   ├── (protected)/              # Route group (auth protected)
│   │   ├── page.tsx              # /app route - Category selection
│   │   └── cards/
│   │       └── page.tsx          # /app/cards route - Card view
│   ├── layout.tsx                # Root layout (HTML/metadata)
│   ├── globals.css               # Global styles (Tailwind)
│   └── page.tsx                  # / root - Redirect to login
│
├── lib/                          # Service layer
│   ├── supabaseClient.ts         # Supabase client + schema
│   ├── ccService.ts              # Business logic functions
│   └── types.ts                  # TypeScript interfaces
│
├── login/                        # Login route
│   └── page.tsx                  # /login route - Authentication
│
├── middleware.ts                 # Auth middleware (route protection)
├── .env.local.example            # Environment template
├── README.md                     # Setup & dev instructions
├── DEPLOYMENT.md                 # Production deployment guide
├── API_REFERENCE.md              # Service layer documentation
├── PROJECT_SUMMARY.md            # Project overview
└── package.json                  # Dependencies & scripts
```

## File Purposes

### App Router (`app/`)

| File | Route | Purpose |
|------|-------|---------|
| `page.tsx` | `/` | Redirects to `/login` |
| `layout.tsx` | All routes | Root HTML, metadata, global CSS |
| `globals.css` | All routes | Tailwind directives |
| `(protected)/page.tsx` | `/app` | Category selection interface |
| `(protected)/cards/page.tsx` | `/app/cards` | Question card viewer |

### Authentication (`login/`)

| File | Route | Purpose |
|------|-------|---------|
| `page.tsx` | `/login` | Email/password login form |

### Service Layer (`lib/`)

| File | Exports | Purpose |
|------|---------|---------|
| `supabaseClient.ts` | `supabase`, `ccDb` | Supabase client instances |
| `ccService.ts` | 7 functions | Auth, data operations, shuffle |
| `types.ts` | 4 interfaces | TypeScript type definitions |

### Middleware

| File | Purpose |
|------|---------|
| `middleware.ts` | Protects `/app/*` routes, redirects based on auth |

### Documentation

| File | Content |
|------|---------|
| `README.md` | Local development setup |
| `DEPLOYMENT.md` | Production deployment + database setup |
| `API_REFERENCE.md` | Complete service function reference |
| `PROJECT_SUMMARY.md` | High-level project overview |
| `STRUCTURE.md` | This file (directory structure) |

## Route Protection

### Public Routes
- `/` - Redirects to `/login`
- `/login` - Accessible when logged out

### Protected Routes (requires auth)
- `/app` - Category selection
- `/app/cards` - Card view

### Middleware Behavior
```
User not authenticated → Trying to access /app/* → Redirect to /login
User authenticated → Trying to access /login → Redirect to /app
```

## Data Flow

### Category Selection Flow
```
/app page.tsx
  ↓
getCategories() → ccService.ts
  ↓
ccDb.from('categories') → supabaseClient.ts
  ↓
Supabase connected_conversations.categories
  ↓
Display categories with toggles
  ↓
Store selected IDs in localStorage
  ↓
Navigate to /app/cards
```

### Card View Flow
```
/app/cards page.tsx
  ↓
Read localStorage for category IDs
  ↓
getIncompleteQuestions(categoryIds) → ccService.ts
  ↓
ccDb queries questions + completions → supabaseClient.ts
  ↓
Filter completed questions
  ↓
Shuffle with Fisher-Yates
  ↓
Display first card with navigation
  ↓
Mark complete → setQuestionCompletion() → ccService.ts
  ↓
Upsert to question_completions table
```

## Import Paths

TypeScript path mapping configured in `tsconfig.json`:
```json
{
  "paths": {
    "@/*": ["./*"]
  }
}
```

### Usage Examples
```typescript
// Service layer
import { getCategories } from '@/lib/ccService';
import { Category } from '@/lib/types';
import { supabase, ccDb } from '@/lib/supabaseClient';

// Next.js
import { redirect } from 'next/navigation';
import { useRouter } from 'next/navigation';
```

## Environment Configuration

### Development
```
.env.local (gitignored)
  ├── NEXT_PUBLIC_SUPABASE_URL
  └── NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### Production
Set in hosting platform dashboard:
- Vercel: Project Settings → Environment Variables
- Netlify: Site Settings → Environment Variables
- Railway/Render: Environment tab

## Key Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.0.6 | React framework with App Router |
| React | Latest | UI library |
| TypeScript | Latest | Type safety |
| Tailwind CSS | v4 | Utility-first styling |
| Supabase JS | Latest | Database + Auth client |
| @supabase/ssr | Latest | Server-side auth helpers |

## Build Output

Production build generates:
- Static pages for `/`, `/login` (prerendered)
- Server components for `/app`, `/app/cards`
- Middleware proxy for auth protection
- Optimized CSS bundle
- TypeScript type checking
