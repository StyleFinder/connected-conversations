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

      if (newCompletedState) {
        // Remove completed question from the list
        setQuestions((prev) => prev.filter((_, i) => i !== currentIndex));
        // Adjust index if needed
        if (currentIndex >= questions.length - 1) {
          setCurrentIndex(Math.max(0, questions.length - 2));
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update completion status');
    } finally {
      setUpdating(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsCompleted(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsCompleted(false);
    }
  };

  const handleBackToCategories = () => {
    router.push('/app');
  };

  const currentQuestion = questions[currentIndex];

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 animate-gradient-xy"></div>
        <div className="text-center relative z-10">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/30 border-t-white mx-auto"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-t-white/60 mx-auto animate-ping"></div>
          </div>
          <p className="mt-6 text-white font-medium text-lg">Loading questions...</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 animate-gradient-xy"></div>

        <div className="max-w-md w-full text-center relative z-10">
          <div className="backdrop-blur-xl bg-white/90 rounded-3xl shadow-2xl p-10 border border-white/20">
            <div className="text-7xl mb-6 animate-bounce-slow">🎉</div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
              All Done!
            </h2>
            <p className="text-gray-600 mb-8 text-lg">
              You've completed all questions in the selected categories.
            </p>
            <button
              onClick={handleBackToCategories}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              Back to Categories
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 animate-gradient-xy"></div>

      {/* Floating orbs */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div className="absolute bottom-20 right-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>

      <div className="max-w-3xl mx-auto p-4 py-6 md:py-8 relative z-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={handleBackToCategories}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-all duration-200 font-medium border border-white/30 hover:border-white/50"
          >
            <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Back
          </button>

          {/* Progress indicator */}
          <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30">
            <span className="text-white font-semibold text-sm">
              {currentIndex + 1} / {questions.length}
            </span>
            <div className="w-32 bg-white/30 rounded-full h-2 overflow-hidden">
              <div
                className="bg-white h-full rounded-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Category Pill */}
        <div className="mb-6 animate-fade-in">
          <span className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-900 px-5 py-2.5 rounded-full text-sm font-semibold shadow-md backdrop-blur-sm border border-indigo-200">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z"></path>
              <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z"></path>
            </svg>
            {currentQuestion?.category_name}
          </span>
        </div>

        {/* Question Card with flip animation */}
        <div className="perspective-1000 mb-6" key={currentIndex}>
          <div className="backdrop-blur-xl bg-white/95 rounded-3xl shadow-2xl p-8 md:p-12 min-h-[320px] md:min-h-[380px] flex items-center justify-center border border-white/20 animate-card-flip">
            <div className="text-center">
              <svg className="w-12 h-12 text-indigo-400 mx-auto mb-6 opacity-50" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
              </svg>
              <p className="text-2xl md:text-3xl text-gray-800 leading-relaxed font-medium">
                {currentQuestion?.text}
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50/90 backdrop-blur-sm border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-4 animate-shake">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Completed Toggle with switch design */}
        <div className="backdrop-blur-xl bg-white/90 rounded-2xl shadow-lg p-6 mb-6 border border-white/20">
          <button
            onClick={handleToggleComplete}
            disabled={updating}
            className={`w-full flex items-center justify-between p-5 rounded-xl transition-all duration-300 ${
              isCompleted
                ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-400 shadow-md'
                : 'bg-white/50 border-2 border-gray-200 hover:border-indigo-300 hover:shadow-md'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`relative w-14 h-8 rounded-full transition-colors duration-300 ${
                  isCompleted ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ${
                    isCompleted ? 'transform translate-x-6' : ''
                  }`}
                ></div>
              </div>
              <span
                className={`font-semibold text-lg transition-colors ${
                  isCompleted ? 'text-green-700' : 'text-gray-700'
                }`}
              >
                {isCompleted ? '✓ Completed' : 'Mark as Complete'}
              </span>
            </div>

            {updating && (
              <svg className="animate-spin h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
          </button>
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-4">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="flex-1 backdrop-blur-xl bg-white/90 border-2 border-white/50 text-gray-700 py-4 rounded-xl font-semibold hover:bg-white hover:border-white disabled:bg-white/50 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 disabled:transform-none flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M15 19l-7-7 7-7"></path>
            </svg>
            Previous
          </button>
          <button
            onClick={handleNext}
            disabled={currentIndex === questions.length - 1}
            className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 disabled:transform-none flex items-center justify-center gap-2"
          >
            Next
            <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M9 5l7 7-7 7"></path>
            </svg>
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes gradient-xy {
          0%, 100% {
            background-position: 0% 50%;
            background-size: 400% 400%;
          }
          50% {
            background-position: 100% 50%;
            background-size: 400% 400%;
          }
        }
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        @keyframes card-flip {
          0% {
            opacity: 0;
            transform: rotateY(-10deg) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: rotateY(0) scale(1);
          }
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .animate-gradient-xy {
          animation: gradient-xy 15s ease infinite;
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animate-card-flip {
          animation: card-flip 0.4s ease-out;
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
        .perspective-1000 {
          perspective: 1000px;
        }
      `}</style>
    </div>
  );
}
