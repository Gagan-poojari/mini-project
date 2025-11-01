/// app/elections/page.js
import Link from "next/link"

export default async function ElectionsPage() {
  const baseURL = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"

  const res = await fetch(`${baseURL}/api/elections`, {
    cache: "no-store",
    headers: {
      // this ensures cookies also come
      Cookie: ""
    }
  })

  const data = await res.json()
  const elections = data.success ? data.data : []

  return (
    <div className="text-black max-w-3xl mx-auto py-10 px-5">
      <h1 className="text-3xl font-bold mb-6 mt-10 ">Ongoing Elections</h1>

      {elections.length === 0 && (
        <p className="text-gray-900">No elections found.</p>
      )}

      <div className="space-y-4">
        {elections.map((e) => (
          <div key={e.id} className="border rounded-lg p-4 bg-white flex justify-between">
            <div>
              <h2 className="text-xl font-semibold">{e.title}</h2>
              <p className="text-sm text-gray-900">
                {new Date(e.startDate).toLocaleDateString()} –{" "}
                {new Date(e.endDate).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-500">
                {e._count?.candidates || 0} candidates
              </p>
            </div>

            <Link
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              href={`/vote?election=${e.id}`}
            >
              Vote →
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
