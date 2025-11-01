import prisma from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'
import { errorResponse, successResponse } from '@/lib/utils'

// GET all parties
export async function GET(request) {
  try {
    const user = await verifyAuth(request)
    if (!user) return errorResponse('Unauthorized', 401)
    if (user.role.toLowerCase() !== 'admin') return errorResponse('Forbidden', 403)

    const parties = await prisma.party.findMany({
      include: {
        _count: { select: { candidates: true } }
      },
      orderBy: { name: 'asc' },
    })

    return successResponse(parties)
  } catch (error) {
    console.error('Get parties error:', error)
    return errorResponse('Internal server error', 500)
  }
}

// POST new party
export async function POST(request) {
  const user = await verifyAuth(request)
  if (!user) return errorResponse('Unauthorized', 401)
  if (user.role.toLowerCase() !== 'admin') return errorResponse('Forbidden', 403)

  try {
    const { name, shortName, logo } = await request.json()

    if (!name) return errorResponse('Party name is required')

    const party = await prisma.party.create({
      data: { name, shortName, logo }
    })

    return successResponse(party, 'Party created successfully', 201)
  } catch (error) {
    if (error.code === 'P2002') return errorResponse('Party exists', 409)
    return errorResponse('Internal server error', 500)
  }
}

// DELETE party
export async function DELETE(request) {
  const user = await verifyAuth(request)
  if (!user) return errorResponse('Unauthorized', 401)
  if (user.role.toLowerCase() !== 'admin') return errorResponse('Forbidden', 403)

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return errorResponse('Party ID required')

    await prisma.party.delete({ where: { id: parseInt(id) } })

    return successResponse(null, 'Party deleted successfully')
  } catch (error) {
    return errorResponse('Internal server error', 500)
  }
}
