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

      // If selecting Random, clear all other categories
      if (categoryId === 'random') {
        if (newSet.has('random')) {
          newSet.delete('random');
        } else {
          return new Set(['random']);
        }
      } else {
        // If selecting a regular category, remove Random if it's selected
        if (newSet.has('random')) {
          newSet.delete('random');
        }

        // Toggle the selected category
        if (newSet.has(categoryId)) {
          newSet.delete(categoryId);
        } else {
          newSet.add(categoryId);
        }
      }

      return newSet;
    });
  };

  const handleStart = () => {
    if (selectedCategories.size === 0) {
      setError('Please select at least one category');
      return;
    }

    // Handle "random" selection - use all category IDs
    let categoriesToStore = Array.from(selectedCategories);
    if (selectedCategories.has('random')) {
      categoriesToStore = categories.map(c => c.id);
    }

    // Store selected categories in localStorage for the cards page
    localStorage.setItem(
      'selectedCategories',
      JSON.stringify(categoriesToStore)
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
      <div className="min-h-screen bg-[#fafaf9] flex items-center justify-center" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#e5e7eb] border-t-[#0066cc] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#6b7280] text-sm">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafaf9] flex items-center justify-center px-4" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <div style={{ maxWidth: '700px', width: '100%' }}>

        {/* Header */}
        <div className="flex items-center justify-between" style={{ marginBottom: '24px' }}>
          <h1 className="text-[#003366] font-bold" style={{ fontSize: '32px' }}>
            Connected Conversations for Jim and Michele
          </h1>
          <button
            onClick={handleSignOut}
            className="text-[#0066cc] font-semibold"
            style={{ fontSize: '14px', transition: 'color 0.15s ease' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#0052a3'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#0066cc'}
          >
            Sign Out
          </button>
        </div>

        {/* Category Selection Card */}
        <div style={{ marginBottom: '32px' }}>
          <div className="bg-white border border-[#e5e7eb]" style={{ borderRadius: '16px', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)', padding: '24px' }}>

            <h2 className="text-[#003366] font-bold" style={{ fontSize: '24px', marginBottom: '8px' }}>
              Select Categories
            </h2>
            <p className="text-[#6b7280]" style={{ fontSize: '14px', marginBottom: '24px' }}>
              Choose the categories you'd like to explore
            </p>

            {error && (
              <div className="bg-[#fff5f5] border border-[#fecaca] rounded-lg" style={{ padding: '16px', marginBottom: '16px' }}>
                <span className="text-[#b91c1c]" style={{ fontSize: '14px' }}>{error}</span>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Random Card */}
              <div
                onClick={() => toggleCategory('random')}
                className="border rounded-lg cursor-pointer"
                style={{
                  padding: '16px',
                  borderWidth: '2px',
                  borderColor: selectedCategories.has('random') ? '#0066cc' : '#e5e7eb',
                  backgroundColor: selectedCategories.has('random') ? '#f0f7ff' : '#ffffff',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  if (!selectedCategories.has('random')) {
                    e.currentTarget.style.borderColor = '#d1d5db';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!selectedCategories.has('random')) {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                  }
                }}
              >
                <div className="flex items-center justify-between">
                  <div style={{ flex: 1 }}>
                    <h3 className="text-[#003366] font-semibold" style={{ fontSize: '16px' }}>
                      Random
                    </h3>
                    <p className="text-[#6b7280]" style={{ fontSize: '14px', marginTop: '4px' }}>
                      Get questions from any category
                    </p>
                  </div>
                  <div
                    className="flex items-center justify-center rounded-full border-2"
                    style={{
                      width: '24px',
                      height: '24px',
                      marginLeft: '16px',
                      borderColor: selectedCategories.has('random') ? '#0066cc' : '#d1d5db',
                      backgroundColor: selectedCategories.has('random') ? '#0066cc' : 'transparent'
                    }}
                  >
                    {selectedCategories.has('random') && (
                      <svg
                        style={{ width: '16px', height: '16px', color: '#ffffff' }}
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

              {categories.map((category) => (
                <div
                  key={category.id}
                  onClick={() => toggleCategory(category.id)}
                  className="border rounded-lg cursor-pointer"
                  style={{
                    padding: '16px',
                    borderWidth: '2px',
                    borderColor: selectedCategories.has(category.id) ? '#0066cc' : '#e5e7eb',
                    backgroundColor: selectedCategories.has(category.id) ? '#f0f7ff' : '#ffffff',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!selectedCategories.has(category.id)) {
                      e.currentTarget.style.borderColor = '#d1d5db';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!selectedCategories.has(category.id)) {
                      e.currentTarget.style.borderColor = '#e5e7eb';
                    }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div style={{ flex: 1 }}>
                      <h3 className="text-[#003366] font-semibold" style={{ fontSize: '16px' }}>
                        {category.name}
                      </h3>
                      {category.description && (
                        <p className="text-[#6b7280]" style={{ fontSize: '14px', marginTop: '4px' }}>
                          {category.description}
                        </p>
                      )}
                    </div>
                    <div
                      className="flex items-center justify-center rounded-full border-2"
                      style={{
                        width: '24px',
                        height: '24px',
                        marginLeft: '16px',
                        borderColor: selectedCategories.has(category.id) ? '#0066cc' : '#d1d5db',
                        backgroundColor: selectedCategories.has(category.id) ? '#0066cc' : 'transparent'
                      }}
                    >
                      {selectedCategories.has(category.id) && (
                        <svg
                          style={{ width: '16px', height: '16px', color: '#ffffff' }}
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

              {/* Completed Questions Card */}
              <div
                onClick={() => router.push('/app/completed')}
                className="border rounded-lg cursor-pointer"
                style={{
                  padding: '16px',
                  borderWidth: '2px',
                  borderColor: '#e5e7eb',
                  backgroundColor: '#ffffff',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#d1d5db';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                }}
              >
                <div className="flex items-center justify-between">
                  <div style={{ flex: 1 }}>
                    <h3 className="text-[#003366] font-semibold" style={{ fontSize: '16px' }}>
                      Completed Questions
                    </h3>
                    <p className="text-[#6b7280]" style={{ fontSize: '14px', marginTop: '4px' }}>
                      Review questions you've already answered
                    </p>
                  </div>
                  <svg
                    style={{ width: '20px', height: '20px', color: '#0066cc', marginLeft: '16px' }}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M9 5l7 7-7 7"></path>
                  </svg>
                </div>
              </div>
            </div>

            {categories.length === 0 && (
              <p className="text-center text-[#6b7280]" style={{ fontSize: '14px', padding: '32px 0' }}>
                No categories available
              </p>
            )}
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={handleStart}
          disabled={selectedCategories.size === 0}
          className="w-full rounded-lg font-semibold disabled:cursor-not-allowed"
          style={{
            padding: '16px 32px',
            fontSize: '16px',
            backgroundColor: selectedCategories.size === 0 ? '#d1d5db' : '#0066cc',
            color: '#ffffff',
            border: 'none',
            transition: 'background-color 0.15s ease',
            opacity: selectedCategories.size === 0 ? 0.6 : 1
          }}
          onMouseEnter={(e) => {
            if (selectedCategories.size > 0) {
              e.currentTarget.style.backgroundColor = '#0052a3';
            }
          }}
          onMouseLeave={(e) => {
            if (selectedCategories.size > 0) {
              e.currentTarget.style.backgroundColor = '#0066cc';
            }
          }}
        >
          {selectedCategories.size === 0
            ? 'Select at least one category'
            : 'Start / Continue'}
        </button>

      </div>
    </div>
  );
}
