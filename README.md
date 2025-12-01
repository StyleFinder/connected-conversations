# Connected Conversations

A mobile-first card-style conversation app built with Next.js 14, TypeScript, and Supabase. Display categorized questions one at a time, track completion status, and navigate through your conversation deck.

## Features

- Email/password authentication (single user)
- Category selection with toggles
- Card-based question display with shuffle
- Mark questions as completed (hides from deck)
- Previous/Next navigation between cards
- Mobile-first responsive design
- Supabase backend with RLS

## Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL with RLS)
- **Auth**: Supabase Auth (email/password)

## Database Schema

The app uses an existing Supabase project with the `connected_conversations` schema:

- **categories**: Category definitions with sort order
- **questions**: Questions linked to categories
- **question_completions**: User completion tracking (unique per user/question)

## Local Development Setup

### Prerequisites

- Node.js 18+ and npm
- Existing Supabase project with `connected_conversations` schema

### Installation

1. Clone and install dependencies:

```bash
npm install
```

2. Create environment file:

```bash
cp .env.local.example .env.local
```

3. Configure environment variables in `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Application Routes

- `/login` - Email/password authentication
- `/app` - Category selection page (protected)
- `/app/cards` - Question card view (protected)

## Project Structure

```
app/
├── app/
│   ├── (protected)/          # Protected route group
│   │   ├── page.tsx          # Category selection
│   │   └── cards/
│   │       └── page.tsx      # Card view
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── lib/
│   ├── supabaseClient.ts     # Supabase client + schema
│   ├── ccService.ts          # Service layer functions
│   └── types.ts              # TypeScript interfaces
├── login/
│   └── page.tsx              # Login page
└── middleware.ts             # Auth protection middleware
```

## Key Features Implementation

### Fisher-Yates Shuffle
Questions are randomized using the Fisher-Yates shuffle algorithm in `ccService.ts`

### Completion Tracking
- Questions marked complete are hidden from the deck
- Upsert pattern ensures one completion record per user/question
- Uncompleting a question makes it visible again

### Auth Protection
Middleware guards `/app` and `/app/cards` routes, redirecting unauthenticated users to `/login`

## Service Layer Functions

- `getCurrentUserId()` - Get authenticated user ID
- `getCategories()` - Fetch all categories
- `getIncompleteQuestions(categoryIds)` - Get shuffled incomplete questions
- `setQuestionCompletion(questionId, completed)` - Update completion status
- `signIn(email, password)` - Authenticate user
- `signOut()` - Sign out current user

## Build for Production

```bash
npm run build
npm start
```

## Notes

- This is a single-user application (shared account)
- No CMS or question editor included (v1)
- RLS policies must be configured in Supabase
- Mobile-first design optimized for small screens
