"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminCandidatesPage() {
  const router = useRouter();
  const [candidates, setCandidates] = useState([]);
  const [parties, setParties] = useState([]);
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editRow, setEditRow] = useState({});
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    setMessage("");
    try {
      const [candRes, partiesRes, electionsRes] = await Promise.all([
        fetch("/api/admin/candidates", { credentials: "include" }),
        fetch("/api/admin/parties", { credentials: "include" }),
        fetch("/api/admin/elections", { credentials: "include" }),
      ]);

      if (candRes.status === 401 || candRes.status === 403) {
        router.push("/login");
        return;
      }

      const candPayload = await candRes.json();
      const partiesPayload = await partiesRes.json();
      const electionsPayload = await electionsRes.json();

      setCandidates(candPayload.success ? candPayload.data : []);
      setParties(partiesPayload.success ? partiesPayload.data : []);
      setElections(electionsPayload.success ? electionsPayload.data : []);
    } catch (err) {
      console.error("Load admin lists error:", err);
      setMessage("Failed to load admin data.");
    } finally {
      setLoading(false);
    }
  }

  function startEdit(candidate) {
    setEditingId(candidate.id);
    setEditRow({
      name: candidate.name ?? "",
      profession: candidate.profession ?? "",
      education: candidate.education ?? "",
      partyId: candidate.party?.id ?? candidate.partyId ?? "",
      electionId: candidate.election?.id ?? candidate.electionId ?? "",
    });
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
      // basic validation
      if (!editRow.name || !editRow.partyId || !editRow.electionId) {
        setMessage("Name, Party and Election are required.");
        setSaving(false);
        return;
      }

      const payload = {
        name: editRow.name,
        profession: editRow.profession,
        education: editRow.education,
        partyId: Number(editRow.partyId),
        electionId: Number(editRow.electionId),
      };

      const res = await fetch(`/api/admin/candidates/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.status === 401 || res.status === 403) {
        setMessage("Unauthorized. Please login as admin.");
        setSaving(false);
        return;
      }

      const data = await res.json();
      if (!data.success) {
        setMessage(data.message || "Failed to update candidate");
        setSaving(false);
        return;
      }

      // update local list
      setCandidates((prev) => prev.map((c) => (c.id === id ? data.data : c)));
      setMessage("Candidate updated");
      setEditingId(null);
      setEditRow({});
    } catch (err) {
      console.error("Save candidate error:", err);
      setMessage("Server error while saving candidate");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete candidate? This will remove the candidate.")) return;
    setDeletingId(id);
    setMessage("");
    try {
      const res = await fetch(`/api/admin/candidates/${id}`, {
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
        setMessage(data.message || "Failed to delete candidate");
        setDeletingId(null);
        return;
      }

      setCandidates((prev) => prev.filter((c) => c.id !== id));
      setMessage("Candidate deleted");
    } catch (err) {
      console.error("Delete candidate error:", err);
      setMessage("Server error while deleting candidate");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="mt-10 text-black max-w-6xl mx-auto py-10 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Manage Candidates</h1>
        <div className="flex gap-2">
          <Link href="/admin" className="px-3 py-2 border rounded">
            Dashboard
          </Link>
          <Link href="/admin/candidates/create" className="px-3 py-2 bg-green-600 text-white rounded">
            + Create Candidate
          </Link>
        </div>
      </div>

      {message && <div className="mb-4 p-3 bg-gray-50 rounded text-sm">{message}</div>}

      {loading ? (
        <div className="text-center py-10">Loading...</div>
      ) : candidates.length === 0 ? (
        <div className="text-gray-600">No candidates found.</div>
      ) : (
        <div className="bg-white shadow rounded overflow-hidden">
          <table className="w-full table-auto">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Profession</th>
                <th className="text-left px-4 py-3">Education</th>
                <th className="text-left px-4 py-3">Party</th>
                <th className="text-left px-4 py-3">Election</th>
                <th className="px-4 py-3">Votes</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((c) => (
                <tr key={c.id} className="border-t">
                  <td className="px-4 py-3 w-1/4">
                    {editingId === c.id ? (
                      <input
                        value={editRow.name}
                        onChange={(e) => updateField("name", e.target.value)}
                        className="w-full border rounded px-2 py-1"
                      />
                    ) : (
                      <div className="font-medium">{c.name}</div>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    {editingId === c.id ? (
                      <input
                        value={editRow.profession}
                        onChange={(e) => updateField("profession", e.target.value)}
                        className="w-full border rounded px-2 py-1"
                      />
                    ) : (
                      <div>{c.profession}</div>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    {editingId === c.id ? (
                      <input
                        value={editRow.education}
                        onChange={(e) => updateField("education", e.target.value)}
                        className="w-full border rounded px-2 py-1"
                      />
                    ) : (
                      <div>{c.education}</div>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    {editingId === c.id ? (
                      <select
                        value={editRow.partyId}
                        onChange={(e) => updateField("partyId", e.target.value)}
                        className="w-full border rounded px-2 py-1"
                      >
                        <option value="">Select Party</option>
                        {parties.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div>{c.party?.name ?? "-"}</div>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    {editingId === c.id ? (
                      <select
                        value={editRow.electionId}
                        onChange={(e) => updateField("electionId", e.target.value)}
                        className="w-full border rounded px-2 py-1"
                      >
                        <option value="">Select Election</option>
                        {elections.map((ev) => (
                          <option key={ev.id} value={ev.id}>
                            {ev.title}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div>{c.election?.title ?? "-"}</div>
                    )}
                  </td>

                  <td className="px-4 py-3 text-center">{c._count?.votes ?? 0}</td>

                  <td className="px-4 py-3 text-right space-x-2">
                    {editingId === c.id ? (
                      <>
                        <button
                          onClick={() => saveEdit(c.id)}
                          disabled={saving}
                          className="px-3 py-1 bg-blue-600 text-white rounded"
                        >
                          {saving ? "Saving..." : "Save"}
                        </button>
                        <button onClick={cancelEdit} className="px-3 py-1 bg-gray-100 rounded">
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEdit(c)} className="px-3 py-1 bg-yellow-100 rounded">
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          disabled={deletingId === c.id}
                          className="px-3 py-1 bg-red-600 text-white rounded"
                        >
                          {deletingId === c.id ? "Deleting..." : "Delete"}
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
