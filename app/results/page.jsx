'use client';

import { useState, useEffect } from 'react';

export default function ResultsPage() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchResults();
    
    // Auto-refresh every 5 seconds
    const interval = setInterval(fetchResults, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchResults = async () => {
    try {
      const response = await fetch('/api/results');
      const data = await response.json();

      if (data.success) {
        setResults(data.data);
      } else {
        setError(data.message || 'Failed to load results');
      }
    } catch (err) {
      setError('An error occurred while fetching results');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading results...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  const winner = results?.results[0];

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Election Results</h1>
          <p className="text-gray-600">
            Total Votes: <span className="font-semibold">{results?.totalVotes || 0}</span>
          </p>
          <p className="text-sm text-gray-500 mt-2">Updates automatically every 5 seconds</p>
        </div>

        {winner && winner.voteCount > 0 && (
          <div className="mb-8 bg-linear-to-r from-yellow-100 to-yellow-50 border-2 border-yellow-400 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-yellow-800 mb-1">
                  🏆 LEADING
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{winner.name}</h2>
                <p className="text-gray-600">{winner.party}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-yellow-600">
                  {winner.voteCount}
                </div>
                <div className="text-sm text-gray-600">
                  {winner.percentage}% of votes
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {results?.results.map((candidate, index) => (
            <div
              key={candidate.id}
              className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:shadow-md transition"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-4">
                  <div className="text-2xl font-bold text-gray-400">
                    #{index + 1}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {candidate.name}
                    </h3>
                    <p className="text-gray-600">{candidate.party}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">
                    {candidate.voteCount}
                  </div>
                  <div className="text-sm text-gray-600">votes</div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${candidate.percentage}%` }}
                ></div>
              </div>
              <div className="text-right text-sm text-gray-600 mt-1">
                {candidate.percentage}%
              </div>
            </div>
          ))}
        </div>

        {results?.totalVotes === 0 && (
          <div className="text-center text-gray-500 mt-8">
            No votes have been cast yet.
          </div>
        )}
      </div>
    </div>
  );
}