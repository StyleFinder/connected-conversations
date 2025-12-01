'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from '@/lib/ccService';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      router.push('/app');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] flex items-center justify-center px-4" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <div style={{ maxWidth: '500px', width: '100%' }}>

        {/* Login Card */}
        <div className="bg-white border border-[#e5e7eb]" style={{ borderRadius: '16px', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)', padding: '32px' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h1 className="text-[#003366] font-bold" style={{ fontSize: '32px', marginBottom: '8px' }}>
              Connected Conversations for Jim and Michele
            </h1>
            <p className="text-[#6b7280]" style={{ fontSize: '14px' }}>
              Sign in to start meaningful conversations
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Email Field */}
            <div style={{ marginBottom: '16px' }}>
              <label
                htmlFor="email"
                className="text-[#003366] font-semibold"
                style={{ fontSize: '14px', display: 'block', marginBottom: '8px' }}
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-[#e5e7eb] rounded-lg"
                style={{
                  padding: '12px',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.15s ease'
                }}
                placeholder="you@example.com"
                onFocus={(e) => e.currentTarget.style.borderColor = '#0066cc'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
              />
            </div>

            {/* Password Field */}
            <div style={{ marginBottom: '24px' }}>
              <label
                htmlFor="password"
                className="text-[#003366] font-semibold"
                style={{ fontSize: '14px', display: 'block', marginBottom: '8px' }}
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-[#e5e7eb] rounded-lg"
                style={{
                  padding: '12px',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.15s ease'
                }}
                placeholder="••••••••"
                onFocus={(e) => e.currentTarget.style.borderColor = '#0066cc'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-[#fff5f5] border border-[#fecaca] rounded-lg" style={{ padding: '16px', marginBottom: '24px' }}>
                <div className="flex items-start" style={{ gap: '12px' }}>
                  <svg className="w-5 h-5 text-[#dc2626] flex-shrink-0" style={{ marginTop: '2px' }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="text-[#b91c1c]" style={{ fontSize: '14px' }}>{error}</span>
                </div>
              </div>
            )}

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg font-semibold disabled:cursor-not-allowed"
              style={{
                padding: '12px 24px',
                fontSize: '14px',
                backgroundColor: loading ? '#d1d5db' : '#0066cc',
                color: '#ffffff',
                border: 'none',
                transition: 'background-color 0.15s ease',
                opacity: loading ? 0.6 : 1
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = '#0052a3';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = '#0066cc';
                }
              }}
            >
              {loading ? (
                <div className="flex items-center justify-center" style={{ gap: '8px' }}>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
