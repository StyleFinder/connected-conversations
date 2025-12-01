'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ccDb } from '@/lib/supabaseClient';
import { QuestionWithCategory } from '@/lib/types';

export default function CompletedQuestionsPage() {
  const [questions, setQuestions] = useState<QuestionWithCategory[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    loadCompletedQuestions();
  }, []);

  const loadCompletedQuestions = async () => {
    try {
      const { data, error: fetchError } = await ccDb
        .from('questions')
        .select(`
          id,
          text,
          category_id,
          is_completed,
          categories:category_id (
            id,
            name
          )
        `)
        .eq('is_completed', true)
        .order('updated_at', { ascending: false });

      if (fetchError) throw fetchError;

      const formattedQuestions: QuestionWithCategory[] = (data || []).map((q: any) => ({
        id: q.id,
        text: q.text,
        category_id: q.category_id,
        category_name: q.categories?.name || 'Unknown',
        is_completed: q.is_completed,
      }));

      setQuestions(formattedQuestions);
    } catch (err: any) {
      setError(err.message || 'Failed to load completed questions');
    } finally {
      setLoading(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleBackToCategories = () => {
    router.push('/app');
  };

  const currentQuestion = questions[currentIndex];
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafaf9] flex items-center justify-center" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#e5e7eb] border-t-[#0066cc] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#6b7280] text-sm">Loading completed questions...</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-[#fafaf9] flex items-center justify-center px-4" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
        <div style={{ maxWidth: '700px', width: '100%' }}>
          <div className="bg-white border border-[#e5e7eb]" style={{ borderRadius: '16px', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)', padding: '24px', textAlign: 'center' }}>
            <div style={{ fontSize: '64px', marginBottom: '24px' }}>✓</div>
            <h2 className="text-[#003366] font-bold" style={{ fontSize: '24px', marginBottom: '16px' }}>
              No Completed Questions
            </h2>
            <p className="text-[#6b7280]" style={{ fontSize: '14px', marginBottom: '24px' }}>
              You haven't completed any questions yet. Start answering questions to see them here.
            </p>
            <button
              onClick={handleBackToCategories}
              className="bg-[#0066cc] text-white rounded-lg font-semibold"
              style={{
                padding: '12px 24px',
                fontSize: '14px',
                border: 'none',
                transition: 'background-color 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0052a3'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0066cc'}
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

            {/* Completed Badge */}
            <div className="flex items-center justify-end">
              <div className="inline-flex items-center bg-[#f0fdf4] rounded-lg border border-[#bbf7d0]" style={{ padding: '12px 16px', gap: '8px' }}>
                <svg style={{ width: '16px', height: '16px', color: '#16a34a' }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-[#166534] font-medium" style={{ fontSize: '14px' }}>
                  Completed
                </span>
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
              backgroundColor: '#0066cc',
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
