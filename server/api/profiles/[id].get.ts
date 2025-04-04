import { H3Event, createError } from "h3";
import prisma from "~/lib/prisma";
import { getFileUrl } from "~/server/utils/s3";

export default defineEventHandler(async (event: H3Event) => {
  try {
    const id = getRouterParam(event, "id");

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: "Profile ID is required",
      });
    }

    // Dohvati profil s navedenim ID-om
    const profile: any = await prisma.profile.findUnique({
      where: { id },
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
            userId: true,
          },
        },
        dislikes: {
          select: {
            id: true,
            userId: true,
          },
        },
        comments: {
          select: {
            id: true,
            content: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        // @ts-ignore - Ignoriramo TypeScript grešku za profileExtensions
        profileExtensions: {
          include: {
            extension: true,
          },
        },
      },
    });

    if (!profile) {
      throw createError({
        statusCode: 404,
        statusMessage: "Profile not found",
      });
    }

    // Dohvati signed URL-ove za datoteke i slike
    let fileUrl: string | null = null;
    if (profile.filePath) {
      fileUrl = await getFileUrl(profile.filePath);
    }

    let previewImageUrl: string | null = null;
    if (profile.previewImageUrl) {
      previewImageUrl = await getFileUrl(profile.previewImageUrl);
    }

    // Dohvati signed URL-ove za sve slike profila
    const imageUrls: Array<{ path: string; url: string }> = [];

    if (profile.images && Array.isArray(profile.images)) {
      for (const imgPath of profile.images) {
        const url = await getFileUrl(imgPath);
        // @ts-ignore - Ignoriramo TypeScript grešku za null vrijednost u URL-u
        imageUrls.push({ path: imgPath, url });
      }
    }

    // Dohvati avatar korisnika
    if (profile.user && profile.user.avatar) {
      const avatarUrl = await getFileUrl(profile.user.avatar);
      profile.user.avatar = avatarUrl as any;
    }

    // Dohvati avatare korisnika za komentare
    if (profile.comments && profile.comments.length > 0) {
      for (const comment of profile.comments) {
        if (comment.user && comment.user.avatar) {
          const commentAvatarUrl = await getFileUrl(comment.user.avatar);
          comment.user.avatar = commentAvatarUrl as any;
        }
      }
    }

    // Pripremi profil s URL-ovima za odgovor
    const profileWithUrls = {
      ...profile,
      fileUrl,
      previewImageUrl,
      imageUrls,
      profileExtensions: profile.profileExtensions || [],
      jsonContent: profile.jsonContent,
      comments: profile.comments?.map((comment: any) => {
        return {
          ...comment,
          user: {
            ...comment.user,
            avatar: comment.user.avatar ? comment.user.avatar : null,
          },
        };
      }),
    };

    return profileWithUrls;
  } catch (error: any) {
    console.error("Error fetching profile:", error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || "Internal Server Error",
    });
  }
});
