import { H3Event, createError } from "h3";
import prisma from "~/lib/prisma";
import { Prisma } from "@prisma/client";
import { getFileUrl } from "~/server/utils/s3";

export default defineEventHandler(async (event: H3Event) => {
  try {
    // Dohvati query parametre
    const query = getQuery(event);
    const page = parseInt(query.page as string) || 1;
    const limit = parseInt(query.limit as string) || 10;
    const search = (query.search as string) || "";
    const sort = (query.sort as string) || "recent";

    // Izračunaj offset za paginaciju
    const offset = (page - 1) * limit;

    // Pripremi sortiranje
    let orderBy: any = {};

    switch (sort) {
      case "popular":
        orderBy = { likeCount: "desc" };
        break;
      case "oldest":
        orderBy = { createdAt: "asc" };
        break;
      case "name":
        orderBy = { name: "asc" };
        break;
      case "recent":
      default:
        orderBy = { createdAt: "desc" };
        break;
    }

    // Pripremi filter za pretragu
    const where: Prisma.ProfileWhereInput = search
      ? {
          name: {
            contains: search,
            mode: "insensitive" as Prisma.QueryMode,
          },
        }
      : {};

    // Dohvati ukupan broj profila
    const total = await prisma.profile.count({
      where,
    });

    // Dohvati profile s paginacijom
    const profiles = await prisma.profile.findMany({
      where,
      orderBy,
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
        likes: {
          select: {
            id: true,
          },
        },
        dislikes: {
          select: {
            id: true,
          },
        },
        comments: {
          select: {
            id: true,
          },
        },
      },
    });

    // Dohvati ekstenzije za profile i generiraj presigned URL-ove
    const profilesWithExtensions = await Promise.all(
      profiles.map(async (profile) => {
        // Koristimo raw query za dohvaćanje ekstenzija
        const extensions = await prisma.$queryRaw`
          SELECT e.id, e.name, e.publisher, e.description 
          FROM "Extension" e
          JOIN "ProfileExtension" pe ON e.id = pe."extensionId"
          WHERE pe."profileId" = ${profile.id}
          LIMIT 5
        `;

        // Dohvati signed URL-ove za profile
        let previewImageUrl = null;
        if (profile.previewImageUrl) {
          previewImageUrl = await getFileUrl(profile.previewImageUrl);
        }

        // Dohvati avatar korisnika
        let userAvatarUrl = null;
        if (profile.user && profile.user.avatar) {
          userAvatarUrl = await getFileUrl(profile.user.avatar);
        }

        // Ažuriraj avatar korisnika s presigned URL-om
        const userWithAvatar = profile.user
          ? {
              ...profile.user,
              avatar: userAvatarUrl,
            }
          : profile.user;

        return {
          ...profile,
          previewImageUrl,
          user: userWithAvatar,
          profileExtensions: Array.isArray(extensions)
            ? extensions.map((ext: any) => ({
                extension: ext,
              }))
            : [],
        };
      })
    );

    return {
      profiles: profilesWithExtensions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error: any) {
    console.error("Error fetching profiles:", error);
    throw createError({
      statusCode: 500,
      statusMessage: error.message || "Internal Server Error",
    });
  }
});
