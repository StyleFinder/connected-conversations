import { supabase, ccDb } from './supabaseClient';
import { Category, Question, QuestionWithCategory } from './types';

/**
 * Fisher-Yates shuffle algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Get current authenticated user ID
 */
export async function getCurrentUserId(): Promise<string | null> {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return null;
  }
  return user.id;
}

/**
 * Get all categories sorted by sort_order
 */
export async function getCategories(): Promise<Category[]> {
  const { data, error } = await ccDb
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }

  return data || [];
}

/**
 * Get incomplete questions for selected categories
 * Returns shuffled array of questions with category names
 */
export async function getIncompleteQuestions(
  categoryIds: string[]
): Promise<QuestionWithCategory[]> {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error('User not authenticated');
  }

  // Fetch all active questions in selected categories
  const { data: questions, error: questionsError } = await ccDb
    .from('questions')
    .select('*, categories(name)')
    .in('category_id', categoryIds)
    .eq('is_active', true);

  if (questionsError) {
    console.error('Error fetching questions:', questionsError);
    throw questionsError;
  }

  if (!questions || questions.length === 0) {
    return [];
  }

  // Fetch all completions for this user
  const { data: completions, error: completionsError } = await ccDb
    .from('question_completions')
    .select('question_id, completed')
    .eq('user_id', userId);

  if (completionsError) {
    console.error('Error fetching completions:', completionsError);
    throw completionsError;
  }

  // Create a map of completed question IDs
  const completedMap = new Map<string, boolean>();
  completions?.forEach((c) => {
    if (c.completed) {
      completedMap.set(c.question_id, true);
    }
  });

  // Filter out completed questions and map to QuestionWithCategory
  const incompleteQuestions = questions
    .filter((q) => !completedMap.has(q.id))
    .map((q) => ({
      id: q.id,
      category_id: q.category_id,
      text: q.text,
      is_active: q.is_active,
      created_at: q.created_at,
      updated_at: q.updated_at,
      category_name: (q.categories as any)?.name || 'Unknown',
    }));

  // Shuffle using Fisher-Yates
  return shuffleArray(incompleteQuestions);
}

/**
 * Set completion status for a question
 * Upserts into question_completions table
 */
export async function setQuestionCompletion(
  questionId: string,
  completed: boolean
): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error('User not authenticated');
  }

  const { error } = await ccDb
    .from('question_completions')
    .upsert(
      {
        user_id: userId,
        question_id: questionId,
        completed,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id,question_id',
      }
    );

  if (error) {
    console.error('Error updating completion:', error);
    throw error;
  }
}

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string) {
  console.log('Attempting sign in for:', email);
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('Sign in error:', error);
    throw error;
  }

  console.log('Sign in successful:', data);
  return data;
}

/**
 * Sign out current user
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
}
