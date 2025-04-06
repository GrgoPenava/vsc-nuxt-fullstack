import { H3Event, createError } from "h3";
import prisma from "~/lib/prisma";

export default defineEventHandler(async (event: H3Event) => {
  try {
    const userId = getRouterParam(event, "id");

    if (!userId) {
      throw createError({
        statusCode: 400,
        statusMessage: "User ID is required",
      });
    }

    // Check if user exists
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!userExists) {
      throw createError({
        statusCode: 404,
        statusMessage: "User not found",
      });
    }

    // Fetch user's comments
    const comments = await prisma.comment.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        profile: {
          select: {
            id: true,
            name: true,
            previewImageUrl: true,
          },
        },
      },
    });

    return comments;
  } catch (error: any) {
    console.error("Error fetching user comments:", error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || "Internal Server Error",
    });
  }
});
