# Quick Start Guide - Connected Conversations

Get up and running in 5 minutes.

## Prerequisites

- Node.js 18+ installed
- Supabase project with `connected_conversations` schema
- User account created in Supabase Auth

## 1. Install Dependencies

```bash
npm install
```

## 2. Configure Environment

```bash
# Copy template
cp .env.local.example .env.local

# Edit .env.local with your credentials
# NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## 3. Run Development Server

```bash
npm run dev
```

Open http://localhost:3000

## 4. Database Setup (If Not Done)

Run this SQL in your Supabase SQL Editor:

```sql
-- Create tables
CREATE TABLE connected_conversations.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE connected_conversations.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES connected_conversations.categories(id),
  text TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE connected_conversations.question_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  question_id UUID REFERENCES connected_conversations.questions(id),
  completed BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, question_id)
);

-- Enable RLS
ALTER TABLE connected_conversations.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE connected_conversations.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE connected_conversations.question_completions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Categories viewable by authenticated users"
  ON connected_conversations.categories FOR SELECT TO authenticated USING (true);

CREATE POLICY "Questions viewable by authenticated users"
  ON connected_conversations.questions FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can view own completions"
  ON connected_conversations.question_completions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own completions"
  ON connected_conversations.question_completions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own completions"
  ON connected_conversations.question_completions FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Insert sample data
INSERT INTO connected_conversations.categories (name, description, sort_order) VALUES
  ('Getting to Know You', 'Introductory questions', 1),
  ('Deep Conversations', 'Thought-provoking topics', 2),
  ('Fun & Light', 'Casual conversation starters', 3);

INSERT INTO connected_conversations.questions (category_id, text) VALUES
  ((SELECT id FROM connected_conversations.categories WHERE name = 'Getting to Know You'),
   'What is your favorite childhood memory?'),
  ((SELECT id FROM connected_conversations.categories WHERE name = 'Deep Conversations'),
   'What does success mean to you?'),
  ((SELECT id FROM connected_conversations.categories WHERE name = 'Fun & Light'),
   'If you could have dinner with anyone, who would it be?');
```

## 5. Create User Account

In Supabase Dashboard:
1. Go to Authentication → Users
2. Click "Add user"
3. Enter email: `test@example.com`
4. Enter password: `password123`
5. Click "Create user"

## 6. Test the App

1. Go to http://localhost:3000
2. Login with `test@example.com` / `password123`
3. Select categories
4. Click "Start / Continue"
5. View questions and mark them complete

## Production Deployment

### Deploy to Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

Or use the Vercel dashboard:
1. Import GitHub repository
2. Add environment variables
3. Deploy

## Troubleshooting

### "Missing Supabase environment variables"
- Check `.env.local` exists and has correct values
- Ensure variables start with `NEXT_PUBLIC_`
- Restart dev server after changing .env

### "Login fails"
- Verify user exists in Supabase Auth
- Check Supabase URL and anon key are correct
- Look for errors in browser console

### "No categories shown"
- Run the SQL to insert sample data
- Check RLS policies are enabled
- Verify schema name is `connected_conversations`

### "Questions not loading"
- Ensure questions have `is_active = true`
- Check `category_id` foreign keys are valid
- Verify RLS policies allow reading

## Available Scripts

```bash
npm run dev      # Start development server (port 3000)
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Project Structure

```
app/
├── app/                    # Next.js routes
│   ├── (protected)/        # Auth-protected pages
│   ├── login/              # Login page
│   └── layout.tsx          # Root layout
├── lib/                    # Service layer
│   ├── ccService.ts        # Business logic
│   ├── supabaseClient.ts   # DB client
│   └── types.ts            # TypeScript types
└── middleware.ts           # Auth protection
```

## Next Steps

1. **Customize Categories**: Add your own conversation categories
2. **Add Questions**: Populate with your question deck
3. **Styling**: Adjust Tailwind classes to match your brand
4. **Deploy**: Push to production on Vercel/Netlify

## Documentation

- **README.md** - Full setup instructions
- **DEPLOYMENT.md** - Production deployment guide
- **API_REFERENCE.md** - Service function docs
- **STRUCTURE.md** - Project structure details

## Support

For issues:
1. Check console for error messages
2. Verify environment variables
3. Review Supabase RLS policies
4. Check DEPLOYMENT.md troubleshooting section

---

**Ready to connect!** 🎉
