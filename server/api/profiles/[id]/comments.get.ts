import { H3Event, createError } from "h3";
import prisma from "~/lib/prisma";

export default defineEventHandler(async (event: H3Event) => {
  try {
    const profileId = getRouterParam(event, "id");

    if (!profileId) {
      throw createError({
        statusCode: 400,
        statusMessage: "Profile ID is required",
      });
    }

    // Dohvati query parametre
    const query = getQuery(event);
    const page = parseInt(query.page as string) || 1;
    const limit = parseInt(query.limit as string) || 10;

    // Izračunaj offset za paginaciju
    const offset = (page - 1) * limit;

    // Provjeri postoji li profil
    const profile = await prisma.profile.findUnique({
      where: { id: profileId },
    });

    if (!profile) {
      throw createError({
        statusCode: 404,
        statusMessage: "Profile not found",
      });
    }

    // Dohvati ukupan broj komentara
    const total = await prisma.profileComment.count({
      where: { profileId },
    });

    // Dohvati komentare s paginacijom
    const comments = await prisma.profileComment.findMany({
      where: { profileId },
      orderBy: { createdAt: "desc" },
      skip: offset,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    return {
      comments,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error: any) {
    console.error("Error fetching comments:", error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || "Internal Server Error",
    });
  }
});
