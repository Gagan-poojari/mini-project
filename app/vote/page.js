'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function VotePage() {
  const router = useRouter();
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [voteStatuses, setVoteStatuses] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    fetchElections();

    return () => {
      mounted.current = false;
    };
  }, []);

  const fetchElections = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/elections?active=true');
      const data = await response.json();

      if (data.success) {
        if (!mounted.current) return;
        setElections(data.data || []);

        // fetch vote statuses in parallel (if any)
        const statuses = await Promise.all(
          (data.data || []).map(async (election) => {
            try {
              const res = await fetch(`/api/vote/status?electionId=${election.id}`);
              const json = await res.json();
              return { [election.id]: json.success ? json.data : {} };
            } catch {
              return { [election.id]: {} };
            }
          })
        );

        if (mounted.current) setVoteStatuses(Object.assign({}, ...statuses));
      } else {
        if (mounted.current) setError(data.message || 'Failed to load elections');
      }
    } catch (err) {
      if (mounted.current) setError('Failed to load elections');
    } finally {
      if (mounted.current) setLoading(false);
    }
  };

  const handleElectionSelect = async (election) => {
    setSelectedElection(election);
    setSelectedCandidate(null);
    setCandidates([]);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/elections/${election.id}/candidates`);
      const data = await res.json();
      if (data.success) setCandidates(data.data || []);
      else setError(data.message || 'Failed to load candidates');
    } catch {
      setError('Failed to load candidates');
    }
  };

  const handleVote = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedCandidate || !selectedElection) {
      setError('Please select a candidate');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/vote/cast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateId: selectedCandidate,
          electionId: selectedElection.id,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccess(data.message || 'Vote submitted');
        // refresh statuses / elections
        await fetchElections();
        // clear selection after a short confirmation
        setTimeout(() => {
          if (mounted.current) {
            setSelectedElection(null);
            setSelectedCandidate(null);
          }
        }, 1400);
      } else {
        setError(data.message || 'Failed to cast vote');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      if (mounted.current) setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-lg text-gray-600 animate-pulse">Loading elections...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-2 tracking-tight">
            🗳️ Cast Your Vote
          </h1>
          <p className="text-gray-600 text-lg">Pick an active election and choose your candidate</p>
          <p className="text-sm text-gray-500 mt-2">Secure · Anonymous · One vote per user</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-lg text-center">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-100 text-green-700 px-4 py-3 rounded-lg text-center">
            ✅ {success}
          </div>
        )}

        <AnimatePresence mode="wait">
          {!selectedElection ? (
            <motion.div
              key="elections-list"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="space-y-6"
            >
              {elections.length === 0 ? (
                <div className="bg-white/80 rounded-xl shadow-lg p-12 text-center border border-gray-100">
                  <p className="text-gray-600 text-lg">No active elections available</p>
                </div>
              ) : (
                elections.map((election) => {
                  const status = voteStatuses[election.id] || {};
                  const hasVoted = !!status.hasVoted;
                  return (
                    <div
                      key={election.id}
                      role={hasVoted ? 'article' : 'button'}
                      tabIndex={0}
                      onKeyDown={(ev) => {
                        if (!hasVoted && (ev.key === 'Enter' || ev.key === ' ')) handleElectionSelect(election);
                      }}
                      onClick={() => !hasVoted && handleElectionSelect(election)}
                      className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all duration-200 cursor-pointer
                        ${hasVoted ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-md hover:-translate-y-0.5'}`}
                      aria-disabled={hasVoted}
                      aria-label={`${election.title} ${hasVoted ? '— already voted' : ''}`}
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <h2 className="text-2xl font-bold text-gray-900 truncate">{election.title}</h2>
                            <span className="px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-700">
                              {new Date(election.endDate) > new Date() ? 'Active' : 'Ended'}
                            </span>
                          </div>
                          {election.description && (
                            <p className="text-gray-600 text-sm max-w-2xl">{election.description}</p>
                          )}
                          <p className="text-sm text-gray-500 mt-3">
                            Ends:{' '}
                            <span className="text-gray-700 font-medium">
                              {new Date(election.endDate).toLocaleString()}
                            </span>
                          </p>
                        </div>

                        <div className="flex flex-col items-end gap-3">
                          {hasVoted ? (
                            <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-semibold">
                              ✓ Voted
                            </span>
                          ) : (
                            <button
                              onClick={(ev) => {
                                ev.stopPropagation();
                                handleElectionSelect(election);
                              }}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold transition-transform hover:scale-105 shadow-sm"
                              aria-label={`Vote in ${election.title}`}
                            >
                              Vote →
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </motion.div>
          ) : (
            <motion.div
              key="candidates-panel"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <button
                onClick={() => {
                  setSelectedElection(null);
                  setCandidates([]);
                  setSelectedCandidate(null);
                  setError('');
                  setSuccess('');
                }}
                className="text-blue-600 hover:text-blue-500 mb-4 inline-block"
              >
                ← Back to Elections
              </button>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                <h2 className="text-3xl font-bold text-gray-900">{selectedElection.title}</h2>
                {selectedElection.description && (
                  <p className="text-gray-600 mt-2">{selectedElection.description}</p>
                )}
                <p className="text-sm text-gray-500 mt-3">
                  Ends:{' '}
                  <span className="text-gray-700 font-medium">
                    {new Date(selectedElection.endDate).toLocaleString()}
                  </span>
                </p>
              </div>

              <form onSubmit={handleVote}>
                <div className="grid gap-6 md:grid-cols-2">
                  {candidates.length === 0 ? (
                    <div className="bg-white/80 rounded-xl shadow p-8 border border-gray-100 text-center">
                      <p className="text-gray-600">No candidates found for this election.</p>
                    </div>
                  ) : (
                    candidates.map((candidate) => (
                      <label
                        key={candidate.id}
                        className={`block rounded-xl p-5 border-2 transition-colors cursor-pointer
                          ${selectedCandidate === candidate.id ? 'border-purple-500 bg-purple-50 shadow-md' : 'border-gray-100 hover:border-purple-200'}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900">{candidate.name}</h3>
                            {candidate.profession && (
                              <p className="text-sm text-gray-600 mt-1">{candidate.profession}</p>
                            )}
                            <p className="text-sm text-gray-500 mt-2">
                              Party:{' '}
                              <span className="text-gray-700 font-medium">
                                {candidate.party?.name || 'Independent'}
                              </span>
                            </p>
                          </div>

                          <input
                            type="radio"
                            name="candidate"
                            value={candidate.id}
                            checked={selectedCandidate === candidate.id}
                            onChange={() => setSelectedCandidate(candidate.id)}
                            className="h-5 w-5 text-purple-600"
                            aria-label={`Select ${candidate.name}`}
                          />
                        </div>
                      </label>
                    ))
                  )}
                </div>

                <div className="text-center mt-10">
                  <button
                    type="submit"
                    disabled={!selectedCandidate || submitting}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-10 rounded-lg font-bold hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-disabled={!selectedCandidate || submitting}
                  >
                    {submitting ? 'Submitting...' : 'Submit Vote'}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
