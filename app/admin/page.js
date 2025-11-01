"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"

export default function AdminDashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [elections, setElections] = useState([])
  const [parties, setParties] = useState([])
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [creating, setCreating] = useState(false)
  const [message, setMessage] = useState("")
  const [candidates, setCandidates] = useState([])

  const addCandidate = () => setCandidates([...candidates, { name: "", profession: "", education: "", partyId: "" }])
  const removeCandidate = (i) => setCandidates(candidates.filter((_, idx) => idx !== i))
  const updateCandidate = (i, field, val) => {
    const updated = [...candidates]
    updated[i][field] = val
    setCandidates(updated)
  }

  useEffect(() => {
    verifyAdmin()
  }, [])

  const verifyAdmin = async () => {
    try {
      const res = await fetch("/api/auth/me")
      const data = await res.json()
      if (!data.success) return router.push("/login")

      const role = data.data.role?.toLowerCase()
      if (role !== "admin") return router.push("/elections")

      setUser(data.data)
      await fetchData()
    } catch (err) {
      console.error(err)
      router.push("/login")
    } finally {
      setLoading(false)
    }
  }

  const fetchData = async () => {
    const [electionsRes, partiesRes] = await Promise.all([
      fetch("/api/admin/elections"),
      fetch("/api/admin/parties"),
    ])
    const electionsData = await electionsRes.json()
    const partiesData = await partiesRes.json()
    if (electionsData.success) setElections(electionsData.data)
    if (partiesData.success) setParties(partiesData.data)
  }

  const handleCreateElection = async (e) => {
    e.preventDefault()
    setCreating(true)
    setMessage("")
    try {
      const res = await fetch("/api/admin/elections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, startDate, endDate, candidates }),
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
    } catch {
      setMessage("❌ Server error while creating election")
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl text-gray-700">
        Loading...
      </div>
    )
  }

  return (
    <div className="min-h-screenbg-linear-to-br from-gray-950 via-gray-900 to-black text-white   py-12 px-6 lg:px-10">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between"
        >
          <div>
            <h1 className="text-4xl font-bold text-gray-200 tracking-tight">Admin Dashboard</h1>
            <p className="text-gray-300 mt-1">
              Welcome back, <span className="font-semibold">{user?.fname} {user?.lname}</span>
            </p>
          </div>
          <Link href="/admin/parties" className="mt-4 md:mt-0 px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-medium">
            + Manage Parties
          </Link>
        </motion.header>

        {/* Create Election */}
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="backdrop-blur-sm bg-white/0 rounded-xl shadow-lg border border-gray-200 p-8"
        >
          <h2 className="text-2xl font-semibold text-gray-200 mb-6">🗳️ Create New Election</h2>
          <form onSubmit={handleCreateElection} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Title" value={title} onChange={setTitle} required />
              <Input label="Description" value={description} onChange={setDescription} textarea />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Start Date" type="datetime-local" value={startDate} onChange={setStartDate} required />
              <Input label="End Date" type="datetime-local" value={endDate} onChange={setEndDate} required />
            </div>

            <div className="pt-4 border-t border-slate-400">
              <h3 className="text-lg font-medium mb-3 text-gray-200">Candidates</h3>

              {candidates.map((c, index) => (
                <div key={index} className="bg-green-600 hover:bg-green-700 border border-gray-200 rounded-lg p-4 mb-4">
                  <Input label="Name" value={c.name} onChange={(v) => updateCandidate(index, "name", v)} required />
                  <Input label="Profession" value={c.profession} onChange={(v) => updateCandidate(index, "profession", v)} />
                  <Input label="Education" value={c.education} onChange={(v) => updateCandidate(index, "education", v)} />
                  <Input label="Party ID" type="number" value={c.partyId} onChange={(v) => updateCandidate(index, "partyId", v)} required />
                  <button onClick={() => removeCandidate(index)} type="button" className="text-red-600 text-sm mt-2 hover:underline">
                    Remove Candidate
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={addCandidate}
                className="mt-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md text-sm font-medium"
              >
                + Add Candidate
              </button>
            </div>

            <button
              type="submit"
              disabled={creating}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition disabled:opacity-50"
            >
              {creating ? "Creating..." : "Create Election"}
            </button>

            {message && (
              <p className={`mt-3 text-sm ${message.startsWith("✅") ? "text-green-600" : "text-red-600"}`}>
                {message}
              </p>
            )}
          </form>
        </motion.section>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <SummaryCard title="Elections" count={elections.length} color="yellow" href="/admin/elections" />
          <SummaryCard title="Parties" count={parties.length} color="green" href="/admin/parties" />
          <SummaryCard title="Candidates" count={elections.reduce((sum, e) => sum + (e._count?.candidates || 0), 0)} color="purple" href="/admin/candidates" />
        </div>

        {/* Recent */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <RecentElections elections={elections} />
          <RecentParties parties={parties} />
        </div>
      </div>
    </div>
  )
}

/* ----- Small UI Components ----- */

function Input({ label, value, onChange, type = "text", textarea = false, required }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500"
          rows="3"
          required={required}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500"
          required={required}
        />
      )}
    </div>
  )
}

function SummaryCard({ title, count, color, href }) {
  return (
    <motion.div whileHover={{ y: -5 }} className="bg-white/0 shadow-md rounded-xl p-6 border border-gray-100 transition">
      <h3 className="text-lg font-semibold text-gray-200">{title}</h3>
      <p className={`text-4xl font-bold text-${color}-600 mt-2`}>{count}</p>
      <Link href={href} className={`text-sm text-${color}-600 hover:underline mt-3 inline-block`}>
        Manage {title} →
      </Link>
    </motion.div>
  )
}

function RecentElections({ elections }) {
  return (
    <div className="bg-white/0 rounded-xl shadow-md border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 bg-gray-50/0 border-b">
        <h2 className="text-lg font-semibold text-gray-200">Recent Elections</h2>
      </div>
      <div className="p-6 space-y-3">
        {elections.length === 0 ? (
          <p className="text-gray-500">No elections created yet</p>
        ) : (
          elections.slice(0, 5).map((e) => (
            <div key={e.id} className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-medium text-gray-100">{e.title}</h3>
              <p className="text-sm text-gray-300">
                {new Date(e.startDate).toLocaleDateString()} – {new Date(e.endDate).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-500">
                {e._count?.candidates || 0} candidates, {e._count?.votes || 0} votes
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function RecentParties({ parties }) {
  return (
    <div className="bg-white/0 rounded-xl shadow-md border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 bg-gray-50/0 border-b">
        <h2 className="text-lg font-semibold text-gray-200">Political Parties</h2>
      </div>
      <div className="p-6 space-y-3">
        {parties.length === 0 ? (
          <p className="text-gray-500">No parties registered yet</p>
        ) : (
          parties.slice(0, 5).map((p) => (
            <div key={p.id} className="flex justify-between items-center bg-gray-50/0 p-3 rounded-md">
              <div>
                <p className="font-semibold text-gray-100">{p.name}</p>
                {p.shortName && <p className="text-sm text-gray-200">({p.shortName})</p>}
              </div>
              <span className="text-sm text-gray-300">{p._count?.candidates || 0} candidates</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
