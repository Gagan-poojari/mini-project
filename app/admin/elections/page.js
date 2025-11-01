"use client";

import { useState, useEffect } from "react";
import AdminRoute from "@/components/AdminRoute";
import Link from "next/link";

export default function AdminElectionsPage() {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchElections();
  }, []);

  const fetchElections = async () => {
    try {
      const response = await fetch("/api/admin/elections");
      const data = await response.json();
      if (data.success) {
        setElections(data.data);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/admin/elections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setShowModal(false);
        setFormData({ title: "", description: "", startDate: "", endDate: "" });
        fetchElections();
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Failed to create election");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this election?")) return;

    try {
      const response = await fetch(`/api/admin/elections/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (data.success) {
        fetchElections();
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const getElectionStatus = (election) => {
    const now = new Date();
    const start = new Date(election.startDate);
    const end = new Date(election.endDate);

    if (now < start)
      return { status: "Upcoming", color: "bg-yellow-100 text-yellow-800" };
    if (now > end)
      return { status: "Ended", color: "bg-gray-100 text-gray-800" };
    return { status: "Active", color: "bg-green-100 text-green-800" };
  };

  return (
    <AdminRoute>
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-200">
                Manage Elections
              </h1>
              <Link
                href="/admin"
                className="text-blue-600 hover:underline mt-2 inline-block"
              >
                ← Back to Dashboard
              </Link>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
            >
              + Create Election
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">Loading...</div>
          ) : elections.length === 0 ? (
            <div className="bg-white/0 text-gray-200 rounded-lg shadow p-12 text-center">
              <p className="text-gray-200 text-lg">No elections created yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {elections.map((election) => {
                const statusInfo = getElectionStatus(election);
                return (
                  <div
                    key={election.id}
                    className="bg-white/0 text-gray-200 rounded-lg border border-gray-300 shadow p-6"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-2xl font-bold text-gray-200">
                            {election.title}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold ${statusInfo.color}`}
                          >
                            {statusInfo.status}
                          </span>
                        </div>
                        {election.description && (
                          <p className="text-gray-200 mb-3">
                            {election.description}
                          </p>
                        )}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-200">Start Date:</span>
                            <p className="font-semibold">
                              {new Date(
                                election.startDate
                              ).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-200">End Date:</span>
                            <p className="font-semibold">
                              {new Date(election.endDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500">Candidates:</span>
                            <p className="font-semibold">
                              {election._count?.candidates || 0}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500">Total Votes:</span>
                            <p className="font-semibold">
                              {election._count?.votes || 0}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link
                          href={`/results/${election.id}`}
                          className="text-blue-600 hover:bg-blue-50 px-4 py-2 rounded"
                        >
                          View Results
                        </Link>
                        <button
                          onClick={() => handleDelete(election.id)}
                          className="text-red-600 hover:bg-red-50 px-4 py-2 rounded"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Create Election Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-gray-900/80 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 text-gray-200 rounded-lg max-w-md w-full p-6">
              <h2 className="text-2xl font-bold mb-4">Create New Election</h2>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-1">
                    Election Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., City Council Election 2025"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="Brief description of the election"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-1">
                    Start Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-1">
                    End Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setError("");
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    {submitting ? "Creating..." : "Create Election"}
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
