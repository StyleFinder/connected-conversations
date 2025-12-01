'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getIncompleteQuestions, setQuestionCompletion } from '@/lib/ccService';
import { QuestionWithCategory } from '@/lib/types';

export default function CardsPage() {
  const [questions, setQuestions] = useState<QuestionWithCategory[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [updating, setUpdating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      const categoriesJson = localStorage.getItem('selectedCategories');
      if (!categoriesJson) {
        router.push('/app');
        return;
      }

      const categoryIds: string[] = JSON.parse(categoriesJson);
      const fetchedQuestions = await getIncompleteQuestions(categoryIds);
      setQuestions(fetchedQuestions);
      setIsCompleted(false);
    } catch (err: any) {
      setError(err.message || 'Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleComplete = async () => {
    if (!currentQuestion || updating) return;

    setUpdating(true);
    try {
      const newCompletedState = !isCompleted;
      await setQuestionCompletion(currentQuestion.id, newCompletedState);
      setIsCompleted(newCompletedState);

      // Update the question in the list to reflect completion status
      setQuestions((prev) =>
        prev.map((q, i) =>
          i === currentIndex ? { ...q, is_completed: newCompletedState } : q
        )
      );
    } catch (err: any) {
      setError(err.message || 'Failed to update completion status');
    } finally {
      setUpdating(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      setIsCompleted(questions[prevIndex]?.is_completed || false);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setIsCompleted(questions[nextIndex]?.is_completed || false);
    }
  };

  const handleBackToCategories = () => {
    router.push('/app');
  };

  const currentQuestion = questions[currentIndex];
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafaf9] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#e5e7eb] border-t-[#0066cc] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#6b7280] text-sm">Loading questions...</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-[#fafaf9] flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white border border-[#e5e7eb] rounded-lg shadow-md p-8 text-center">
            <div className="text-6xl mb-6">🎉</div>
            <h2 className="text-2xl font-bold text-[#003366] mb-4">All Done!</h2>
            <p className="text-[#6b7280] text-sm mb-6">
              You've completed all questions in the selected categories.
            </p>
            <button
              onClick={handleBackToCategories}
              className="w-full bg-[#0066cc] hover:bg-[#0052a3] text-white py-3 px-6 rounded-lg text-sm font-semibold transition-all duration-150"
            >
              Back to Categories
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafaf9] flex items-center justify-center px-4" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <div style={{ maxWidth: '700px', width: '100%' }}>

        {/* Top Navigation */}
        <div className="flex items-center justify-between" style={{ marginBottom: '24px' }}>
          <button
            onClick={handleBackToCategories}
            className="text-[#0066cc] font-semibold flex items-center"
            style={{
              fontSize: '14px',
              gap: '6px',
              transition: 'color 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#0052a3'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#0066cc'}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <span className="text-[#6b7280] font-medium" style={{ fontSize: '14px' }}>
            {currentIndex + 1} of {questions.length}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="bg-[#e5e7eb] rounded-full overflow-hidden" style={{ height: '8px', marginBottom: '32px' }}>
          <div
            className="bg-[#0066cc] rounded-full"
            style={{
              height: '100%',
              width: `${progress}%`,
              transition: 'width 0.3s ease'
            }}
          />
        </div>

        {/* QUESTION CARD */}
        <div style={{ marginBottom: '32px' }}>
          <div className="bg-white border border-[#e5e7eb]" style={{ borderRadius: '16px', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)', padding: '24px' }}>

            {/* Category Badge */}
            <div style={{ marginBottom: '24px', textAlign: 'center' }}>
              <span className="inline-block bg-[#f0f7ff] border border-[#bfdbfe] text-[#003366] text-xs font-semibold uppercase tracking-wide" style={{ padding: '6px 12px', borderRadius: '6px' }}>
                {currentQuestion?.category_name}
              </span>
            </div>

            {/* Question Text */}
            <p className="text-2xl md:text-3xl text-[#003366] text-center leading-relaxed" style={{ marginBottom: '24px' }}>
              {currentQuestion?.text}
            </p>

            {error && (
              <div className="bg-[#fff5f5] border border-[#fecaca] rounded-lg" style={{ padding: '16px', marginBottom: '16px' }}>
                <div className="flex items-start" style={{ gap: '12px' }}>
                  <svg className="w-5 h-5 text-[#dc2626] flex-shrink-0" style={{ marginTop: '2px' }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="text-[#b91c1c]" style={{ fontSize: '14px' }}>{error}</span>
                </div>
              </div>
            )}

            {/* Mark Complete Toggle */}
            <div className="flex items-center justify-end">
              <div className="inline-flex items-center bg-[#f9fafb] rounded-lg border border-[#e5e7eb]" style={{ padding: '12px 16px', gap: '12px' }}>
                <span className="text-[#003366] font-medium" style={{ fontSize: '14px' }}>
                  {isCompleted ? '✓ Completed' : 'Mark as Complete'}
                </span>
                <button
                  onClick={handleToggleComplete}
                  disabled={updating}
                  className="relative inline-flex items-center rounded-full disabled:opacity-50"
                  style={{
                    height: '24px',
                    width: '44px',
                    backgroundColor: isCompleted ? '#16a34a' : '#e5e7eb',
                    transition: 'background-color 0.2s'
                  }}
                >
                  <span
                    className="inline-block rounded-full bg-white"
                    style={{
                      height: '16px',
                      width: '16px',
                      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                      transform: isCompleted ? 'translateX(26px)' : 'translateX(2px)',
                      transition: 'transform 0.2s'
                    }}
                  />
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex" style={{ gap: '12px' }}>
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="flex-1 bg-white border border-[#e5e7eb] text-[#003366] rounded-lg font-semibold disabled:cursor-not-allowed"
            style={{
              padding: '12px 24px',
              fontSize: '14px',
              transition: 'all 0.15s ease',
              opacity: currentIndex === 0 ? 0.4 : 1
            }}
            onMouseEnter={(e) => {
              if (currentIndex !== 0) {
                e.currentTarget.style.backgroundColor = '#f9fafb';
                e.currentTarget.style.borderColor = '#0066cc';
              }
            }}
            onMouseLeave={(e) => {
              if (currentIndex !== 0) {
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.borderColor = '#e5e7eb';
              }
            }}
          >
            Previous
          </button>
          <button
            onClick={handleNext}
            disabled={currentIndex === questions.length - 1}
            className="flex-1 rounded-lg font-semibold disabled:cursor-not-allowed"
            style={{
              padding: '12px 24px',
              fontSize: '14px',
              backgroundColor: currentIndex === questions.length - 1 ? '#0066cc' : '#0066cc',
              color: '#ffffff',
              border: 'none',
              transition: 'background-color 0.15s ease',
              opacity: currentIndex === questions.length - 1 ? 0.4 : 1
            }}
            onMouseEnter={(e) => {
              if (currentIndex !== questions.length - 1) {
                e.currentTarget.style.backgroundColor = '#0052a3';
              }
            }}
            onMouseLeave={(e) => {
              if (currentIndex !== questions.length - 1) {
                e.currentTarget.style.backgroundColor = '#0066cc';
              }
            }}
          >
            Next
          </button>
        </div>

      </div>
    </div>
  );
}
