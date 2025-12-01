'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCategories, signOut } from '@/lib/ccService';
import { Category } from '@/lib/types';

export default function CategorySelectionPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set()
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const cats = await getCategories();
      setCategories(cats);
      // Select all categories by default
      setSelectedCategories(new Set(cats.map((c) => c.id)));
    } catch (err: any) {
      setError(err.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const handleStart = () => {
    if (selectedCategories.size === 0) {
      setError('Please select at least one category');
      return;
    }
    // Store selected categories in localStorage for the cards page
    localStorage.setItem(
      'selectedCategories',
      JSON.stringify(Array.from(selectedCategories))
    );
    router.push('/app/cards');
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (err: any) {
      console.error('Sign out error:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 animate-gradient-xy"></div>
        <div className="text-center relative z-10">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/30 border-t-white mx-auto"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-t-white/60 mx-auto animate-ping"></div>
          </div>
          <p className="mt-6 text-white font-medium text-lg">Loading categories...</p>
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

      <div className="max-w-3xl mx-auto p-4 py-8 relative z-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
              Connected Conversations
            </h1>
            <p className="text-white/90 mt-1 text-sm">Choose your conversation topics</p>
          </div>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-all duration-200 font-medium border border-white/30 hover:border-white/50"
          >
            Sign Out
          </button>
        </div>

        {/* Main card */}
        <div className="backdrop-blur-xl bg-white/90 rounded-3xl shadow-2xl p-6 md:p-8 border border-white/20 mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Select Categories
          </h2>
          <p className="text-gray-600 mb-6">
            Pick the topics that interest you most
          </p>

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

          <div className="space-y-3">
            {categories.map((category, index) => (
              <div
                key={category.id}
                onClick={() => toggleCategory(category.id)}
                style={{ animationDelay: `${index * 50}ms` }}
                className={`group p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 animate-fade-in-up ${
                  selectedCategories.has(category.id)
                    ? 'border-indigo-500 bg-gradient-to-r from-indigo-50 to-purple-50 shadow-md scale-[1.02]'
                    : 'border-gray-200 bg-white/50 hover:border-indigo-300 hover:shadow-md hover:scale-[1.01]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className={`font-semibold transition-colors ${
                      selectedCategories.has(category.id) ? 'text-indigo-900' : 'text-gray-800'
                    }`}>
                      {category.name}
                    </h3>
                    {category.description && (
                      <p className={`text-sm mt-1 transition-colors ${
                        selectedCategories.has(category.id) ? 'text-indigo-700' : 'text-gray-600'
                      }`}>
                        {category.description}
                      </p>
                    )}
                  </div>
                  <div
                    className={`w-7 h-7 rounded-full border-2 flex items-center justify-center ml-4 transition-all duration-300 ${
                      selectedCategories.has(category.id)
                        ? 'border-indigo-500 bg-indigo-500 scale-110'
                        : 'border-gray-300 group-hover:border-indigo-300'
                    }`}
                  >
                    {selectedCategories.has(category.id) && (
                      <svg
                        className="w-4 h-4 text-white animate-scale-in"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M5 13l4 4L19 7"></path>
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {categories.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📚</div>
              <p className="text-gray-500">No categories available</p>
            </div>
          )}
        </div>

        {/* Start button */}
        <button
          onClick={handleStart}
          disabled={selectedCategories.size === 0}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 md:py-5 rounded-2xl font-bold text-lg hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 active:translate-y-0 disabled:transform-none"
        >
          {selectedCategories.size === 0 ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              Select at least one category
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
              </svg>
              Start Conversations ({selectedCategories.size} selected)
            </span>
          )}
        </button>
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
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes scale-in {
          from {
            transform: scale(0);
          }
          to {
            transform: scale(1);
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
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out forwards;
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>
    </div>
  );
}
