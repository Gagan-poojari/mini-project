'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [elections, setElections] = useState([]);
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    fetchData();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();

      if (!data.success || data.data.role !== 'ADMIN') {
        router.push('/');
        return;
      }

      setUser(data.data);
    } catch (error) {
      router.push('/');
    }
  };

  const fetchData = async () => {
    try {
      const [electionsRes, partiesRes] = await Promise.all([
        fetch('/api/admin/elections'),
        fetch('/api/admin/parties'),
      ]);

      const electionsData = await electionsRes.json();
      const partiesData = await partiesRes.json();

      if (electionsData.success) setElections(electionsData.data);
      if (partiesData.success) setParties(partiesData.data);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
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
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {user?.fname} {user?.lname}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Elections</h3>
            <p className="text-3xl font-bold text-blue-600">{elections.length}</p>
            <Link
              href="/admin/elections"
              className="text-sm text-blue-600 hover:underline mt-2 inline-block"
            >
              Manage Elections →
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Parties</h3>
            <p className="text-3xl font-bold text-green-600">{parties.length}</p>
            <Link
              href="/admin/parties"
              className="text-sm text-green-600 hover:underline mt-2 inline-block"
            >
              Manage Parties →
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Candidates</h3>
            <p className="text-3xl font-bold text-purple-600">
              {elections.reduce((sum, e) => sum + (e._count?.candidates || 0), 0)}
            </p>
            <Link
              href="/admin/candidates"
              className="text-sm text-purple-600 hover:underline mt-2 inline-block"
            >
              Manage Candidates →
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                    <div key={election.id} className="border-l-4 border-blue-500 pl-4">
                      <h3 className="font-semibold text-gray-900">{election.title}</h3>
                      <p className="text-sm text-gray-600">
                        {new Date(election.startDate).toLocaleDateString()} -{' '}
                        {new Date(election.endDate).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        {election._count?.candidates || 0} candidates,{' '}
                        {election._count?.votes || 0} votes
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Political Parties</h2>
            </div>
            <div className="p-6">
              {parties.length === 0 ? (
                <p className="text-gray-500">No parties registered yet</p>
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
                          <p className="text-sm text-gray-600">({party.shortName})</p>
                        )}
                      </div>
                      <span className="text-sm text-gray-500">
                        {party._count?.candidates || 0} candidates
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}