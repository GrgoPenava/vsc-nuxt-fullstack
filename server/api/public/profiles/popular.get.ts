import { H3Event, createError } from "h3";
import prisma from "~/lib/prisma";
import { getFileUrl } from "~/server/utils/s3";

export default defineEventHandler(async (event: H3Event) => {
  try {
    // Dohvati query parametre
    const query = getQuery(event);
    const limit = parseInt(query.limit as string) || 3; // Default 3 profila

    // Dohvati profile sortirane po broju lajkova
    const profiles = await prisma.profile.findMany({
      take: limit,
      orderBy: {
        likeCount: "desc", // Sortiraj po broju lajkova (silazno)
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
        profileExtensions: {
          include: {
            extension: true,
          },
          take: 3, // Samo prve 3 ekstenzije
        },
      },
    });

    // Obradi dohvaćene profile i dodaj URL-ove za slike
    const processedProfiles = await Promise.all(
      profiles.map(async (profile) => {
        // Dohvati URL-ove za slike
        const imageUrls = [];

        // Dodaj preview sliku ako postoji
        if (profile.previewImageUrl) {
          const imageUrl = await getFileUrl(profile.previewImageUrl);
          imageUrls.push({ url: imageUrl });
        }

        // Dodaj avatar korisnika ako postoji
        if (profile.user && profile.user.avatar) {
          profile.user.avatar = await getFileUrl(profile.user.avatar);
        }

        // Vrati procesiran profil
        return {
          id: profile.id,
          name: profile.name,
          description: profile.description,
          userId: profile.userId,
          userName: profile.user?.username,
          userAvatar: profile.user?.avatar,
          imageUrl: imageUrls.length > 0 ? imageUrls[0].url : null,
          likeCount: profile.likeCount,
          commentCount: profile._count.comments,
          extensions: profile.profileExtensions.map((pe) => ({
            id: pe.extension.id,
            name: pe.extension.name,
            publisher: pe.extension.publisher,
          })),
          createdAt: profile.createdAt,
        };
      })
    );

    return processedProfiles;
  } catch (error: any) {
    console.error("Error fetching popular profiles:", error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || "Internal Server Error",
    });
  }
});
