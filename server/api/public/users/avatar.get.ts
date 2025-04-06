import { H3Event, createError } from "h3";
import prisma from "~/lib/prisma";
import { getFileUrl } from "~/server/utils/s3";

export default defineEventHandler(async (event: H3Event) => {
  try {
    const query = getQuery(event);
    const userId = query.userId as string;

    if (!userId) {
      throw createError({
        statusCode: 400,
        statusMessage: "User ID is required",
      });
    }

    // Fetch user avatar
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { avatar: true },
    });

    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: "User not found",
      });
    }

    // If user has avatar, get signed URL
    if (user.avatar) {
      const avatarUrl = await getFileUrl(user.avatar);
      return { avatarUrl };
    }

    // If no avatar, return null
    return { avatarUrl: null };
  } catch (error: any) {
    console.error("Error fetching avatar:", error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || "Internal Server Error",
    });
  }
});
