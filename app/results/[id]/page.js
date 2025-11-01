'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function ElectionResultsPage() {
  const params = useParams();
  const electionId = params.id;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (electionId) {
      fetchResults();
      const interval = setInterval(fetchResults, 5000);
      return () => clearInterval(interval);
    }
  }, [electionId]);

  const fetchResults = async () => {
    try {
      const response = await fetch(`/api/elections/${electionId}/results`);
      const resultData = await response.json();

      if (resultData.success) {
        setData(resultData.data);
      } else {
        setError(resultData.message || 'Failed to load results');
      }
    } catch (err) {
      setError('An error occurred while fetching results');
    } finally {
      setLoading(false);
    }
  };

  const getElectionStatus = (election) => {
    const now = new Date();
    const start = new Date(election.startDate);
    const end = new Date(election.endDate);

    if (now < start) return { status: 'Upcoming', color: 'bg-yellow-100 text-yellow-800' };
    if (now > end) return { status: 'Ended', color: 'bg-gray-100 text-gray-800' };
    return { status: 'Active', color: 'bg-green-100 text-green-800' };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
        <div className="text-2xl font-semibold text-gray-700 animate-pulse">
          Loading results...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-white">
        <div className="text-xl text-red-600 font-semibold bg-white px-6 py-4 rounded-xl shadow">
          {error}
        </div>
      </div>
    );
  }

  const winner = data?.results[0];
  const statusInfo = getElectionStatus(data.election);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Back Button */}
        <div>
          <Link
            href="/results"
            className="text-blue-600 font-medium hover:underline flex items-center gap-2"
          >
            ← Back to All Results
          </Link>
        </div>

        {/* Election Header */}
        <div className="text-center bg-white rounded-2xl shadow-md p-8 border border-gray-100">
          <div className="flex justify-center items-center gap-3 mb-4">
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
              {data.election.title}
            </h1>
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold ${statusInfo.color}`}
            >
              {statusInfo.status}
            </span>
          </div>

          {data.election.description && (
            <p className="text-gray-600 max-w-2xl mx-auto mb-6">
              {data.election.description}
            </p>
          )}

          <div className="flex flex-wrap justify-center gap-8 text-sm">
            <div>
              <span className="text-gray-500">Total Votes:</span>
              <span className="font-semibold ml-2 text-gray-900">{data.totalVotes || 0}</span>
            </div>
            <div>
              <span className="text-gray-500">Start:</span>
              <span className="font-semibold ml-2 text-gray-900">
                {new Date(data.election.startDate).toLocaleDateString()}
              </span>
            </div>
            <div>
              <span className="text-gray-500">End:</span>
              <span className="font-semibold ml-2 text-gray-900">
                {new Date(data.election.endDate).toLocaleDateString()}
              </span>
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-3 italic">
            🔄 Updates automatically every 5 seconds
          </p>
        </div>

        {/* Winner Card */}
        {winner && winner.voteCount > 0 && (
          <div className="bg-gradient-to-r from-yellow-100 via-amber-50 to-yellow-100 border-2 border-yellow-400 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-sm font-semibold text-yellow-700 mb-1 tracking-wide">
                  🏆 LEADING CANDIDATE
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-1">{winner.name}</h2>
                <p className="text-gray-600">{winner.profession}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {winner.party.name}
                  {winner.party.shortName && ` (${winner.party.shortName})`}
                </p>
              </div>
              <div className="text-right">
                <div className="text-5xl font-extrabold text-yellow-600">
                  {winner.voteCount}
                </div>
                <div className="text-sm text-gray-600">{winner.percentage}% of votes</div>
              </div>
            </div>
          </div>
        )}

        {/* Candidates List */}
        <div className="space-y-4">
          {data.results.map((candidate, index) => (
            <div
              key={candidate.id}
              className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-4 flex-1">
                  <div className="text-2xl font-bold text-gray-300 w-8">#{index + 1}</div>
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                      {candidate.name}
                    </h3>
                    <p className="text-sm text-gray-600">{candidate.profession}</p>
                    <p className="text-sm text-gray-500">
                      {candidate.party.name}
                      {candidate.party.shortName && ` (${candidate.party.shortName})`}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600">
                    {candidate.voteCount}
                  </div>
                  <div className="text-sm text-gray-600">votes</div>
                </div>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-700 h-3 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${candidate.percentage}%` }}
                ></div>
              </div>
              <div className="text-right text-sm text-gray-600 mt-1">
                {candidate.percentage}%
              </div>
            </div>
          ))}
        </div>

        {/* No Votes Message */}
        {data.totalVotes === 0 && (
          <div className="text-center text-gray-600 mt-12 bg-white rounded-2xl shadow-lg p-12 border border-gray-100">
            <p className="text-lg font-medium">No votes have been cast yet in this election.</p>
          </div>
        )}
      </div>
    </div>
  );
}
