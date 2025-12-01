# Deployment Guide - Connected Conversations

## Prerequisites

1. **Supabase Project Setup**
   - Existing Supabase project with `connected_conversations` schema
   - Database tables: `categories`, `questions`, `question_completions`
   - Row Level Security (RLS) policies configured
   - At least one user account created

2. **Environment Variables**
   - `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous/public key

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local` file:
```bash
cp .env.local.example .env.local
```

3. Add your Supabase credentials to `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

4. Run development server:
```bash
npm run dev
```

5. Open http://localhost:3000

## Production Build

Test production build locally:
```bash
npm run build
npm start
```

## Deploy to Vercel

1. Push code to GitHub repository

2. Import project in Vercel:
   - Go to https://vercel.com/new
   - Import your repository
   - Configure project settings

3. Add environment variables in Vercel:
   - Go to Project Settings → Environment Variables
   - Add `NEXT_PUBLIC_SUPABASE_URL`
   - Add `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. Deploy:
   - Vercel will automatically build and deploy
   - Subsequent pushes to main branch auto-deploy

## Deploy to Other Platforms

### Netlify

1. Build command: `npm run build`
2. Publish directory: `.next`
3. Add environment variables in Netlify UI

### Railway / Render

1. Build command: `npm run build`
2. Start command: `npm start`
3. Add environment variables in platform UI

## Database Setup

Ensure your Supabase database has:

### Tables

```sql
-- Categories table
CREATE TABLE connected_conversations.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Questions table
CREATE TABLE connected_conversations.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES connected_conversations.categories(id),
  text TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Question completions table
CREATE TABLE connected_conversations.question_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  question_id UUID REFERENCES connected_conversations.questions(id),
  completed BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, question_id)
);
```

### RLS Policies

Enable RLS on all tables and create appropriate policies:

```sql
-- Enable RLS
ALTER TABLE connected_conversations.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE connected_conversations.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE connected_conversations.question_completions ENABLE ROW LEVEL SECURITY;

-- Example policies (adjust based on your auth setup)
-- Categories: readable by authenticated users
CREATE POLICY "Categories are viewable by authenticated users"
  ON connected_conversations.categories
  FOR SELECT
  TO authenticated
  USING (true);

-- Questions: readable by authenticated users
CREATE POLICY "Questions are viewable by authenticated users"
  ON connected_conversations.questions
  FOR SELECT
  TO authenticated
  USING (true);

-- Completions: users can view and edit their own completions
CREATE POLICY "Users can view their own completions"
  ON connected_conversations.question_completions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own completions"
  ON connected_conversations.question_completions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own completions"
  ON connected_conversations.question_completions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

## User Account Setup

Create a user account in Supabase:

1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add user"
3. Enter email and password
4. User will be able to log in to the app

## Post-Deployment Checklist

- [ ] Environment variables configured
- [ ] Database tables created
- [ ] RLS policies enabled
- [ ] User account created
- [ ] Categories populated
- [ ] Questions populated
- [ ] Test login functionality
- [ ] Test category selection
- [ ] Test card navigation
- [ ] Test completion toggle
- [ ] Verify mobile responsiveness

## Troubleshooting

### Login fails
- Check Supabase URL and anon key are correct
- Verify user exists in Supabase Auth
- Check browser console for errors

### No categories shown
- Verify categories table has data
- Check RLS policies allow reading
- Verify database schema name is correct

### Questions not loading
- Check questions table has data
- Verify questions have `is_active = true`
- Check category_id foreign keys are valid
- Verify RLS policies allow reading

### Completions not saving
- Check RLS policies allow insert/update
- Verify user_id matches authenticated user
- Check browser console for errors

## Performance Optimization

For production:

1. **Image Optimization**: Use Next.js Image component for any images
2. **Caching**: Configure appropriate cache headers
3. **Database Indexes**: Add indexes on frequently queried columns
4. **Connection Pooling**: Use Supabase connection pooling for high traffic

## Security Considerations

1. **Environment Variables**: Never commit .env.local to git
2. **RLS Policies**: Always use RLS to protect data
3. **API Keys**: Use anon key only, never service role key in frontend
4. **HTTPS**: Always use HTTPS in production
5. **Auth**: Consider adding rate limiting to login endpoint
