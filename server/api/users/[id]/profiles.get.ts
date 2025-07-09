import { H3Event, createError } from "h3";
import prisma from "~/lib/prisma";
import { getFileUrl } from "~/server/utils/s3";

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

    // Fetch user's profiles
    const profiles = await prisma.profile.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            comments: true,
          },
        },
        user: {
          select: {
            id: true,
            username: true,
          },
        },
        profileExtensions: {
          include: {
            extension: true,
          },
        },
      },
    });

    // Get image URLs for each profile
    const processedProfiles = await Promise.all(
      profiles.map(async (profile) => {
        // Process image URLs
        const imageUrls = [];

        // Add preview image if it exists
        if (profile.previewImageUrl) {
          const imageUrl = await getFileUrl(profile.previewImageUrl);
          imageUrls.push({ url: imageUrl });
        }

        // Add additional images
        if (profile.images && profile.images.length > 0) {
          const additionalImageUrls = await Promise.all(
            profile.images.map(async (imagePath: string) => {
              const url = await getFileUrl(imagePath);
              return { url };
            })
          );
          imageUrls.push(...additionalImageUrls);
        }

        // Return processed profile with URLs
        return {
          ...profile,
          imageUrls,
          commentsCount: profile._count.comments,
          _count: undefined, // Remove _count from final result
        };
      })
    );

    return processedProfiles;
  } catch (error: any) {
    console.error("Error fetching user profiles:", error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || "Internal Server Error",
    });
  }
});
