'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ResultsPage() {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchElections();
    const interval = setInterval(fetchElections, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchElections = async () => {
    try {
      const response = await fetch('/api/elections');
      const data = await response.json();

      if (data.success) {
        setElections(data.data);
      } else {
        setError(data.message || 'Failed to load elections');
      }
    } catch (err) {
      setError('An error occurred while fetching elections');
    } finally {
      setLoading(false);
    }
  };

  const getElectionStatus = (election) => {
    const now = new Date();
    const start = new Date(election.startDate);
    const end = new Date(election.endDate);

    if (now < start) return { status: 'Upcoming', color: 'bg-yellow-200 text-yellow-900' };
    if (now > end) return { status: 'Ended', color: 'bg-gray-200 text-gray-800' };
    return { status: 'Active', color: 'bg-green-200 text-green-900' };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-xl font-medium text-gray-700 animate-pulse">
          Loading election results...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-white">
        <div className="text-xl text-red-600 font-semibold">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-2 tracking-tight">
            Election Results
          </h1>
          <p className="text-gray-600 text-lg">View live and past election outcomes</p>
          <p className="text-sm text-gray-500 mt-2">
            Updates automatically every 10 seconds ⏱️
          </p>
        </div>

        {elections.length === 0 ? (
          <div className="bg-white/70 backdrop-blur rounded-xl shadow-lg p-16 text-center border border-gray-100">
            <p className="text-gray-500 text-lg">No elections available</p>
          </div>
        ) : (
          <div className="space-y-8">
            {elections.map((election) => {
              const statusInfo = getElectionStatus(election);
              return (
                <div
                  key={election.id}
                  className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                >
                  {/* Header */}
                  <div className="px-6 py-4 bg-gray-50 border-b flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h2 className="text-2xl font-bold text-gray-900">{election.title}</h2>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${statusInfo.color}`}
                        >
                          {statusInfo.status}
                        </span>
                      </div>
                      {election.description && (
                        <p className="text-gray-600 text-sm max-w-xl">{election.description}</p>
                      )}
                    </div>
                    <Link
                      href={`/results/${election.id}`}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold transition-transform duration-300 hover:scale-105 shadow-sm"
                    >
                      View Details →
                    </Link>
                  </div>

                  {/* Stats */}
                  <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="bg-gray-50 rounded-lg p-5 hover:bg-gray-100 transition">
                      <p className="text-gray-500 text-sm mb-1">Total Votes</p>
                      <p className="text-3xl font-bold text-blue-600">
                        {election._count?.votes || 0}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-5 hover:bg-gray-100 transition">
                      <p className="text-gray-500 text-sm mb-1">Candidates</p>
                      <p className="text-3xl font-bold text-purple-600">
                        {election._count?.candidates || 0}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-5 hover:bg-gray-100 transition">
                      <p className="text-gray-500 text-sm mb-1">Start Date</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {new Date(election.startDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-5 hover:bg-gray-100 transition">
                      <p className="text-gray-500 text-sm mb-1">End Date</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {new Date(election.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
