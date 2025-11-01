"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminPartiesPage() {
  const router = useRouter();
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editRow, setEditRow] = useState({});
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadParties();
  }, []);

  async function loadParties() {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/parties", { credentials: "include" });
      if (res.status === 401 || res.status === 403) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      setParties(data.success ? data.data : []);
    } catch (err) {
      console.error("Load parties error:", err);
      setMessage("Failed to load parties");
    } finally {
      setLoading(false);
    }
  }

  function startEdit(party) {
    setEditingId(party.id);
    setEditRow({ name: party.name || "", shortName: party.shortName || "", logo: party.logo || "" });
    setMessage("");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditRow({});
    setMessage("");
  }

  function updateField(field, value) {
    setEditRow((s) => ({ ...s, [field]: value }));
  }

  async function saveEdit(id) {
    setSaving(true);
    setMessage("");
    try {
      if (!editRow.name) {
        setMessage("Party name is required.");
        setSaving(false);
        return;
      }

      const res = await fetch(`/api/admin/parties/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editRow.name, shortName: editRow.shortName, logo: editRow.logo }),
      });

      if (res.status === 401 || res.status === 403) {
        setMessage("Unauthorized. Please login as admin.");
        setSaving(false);
        return;
      }

      const data = await res.json();
      if (!data.success) {
        setMessage(data.message || "Failed to update party");
        setSaving(false);
        return;
      }

      setParties((prev) => prev.map((p) => (p.id === id ? data.data : p)));
      setMessage("Party updated");
      setEditingId(null);
      setEditRow({});
    } catch (err) {
      console.error("Save party error:", err);
      setMessage("Server error while updating");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete party? This will also remove its candidates.")) return;
    setDeletingId(id);
    setMessage("");
    try {
      const res = await fetch(`/api/admin/parties/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.status === 401 || res.status === 403) {
        setMessage("Unauthorized. Please login as admin.");
        setDeletingId(null);
        return;
      }

      const data = await res.json();
      if (!data.success) {
        setMessage(data.message || "Failed to delete party");
        setDeletingId(null);
        return;
      }

      setParties((prev) => prev.filter((p) => p.id !== id));
      setMessage("Party deleted");
    } catch (err) {
      console.error("Delete party error:", err);
      setMessage("Server error while deleting party");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="mt-10 text-black max-w-4xl mx-auto py-10 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Manage Parties</h1>
        <div className="flex gap-2">
          <Link href="/admin" className="px-3 py-2 border rounded">
            Dashboard
          </Link>
          <Link href="/admin/parties/create" className="px-3 py-2 bg-green-600 text-white rounded">
            + Create Party
          </Link>
        </div>
      </div>

      {message && <div className="mb-4 p-3 bg-gray-50 rounded text-sm">{message}</div>}

      {loading ? (
        <div className="text-center py-10">Loading parties...</div>
      ) : parties.length === 0 ? (
        <div className="text-gray-600">No parties found.</div>
      ) : (
        <div className="bg-white shadow rounded overflow-hidden">
          <table className="w-full table-auto">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Short Name</th>
                <th className="text-left px-4 py-3">Candidates</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {parties.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="px-4 py-3 w-1/3">
                    {editingId === p.id ? (
                      <input value={editRow.name} onChange={(e) => updateField("name", e.target.value)} className="w-full border rounded px-2 py-1" />
                    ) : (
                      <div className="font-medium">{p.name}</div>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    {editingId === p.id ? (
                      <input value={editRow.shortName} onChange={(e) => updateField("shortName", e.target.value)} className="w-full border rounded px-2 py-1" />
                    ) : (
                      <div>{p.shortName || "-"}</div>
                    )}
                  </td>

                  <td className="px-4 py-3">{p._count?.candidates ?? 0}</td>

                  <td className="px-4 py-3 text-right space-x-2">
                    {editingId === p.id ? (
                      <>
                        <button onClick={() => saveEdit(p.id)} disabled={saving} className="px-3 py-1 bg-blue-600 text-white rounded">
                          {saving ? "Saving..." : "Save"}
                        </button>
                        <button onClick={cancelEdit} className="px-3 py-1 bg-gray-100 rounded">
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEdit(p)} className="px-3 py-1 bg-yellow-100 rounded">
                          Edit
                        </button>
                        <button onClick={() => handleDelete(p.id)} disabled={deletingId === p.id} className="px-3 py-1 bg-red-600 text-white rounded">
                          {deletingId === p.id ? "Deleting..." : "Delete"}
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
