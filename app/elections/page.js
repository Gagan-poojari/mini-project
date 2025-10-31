import { prisma } from '@/lib/prisma'

export default async function ElectionsPage() {
  const elections = await prisma.election.findMany({
    include: { candidates: true },
  })

  return (
    <div>
      <h1>Ongoing Elections</h1>
      {elections.map(e => (
        <div key={e.id}>
          <h2>{e.title}</h2>
          <a href={`/vote?election=${e.id}`}>Vote</a>
        </div>
      ))}
    </div>
  )
}
