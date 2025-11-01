'use client';

import { useState, useEffect } from 'react';
import AdminRoute from '@/components/AdminRoute';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminCandidatesPage() {
  const [candidates, setCandidates] = useState([]);
  const [elections, setElections] = useState([]);
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedElection, setSelectedElection] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    profession: '',
    education: '',
    partyId: '',
    electionId: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [candidatesRes, electionsRes, partiesRes] = await Promise.all([
        fetch('/api/admin/candidates'),
        fetch('/api/admin/elections'),
        fetch('/api/admin/parties'),
      ]);

      const candidatesData = await candidatesRes.json();
      const electionsData = await electionsRes.json();
      const partiesData = await partiesRes.json();

      if (candidatesData.success) setCandidates(candidatesData.data);
      if (electionsData.success) setElections(electionsData.data);
      if (partiesData.success) setParties(partiesData.data);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/admin/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setShowModal(false);
        setFormData({
          name: '',
          profession: '',
          education: '',
          partyId: '',
          electionId: '',
        });
        fetchData();
      } else {
        setError(data.message);
      }
    } catch {
      setError('Failed to create candidate');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this candidate?')) return;

    try {
      const response = await fetch(`/api/admin/candidates?id=${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) fetchData();
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const filteredCandidates = selectedElection
    ? candidates.filter((c) => c.electionId === parseInt(selectedElection))
    : candidates;

  return (
    <AdminRoute>
      <div className="min-h-screen  bg-linear-to-br from-gray-950 via-gray-900 to-black text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-extrabold text-gray-200 tracking-tight">
                Manage Candidates
              </h1>
              <Link href="/admin" className="text-blue-600 hover:underline mt-2 inline-block">
                ← Back to Dashboard
              </Link>
            </div>

            <button
              onClick={() => setShowModal(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-purple-300 transition"
            >
              + Add Candidate
            </button>
          </div>

          {/* Filter */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-200 mb-2">
              Filter by Election
            </label>
            <select
              value={selectedElection}
              onChange={(e) => setSelectedElection(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white/0 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Elections</option>
              {elections.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.title}
                </option>
              ))}
            </select>
          </div>

          {/* Candidates */}
          {loading ? (
            <div className="text-center py-16 text-gray-200">Loading candidates...</div>
          ) : filteredCandidates.length === 0 ? (
            <div className="bg-white/0 backdrop-blur-sm rounded-2xl shadow-md p-12 text-center border border-gray-100">
              <p className="text-gray-500 text-lg">
                No candidates found yet. Add your first candidate!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCandidates.map((candidate) => (
                <motion.div
                  key={candidate.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/0 backdrop-blur-sm border border-gray-100 shadow-md hover:shadow-lg rounded-2xl p-6 transition-all duration-300"
                >
                  <h3 className="text-xl font-semibold text-gray-200 mb-1">
                    {candidate.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">{candidate.profession}</p>

                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="font-medium text-gray-600">Education:</span>{' '}
                      {candidate.education}
                    </p>
                    <p>
                      <span className="font-medium text-gray-600">Party:</span>{' '}
                      {candidate.party.name}{' '}
                      {candidate.party.shortName && `(${candidate.party.shortName})`}
                    </p>
                    <p>
                      <span className="font-medium text-gray-600">Election:</span>{' '}
                      {candidate.election.title}
                    </p>
                    <p className="text-emerald-300 font-semibold">
                      Votes: {candidate._count?.votes || 0}
                    </p>
                  </div>

                  <button
                    onClick={() => handleDelete(candidate.id)}
                    className="mt-4 w-full border border-red-200 text-red-600 font-semibold py-2 rounded-lg hover:bg-red-50 transition"
                  >
                    Delete
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Modal */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-gray-800/80 rounded-2xl shadow-2xl p-8 w-full max-w-md"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
              >
                <h2 className="text-2xl font-bold mb-6 text-gray-200">
                  Add New Candidate
                </h2>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {['name', 'profession', 'education'].map((field) => (
                    <div key={field}>
                      <label className="block text-sm font-semibold text-gray-200 mb-1 capitalize">
                        {field} *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData[field]}
                        onChange={(e) =>
                          setFormData({ ...formData, [field]: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  ))}

                  <div>
                    <label className="block text-sm font-semibold text-gray-200 mb-1">
                      Party *
                    </label>
                    <select
                      required
                      value={formData.partyId}
                      onChange={(e) => setFormData({ ...formData, partyId: e.target.value })}
                      className="w-full px-3 py-2 bg-white/0 text-gray-200 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Select a party</option>
                      {parties.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} {p.shortName && `(${p.shortName})`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-200 mb-1">
                      Election *
                    </label>
                    <select 
                      required
                      value={formData.electionId}
                      onChange={(e) =>
                        setFormData({ ...formData, electionId: e.target.value })
                      }
                      className="w-full bg-white/0 text-gray-200 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    >
                      <option className='bg-white/0 text-gray-200' value="">Select an election</option>
                      {elections.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        setError('');
                      }}
                      className="flex-1 border bg-rose-800 text-gray-200 border-gray-300 rounded-lg py-2 hover:border hover:border-blue-600 hover:bg-gray-50 hover:text-black"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 bg-purple-600 text-white rounded-lg py-2 hover:bg-purple-700 transition disabled:bg-gray-400"
                    >
                      {submitting ? 'Adding...' : 'Add Candidate'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AdminRoute>
  );
}
