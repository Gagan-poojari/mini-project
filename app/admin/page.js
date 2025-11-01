"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function AdminDashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [elections, setElections] = useState([])
  const [parties, setParties] = useState([])
  const [loading, setLoading] = useState(true)

  // 🟡 Form state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [creating, setCreating] = useState(false)
  const [message, setMessage] = useState("")

  // 🟢 Candidate list state
  const [candidates, setCandidates] = useState([])

  const addCandidate = () => {
    setCandidates([
      ...candidates,
      { name: "", profession: "", education: "", partyId: "" },
    ])
  }

  const removeCandidate = (index) => {
    setCandidates(candidates.filter((_, i) => i !== index))
  }

  const updateCandidate = (index, field, value) => {
    const updated = [...candidates]
    updated[index][field] = value
    setCandidates(updated)
  }

  useEffect(() => {
    verifyAdmin()
  }, [])

  const verifyAdmin = async () => {
    try {
      const res = await fetch("/api/auth/me")
      const data = await res.json()

      if (!data.success) {
        router.push("/login")
        return
      }

      const role = data.data.role?.toLowerCase()
      if (role !== "admin") {
        router.push("/elections")
        return
      }

      setUser(data.data)
      await fetchData()
    } catch (error) {
      console.error("Auth check failed:", error)
      router.push("/login")
    } finally {
      setLoading(false)
    }
  }

  const fetchData = async () => {
    try {
      const [electionsRes, partiesRes] = await Promise.all([
        fetch("/api/admin/elections"),
        fetch("/api/admin/parties"),
      ])
      const electionsData = await electionsRes.json()
      const partiesData = await partiesRes.json()

      if (electionsData.success) setElections(electionsData.data)
      if (partiesData.success) setParties(partiesData.data)
    } catch (error) {
      console.error("Fetch error:", error)
    }
  }

  const handleCreateElection = async (e) => {
    e.preventDefault()
    setCreating(true)
    setMessage("")

    try {
      const res = await fetch("/api/admin/elections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          startDate,
          endDate,
          candidates,
        }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        setMessage("✅ Election created successfully!")
        setTitle("")
        setDescription("")
        setStartDate("")
        setEndDate("")
        setCandidates([])
        await fetchData()
      } else {
        setMessage(`❌ ${data.message || "Failed to create election"}`)
      }
    } catch (error) {
      console.error("Election creation error:", error)
      setMessage("❌ Server error while creating election")
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="mt-10 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        <header>
          <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-black mt-2">
            Welcome back, {user?.fname} {user?.lname}
          </p>
        </header>

        {/* 🟢 Create Election Form */}
        <section className="bg-white text-black rounded-lg shadow p-6 border">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Create New Election
          </h2>
          <form onSubmit={handleCreateElection} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">
                  Start Date
                </label>
                <input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium">
                  End Date
                </label>
                <input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
                  required
                />
              </div>
            </div>

            {/* 🧩 Candidate inputs */}
            <div className="border-t pt-4 mt-4 text-black">
              <h3 className="text-lg font-medium mb-2">
                Candidates
              </h3>

              {candidates.map((c, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-3 mb-3 bg-gray-50"
                >
                  <label className="block text-sm font-medium">
                    Name
                  </label>
                  <input
                    type="text"
                    value={c.name}
                    onChange={(e) =>
                      updateCandidate(index, "name", e.target.value)
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
                    required
                  />

                  <label className="block text-sm font-medium mt-2">
                    Profession
                  </label>
                  <input
                    type="text"
                    value={c.profession}
                    onChange={(e) =>
                      updateCandidate(index, "profession", e.target.value)
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
                  />

                  <label className="block text-sm font-medium mt-2">
                    Education
                  </label>
                  <input
                    type="text"
                    value={c.education}
                    onChange={(e) =>
                      updateCandidate(index, "education", e.target.value)
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
                  />

                  <label className="block text-sm font-medium mt-2">
                    Party ID
                  </label>
                  <input
                    type="number"
                    value={c.partyId}
                    onChange={(e) =>
                      updateCandidate(index, "partyId", e.target.value)
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
                    required
                  />

                  <button
                    type="button"
                    onClick={() => removeCandidate(index)}
                    className="mt-2 text-red-600 text-sm hover:underline"
                  >
                    Remove Candidate
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={addCandidate}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 text-sm"
              >
                + Add Candidate
              </button>
            </div>

            <button
              type="submit"
              disabled={creating}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {creating ? "Creating..." : "Create Election"}
            </button>

            {message && (
              <p
                className={`mt-2 text-sm ${
                  message.startsWith("✅")
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {message}
              </p>
            )}
          </form>
        </section>

        {/* Stats summary cards */}
        <div className=" text-black grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <SummaryCard
            title="Elections"
            count={elections.length}
            color="blue"
            href="/admin/elections"
          />
          <SummaryCard
            title="Parties"
            count={parties.length}
            color="green"
            href="/admin/parties"
          />
          <SummaryCard
            title="Candidates"
            count={elections.reduce(
              (sum, e) => sum + (e._count?.candidates || 0),
              0
            )}
            color="purple"
            href="/admin/candidates"
          />
        </div>

        {/* Recent Elections & Parties */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <RecentElections elections={elections} />
          <RecentParties parties={parties} />
        </div>
      </div>
    </div>
  )
}

/* --- helper UI components --- */

function SummaryCard({ title, count, color, href }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className={`text-3xl font-bold text-${color}-600`}>{count}</p>
      <Link
        href={href}
        className={`text-sm text-${color}-600 hover:underline mt-2 inline-block`}
      >
        Manage {title} →
      </Link>
    </div>
  )
}

function RecentElections({ elections }) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b">
        <h2 className="text-xl font-semibold text-gray-900">Recent Elections</h2>
      </div>
      <div className="p-6">
        {elections.length === 0 ? (
          <p className="text-gray-500">No elections created yet</p>
        ) : (
          <div className="space-y-4">
            {elections.slice(0, 5).map((election) => (
              <div
                key={election.id}
                className="border-l-4 border-blue-500 pl-4"
              >
                <h3 className="font-semibold text-gray-900">
                  {election.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {new Date(election.startDate).toLocaleDateString()} –{" "}
                  {new Date(election.endDate).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-500">
                  {election._count?.candidates || 0} candidates,{" "}
                  {election._count?.votes || 0} votes
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function RecentParties({ parties }) {
  return (
    <div className="text-black bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b">
        <h2 className="text-xl font-semibold text-gray-900">
          Political Parties
        </h2>
      </div>
      <div className="p-6">
        {parties.length === 0 ? (
          <p className="">No parties registered yet</p>
        ) : (
          <div className="space-y-3">
            {parties.slice(0, 5).map((party) => (
              <div
                key={party.id}
                className="flex justify-between items-center p-3 bg-gray-50 rounded"
              >
                <div>
                  <p className="font-semibold text-gray-900">{party.name}</p>
                  {party.shortName && (
                    <p className="text-sm ">
                      ({party.shortName})
                    </p>
                  )}
                </div>
                <span className="text-sm">
                  {party._count?.candidates || 0} candidates
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
