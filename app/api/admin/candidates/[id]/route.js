import prisma from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'
import { errorResponse, successResponse } from '@/lib/utils'

// UPDATE candidate
export async function PATCH(request, { params }) {
  try {
    const user = await verifyAuth(request)
    if (!user) return errorResponse("Unauthorized", 401)
    if (user.role.toLowerCase() !== "admin") return errorResponse("Forbidden", 403)

    const id = parseInt(params.id)
    const body = await request.json()

    const updated = await prisma.candidate.update({
      where: { id },
      data: body,
    })

    return successResponse(updated, "Candidate updated")
  } catch (err) {
    console.error("PATCH candidate error:", err)
    return errorResponse("Internal Server Error", 500)
  }
}

// DELETE candidate
export async function DELETE(request, { params }) {
  try {
    const user = await verifyAuth(request)
    if (!user) return errorResponse("Unauthorized", 401)
    if (user.role.toLowerCase() !== "admin") return errorResponse("Forbidden", 403)

    const id = parseInt(params.id)

    await prisma.candidate.delete({ where: { id } })

    return successResponse(null, "Candidate deleted")
  } catch (err) {
    console.error("DELETE candidate error:", err)
    return errorResponse("Internal Server Error", 500)
  }
}
