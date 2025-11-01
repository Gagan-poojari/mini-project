import prisma from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'
import { errorResponse, successResponse } from '@/lib/utils'

// GET candidates (optional: filter by election)
export async function GET(request) {
  try {
    const user = await verifyAuth(request)
    if (!user) return errorResponse('Unauthorized', 401)
    if (user.role.toLowerCase() !== 'admin') return errorResponse('Forbidden', 403)

    const { searchParams } = new URL(request.url)
    const electionId = searchParams.get('electionId')

    const where = electionId ? { electionId: parseInt(electionId) } : {}

    const candidates = await prisma.candidate.findMany({
      where,
      include: {
        party: true,
        election: true,
        _count: { select: { votes: true } }
      },
      orderBy: { name: 'asc' },
    })

    return successResponse(candidates)
  } catch (error) {
    return errorResponse('Internal server error', 500)
  }
}

// POST create candidate
export async function POST(request) {
  const user = await verifyAuth(request)
  if (!user) return errorResponse('Unauthorized', 401)
  if (user.role.toLowerCase() !== 'admin') return errorResponse('Forbidden', 403)

  try {
    const body = await request.json()
    const { name, profession, education, partyId, electionId } = body

    if (!name || !profession || !education || !partyId || !electionId)
      return errorResponse('All fields required')

    const candidate = await prisma.candidate.create({
      data: {
        name,
        profession,
        education,
        partyId: parseInt(partyId),
        electionId: parseInt(electionId),
      }
    })

    return successResponse(candidate, 'Candidate created successfully', 201)
  } catch (error) {
    return errorResponse('Internal server error', 500)
  }
}

// DELETE candidate
export async function DELETE(request) {
  const user = await verifyAuth(request)
  if (!user) return errorResponse('Unauthorized', 401)
  if (user.role.toLowerCase() !== 'admin') return errorResponse('Forbidden', 403)

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return errorResponse('Candidate ID required')

    await prisma.candidate.delete({ where: { id: parseInt(id) } })

    return successResponse(null, 'Candidate deleted successfully')
  } catch (error) {
    return errorResponse('Internal server error', 500)
  }
}
