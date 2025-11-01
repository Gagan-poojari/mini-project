import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function ElectionsPage() {
  const elections = await prisma.election.findMany({
    include: { candidates: true },
  })

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-950 via-gray-900 to-black text-white py-16 px-6 flex flex-col items-center">
      {/* Header */}
      <div className="text-center pb-14">
        <h1 className="text-6xl h-20 font-extrabold bg-linear-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          🗳️ Ongoing Elections
        </h1>
        <p className="text-gray-400 mt-5 pt-5 text-lg">
          View active elections and cast your vote securely.
        </p>
      </div>

      {/* Elections List */}
      {elections.length === 0 ? (
        <p className="text-gray-400 text-lg text-center">
          No ongoing elections at the moment.
        </p>
      ) : (
        <div className="w-full max-w-6xl grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {elections.map((election) => (
            <div
              key={election.id}
              className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl hover:shadow-purple-500/30 transition-all duration-300 overflow-hidden group"
            >
              {/* Glow overlay */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-linear-to-r from-purple-500/10 via-pink-500/10 to-transparent blur-2xl" />

              {/* Card Content */}
              <div className="relative z-10 p-6 flex flex-col justify-between h-full">
                <div>
                  <h2 className="text-2xl font-semibold mb-3 group-hover:text-purple-400 transition-colors">
                    {election.title}
                  </h2>
                  <p className="text-gray-400 text-sm mb-5">
                    {election.candidates.length} Candidate
                    {election.candidates.length !== 1 && 's'}
                  </p>
                </div>

                <Link
                  href={`/vote?election=${election.id}`}
                  className="inline-block text-center w-full bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-purple-600 hover:to-pink-500 text-white font-medium py-2.5 rounded-xl transition-transform duration-200 hover:scale-105 shadow-lg"
                >
                  Vote Now →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
