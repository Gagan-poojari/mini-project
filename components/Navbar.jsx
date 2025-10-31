"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function Navbar({ user }) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });
      if (response.ok) {
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <motion.nav
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-white/10 border-b border-white/10"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex justify-between h-16 items-center">
          {/* Brand */}
          <Link
            href="/"
            className="text-xl sm:text-2xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-pink-500 hover:from-pink-500 hover:to-blue-400 transition-colors"
          >
            🗳️ VoteSystem
          </Link>

          {/* Nav Links */}
          <div className="flex items-center space-x-6">
            {user ? (
              <>
                <span className="hidden sm:block text-gray-200">
                  Welcome,{" "}
                  <span className="font-semibold text-white">
                    {user.name || "User"}
                  </span>
                </span>

                <Link
                  href="/vote"
                  className="nav-link text-gray-300 hover:text-white"
                >
                  Vote
                </Link>

                <Link
                  href="/results"
                  className="nav-link text-gray-300 hover:text-white"
                >
                  Results
                </Link>
                 {user && (
                  <>
                    <Link href="/elections">Elections</Link>
                    {user.role === "admin" && <Link href="/admin">Admin</Link>}
                  </>
                )}

                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-sm font-medium transition-all duration-300 shadow-md hover:shadow-red-600/40"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="nav-link text-gray-300 hover:text-white"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-indigo-600 hover:to-blue-700 text-white text-sm font-medium transition-all duration-300 shadow-md hover:shadow-blue-500/40"
                >
                  Register
                </Link>
               
              </>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .nav-link {
          position: relative;
          transition: color 0.3s ease;
        }
        .nav-link::after {
          content: "";
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 0%;
          height: 1.5px;
          background: linear-gradient(to right, #3b82f6, #ec4899);
          transition: width 0.3s ease;
        }
        .nav-link:hover::after {
          width: 100%;
        }
      `}</style>
    </motion.nav>
  );
}
