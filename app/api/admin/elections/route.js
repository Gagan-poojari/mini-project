import prisma from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'
import { errorResponse, successResponse } from '@/lib/utils'

// 🔹 GET all elections (admin view)
export async function GET() {
  try {
    const elections = await prisma.election.findMany({
      include: {
        candidates: {
          include: { party: true },
        },
        _count: {
          select: { candidates: true, votes: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return successResponse(elections)
  } catch (error) {
    console.error('Fetch elections error:', error)
    return errorResponse('Internal server error', 500)
  }
}

// 🔹 POST: Create election with optional candidates
export async function POST(request) {
  try {
    const user = await verifyAuth(request)
    if (!user) return errorResponse('Unauthorized', 401)

    if (user.role.toLowerCase() !== 'admin') {
      return errorResponse('Forbidden: Admin access only', 403)
    }

    const body = await request.json()
    const { title, description, startDate, endDate, candidates } = body

    if (!title || !startDate || !endDate) {
      return errorResponse('Title, startDate, and endDate are required', 400)
    }

    // Create election + optional candidates in one go
    const election = await prisma.election.create({
      data: {
        title,
        description: description || '',
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        candidates: candidates?.length
          ? {
              create: candidates.map((c) => ({
                name: c.name,
                profession: c.profession || '',
                education: c.education || '',
                partyId: parseInt(c.partyId),
              })),
            }
          : undefined,
      },
      include: {
        candidates: { include: { party: true } },
      },
    })

    return successResponse(
      election,
      candidates?.length
        ? `Election created with ${candidates.length} candidate(s)`
        : 'Election created successfully'
    )
  } catch (error) {
    console.error('Create election error:', error)
    return errorResponse('Internal server error', 500)
  }
}
