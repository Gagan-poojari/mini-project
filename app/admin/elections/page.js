"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminElectionsPage() {
  const router = useRouter();
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editState, setEditState] = useState({});
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadElections();
  }, []);

  async function loadElections() {
    setLoading(true);
    setFetchError("");
    try {
      const res = await fetch("/api/admin/elections", {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (res.status === 401 || res.status === 403) {
        // not authorized - redirect to login or elections
        router.push("/login");
        return;
      }

      const payload = await res.json();
      if (!payload.success) {
        setFetchError(payload.message || "Failed to load elections");
        setElections([]);
      } else {
        // ensure dates are normalized for date inputs (YYYY-MM-DD)
        const normalized = payload.data.map((e) => ({
          ...e,
          startDateISO: toDateInputValue(e.startDate),
          endDateISO: toDateInputValue(e.endDate),
        }));
        setElections(normalized);
      }
    } catch (err) {
      console.error("Load elections error:", err);
      setFetchError("Server error while loading elections");
    } finally {
      setLoading(false);
    }
  }

  function toDateInputValue(when) {
    if (!when) return "";
    // Accept either Date string or Date object
    const d = new Date(when);
    // Build YYYY-MM-DD
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  function startEdit(election) {
    setEditingId(election.id);
    setEditState({
      title: election.title || "",
      description: election.description || "",
      startDate: election.startDateISO || "",
      endDate: election.endDateISO || "",
    });
    setMessage("");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditState({});
    setMessage("");
  }

  function updateField(field, value) {
    setEditState((s) => ({ ...s, [field]: value }));
  }

  async function saveEdit(id) {
    setSaving(true);
    setMessage("");
    try {
      // Validate dates
      if (!editState.title || !editState.startDate || !editState.endDate) {
        setMessage("Title, start date and end date are required.");
        setSaving(false);
        return;
      }

      const body = {
        title: editState.title,
        description: editState.description,
        // Convert to full ISO so Prisma can parse it (set to start of day)
        startDate: new Date(editState.startDate).toISOString(),
        endDate: new Date(editState.endDate).toISOString(),
      };

      const res = await fetch(`/api/admin/elections/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.status === 401 || res.status === 403) {
        setMessage("Unauthorized. Please login as admin.");
        setSaving(false);
        return;
      }

      const payload = await res.json();
      if (!payload.success) {
        setMessage(payload.message || "Failed to update election");
        setSaving(false);
        return;
      }

      // Update local list
      setElections((prev) =>
        prev.map((e) =>
          e.id === id
            ? {
                ...payload.data,
                startDateISO: toDateInputValue(payload.data.startDate),
                endDateISO: toDateInputValue(payload.data.endDate),
              }
            : e
        )
      );

      setMessage("Election updated");
      setEditingId(null);
      setEditState({});
    } catch (err) {
      console.error("Save edit error:", err);
      setMessage("Server error while updating");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Are you sure you want to delete this election? This cannot be undone.")) return;
    setDeletingId(id);
    setMessage("");
    try {
      const res = await fetch(`/api/admin/elections/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.status === 401 || res.status === 403) {
        setMessage("Unauthorized. Please login as admin.");
        setDeletingId(null);
        return;
      }

      const payload = await res.json();
      if (!payload.success) {
        setMessage(payload.message || "Failed to delete election");
        setDeletingId(null);
        return;
      }

      // remove locally
      setElections((prev) => prev.filter((e) => e.id !== id));
      setMessage("Election deleted");
    } catch (err) {
      console.error("Delete error:", err);
      setMessage("Server error while deleting");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="mt-10 text-black max-w-6xl mx-auto py-10 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-semibold">Manage Elections</h1>
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="text-sm px-3 py-2 border rounded hover:bg-gray-50"
          >
            Dashboard
          </Link>
          <Link
            href="/admin/elections/create"
            className="text-sm px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            + Create Election
          </Link>
        </div>
      </div>

      {message && (
        <div
          className={`mb-4 p-3 rounded ${
            message.startsWith("Election") || message.startsWith("Updated") || message.startsWith("Election updated") || message.startsWith("Election deleted")
              ? "bg-green-50 text-green-800"
              : "bg-red-50 text-red-800"
          }`}
        >
          {message}
        </div>
      )}

      {loading ? (
        <div className="text-center py-20">Loading elections...</div>
      ) : fetchError ? (
        <div className="text-red-600">{fetchError}</div>
      ) : elections.length === 0 ? (
        <div className="text-gray-600">No elections found.</div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="w-full table-auto">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3">Title</th>
                <th className="text-left px-4 py-3">Description</th>
                <th className="text-left px-4 py-3">Start Date</th>
                <th className="text-left px-4 py-3">End Date</th>
                <th className="px-4 py-3">Candidates</th>
                <th className="px-4 py-3">Votes</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {elections.map((e) => (
                <tr key={e.id} className="border-t">
                  <td className="px-4 py-3">
                    {editingId === e.id ? (
                      <input
                        className="border rounded px-2 py-1 w-full"
                        value={editState.title}
                        onChange={(ev) => updateField("title", ev.target.value)}
                      />
                    ) : (
                      <div className="font-medium">{e.title}</div>
                    )}
                  </td>

                  <td className="px-4 py-3 w-1/3">
                    {editingId === e.id ? (
                      <input
                        className="border rounded px-2 py-1 w-full"
                        value={editState.description}
                        onChange={(ev) => updateField("description", ev.target.value)}
                      />
                    ) : (
                      <div className="text-sm text-gray-600">{e.description || "-"}</div>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    {editingId === e.id ? (
                      <input
                        type="date"
                        className="border rounded px-2 py-1"
                        value={editState.startDate}
                        onChange={(ev) => updateField("startDate", ev.target.value)}
                      />
                    ) : (
                      <div className="text-sm">{new Date(e.startDate).toLocaleDateString()}</div>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    {editingId === e.id ? (
                      <input
                        type="date"
                        className="border rounded px-2 py-1"
                        value={editState.endDate}
                        onChange={(ev) => updateField("endDate", ev.target.value)}
                      />
                    ) : (
                      <div className="text-sm">{new Date(e.endDate).toLocaleDateString()}</div>
                    )}
                  </td>

                  <td className="px-4 py-3 text-center">
                    <div className="text-sm">{e._count?.candidates ?? (e.candidates?.length ?? 0)}</div>
                  </td>

                  <td className="px-4 py-3 text-center">
                    <div className="text-sm">{e._count?.votes ?? 0}</div>
                  </td>

                  <td className="px-4 py-3 text-right space-x-2">
                    {editingId === e.id ? (
                      <>
                        <button
                          onClick={() => saveEdit(e.id)}
                          disabled={saving}
                          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60"
                        >
                          {saving ? "Saving..." : "Save"}
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(e)}
                          className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(e.id)}
                          disabled={deletingId === e.id}
                          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-60"
                        >
                          {deletingId === e.id ? "Deleting..." : "Delete"}
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
