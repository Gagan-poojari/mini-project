'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function VotePage() {
  const router = useRouter();
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [voteStatus, setVoteStatus] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Check vote status
      const statusRes = await fetch('/api/vote/status');
      const statusData = await statusRes.json();

      if (statusData.success) {
        setVoteStatus(statusData.data);
        
        // If already voted, redirect to results
        if (statusData.data.hasVoted) {
          router.push('/results');
          return;
        }
      }

      // Fetch candidates
      const candidatesRes = await fetch('/api/candidates');
      const candidatesData = await candidatesRes.json();

      if (candidatesData.success) {
        setCandidates(candidatesData.data);
      }
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (e) => {
    e.preventDefault();

    if (!selectedCandidate) {
      setError('Please select a candidate');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/vote/cast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          candidateId: selectedCandidate,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(data.message);
        setTimeout(() => {
          router.push('/results');
          router.refresh();
        }, 2000);
      } else {
        setError(data.message || 'Failed to cast vote');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Cast Your Vote</h1>
          <p className="text-gray-600">Select a candidate to vote for</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        )}

        <form onSubmit={handleVote}>
          <div className="grid gap-4 md:grid-cols-2 mb-8">
            {candidates.map((candidate) => (
              <div
                key={candidate.id}
                onClick={() => setSelectedCandidate(candidate.id)}
                className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
                  selectedCandidate === candidate.id
                    ? 'border-blue-600 bg-blue-50 shadow-lg'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {candidate.name}
                    </h3>
                    <p className="text-gray-600">{candidate.party}</p>
                  </div>
                  <input
                    type="radio"
                    name="candidate"
                    value={candidate.id}
                    checked={selectedCandidate === candidate.id}
                    onChange={() => setSelectedCandidate(candidate.id)}
                    className="mt-1 h-5 w-5 text-blue-600 cursor-pointer"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center">
            <button
              type="submit"
              disabled={!selectedCandidate || submitting}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting Vote...' : 'Submit Vote'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}