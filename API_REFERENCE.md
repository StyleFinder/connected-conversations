# API Reference - Connected Conversations Service Layer

## Service Functions (`lib/ccService.ts`)

### Authentication

#### `signIn(email: string, password: string)`
Authenticate user with email and password.

```typescript
import { signIn } from '@/lib/ccService';

try {
  const data = await signIn('user@example.com', 'password');
  // Redirect to /app on success
} catch (error) {
  // Handle authentication error
}
```

**Returns**: Session data from Supabase
**Throws**: Authentication error if credentials invalid

---

#### `signOut()`
Sign out the current user.

```typescript
import { signOut } from '@/lib/ccService';

try {
  await signOut();
  // Redirect to /login
} catch (error) {
  // Handle sign out error
}
```

**Returns**: void
**Throws**: Error if sign out fails

---

#### `getCurrentUserId()`
Get the authenticated user's ID.

```typescript
import { getCurrentUserId } from '@/lib/ccService';

const userId = await getCurrentUserId();
if (!userId) {
  // User not authenticated
}
```

**Returns**: `string | null` - User ID or null if not authenticated
**Throws**: None

---

### Categories

#### `getCategories()`
Fetch all categories sorted by sort_order.

```typescript
import { getCategories } from '@/lib/ccService';
import { Category } from '@/lib/types';

try {
  const categories: Category[] = await getCategories();
  // Display categories to user
} catch (error) {
  // Handle fetch error
}
```

**Returns**: `Category[]` - Array of category objects
**Throws**: Database error if fetch fails

**Category Type**:
```typescript
interface Category {
  id: string;
  name: string;
  description: string | null;
  sort_order: number;
  created_at: string;
}
```

---

### Questions

#### `getIncompleteQuestions(categoryIds: string[])`
Fetch incomplete questions for selected categories, shuffled using Fisher-Yates algorithm.

```typescript
import { getIncompleteQuestions } from '@/lib/ccService';
import { QuestionWithCategory } from '@/lib/types';

try {
  const categoryIds = ['uuid-1', 'uuid-2', 'uuid-3'];
  const questions: QuestionWithCategory[] = await getIncompleteQuestions(categoryIds);
  // Display shuffled questions
} catch (error) {
  // Handle fetch error
}
```

**Parameters**:
- `categoryIds: string[]` - Array of category UUIDs to fetch questions from

**Returns**: `QuestionWithCategory[]` - Shuffled array of incomplete questions with category names
**Throws**:
- Error if user not authenticated
- Database error if fetch fails

**QuestionWithCategory Type**:
```typescript
interface QuestionWithCategory extends Question {
  category_name: string;
}

interface Question {
  id: string;
  category_id: string;
  text: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
```

**Behavior**:
1. Fetches all active questions in selected categories
2. Fetches user's completion records
3. Filters out completed questions
4. Randomizes remaining questions using Fisher-Yates shuffle
5. Returns shuffled array with category names attached

---

#### `setQuestionCompletion(questionId: string, completed: boolean)`
Update completion status for a question (upsert).

```typescript
import { setQuestionCompletion } from '@/lib/ccService';

try {
  // Mark as completed
  await setQuestionCompletion('question-uuid', true);

  // Mark as incomplete
  await setQuestionCompletion('question-uuid', false);
} catch (error) {
  // Handle update error
}
```

**Parameters**:
- `questionId: string` - UUID of the question
- `completed: boolean` - true to mark complete, false to mark incomplete

**Returns**: void
**Throws**:
- Error if user not authenticated
- Database error if upsert fails

**Behavior**:
- Uses upsert with `ON CONFLICT (user_id, question_id)`
- Creates new record if none exists
- Updates existing record if found
- Updates `updated_at` timestamp

---

## Supabase Client (`lib/supabaseClient.ts`)

### Exports

#### `supabase`
Main Supabase client instance for public schema.

```typescript
import { supabase } from '@/lib/supabaseClient';

const { data, error } = await supabase.auth.getUser();
```

---

#### `ccDb`
Supabase client configured for `connected_conversations` schema.

```typescript
import { ccDb } from '@/lib/supabaseClient';

const { data, error } = await ccDb
  .from('categories')
  .select('*')
  .order('sort_order');
```

**Note**: Use `ccDb` for all database operations to ensure correct schema targeting.

---

## TypeScript Types (`lib/types.ts`)

### Category
```typescript
interface Category {
  id: string;
  name: string;
  description: string | null;
  sort_order: number;
  created_at: string;
}
```

### Question
```typescript
interface Question {
  id: string;
  category_id: string;
  text: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
```

### QuestionCompletion
```typescript
interface QuestionCompletion {
  id: string;
  user_id: string;
  question_id: string;
  completed: boolean;
  updated_at: string;
}
```

### QuestionWithCategory
```typescript
interface QuestionWithCategory extends Question {
  category_name: string;
}
```

---

## Usage Patterns

### Category Selection Flow
```typescript
// 1. Fetch categories on page load
const categories = await getCategories();

// 2. User selects categories
const selectedIds = ['uuid-1', 'uuid-2'];

// 3. Store in localStorage
localStorage.setItem('selectedCategories', JSON.stringify(selectedIds));

// 4. Navigate to cards page
router.push('/app/cards');
```

### Card View Flow
```typescript
// 1. Retrieve selected categories
const categoriesJson = localStorage.getItem('selectedCategories');
const categoryIds = JSON.parse(categoriesJson);

// 2. Fetch incomplete questions
const questions = await getIncompleteQuestions(categoryIds);

// 3. Display current question
const currentQuestion = questions[currentIndex];

// 4. Handle completion toggle
await setQuestionCompletion(currentQuestion.id, true);

// 5. Remove from list (or keep for undo)
const updatedQuestions = questions.filter((_, i) => i !== currentIndex);
```

### Error Handling
```typescript
try {
  await setQuestionCompletion(questionId, true);
} catch (error: any) {
  console.error('Error:', error);
  setError(error.message || 'An error occurred');
}
```

---

## Fisher-Yates Shuffle Algorithm

The `shuffleArray` function implements Fisher-Yates shuffle for unbiased randomization:

```typescript
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
```

**Complexity**: O(n)
**Properties**: Unbiased, cryptographically random (uses Math.random)

---

## Environment Variables

Required for all service functions to work:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**Note**: These must be prefixed with `NEXT_PUBLIC_` to be accessible in client components.
