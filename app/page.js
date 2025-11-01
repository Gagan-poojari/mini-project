"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { FiPlay } from "react-icons/fi";

export default function Home() {
  return (
    <main className="min-h-screen bg-linear-to-br from-gray-950 via-gray-900 to-black text-white antialiased overflow-hidden">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-linear-to-br from-transparent to-black/90" />
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5 mix-blend-overlay" />
        </div>

        <div className="container mx-auto px-6 lg:px-20 py-24 lg:py-40">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* LEFT - Intro Copy */}
            <div className="space-y-8 max-w-2xl">
              <motion.h1
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight"
              >
                Modernizing <span className="glow">Democracy</span> through
                <br /> Online Voting
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-gray-300 text-lg"
              >
                A secure, scalable, and transparent digital platform for modern elections — built using{" "}
                <strong>Next.js</strong>, <strong>Node.js</strong>, and <strong>Supabase</strong>.
                Empowering voters and administrators with a fair and tamper-proof experience.
              </motion.p>

              <div className="flex flex-wrap gap-4">
                <motion.a
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  href="#features"
                  className="inline-flex items-center gap-3 bg-linear-to-r from-white/10 to-white/5 border border-white/10 backdrop-blur-sm px-6 py-3 rounded-2xl text-sm font-semibold"
                >
                  <FiPlay className="w-4 h-4" /> Explore System
                </motion.a>
                <motion.a
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  href="#roles"
                  className="inline-flex items-center gap-2 text-sm px-5 py-3 rounded-2xl border border-white/10"
                >
                  User Roles
                </motion.a>
              </div>

              <div className="flex gap-3 mt-4 flex-wrap">
                <Chip text="Supabase Auth" />
                <Chip text="reCAPTCHA" />
                <Chip text="2FA Ready" />
                <Chip text="Scalable" />
              </div>
            </div>

            {/* RIGHT - Visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10">
                <div className="relative w-full h-80 sm:h-96 lg:h-[440px] bg-black">
                  <Image
                    src="/voting-hero.png"
                    alt="Online Voting System"
                    fill
                    style={{ objectFit: "cover" }}
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority
                  />
                  <div className="absolute inset-0 scanlines opacity-25 mix-blend-overlay" />
                  <div className="absolute inset-0 rgb-layer opacity-30 mix-blend-screen" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="container mx-auto px-6 lg:px-20 py-24">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          <FeatureCard
            title="Security First"
            body="Protected with Supabase Auth, reCAPTCHA, and optional Two-Factor Authentication for unmatched election integrity."
          />
          <FeatureCard
            title="Admin Controls"
            body="Administrators can create, update, or delete elections and candidates securely within the dashboard."
          />
          <FeatureCard
            title="Transparency"
            body="Votes are stored immutably in PostgreSQL. Once cast, a vote cannot be changed or duplicated."
          />
        </motion.div>
      </section>

      {/* ROLES SECTION */}
      <section id="roles" className="bg-white/5 border-t border-white/10 py-24">
        <div className="container mx-auto px-6 lg:px-20">
          <motion.h2
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold text-center mb-16"
          >
            System Roles
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <RoleCard
              title="Administrator"
              desc="Admins manage elections and candidates, and have access to both admin and voter functionalities for testing and participation."
              features={[
                "Add / Delete elections",
                "Add / Remove candidates",
                "View overall election stats",
              ]}
            />
            <RoleCard
              title="Voter"
              desc="Registered users can securely log in, view available elections, and cast their vote once per election — ensuring fairness and transparency."
              features={[
                "Secure login via Supabase",
                "One vote per election",
                "View results post-election",
              ]}
            />
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 py-10 text-center text-gray-400">
        <p className="text-sm">
          © 2025 Online Voting System — Built by 
          <span className="text-white font-semibold"> Gagan Poojary</span> & 
          <span className="text-white font-semibold"> Chyavan P Sharma</span>.
        </p>
      </footer>

      <style jsx>{`
        .glow {
          background: linear-gradient(90deg, #ff8fb2, #ff4d6d);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-shadow: 0 0 40px rgba(255, 77, 109, 0.4);
        }

        .scanlines {
          background-image: linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px);
          background-size: 100% 4px;
        }

        .rgb-layer {
          background: linear-gradient(90deg, rgba(255, 0, 85, 0.08), rgba(0, 200, 255, 0.05));
        }
      `}</style>
    </main>
  );
}

/* Utility Components */
function Chip({ text }) {
  return (
    <div className="text-xs px-3 py-1 rounded-full bg-white/10 border border-white/10 font-medium">
      {text}
    </div>
  );
}

function FeatureCard({ title, body }) {
  return (
    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors duration-300">
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-sm text-gray-300">{body}</p>
    </div>
  );
}

function RoleCard({ title, desc, features }) {
  return (
    <div className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300">
      <h3 className="text-2xl font-semibold mb-3">{title}</h3>
      <p className="text-gray-300 mb-5 text-sm">{desc}</p>
      <ul className="space-y-2 text-sm text-gray-400">
        {features.map((f, i) => (
          <li key={i}>• {f}</li>
        ))}
      </ul>
    </div>
  );
}
