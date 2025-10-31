import prisma from '@/lib/prisma'
import { errorResponse, successResponse } from '@/lib/utils'
import { verifyAuth } from '@/lib/auth' // assumes you have this helper to decode JWT

// 🟢 GET all elections (or active elections)
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
        _count: {
          select: {
            candidates: true,
            votes: true,
          },
        },
      },
      orderBy: {
        startDate: 'desc',
      },
    })

    return successResponse(elections)
  } catch (error) {
    console.error('Get elections error:', error)
    return errorResponse('Internal server error', 500)
  }
}

// 🟡 POST: Create new election (Admin-only)
export async function POST(request) {
  try {
    // 🔹 Authenticate user
    const user = await verifyAuth(request)
    if (!user) return errorResponse('Unauthorized', 401)

    // 🔹 Restrict to admins only
    if (user.role.toLowerCase() !== 'admin') {
      return errorResponse('Forbidden: Admin access only', 403)
    }

    // 🔹 Parse request body
    const body = await request.json()
    const { title, description, startDate, endDate } = body

    if (!title || !startDate || !endDate) {
      return errorResponse('Title, startDate, and endDate are required', 400)
    }

    // 🔹 Create election
    const election = await prisma.election.create({
      data: {
        title,
        description: description || '',
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        createdBy: user.id,
      },
    })

    return successResponse(election, 'Election created successfully')
  } catch (error) {
    console.error('Create election error:', error)
    return errorResponse('Internal server error', 500)
  }
}
