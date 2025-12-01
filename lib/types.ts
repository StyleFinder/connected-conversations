export interface Category {
  id: string;
  name: string;
  description: string | null;
  sort_order: number;
  created_at: string;
}

export interface Question {
  id: string;
  category_id: string;
  text: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface QuestionCompletion {
  id: string;
  user_id: string;
  question_id: string;
  completed: boolean;
  updated_at: string;
}

export interface QuestionWithCategory extends Question {
  category_name: string;
}
