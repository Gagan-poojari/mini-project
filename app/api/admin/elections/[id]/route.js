import prisma from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'
import { errorResponse, successResponse } from '@/lib/utils'

// UPDATE election
export async function PATCH(request, { params }) {
  try {
    const user = await verifyAuth(request)
    if (!user) return errorResponse("Unauthorized", 401)
    if (user.role.toLowerCase() !== "admin") return errorResponse("Forbidden", 403)

    const id = parseInt(params.id)
    const body = await request.json()

    const updated = await prisma.election.update({
      where: { id },
      data: body,
    })

    return successResponse(updated, "Election updated")
  } catch (err) {
    console.error("PATCH election error:", err)
    return errorResponse("Internal Server Error", 500)
  }
}

// DELETE election
export async function DELETE(request, { params }) {
  try {
    const user = await verifyAuth(request)
    if (!user) return errorResponse("Unauthorized", 401)
    if (user.role.toLowerCase() !== "admin") return errorResponse("Forbidden", 403)

    const id = parseInt(params.id)

    await prisma.election.delete({
      where: { id },
    })

    return successResponse(null, "Election deleted")
  } catch (err) {
    console.error("DELETE election error:", err)
    return errorResponse("Internal Server Error", 500)
  }
}
