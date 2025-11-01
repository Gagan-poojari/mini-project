import prisma from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'
import { errorResponse, successResponse } from '@/lib/utils'

// UPDATE party
export async function PATCH(request, { params }) {
  try {
    const user = await verifyAuth(request)
    if (!user) return errorResponse("Unauthorized", 401)
    if (user.role.toLowerCase() !== "admin") return errorResponse("Forbidden", 403)

    const id = parseInt(params.id)
    const body = await request.json()

    const updated = await prisma.party.update({
      where: { id },
      data: body,
    })

    return successResponse(updated, "Party updated")
  } catch (err) {
    console.error("PATCH party error:", err)
    return errorResponse("Internal Server Error", 500)
  }
}

// DELETE party
export async function DELETE(request, { params }) {
  try {
    const user = await verifyAuth(request)
    if (!user) return errorResponse("Unauthorized", 401)
    if (user.role.toLowerCase() !== "admin") return errorResponse("Forbidden", 403)

    const id = parseInt(params.id)

    await prisma.party.delete({ where: { id } })

    return successResponse(null, "Party deleted")
  } catch (err) {
    console.error("DELETE party error:", err)
    return errorResponse("Internal Server Error", 500)
  }
}
