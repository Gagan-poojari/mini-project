'use client';

import { useState, useEffect } from 'react';
import AdminRoute from '@/components/AdminRoute';
import Link from 'next/link';
import { PlusCircle, Trash2 } from 'lucide-react';

export default function AdminPartiesPage() {
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', shortName: '', logo: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchParties();
  }, []);

  const fetchParties = async () => {
    try {
      const response = await fetch('/api/admin/parties');
      const data = await response.json();
      if (data.success) setParties(data.data);
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
      const response = await fetch('/api/admin/parties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        setShowModal(false);
        setFormData({ name: '', shortName: '', logo: '' });
        fetchParties();
      } else {
        setError(data.message);
      }
    } catch {
      setError('Failed to create party');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure? This will delete all associated candidates!')) return;
    try {
      const response = await fetch(`/api/admin/parties?id=${id}`, { method: 'DELETE' });
      const data = await response.json();
      if (data.success) fetchParties();
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  return (
    <AdminRoute>
      <div className="min-h-screen bg-gray-50 py-12 px-6 lg:px-10">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="flex justify-between items-center mb-10">
            <div>
              <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Manage Parties</h1>
              <Link
                href="/admin"
                className="inline-block text-blue-600 hover:text-blue-700 font-medium mt-2"
              >
                ← Back to Dashboard
              </Link>
            </div>

            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-300"
            >
              <PlusCircle size={20} />
              Add Party
            </button>
          </div>

          {/* Content Section */}
          {loading ? (
            <div className="text-center py-12 text-gray-600 animate-pulse">Loading...</div>
          ) : parties.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center border border-gray-100">
              <p className="text-gray-500 text-lg">No parties registered yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {parties.map((party) => (
                <div
                  key={party.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 p-6 flex flex-col justify-between"
                >
                  <div>
                    {party.logo && (
                      <div className="flex justify-center mb-4">
                        <img
                          src={party.logo}
                          alt={`${party.name} logo`}
                          className="w-20 h-20 object-contain rounded-full border border-gray-200 p-2 bg-gray-50"
                        />
                      </div>
                    )}
                    <div className="text-center">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{party.name}</h3>
                      {party.shortName && (
                        <p className="text-green-600 font-medium">({party.shortName})</p>
                      )}
                    </div>

                    <div className="mt-4 space-y-2 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Candidates:</span>
                        <span className="font-semibold text-gray-800">
                          {party._count?.candidates || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Created:</span>
                        <span className="font-semibold text-gray-800">
                          {new Date(party.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(party.id)}
                    className="mt-6 flex items-center justify-center gap-2 text-red-600 hover:bg-red-50 py-2.5 rounded-lg border border-red-200 font-medium transition-all duration-300"
                  >
                    <Trash2 size={18} />
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Party Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-fadeIn">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                Add New Party
              </h2>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Party Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="e.g., Progressive Democratic Party"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Short Name
                  </label>
                  <input
                    type="text"
                    value={formData.shortName}
                    onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="e.g., PDP"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Logo URL (optional)
                  </label>
                  <input
                    type="url"
                    value={formData.logo}
                    onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="https://example.com/logo.png"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setError('');
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 shadow-md hover:shadow-lg transition disabled:bg-gray-400"
                  >
                    {submitting ? 'Adding...' : 'Add Party'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminRoute>
  );
}
