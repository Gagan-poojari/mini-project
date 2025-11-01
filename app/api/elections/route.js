import prisma from '@/lib/prisma'
import { errorResponse, successResponse } from '@/lib/utils'
import { verifyAuth } from '@/lib/auth' 

// GET: public fetch (voter + admin)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('active') === 'true'

    const now = new Date()

    const where = activeOnly
      ? {
          startDate: { lte: now },
          endDate: { gte: now },
        }
      : {}

    const elections = await prisma.election.findMany({
      where,
      include: {
        candidates: { include: { party: true } },
        _count: { select: { candidates: true, votes: true } }
      },
      orderBy: { startDate: 'desc' },
    })

    return successResponse(elections)
  } catch (error) {
    console.error('Get elections error:', error)
    return errorResponse('Internal server error', 500)
  }
}


// POST: Admin create election + OPTIONAL candidates
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
      return errorResponse('Title, startDate, endDate required', 400)
    }

    const election = await prisma.election.create({
      data: {
        title,
        description: description || '',
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        candidates: candidates?.length
          ? {
              create: candidates.map(c => ({
                name: c.name,
                profession: c.profession || '',
                education: c.education || '',
                partyId: Number(c.partyId)
              }))
            }
          : undefined
      },
      include: {
        candidates: true
      }
    })

    return successResponse(election, 'Election created successfully')
  } catch (error) {
    console.error('Create election error:', error)
    return errorResponse('Internal server error', 500)
  }
}
