'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar({ user }) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      if (response.ok) {
        router.push('/');
        router.refresh();
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isAdmin = user?.role === 'ADMIN';

  return (
    <nav className="sticky top-0 z-50 bg-gray-700 backdrop-blur-xl border-b border-white/20 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Link
              href="/"
              className="text-2xl font-extrabold text-white"
              // className="text-2xl font-extrabold bg-linear-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent"
            >
              🗳️ VoteSystem
            </Link>
            {isAdmin && (
              <span className="ml-2 px-2 py-0.5 bg-purple-700/20 text-purple-300 text-xs font-semibold rounded-full border border-purple-500/30">
                ADMIN
              </span>
            )}
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            {user ? (
              <>
                <span className="text-gray-200 text-sm">
                  Welcome,&nbsp;
                  <span className="font-semibold text-white">
                    {user.fname} {user.lname}
                  </span>
                </span>

                {isAdmin ? (
                  <>
                    <Link href="/admin" className="nav-link text-purple-300">
                      Dashboard
                    </Link>
                    <Link href="/admin/elections" className="nav-link text-purple-300">
                      Elections
                    </Link>
                    <Link href="/admin/parties" className="nav-link text-purple-300">
                      Parties
                    </Link>
                    <Link href="/admin/candidates" className="nav-link text-purple-300">
                      Candidates
                    </Link>
                  </>
                ) : (
                  <Link href="/elections" className="nav-link text-blue-300">
                    Elections
                  </Link>
                )}

                <Link href="/results" className="nav-link text-blue-300">
                  Results
                </Link>

                <button
                  onClick={handleLogout}
                  className="bg-linear-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white px-4 py-2 rounded-xl font-medium transition-transform hover:scale-105"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="nav-link text-blue-300">
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-xl font-medium shadow-md hover:shadow-purple-500/20 transition-transform hover:scale-105"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-gray-200 hover:text-white transition"
          >
            <svg
              className="h-7 w-7"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {mobileMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu with animation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="md:hidden bg-white/10 backdrop-blur-lg rounded-xl mt-2 p-4 space-y-3 border border-white/20"
            >
              {user ? (
                <>
                  <div className="text-gray-200 border-b border-white/20 pb-2">
                    {user.fname} {user.lname}
                  </div>

                  {isAdmin ? (
                    <>
                      <Link href="/admin" className="mobile-link text-purple-300">
                        Dashboard
                      </Link>
                      <Link href="/admin/elections" className="mobile-link text-purple-300">
                        Elections
                      </Link>
                      <Link href="/admin/parties" className="mobile-link text-purple-300">
                        Parties
                      </Link>
                      <Link href="/admin/candidates" className="mobile-link text-purple-300">
                        Candidates
                      </Link>
                    </>
                  ) : (
                    <Link href="/elections" className="mobile-link text-blue-300">
                      Elections
                    </Link>
                  )}

                  <Link href="/results" className="mobile-link text-blue-300">
                    Results
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full bg-linear-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white py-2 rounded-xl font-medium transition-transform hover:scale-105"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="mobile-link text-blue-300">
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="block text-center bg-linear-to-r from-blue-600 to-purple-600 text-white py-2 rounded-xl font-medium hover:scale-105 transition-transform"
                  >
                    Register
                  </Link>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Custom styles */}
      <style jsx>{`
        .nav-link {
          position: relative;
          font-medium: 500;
          transition: color 0.3s ease;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          width: 0;
          height: 2px;
          background: currentColor;
          transition: width 0.3s ease;
        }
        .nav-link:hover::after {
          width: 100%;
        }
        .mobile-link {
          display: block;
          padding: 0.5rem 0.75rem;
          border-radius: 0.5rem;
          transition: background 0.2s;
        }
        .mobile-link:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </nav>
  );
}
